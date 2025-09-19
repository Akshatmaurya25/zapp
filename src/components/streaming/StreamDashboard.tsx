'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Badge } from '@/components/ui/Badge'
import { Copy, Play, Square, Settings, Eye, DollarSign } from 'lucide-react'
import { streamingService, Stream, formatViewerCount, formatStreamDuration } from '@/lib/streaming'
import { useToast } from '@/components/ui/Toast'

interface StreamDashboardProps {
  userToken: string // wallet address for identification
  userId: string
}

export default function StreamDashboard({ userToken, userId }: StreamDashboardProps) {
  const [streams, setStreams] = useState<Stream[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [gameName, setGameName] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()

  useEffect(() => {
    fetchUserStreams()

    // Set up real-time updates
    const socket = streamingService.connectSocket()

    streamingService.onStreamStarted((data) => {
      if (data.streamer === userId) {
        fetchUserStreams()
      }
    })

    streamingService.onStreamEnded((data) => {
      if (data.streamer === userId) {
        fetchUserStreams()
      }
    })

    return () => {
      streamingService.offStreamStarted()
      streamingService.offStreamEnded()
    }
  }, [userId])

  const fetchUserStreams = async () => {
    try {
      const { streams: allStreams } = await streamingService.getStreams(false, 50)
      const userStreams = allStreams.filter(stream => stream.streamer_id === userId)
      setStreams(userStreams)
    } catch (error) {
      console.error('Failed to fetch streams:', error)
      showToast({ title: 'Failed to fetch streams', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const createStream = async () => {
    if (!title.trim()) {
      showToast({ title: 'Please enter a stream title', type: 'error' })
      return
    }

    setCreating(true)
    try {
      // Create stream using direct API call with user ID
      const response = await fetch('/api/streams/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim(),
          game_name: gameName.trim() || undefined,
          userId: userId
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create stream')
      }

      const newStream = await response.json()
      setStreams(prev => [newStream.stream, ...prev])
      setShowCreateModal(false)
      setTitle('')
      setGameName('')
      showToast({ title: 'Stream created successfully!', type: 'success' })
    } catch (error) {
      console.error('Failed to create stream:', error)
      showToast({ title: error instanceof Error ? error.message : 'Failed to create stream', type: 'error' })
    } finally {
      setCreating(false)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast({ title: `${label} copied to clipboard!`, type: 'success' })
    } catch (error) {
      showToast({ title: 'Failed to copy to clipboard', type: 'error' })
    }
  }

  const endStream = async (streamKey: string) => {
    try {
      const response = await fetch(`/api/streams/${streamKey}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to end stream')
      }

      await fetchUserStreams()
      showToast({ title: 'Stream ended successfully', type: 'success' })
    } catch (error) {
      console.error('Failed to end stream:', error)
      showToast({ title: error instanceof Error ? error.message : 'Failed to end stream', type: 'error' })
    }
  }

  const viewStream = (streamKey: string) => {
    router.push(`/stream/${streamKey}`)
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Stream Dashboard</h1>
          <p className="text-gray-600">Manage your live streams and view analytics</p>
        </div>

        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild onClick={() => setShowCreateModal(true)}>
            <Button>
              <Play className="w-4 h-4 mr-2" />
              Create Stream
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Stream</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Stream Title *
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter stream title..."
                  maxLength={100}
                />
              </div>
              <div>
                <label htmlFor="game" className="block text-sm font-medium mb-2">
                  Game/Category
                </label>
                <Input
                  id="game"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  placeholder="What are you playing?"
                  maxLength={50}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button onClick={createStream} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Stream'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {streams.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <Play className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No streams yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first stream to start broadcasting to your audience
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Play className="w-4 h-4 mr-2" />
              Create First Stream
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {streams.map((stream) => (
            <Card key={stream.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium">{stream.title}</h3>
                    {stream.is_active && stream.is_live ? (
                      <Badge variant="destructive" className="animate-pulse">
                        🔴 LIVE
                      </Badge>
                    ) : stream.is_active ? (
                      <Badge variant="secondary">Ready</Badge>
                    ) : (
                      <Badge variant="outline">Ended</Badge>
                    )}
                  </div>
                  {stream.game_name && (
                    <p className="text-gray-600 mb-2">Playing: {stream.game_name}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {formatViewerCount(stream.viewer_count)} viewers
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ${Number(stream.total_tips || 0).toFixed(2)} tips
                    </span>
                    {stream.started_at && stream.is_live && (
                      <span>
                        {formatStreamDuration(stream.started_at)} live
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {stream.is_active && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewStream(stream.stream_key)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  )}
                  {stream.is_active && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => endStream(stream.stream_key)}
                    >
                      <Square className="w-4 h-4 mr-1" />
                      End Stream
                    </Button>
                  )}
                </div>
              </div>

              {stream.is_active && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-sm">Stream Configuration</h4>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      RTMP URL
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={stream.rtmp_url || ''}
                        readOnly
                        className="text-xs font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(stream.rtmp_url || '', 'RTMP URL')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Stream Key
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={stream.stream_key}
                        readOnly
                        type="password"
                        className="text-xs font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(stream.stream_key, 'Stream Key')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Configure OBS with the RTMP URL and Stream Key above
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}