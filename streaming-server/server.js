const NodeMediaServer = require('node-media-server');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Configure CORS
const corsOptions = {
  origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve HLS files statically
app.use('/media', express.static(path.join(__dirname, 'media')));

// Initialize Socket.IO with CORS
const io = socketIo(server, {
  cors: corsOptions
});

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Create directories for HLS streams
const hlsPath = path.join(__dirname, 'hls');
fs.ensureDirSync(hlsPath);

// NodeMediaServer configuration
const nmsConfig = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    allow_origin: '*',
    mediaroot: './media',
    webroot: './media'
  },
  // Enable HLS transcoding
  relay: {
    ffmpeg: process.env.FFMPEG_PATH || 'ffmpeg',
    tasks: [
      {
        app: 'live',
        mode: 'push',
        edge: 'rtmp://127.0.0.1/hls'
      }
    ]
  }
};

// Check FFmpeg availability
let ffmpegAvailable = false;
const { exec } = require('child_process');

exec('ffmpeg -version', (error) => {
  if (error) {
    console.log('⚠️  FFmpeg not found - RTMP streaming only');
    console.log('📺 To enable video playback, install FFmpeg:');
    console.log('   Windows: winget install "FFmpeg (Essentials Build)"');
    console.log('   Or download from: https://ffmpeg.org/download.html');
  } else {
    ffmpegAvailable = true;
    console.log('✅ FFmpeg detected - Video transcoding enabled');
  }
});

// Initialize NodeMediaServer
const nms = new NodeMediaServer(nmsConfig);

// Stream state management
const activeStreams = new Map();
const streamViewers = new Map();
const hlsProcesses = new Map();

