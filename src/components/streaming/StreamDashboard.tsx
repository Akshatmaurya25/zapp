'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import {
  Copy,
  Play,
  Square,
  Eye,
  DollarSign,
  Monitor,
  Settings,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Radio,
  ExternalLink,
  Zap,
  Video,
  Wifi,
  WifiOff,
  Gamepad2
} from 'lucide-react'
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
    window.open(`/stream/${streamKey}`, '_blank')
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

  // Helper functions for stream status
  const getStreamStatus = (stream: Stream) => {
    if (!stream.is_active) return 'ended'
    if (stream.is_live) return 'live'
    if (stream.viewer_count > 0) return 'broadcasting'
    return 'ready'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-red-600 text-white animate-pulse">🔴 LIVE</Badge>
      case 'broadcasting':
        return <Badge className="bg-green-600 text-white">📡 Broadcasting</Badge>
      case 'ready':
        return <Badge className="bg-blue-600 text-white">⚡ Ready</Badge>
      case 'ended':
        return <Badge variant="outline" className="text-gray-400">⏹️ Ended</Badge>
      default:
        return <Badge variant="outline">❓ Unknown</Badge>
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'live':
        return 'Your stream is live and viewers can watch!'
      case 'broadcasting':
        return 'Connected to RTMP - stream should be live soon'
      case 'ready':
        return 'Stream created - configure OBS and start broadcasting'
      case 'ended':
        return 'Stream has ended - view analytics or create a new one'
      default:
        return 'Unknown stream status'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-text-primary">Stream Dashboard</h1>
                <p className="text-text-secondary">Create, manage, and monitor your live streams</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2 text-text-tertiary">
                <Video className="w-4 h-4" />
                <span>{streams.length} total streams</span>
              </div>
              <div className="flex items-center gap-2 text-text-tertiary">
                <Users className="w-4 h-4" />
                <span>{streams.reduce((acc, s) => acc + (s.viewer_count || 0), 0)} total viewers</span>
              </div>
              <div className="flex items-center gap-2 text-text-tertiary">
                <DollarSign className="w-4 h-4" />
                <span>${streams.reduce((acc, s) => acc + Number(s.total_tips || 0), 0).toFixed(2)} earned</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => window.open('https://obsproject.com/', '_blank')}
              className="border-border-primary text-text-secondary hover:text-text-primary"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Download OBS
            </Button>

            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
            >
              <Zap className="w-4 h-4 mr-2" />
              Create New Stream
            </Button>

            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogContent className="bg-background-primary border-border-primary">
                <DialogHeader>
                  <DialogTitle className="text-text-primary">Create New Stream</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-2 text-text-secondary">
                      Stream Title *
                    </label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter an engaging stream title..."
                      maxLength={100}
                      className="bg-background-secondary border-border-primary text-text-primary"
                    />
                    <p className="text-xs text-text-tertiary mt-1">Make it catchy to attract more viewers!</p>
                  </div>
                  <div>
                    <label htmlFor="game" className="block text-sm font-medium mb-2 text-text-secondary">
                      Game/Category
                    </label>
                    <Input
                      id="game"
                      value={gameName}
                      onChange={(e) => setGameName(e.target.value)}
                      placeholder="What are you playing or doing?"
                      maxLength={50}
                      className="bg-background-secondary border-border-primary text-text-primary"
                    />
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-blue-200 font-medium">Next Steps After Creating:</p>
                        <p className="text-blue-300 text-xs mt-1">You'll get RTMP details to configure in OBS, then you can start broadcasting!</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                      disabled={creating}
                      className="border-border-primary text-text-secondary"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={createStream}
                      disabled={creating || !title.trim()}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {creating ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Create Stream
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {streams.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Empty State */}
          <Card className="border-border-primary bg-surface-secondary">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full flex items-center justify-center">
                <Radio className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text-primary">Ready to Start Streaming?</h3>
              <p className="text-text-secondary mb-6 max-w-sm mx-auto">
                Create your first stream and start sharing your gaming adventures with the community!
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                Create Your First Stream
              </Button>
            </CardContent>
          </Card>

          {/* Quick Setup Guide */}
          <Card className="border-border-primary bg-surface-secondary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-text-primary">
                <HelpCircle className="w-5 h-5 text-purple-400" />
                How to Start Streaming
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">1</div>
                  <div>
                    <p className="font-medium text-text-primary">Download OBS Studio</p>
                    <p className="text-sm text-text-secondary">Free streaming software to broadcast your content</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">2</div>
                  <div>
                    <p className="font-medium text-text-primary">Create a Stream</p>
                    <p className="text-sm text-text-secondary">Set up your stream title and category</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">3</div>
                  <div>
                    <p className="font-medium text-text-primary">Configure OBS</p>
                    <p className="text-sm text-text-secondary">Use the RTMP URL and Stream Key we provide</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">4</div>
                  <div>
                    <p className="font-medium text-text-primary">Start Broadcasting</p>
                    <p className="text-sm text-text-secondary">Hit "Start Streaming" in OBS and go live!</p>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => window.open('https://obsproject.com/download', '_blank')}
                className="w-full border-border-primary text-text-secondary hover:text-text-primary"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Download OBS Studio
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {streams.map((stream) => {
            const status = getStreamStatus(stream)
            return (
              <Card key={stream.id} className="border-border-primary bg-surface-secondary overflow-hidden">
                <CardContent className="p-0">
                  {/* Stream Header */}
                  <div className="p-6 pb-4">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-xl font-semibold text-text-primary">{stream.title}</h3>
                          {getStatusBadge(status)}
                        </div>

                        <p className="text-text-secondary text-sm">{getStatusDescription(status)}</p>

                        {stream.game_name && (
                          <div className="flex items-center gap-2">
                            <Gamepad2 className="w-4 h-4 text-purple-400" />
                            <span className="text-text-secondary">Playing: {stream.game_name}</span>
                          </div>
                        )}

                        {/* Stream Stats */}
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2 text-text-tertiary">
                            <Eye className="w-4 h-4" />
                            <span>{formatViewerCount(stream.viewer_count)} viewers</span>
                          </div>
                          <div className="flex items-center gap-2 text-text-tertiary">
                            <DollarSign className="w-4 h-4" />
                            <span>${Number(stream.total_tips || 0).toFixed(2)} earned</span>
                          </div>
                          {stream.started_at && (
                            <div className="flex items-center gap-2 text-text-tertiary">
                              <Clock className="w-4 h-4" />
                              <span>
                                {status === 'live' ? `${formatStreamDuration(stream.started_at)} live` :
                                 status === 'ready' ? 'Ready to go live' :
                                 'Stream created'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {stream.is_active && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewStream(stream.stream_key)}
                            className="border-border-primary text-text-secondary hover:text-text-primary"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Watch Stream
                          </Button>
                        )}
                        {stream.is_active && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => endStream(stream.stream_key)}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            <Square className="w-4 h-4 mr-2" />
                            End Stream
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RTMP Configuration Panel */}
                  {stream.is_active && (
                    <div className="border-t border-border-secondary bg-background-tertiary">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-text-primary flex items-center gap-2">
                            <Settings className="w-4 h-4 text-purple-400" />
                            OBS Configuration
                          </h4>
                          <div className="flex items-center gap-2">
                            {status === 'ready' ? (
                              <div className="flex items-center gap-2 text-blue-400">
                                <Wifi className="w-4 h-4" />
                                <span className="text-sm">Waiting for connection</span>
                              </div>
                            ) : status === 'broadcasting' ? (
                              <div className="flex items-center gap-2 text-green-400">
                                <Radio className="w-4 h-4" />
                                <span className="text-sm">Connected</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-red-400">
                                <WifiOff className="w-4 h-4" />
                                <span className="text-sm">Offline</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-medium text-text-secondary">RTMP Server URL</label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(stream.rtmp_url || '', 'RTMP URL')}
                                className="h-6 px-2 text-xs"
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Copy
                              </Button>
                            </div>
                            <Input
                              value={stream.rtmp_url || ''}
                              readOnly
                              className="text-xs font-mono bg-background-primary border-border-primary text-text-primary"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-medium text-text-secondary">Stream Key</label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(stream.stream_key, 'Stream Key')}
                                className="h-6 px-2 text-xs"
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Copy
                              </Button>
                            </div>
                            <Input
                              value={stream.stream_key}
                              readOnly
                              type="password"
                              className="text-xs font-mono bg-background-primary border-border-primary text-text-primary"
                            />
                          </div>
                        </div>

                        {/* Quick Setup Instructions */}
                        <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Monitor className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="text-purple-200 font-medium mb-1">Quick OBS Setup:</p>
                              <p className="text-purple-300 text-xs">
                                1. Go to OBS Settings → Stream<br/>
                                2. Set Service to "Custom..."<br/>
                                3. Paste the Server URL and Stream Key above<br/>
                                4. Click "Start Streaming" in OBS
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}