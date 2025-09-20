'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { MediaUpload, MediaPreview } from '@/components/ui/MediaUpload'
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
  Gamepad2,
  ImageIcon,
  X
} from 'lucide-react'
import { streamingService, Stream, formatViewerCount, formatStreamDuration } from '@/lib/streaming'
import { useToast } from '@/components/ui/Toast'
import { MediaUpload as MediaUploadType } from '@/types'
import { getGameLogo, getAvailableGames, getGameCategoryColor } from '@/utils/gameLogos'

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
  const [thumbnailHash, setThumbnailHash] = useState<string>('')
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
          thumbnail_hash: thumbnailHash || undefined,
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
      setThumbnailHash('')
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
    return <DashboardLoadingSkeleton />
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
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-purple-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="relative bg-surface-secondary/50 backdrop-blur-sm border border-border-primary rounded-2xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-lg opacity-50"></div>
                  <div className="relative p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg">
                    <Radio className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Stream Dashboard
                  </h1>
                  <p className="text-text-secondary text-lg">Create, manage, and monitor your live streams</p>
                </div>
              </div>

              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-background-primary/50 backdrop-blur-sm border border-border-secondary rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Video className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text-primary">{streams.length}</p>
                      <p className="text-sm text-text-secondary">Total Streams</p>
                    </div>
                  </div>
                </div>
                <div className="bg-background-primary/50 backdrop-blur-sm border border-border-secondary rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text-primary">{streams.reduce((acc, s) => acc + (s.viewer_count || 0), 0)}</p>
                      <p className="text-sm text-text-secondary">Total Viewers</p>
                    </div>
                  </div>
                </div>
                <div className="bg-background-primary/50 backdrop-blur-sm border border-border-secondary rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text-primary">${streams.reduce((acc, s) => acc + Number(s.total_tips || 0), 0).toFixed(2)}</p>
                      <p className="text-sm text-text-secondary">Total Earned</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                onClick={() => window.open('https://obsproject.com/', '_blank')}
                className="border-border-primary text-text-secondary hover:text-text-primary px-6 py-3"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Download OBS
              </Button>

              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg px-8 py-4 text-lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                Create New Stream
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogContent className="bg-background-primary border-border-primary">
                <DialogHeader>
                  <DialogTitle className="text-text-primary">Create New Stream</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
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
                    <label htmlFor="game" className="block text-sm font-medium mb-3 text-text-secondary">
                      Game/Category
                    </label>
                    <div className="space-y-3">
                      <Input
                        id="game"
                        value={gameName}
                        onChange={(e) => setGameName(e.target.value)}
                        placeholder="What are you playing or doing?"
                        maxLength={50}
                        className="bg-background-secondary border-border-primary text-text-primary"
                      />
                      <div className="bg-background-tertiary rounded-lg p-3">
                        <p className="text-xs font-medium text-text-secondary mb-3">Popular Games:</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {getAvailableGames().slice(0, 8).map((game) => (
                            <button
                              key={game.key}
                              type="button"
                              onClick={() => setGameName(game.name)}
                              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-background-secondary transition-colors group"
                            >
                              <img
                                src={game.logo}
                                alt={game.name}
                                className="w-8 h-8 rounded object-cover group-hover:scale-110 transition-transform"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                              <span className="text-xs text-text-tertiary group-hover:text-text-secondary transition-colors">
                                {game.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-3 text-text-secondary">
                      Stream Thumbnail (Optional)
                    </label>
                    {thumbnailHash ? (
                      <div className="space-y-3">
                        <div className="relative w-full aspect-video bg-background-secondary rounded-lg border border-border-primary overflow-hidden">
                          <MediaPreview
                            ipfsHash={thumbnailHash}
                            type="image/jpeg"
                            alt="Stream thumbnail"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setThumbnailHash('')}
                            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-text-tertiary">Great! This thumbnail will be shown when you're live</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <MediaUpload
                          accept="images"
                          maxFiles={1}
                          onFilesUploaded={(uploads: MediaUploadType[]) => {
                            if (uploads.length > 0 && uploads[0].ipfs_hash) {
                              setThumbnailHash(uploads[0].ipfs_hash)
                            }
                          }}
                          className="w-full"
                        />
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <ImageIcon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="text-blue-200 font-medium">Pro Tip:</p>
                              <p className="text-blue-300 text-xs mt-1">
                                Upload a custom thumbnail to make your stream stand out! Recommended size: 1920x1080px
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-green-200 font-semibold mb-2">Next Steps After Creating:</p>
                        <ul className="text-green-300 text-xs space-y-1">
                          <li>• Get RTMP URL and Stream Key for OBS</li>
                          <li>• Configure OBS with your streaming settings</li>
                          <li>• Start broadcasting and go live!</li>
                          {thumbnailHash && <li>• Your custom thumbnail will be displayed</li>}
                        </ul>
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

      {streams.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Empty State */}
          <Card className="border-border-primary bg-surface-secondary overflow-hidden">
            <CardContent className="p-8 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5"></div>
              <div className="relative">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-full blur-xl"></div>
                  <div className="relative bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full flex items-center justify-center w-full h-full border border-purple-500/30">
                    <Radio className="w-12 h-12 text-purple-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-text-primary">Ready to Start Streaming?</h3>
                <p className="text-text-secondary mb-8 max-w-sm mx-auto text-lg">
                  Create your first stream and start sharing your adventures with the community!
                </p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl px-8 py-4 text-lg"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Create Your First Stream
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Setup Guide */}
          <Card className="border-border-primary bg-surface-secondary overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-3 text-text-primary text-xl">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <HelpCircle className="w-6 h-6 text-blue-400" />
                </div>
                How to Start Streaming
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg">1</div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text-primary text-lg">Download OBS Studio</p>
                    <p className="text-text-secondary">Free streaming software to broadcast your content</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg">2</div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text-primary text-lg">Create a Stream</p>
                    <p className="text-text-secondary">Set up your stream title and category</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg">3</div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text-primary text-lg">Configure OBS</p>
                    <p className="text-text-secondary">Use the RTMP URL and Stream Key we provide</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg">4</div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text-primary text-lg">Start Broadcasting</p>
                    <p className="text-text-secondary">Hit "Start Streaming" in OBS and go live!</p>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => window.open('https://obsproject.com/download', '_blank')}
                className="w-full border-border-primary text-text-secondary hover:text-text-primary py-3"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Download OBS Studio
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-8">
          {streams.map((stream) => {
            const status = getStreamStatus(stream)
            return (
              <Card key={stream.id} className="border-border-primary bg-surface-secondary overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                <CardContent className="p-0">
                  {/* Enhanced Stream Header */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5"></div>
                    <div className="relative p-8">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-4 flex-wrap">
                            <h3 className="text-2xl font-bold text-text-primary group-hover:text-purple-400 transition-colors">{stream.title}</h3>
                            {getStatusBadge(status)}
                          </div>

                          <p className="text-text-secondary text-lg">{getStatusDescription(status)}</p>

                          {stream.game_name && (
                            <div className="flex items-center gap-3 bg-background-primary/50 rounded-lg px-4 py-2 w-fit">
                              <div className="flex items-center gap-2">
                                <img
                                  src={getGameLogo(stream.game_name)}
                                  alt={stream.game_name}
                                  className="w-6 h-6 rounded object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                    if (fallback) fallback.style.display = 'flex'
                                  }}
                                />
                                <Gamepad2 className="w-5 h-5 text-purple-400" style={{ display: 'none' }} />
                              </div>
                              <span className="text-text-secondary font-medium">Playing: {stream.game_name}</span>
                            </div>
                          )}

                          {/* Enhanced Stream Stats */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 bg-background-primary/30 rounded-lg p-3">
                              <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Eye className="w-4 h-4 text-blue-400" />
                              </div>
                              <div>
                                <p className="text-lg font-semibold text-text-primary">{formatViewerCount(stream.viewer_count)}</p>
                                <p className="text-xs text-text-tertiary">Viewers</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 bg-background-primary/30 rounded-lg p-3">
                              <div className="p-2 bg-green-500/20 rounded-lg">
                                <DollarSign className="w-4 h-4 text-green-400" />
                              </div>
                              <div>
                                <p className="text-lg font-semibold text-text-primary">${Number(stream.total_tips || 0).toFixed(2)}</p>
                                <p className="text-xs text-text-tertiary">Earned</p>
                              </div>
                            </div>
                            {stream.started_at && (
                              <div className="flex items-center gap-3 bg-background-primary/30 rounded-lg p-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                  <Clock className="w-4 h-4 text-purple-400" />
                                </div>
                                <div>
                                  <p className="text-lg font-semibold text-text-primary">
                                    {status === 'live' ? formatStreamDuration(stream.started_at) :
                                     status === 'ready' ? 'Ready' :
                                     'Created'}
                                  </p>
                                  <p className="text-xs text-text-tertiary">
                                    {status === 'live' ? 'Duration' : 'Status'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Enhanced Action Buttons */}
                        <div className="flex flex-col gap-3 flex-shrink-0">
                          {stream.is_active && (
                            <Button
                              variant="outline"
                              onClick={() => viewStream(stream.stream_key)}
                              className="border-border-primary text-text-secondary hover:text-text-primary hover:border-purple-500/50 px-6 py-3"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Watch Stream
                            </Button>
                          )}
                          {stream.is_active && (
                            <Button
                              variant="outline"
                              onClick={() => endStream(stream.stream_key)}
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 px-6 py-3"
                            >
                              <Square className="w-4 h-4 mr-2" />
                              End Stream
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced RTMP Configuration Panel */}
                  {stream.is_active && (
                    <div className="border-t border-border-secondary bg-gradient-to-br from-background-tertiary to-background-secondary">
                      <div className="p-8">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-xl font-bold text-text-primary flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                              <Settings className="w-5 h-5 text-purple-400" />
                            </div>
                            OBS Configuration
                          </h4>
                          <div className="flex items-center gap-3">
                            {status === 'ready' ? (
                              <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/30">
                                <Wifi className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-medium text-blue-400">Waiting for connection</span>
                              </div>
                            ) : status === 'broadcasting' ? (
                              <div className="flex items-center gap-2 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/30">
                                <Radio className="w-4 h-4 text-green-400" />
                                <span className="text-sm font-medium text-green-400">Connected</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/30">
                                <WifiOff className="w-4 h-4 text-red-400" />
                                <span className="text-sm font-medium text-red-400">Offline</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-semibold text-text-secondary">RTMP Server URL</label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(stream.rtmp_url || '', 'RTMP URL')}
                                className="h-8 px-3 text-sm hover:bg-purple-500/10"
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy
                              </Button>
                            </div>
                            <Input
                              value={stream.rtmp_url || ''}
                              readOnly
                              className="text-sm font-mono bg-background-primary border-border-primary text-text-primary py-3"
                            />
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-semibold text-text-secondary">Stream Key</label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(stream.stream_key, 'Stream Key')}
                                className="h-8 px-3 text-sm hover:bg-purple-500/10"
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy
                              </Button>
                            </div>
                            <Input
                              value={stream.stream_key}
                              readOnly
                              type="password"
                              className="text-sm font-mono bg-background-primary border-border-primary text-text-primary py-3"
                            />
                          </div>
                        </div>

                        {/* Enhanced Setup Instructions */}
                        <div className="mt-6 p-6 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                              <Monitor className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                              <p className="text-purple-200 font-semibold text-lg mb-3">Quick OBS Setup:</p>
                              <div className="space-y-2 text-purple-300">
                                <p className="flex items-center gap-2">
                                  <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                  Go to OBS Settings → Stream
                                </p>
                                <p className="flex items-center gap-2">
                                  <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                  Set Service to "Custom..."
                                </p>
                                <p className="flex items-center gap-2">
                                  <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                  Paste the Server URL and Stream Key above
                                </p>
                                <p className="flex items-center gap-2">
                                  <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                                  Click "Start Streaming" in OBS
                                </p>
                              </div>
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

function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="relative overflow-hidden">
        <div className="bg-surface-secondary/50 border border-border-primary rounded-2xl p-8">
          <div className="animate-pulse">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-surface-tertiary rounded-2xl"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-surface-tertiary rounded w-64"></div>
                    <div className="h-5 bg-surface-tertiary rounded w-80"></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-background-primary/50 border border-border-secondary rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-surface-tertiary rounded-lg"></div>
                        <div className="space-y-2">
                          <div className="h-6 bg-surface-tertiary rounded w-12"></div>
                          <div className="h-3 bg-surface-tertiary rounded w-20"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="h-12 bg-surface-tertiary rounded-lg w-32"></div>
                <div className="h-14 bg-surface-tertiary rounded-lg w-40"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="border-border-primary bg-surface-secondary">
            <CardContent className="p-8">
              <div className="animate-pulse space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-surface-tertiary rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-surface-tertiary rounded w-48"></div>
                    <div className="h-4 bg-surface-tertiary rounded w-64"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-surface-tertiary rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-surface-tertiary rounded w-32"></div>
                        <div className="h-3 bg-surface-tertiary rounded w-48"></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="h-12 bg-surface-tertiary rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}