// Utility functions
function generateStreamKey() {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

async function authenticateStream(streamKey) {
  try {
    const { data: stream, error } = await supabase
      .from('live_streams')
      .select('*')
      .eq('stream_key', streamKey)
      .single();

    if (error || !stream) {
      console.log('Stream authentication failed:', error);
      return false;
    }

    return stream;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
}

async function updateStreamStatus(streamKey, isActive, stats = {}) {
  try {
    const updateData = {
      is_active: isActive,
      ...stats
    };

    if (isActive) {
      updateData.started_at = new Date().toISOString();
      updateData.rtmp_url = `rtmp://localhost:1935/live/${streamKey}`;
      // Only set HLS URL if FFmpeg is available for transcoding
      updateData.hls_url = ffmpegAvailable ? `http://localhost:9000/media/hls/${streamKey}/index.m3u8` : null;
    } else {
      updateData.ended_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('live_streams')
      .update(updateData)
      .eq('stream_key', streamKey);

    if (error) {
      console.error('Failed to update stream status:', error);
    }
  } catch (error) {
    console.error('Update stream status error:', error);
  }
}

function startHLSTranscoding(streamKey) {
  // Wait a moment for the stream to be fully established
  setTimeout(() => {
    const hlsOutputPath = path.join(__dirname, 'media', 'hls', streamKey);
    fs.ensureDirSync(hlsOutputPath);

    const ffmpegArgs = [
      '-i', `rtmp://127.0.0.1:1935/live${streamKey}/${streamKey}`,
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-f', 'hls',
      '-hls_time', '2',           // Shorter segments for reduced gaps
      '-hls_list_size', '6',      // Keep fewer segments for live streaming
      '-hls_flags', 'delete_segments+independent_segments+program_date_time+append_list',
      '-hls_segment_type', 'mpegts',
      '-preset', 'veryfast',      // Faster encoding for lower latency
      '-tune', 'zerolatency',
      '-g', '60',                 // GOP size matching segment duration (2s * 30fps)
      '-keyint_min', '30',        // Keyframe every second
      '-sc_threshold', '0',       // Disable scene change detection
      '-b:v', '2000k',           // Slightly lower bitrate for stability
      '-maxrate', '2000k',       // Max bitrate
      '-bufsize', '4000k',       // Buffer size (2x bitrate)
      '-profile:v', 'main',       // Use main profile for better compression
      '-level', '4.0',           // Higher level for better quality
      '-pix_fmt', 'yuv420p',
      '-force_key_frames', 'expr:gte(t,n_forced*2)', // Force keyframes every 2 seconds
      '-segment_list_flags', 'live',  // Enable live segment list
      '-segment_time', '2',       // Explicit segment time
      '-avoid_negative_ts', 'make_zero',  // Avoid timestamp issues
      '-loglevel', 'info',
      path.join(hlsOutputPath, 'index.m3u8')
    ];

    console.log(`🎬 Starting HLS transcoding for stream: ${streamKey}`);
    console.log(`📁 Output directory: ${hlsOutputPath}`);
    console.log(`🔧 FFmpeg command: ffmpeg ${ffmpegArgs.join(' ')}`);

    const ffmpegProcess = exec(`ffmpeg ${ffmpegArgs.join(' ')}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`FFmpeg error for ${streamKey}:`, error);
      }
    });

    ffmpegProcess.stdout?.on('data', (data) => {
      console.log(`FFmpeg ${streamKey} stdout:`, data.toString());
    });

    ffmpegProcess.stderr?.on('data', (data) => {
      console.log(`FFmpeg ${streamKey} stderr:`, data.toString());
    });

    ffmpegProcess.on('exit', (code) => {
      console.log(`FFmpeg process for ${streamKey} exited with code ${code}`);
    });

    hlsProcesses.set(streamKey, ffmpegProcess);
  }, 3000); // Wait 3 seconds for stream to establish
}

function stopHLSTranscoding(streamKey) {
  const process = hlsProcesses.get(streamKey);
  if (process) {
    console.log(`🛑 Stopping HLS transcoding for stream: ${streamKey}`);
    process.kill('SIGTERM');
    hlsProcesses.delete(streamKey);

    // Clean up HLS files
    const hlsOutputPath = path.join(__dirname, 'media', 'hls', streamKey);
    if (fs.existsSync(hlsOutputPath)) {
      fs.removeSync(hlsOutputPath);
    }
  }
}

// NodeMediaServer event handlers
nms.on('preConnect', (id, args) => {
  console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('postConnect', (id, args) => {
  console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('doneConnect', (id, args) => {
  console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('prePublish', async (id, StreamPath, args) => {
  console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);

  // Extract stream key from path (format: /live/STREAM_KEY)
  const streamKey = StreamPath.split('/').pop();

  // Authenticate stream
  const stream = await authenticateStream(streamKey);
  if (!stream) {
    console.log('Rejecting unauthorized stream:', streamKey);
    const session = nms.getSession(id);
    session.reject();
    return;
  }

  console.log('✅ Stream authenticated:', streamKey, 'Title:', stream.title);
  activeStreams.set(streamKey, {
    id,
    streamPath: StreamPath,
    startTime: Date.now(),
    stream: stream
  });

  console.log('📊 Active streams count:', activeStreams.size);

  // Start HLS transcoding if FFmpeg is available
  if (ffmpegAvailable) {
    startHLSTranscoding(streamKey);
  }

  // Update database
  await updateStreamStatus(streamKey, true);

  // Notify viewers
  io.emit('stream_started', {
    streamKey,
    streamId: stream.id,
    title: stream.title,
    streamer: stream.streamer_id
  });

  console.log('🔔 Notified viewers of stream start for:', streamKey);
});

nms.on('postPublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePublish', async (id, StreamPath, args) => {
  console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);

  const streamKey = StreamPath.split('/').pop();
  const streamInfo = activeStreams.get(streamKey);

  if (streamInfo) {
    const duration = Date.now() - streamInfo.startTime;
    const viewerCount = streamViewers.get(streamKey)?.size || 0;

    // Stop HLS transcoding
    stopHLSTranscoding(streamKey);

    // Update database with final stats
    await updateStreamStatus(streamKey, false, {
      viewer_count: viewerCount
    });

    // Clean up
    activeStreams.delete(streamKey);
    streamViewers.delete(streamKey);

    // Notify viewers
    io.emit('stream_ended', {
      streamKey,
      streamId: streamInfo.stream.id,
      duration
    });
  }
});

nms.on('prePlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('postPlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);

  const streamKey = StreamPath.split('/').pop();
  if (!streamViewers.has(streamKey)) {
    streamViewers.set(streamKey, new Set());
  }
  streamViewers.get(streamKey).add(id);

  // Update viewer count
  const viewerCount = streamViewers.get(streamKey).size;
  io.emit('viewer_count_update', { streamKey, viewerCount });
});

nms.on('donePlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);

  const streamKey = StreamPath.split('/').pop();
  if (streamViewers.has(streamKey)) {
    streamViewers.get(streamKey).delete(id);

    // Update viewer count
    const viewerCount = streamViewers.get(streamKey).size;
    io.emit('viewer_count_update', { streamKey, viewerCount });
  }
});

// Express API routes
app.get('/api/streams', async (req, res) => {
  try {
    const { data: streams, error } = await supabase
      .from('live_streams')
      .select('*')
      .eq('is_active', true)
      .order('started_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Add viewer counts
    const streamsWithViewers = streams.map(stream => ({
      ...stream,
      viewer_count: streamViewers.get(stream.stream_key)?.size || 0
    }));

    res.json(streamsWithViewers);
  } catch (error) {
    console.error('Error fetching streams:', error);
    res.status(500).json({ error: 'Failed to fetch streams' });
  }
});

app.get('/api/streams/:streamKey', async (req, res) => {
  try {
    const { streamKey } = req.params;

    const { data: stream, error } = await supabase
      .from('live_streams')
      .select('*')
      .eq('stream_key', streamKey)
      .single();

    if (error || !stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    // Add current viewer count
    stream.viewer_count = streamViewers.get(streamKey)?.size || 0;
    stream.is_live = activeStreams.has(streamKey);

    res.json(stream);
  } catch (error) {
    console.error('Error fetching stream:', error);
    res.status(500).json({ error: 'Failed to fetch stream' });
  }
});

// New endpoint for checking stream status
app.get('/api/streams/:streamKey/status', (req, res) => {
  try {
    const { streamKey } = req.params;

    const isReceivingContent = activeStreams.has(streamKey);
    const viewerCount = streamViewers.get(streamKey)?.size || 0;
    const streamInfo = activeStreams.get(streamKey);

    console.log(`Status check for ${streamKey}: receiving=${isReceivingContent}, viewers=${viewerCount}`);

    res.json({
      streamKey,
      isReceivingContent,
      isLive: isReceivingContent,
      viewerCount,
      startTime: streamInfo?.startTime || null,
      uptime: streamInfo ? Date.now() - streamInfo.startTime : 0
    });
  } catch (error) {
    console.error('Error checking stream status:', error);
    res.status(500).json({ error: 'Failed to check stream status' });
  }
});

app.get('/api/stats', (req, res) => {
  const stats = {
    activeStreams: activeStreams.size,
    totalViewers: Array.from(streamViewers.values()).reduce((total, viewers) => total + viewers.size, 0),
    uptime: process.uptime()
  };

  res.json(stats);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_stream', (streamKey) => {
    socket.join(`stream_${streamKey}`);
    console.log(`Client ${socket.id} joined stream ${streamKey}`);
  });

  socket.on('leave_stream', (streamKey) => {
    socket.leave(`stream_${streamKey}`);
    console.log(`Client ${socket.id} left stream ${streamKey}`);
  });

  socket.on('tip_notification', (data) => {
    // Broadcast tip to stream viewers
    io.to(`stream_${data.streamKey}`).emit('new_tip', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    activeStreams: activeStreams.size
  });
});

// Start servers
const HTTP_PORT = process.env.STREAMING_HTTP_PORT || 9000;
const RTMP_PORT = process.env.STREAMING_RTMP_PORT || 1935;
const HLS_PORT = process.env.STREAMING_HLS_PORT || 8000;

server.listen(HTTP_PORT, () => {
  console.log(`🚀 Streaming API server running on port ${HTTP_PORT}`);
});

nms.run();
console.log(`🎥 RTMP server running on port ${RTMP_PORT}`);
console.log(`📺 HLS server running on port ${HLS_PORT}`);
console.log(`🔌 WebSocket server running on port ${HTTP_PORT}`);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down streaming server...');
  server.close(() => {
    nms.stop();
    process.exit(0);
  });
});