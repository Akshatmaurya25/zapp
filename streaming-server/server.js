const NodeMediaServer = require('node-media-server');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config({ path: '../.env.local' });

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
    mediaroot: './media'
  },
  // HTTPS disabled for development - uncomment and add certificates for production
  // https: {
  //   port: 8443,
  //   key: './privatekey.pem',
  //   cert: './certificate.pem'
  // },
  relay: {
    ffmpeg: process.env.FFMPEG_PATH || '/usr/local/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        mode: 'push',
        edge: 'rtmp://127.0.0.1/live_hls'
      }
    ]
  },
  fission: {
    ffmpeg: process.env.FFMPEG_PATH || '/usr/local/bin/ffmpeg',
    tasks: [
      {
        rule: 'live/*',
        model: [
          {
            ab: '128k',
            vb: '1500k',
            vs: '1280x720',
            vf: '30'
          }
        ]
      }
    ]
  }
};

// Initialize NodeMediaServer
const nms = new NodeMediaServer(nmsConfig);

// Stream state management
const activeStreams = new Map();
const streamViewers = new Map();

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
      updateData.hls_url = `http://localhost:8000/live/${streamKey}/index.m3u8`;
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

  console.log('Stream authenticated:', streamKey);
  activeStreams.set(streamKey, {
    id,
    streamPath: StreamPath,
    startTime: Date.now(),
    stream: stream
  });

  // Update database
  await updateStreamStatus(streamKey, true);

  // Notify viewers
  io.emit('stream_started', {
    streamKey,
    streamId: stream.id,
    title: stream.title,
    streamer: stream.streamer_id
  });
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