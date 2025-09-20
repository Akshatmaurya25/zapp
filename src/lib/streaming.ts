import { io, Socket } from 'socket.io-client'

export interface Stream {
  id: string
  streamer_id: string
  stream_key: string
  title: string
  game_name?: string
  thumbnail_hash?: string
  is_active: boolean
  viewer_count: number
  total_tips: string | number
  rtmp_url?: string
  hls_url?: string
  started_at?: string
  ended_at?: string
  created_at: string
  users?: {
    id: string
    username?: string
    display_name?: string
    avatar_ipfs?: string
    wallet_address?: string
  }
  is_live?: boolean
}

export interface StreamTip {
  id: string
  stream_id: string
  tipper_wallet: string
  streamer_wallet: string
  amount: number
  message?: string
  tx_hash: string
  created_at: string
}

export interface CreateStreamData {
  title?: string
  game_name?: string
  thumbnail_hash?: string
}

export class StreamingService {
  private socket: Socket | null = null
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }

  // Initialize WebSocket connection
  connectSocket(): Socket {
    if (!this.socket) {
      this.socket = io('http://localhost:9000', {
        transports: ['websocket', 'polling']
      })
    }
    return this.socket
  }

  // Disconnect WebSocket
  disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Join a stream room for real-time updates
  joinStream(streamKey: string) {
    if (this.socket) {
      this.socket.emit('join_stream', streamKey)
    }
  }

  // Leave a stream room
  leaveStream(streamKey: string) {
    if (this.socket) {
      this.socket.emit('leave_stream', streamKey)
    }
  }

  // Create a new stream
  async createStream(data: CreateStreamData, authToken: string): Promise<Stream> {
    const response = await fetch(`${this.baseUrl}/api/streams/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create stream')
    }

    return response.json()
  }

  // Get list of streams
  async getStreams(activeOnly = false, limit = 20, offset = 0): Promise<{ streams: Stream[], total: number }> {
    const params = new URLSearchParams({
      active: activeOnly.toString(),
      limit: limit.toString(),
      offset: offset.toString()
    })

    const response = await fetch(`${this.baseUrl}/api/streams/list?${params}`)

    if (!response.ok) {
      throw new Error('Failed to fetch streams')
    }

    return response.json()
  }

  // Get a specific stream
  async getStream(streamKey: string): Promise<Stream> {
    const response = await fetch(`${this.baseUrl}/api/streams/${streamKey}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch stream')
    }

    return response.json()
  }

  // Update stream
  async updateStream(streamKey: string, data: CreateStreamData, authToken: string): Promise<Stream> {
    const response = await fetch(`${this.baseUrl}/api/streams/${streamKey}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update stream')
    }

    return response.json()
  }

  // End stream
  async endStream(streamKey: string, authToken: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/streams/${streamKey}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to end stream')
    }
  }

  // Record a tip
  async recordTip(tipData: {
    stream_id: string
    streamer_wallet: string
    tipper_wallet: string
    amount: string
    message?: string
    tx_hash: string
  }): Promise<{ success: boolean, tip: StreamTip }> {
    const response = await fetch(`${this.baseUrl}/api/streams/tip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tipData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to record tip')
    }

    return response.json()
  }

  // Get tips for a stream
  async getStreamTips(streamId: string, limit = 20, offset = 0): Promise<{ tips: StreamTip[], total: number }> {
    const params = new URLSearchParams({
      stream_id: streamId,
      limit: limit.toString(),
      offset: offset.toString()
    })

    const response = await fetch(`${this.baseUrl}/api/streams/tip?${params}`)

    if (!response.ok) {
      throw new Error('Failed to fetch tips')
    }

    return response.json()
  }

  // Listen for real-time events
  onStreamStarted(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('stream_started', callback)
    }
  }

  onStreamEnded(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('stream_ended', callback)
    }
  }

  onViewerCountUpdate(callback: (data: { streamKey: string, viewerCount: number }) => void) {
    if (this.socket) {
      this.socket.on('viewer_count_update', callback)
    }
  }

  onNewTip(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new_tip', callback)
    }
  }

  // Remove event listeners
  offStreamStarted() {
    if (this.socket) {
      this.socket.off('stream_started')
    }
  }

  offStreamEnded() {
    if (this.socket) {
      this.socket.off('stream_ended')
    }
  }

  offViewerCountUpdate() {
    if (this.socket) {
      this.socket.off('viewer_count_update')
    }
  }

  offNewTip() {
    if (this.socket) {
      this.socket.off('new_tip')
    }
  }
}

// Singleton instance
export const streamingService = new StreamingService()

// Utility functions
export function formatViewerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

export function formatStreamDuration(startTime: string): string {
  const start = new Date(startTime)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function generateStreamUrl(streamKey: string): {
  rtmp: string
  hls: string
} {
  return {
    rtmp: `rtmp://localhost:1935/live/${streamKey}`,
    hls: `http://localhost:8000/live/${streamKey}/index.m3u8`
  }
}