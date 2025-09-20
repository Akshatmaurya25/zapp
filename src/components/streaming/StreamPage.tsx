'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import {
  Eye,
  DollarSign,
  Clock,
  Share2,
  Heart,
  Users,
  ArrowLeft,
  Gamepad2,
  Gift
} from 'lucide-react'
import VideoPlayer from './VideoPlayer'
import SimpleRTMPPlayer from './SimpleRTMPPlayer'
import TipModal from './TipModal'
import { streamingService, Stream, StreamTip, formatViewerCount, formatStreamDuration } from '@/lib/streaming'
import { useToast } from '@/components/ui/Toast'

interface StreamPageProps {
  streamKey: string
}

export default function StreamPage({ streamKey }: StreamPageProps) {
  const [stream, setStream] = useState<Stream | null>(null)
  const [tips, setTips] = useState<StreamTip[]>([])
  const [loading, setLoading] = useState(true)
  const [showTipModal, setShowTipModal] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isReceivingContent, setIsReceivingContent] = useState(false)
  const [hlsFailed, setHlsFailed] = useState(false)

  const router = useRouter()
  const { showToast } = useToast()

  useEffect(() => {
    fetchStream()
    fetchTips()

    // Set up real-time updates
    const socket = streamingService.connectSocket()
    streamingService.joinStream(streamKey)

    // Check for streaming content every 5 seconds
    const checkStreamingContent = async () => {
      try {
        const response = await fetch(`http://localhost:9000/api/streams/${streamKey}/status`)
        if (response.ok) {
          const data = await response.json()
          console.log('Stream status check:', data)
          setIsReceivingContent(data.isReceivingContent || false)
        } else {
          console.warn('Stream status check failed:', response.status)
          setIsReceivingContent(false)
        }
      } catch (error) {
        console.error('Stream status check error:', error)
        // If the streaming server is down, assume no content is being received
        setIsReceivingContent(false)
      }
    }

    // Initial check
    checkStreamingContent()

    // Set up interval for content checking
    const contentCheckInterval = setInterval(checkStreamingContent, 5000)

    streamingService.onViewerCountUpdate((data) => {
      if (data.streamKey === streamKey) {
        setStream(prev => prev ? { ...prev, viewer_count: data.viewerCount } : null)
      }
    })

    streamingService.onNewTip((tipData) => {
      if (tipData.streamKey === streamKey) {
        setTips(prev => [tipData.tip, ...prev])
        setStream(prev => prev ? {
          ...prev,
          total_tips: (parseFloat(prev.total_tips?.toString() || '0') + parseFloat(tipData.tip.amount)).toString()
        } : null)

        // Show tip notification
        showToast({
          title: `💰 ${tipData.tip.tipper_wallet.slice(0, 6)}... tipped ${tipData.tip.amount} ETH!`,
          type: 'success'
        })
      }
    })

    streamingService.onStreamEnded((data) => {
      if (data.streamKey === streamKey) {
        showToast({ title: 'Stream has ended', type: 'info' })
        setStream(prev => prev ? { ...prev, is_active: false, is_live: false } : null)
        setIsReceivingContent(false)
      }
    })

    return () => {
      clearInterval(contentCheckInterval)
      streamingService.leaveStream(streamKey)
      streamingService.offViewerCountUpdate()
      streamingService.offNewTip()
      streamingService.offStreamEnded()
    }
  }, [streamKey])

  const fetchStream = async () => {
    try {
      const streamData = await streamingService.getStream(streamKey)
      console.log('Stream data fetched:', streamData)
      console.log('HLS URL in stream data:', streamData.hls_url)
      console.log('User data in stream:', streamData.users)
      setStream(streamData)
    } catch (error) {
      console.error('Failed to fetch stream:', error)
      showToast({ title: 'Stream not found', type: 'error' })
      router.push('/streams')
    } finally {
      setLoading(false)
    }
  }

  const fetchTips = async () => {
    if (!stream?.id) return

    try {
      const { tips: streamTips } = await streamingService.getStreamTips(stream.id, 20)
      setTips(streamTips)
    } catch (error) {
      console.error('Failed to fetch tips:', error)
    }
  }

  const shareStream = async () => {
    const url = `${window.location.origin}/stream/${streamKey}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: stream?.title || 'Live Stream',
          text: `Watch ${stream?.users?.display_name || 'this streamer'} live!`,
          url: url
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        showToast({ title: 'Stream link copied to clipboard!', type: 'success' })
      } catch (error) {
        showToast({ title: 'Failed to copy link', type: 'error' })
      }
    }
  }

  const toggleFollow = async () => {
    // This would integrate with your existing follow system
    setIsFollowing(!isFollowing)
    showToast({
      title: isFollowing ? 'Unfollowed streamer' : 'Now following streamer!',
      type: 'success'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-surface-secondary rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-4">
                <div className="aspect-video bg-surface-secondary rounded-lg"></div>
                <Card className="p-6 border-border-primary">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-surface-secondary rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-5 bg-surface-secondary rounded w-2/3"></div>
                      <div className="h-4 bg-surface-secondary rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-16 bg-surface-secondary rounded"></div>
                    ))}
                  </div>
                </Card>
              </div>
              <div className="space-y-4">
                <Card className="p-4 border-border-primary">
                  <div className="h-5 bg-surface-secondary rounded w-1/2 mb-4"></div>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-10 bg-surface-secondary rounded"></div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md border-border-primary bg-surface-secondary">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full flex items-center justify-center">
            <Eye className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold mb-3 text-text-primary">Stream Not Found</h2>
          <p className="text-text-secondary mb-6">
            This stream may have ended or the link is invalid. Don't worry, there are plenty of other great streams to watch!
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/streams')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Browse Live Streams
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full border-border-primary text-text-secondary hover:text-text-primary"
            >
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="border-border-primary text-text-secondary hover:text-text-primary w-fit"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Streams
          </Button>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-text-primary truncate">{stream.title}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {stream.is_active && stream.is_live && (
                <Badge variant="destructive" className="animate-pulse text-xs">
                  🔴 LIVE
                </Badge>
              )}
              {stream.is_active && isReceivingContent && (
                <Badge className="bg-green-600 hover:bg-green-700 text-white text-xs animate-pulse">
                  📡 Receiving OBS
                </Badge>
              )}
              {stream.is_active && isReceivingContent && hlsFailed && (
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  🎥 RTMP Live
                </Badge>
              )}
              {stream.is_active && !isReceivingContent && (
                <Badge variant="outline" className="border-orange-500 text-orange-500 text-xs">
                  ⏳ Waiting for OBS
                </Badge>
              )}
              {stream.is_active && stream.is_live && (
                <span className="text-sm text-text-secondary">
                  {formatViewerCount(stream.viewer_count || 0)} watching now
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={shareStream} className="border-border-primary text-text-secondary hover:text-text-primary">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Player */}
            <Card className="overflow-hidden border-border-primary bg-surface-secondary">
              <div className="relative">
                {stream.is_active && isReceivingContent ? (
                  <div className="relative w-full">
                    {stream.hls_url && stream.hls_url.trim() !== '' && !hlsFailed ? (
                      <VideoPlayer
                        src={stream.hls_url}
                        className="aspect-video w-full"
                        onError={() => {
                          console.log('HLS error occurred, may fall back to RTMP view')
                        }}
                        onTimeout={() => {
                          console.log('HLS timeout, falling back to RTMP view')
                          setHlsFailed(true)
                        }}
                      />
                    ) : (
                      <SimpleRTMPPlayer
                        streamKey={stream.stream_key}
                        isReceivingContent={isReceivingContent}
                        className="w-full"
                      />
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center relative">
                    {/* Live stream animation for when receiving content */}
                    {stream.is_active && isReceivingContent && (
                      <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 to-purple-900/30 animate-pulse" />
                    )}

                    <div className="text-center text-white p-8 relative z-10">
                      <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center border ${
                        stream.is_active && isReceivingContent
                          ? 'bg-gradient-to-r from-red-600/40 to-purple-600/40 border-red-400/30 animate-pulse'
                          : 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-white/10'
                      }`}>
                        {stream.is_active && isReceivingContent ? (
                          <div className="relative">
                            <div className="w-4 h-4 bg-red-500 rounded-full animate-ping absolute -top-1 -right-1" />
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                              <div className="w-6 h-6 bg-white rounded-full" />
                            </div>
                          </div>
                        ) : (
                          <Eye className="w-10 h-10 text-purple-400" />
                        )}
                      </div>

                      <h3 className="text-xl font-semibold mb-3">
                        {stream.is_active && isReceivingContent
                          ? '🔴 LIVE STREAM ACTIVE'
                          : stream.is_active
                            ? 'Stream Starting Soon'
                            : 'Stream Offline'
                        }
                      </h3>

                      <p className="text-gray-300 mb-4">
                        {stream.is_active && isReceivingContent
                          ? hlsFailed
                            ? 'The streamer is live! Broadcasting via RTMP protocol.'
                            : 'The streamer is live and broadcasting! Video transcoding for web playback is being configured.'
                          : stream.is_active
                            ? 'The streamer is setting up. Stream will begin shortly.'
                            : 'This stream has ended. Check out other live streams!'}
                      </p>

                      {stream.is_active && isReceivingContent && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-green-400 text-sm font-medium">Receiving from OBS Studio</span>
                          </div>
                          <div className={`border rounded-lg p-3 text-sm ${
                            hlsFailed
                              ? 'bg-blue-500/20 border-blue-500/30'
                              : 'bg-green-500/20 border-green-500/30'
                          }`}>
                            <p className={hlsFailed ? 'text-blue-200' : 'text-green-200'}>
                              <strong>Stream Status:</strong> {hlsFailed
                                ? 'Your OBS is connected and streaming live via RTMP protocol.'
                                : 'Your OBS is connected and sending video data to the RTMP server. Video transcoding to web format (HLS) will be available in a future update.'
                              }
                            </p>
                          </div>
                        </div>
                      )}

                      {!stream.is_active && (
                        <Button
                          variant="outline"
                          onClick={() => router.push('/streams')}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          Browse Live Streams
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Live indicator overlay */}
                {stream.is_active && stream.is_live && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="destructive" className="animate-pulse shadow-lg">
                      🔴 LIVE
                    </Badge>
                  </div>
                )}

                {/* OBS Content indicator overlay */}
                {stream.is_active && (
                  <div className="absolute top-4 left-20">
                    {isReceivingContent ? (
                      <>
                        <Badge className="bg-green-600/90 backdrop-blur-sm text-white shadow-lg animate-pulse mr-2">
                          📡 Receiving
                        </Badge>
                        {hlsFailed && (
                          <Badge className="bg-blue-600/90 backdrop-blur-sm text-white shadow-lg">
                            🎥 RTMP Live
                          </Badge>
                        )}
                      </>
                    ) : (
                      <Badge className="bg-orange-600/90 backdrop-blur-sm text-white shadow-lg">
                        ⏳ Waiting for OBS
                      </Badge>
                    )}
                  </div>
                )}

                {/* Viewer count overlay */}
                {stream.is_active && stream.is_live && (
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {formatViewerCount(stream.viewer_count || 0)}
                  </div>
                )}
              </div>
            </Card>

            {/* Stream Info */}
            <Card className="border-border-primary bg-surface-secondary">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16 ring-2 ring-purple-500/20">
                      {stream.users?.avatar_ipfs ? (
                        <img
                          src={`https://gateway.pinata.cloud/ipfs/${stream.users.avatar_ipfs}`}
                          alt="Streamer"
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            console.error('Avatar loading failed for stream:', stream.stream_key, 'IPFS hash:', stream.users?.avatar_ipfs)
                            e.currentTarget.style.display = 'none'
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement
                            if (fallback) fallback.style.display = 'flex'
                          }}
                          onLoad={() => {
                            console.log('Avatar loaded successfully for stream:', stream.stream_key)
                          }}
                        />
                      ) : null}
                      <div
                        className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-medium text-xl rounded-full"
                        style={{ display: stream.users?.avatar_ipfs ? 'none' : 'flex' }}
                      >
                        {(stream.users?.display_name || stream.users?.username || 'U')[0].toUpperCase()}
                      </div>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-semibold text-text-primary mb-1">{stream.title}</h2>
                      <p className="text-text-secondary font-medium">
                        {stream.users?.display_name || stream.users?.username || 'Unknown Streamer'}
                      </p>
                      {stream.game_name && (
                        <div className="flex items-center gap-2 mt-2">
                          <Gamepad2 className="w-4 h-4 text-purple-400" />
                          <Badge variant="secondary" className="text-xs">
                            {stream.game_name}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <Button
                      variant={isFollowing ? "default" : "outline"}
                      size="sm"
                      onClick={toggleFollow}
                      className={`${isFollowing ? 'bg-purple-600 hover:bg-purple-700' : 'border-border-primary text-text-secondary hover:text-text-primary'}`}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => setShowTipModal(true)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      Send Tip
                    </Button>
                  </div>
                </div>

                {/* Stream Stats */}
                <div className={`grid gap-4 p-4 bg-background-primary rounded-lg border border-border-secondary ${stream.is_active ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'}`}>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-lg font-semibold text-text-primary">
                      {formatViewerCount(stream.viewer_count || 0)}
                    </div>
                    <div className="text-xs text-text-tertiary">Viewers</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div className="text-lg font-semibold text-text-primary">
                      ${Number(stream.total_tips || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-text-tertiary">Total Tips</div>
                  </div>

                  {stream.started_at && stream.is_live && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="text-lg font-semibold text-text-primary">
                        {formatStreamDuration(stream.started_at)}
                      </div>
                      <div className="text-xs text-text-tertiary">Duration</div>
                    </div>
                  )}

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-pink-400 mb-1">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div className="text-lg font-semibold text-text-primary">
                      {stream.is_active && stream.is_live ? 'LIVE' : 'OFFLINE'}
                    </div>
                    <div className="text-xs text-text-tertiary">Stream Status</div>
                  </div>

                  {stream.is_active && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {isReceivingContent ? (
                          <div className="w-4 h-4 text-green-400">📡</div>
                        ) : (
                          <div className="w-4 h-4 text-orange-400">⏳</div>
                        )}
                      </div>
                      <div className={`text-lg font-semibold ${isReceivingContent ? 'text-green-400' : 'text-orange-400'}`}>
                        {isReceivingContent ? 'RECEIVING' : 'WAITING'}
                      </div>
                      <div className="text-xs text-text-tertiary">OBS Status</div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-border-primary bg-surface-secondary">
              <div className="p-4">
                <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-purple-400" />
                  Support the Streamer
                </h3>
                <div className="space-y-3">
                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md"
                    onClick={() => setShowTipModal(true)}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Send Crypto Tip
                  </Button>

                  <Button
                    variant={isFollowing ? "default" : "outline"}
                    className={`w-full ${isFollowing ? 'bg-purple-600 hover:bg-purple-700' : 'border-border-primary text-text-secondary hover:text-text-primary'}`}
                    onClick={toggleFollow}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-border-primary text-text-secondary hover:text-text-primary"
                    onClick={shareStream}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Stream
                  </Button>
                </div>
              </div>
            </Card>

            {/* Recent Tips */}
            <Card className="border-border-primary bg-surface-secondary">
              <div className="p-4">
                <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  Recent Tips
                  {tips.length > 0 && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {tips.length}
                    </Badge>
                  )}
                </h3>

                {tips.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                    {tips.map((tip) => (
                      <div key={tip.id} className="bg-background-primary border border-border-secondary rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-green-400 text-sm">
                            💰 {tip.amount} ETH
                          </span>
                          <span className="text-xs text-text-tertiary">
                            {new Date(tip.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-text-secondary text-sm mb-1">
                          From: <span className="font-mono text-purple-400">{tip.tipper_wallet.slice(0, 6)}...{tip.tipper_wallet.slice(-4)}</span>
                        </div>
                        {tip.message && (
                          <div className="text-text-primary text-sm mt-2 p-2 bg-surface-secondary rounded italic border-l-2 border-green-400">
                            "{tip.message}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-full flex items-center justify-center">
                      <Gift className="w-8 h-8 text-green-400" />
                    </div>
                    <h4 className="font-medium text-text-primary mb-2">No tips yet</h4>
                    <p className="text-sm text-text-secondary mb-4">Be the first to show your support!</p>
                    <Button
                      size="sm"
                      onClick={() => setShowTipModal(true)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      Send First Tip
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Tip Modal */}
      {showTipModal && (
        <TipModal
          isOpen={showTipModal}
          onClose={() => setShowTipModal(false)}
          stream={stream}
        />
      )}
    </div>
  )
}