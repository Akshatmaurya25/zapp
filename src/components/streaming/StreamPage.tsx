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

  const router = useRouter()
  const { showToast } = useToast()

  useEffect(() => {
    fetchStream()
    fetchTips()

    // Set up real-time updates
    const socket = streamingService.connectSocket()
    streamingService.joinStream(streamKey)

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
      }
    })

    return () => {
      streamingService.leaveStream(streamKey)
      streamingService.offViewerCountUpdate()
      streamingService.offNewTip()
      streamingService.offStreamEnded()
    }
  }, [streamKey])

  const fetchStream = async () => {
    try {
      const streamData = await streamingService.getStream(streamKey)
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
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="aspect-video bg-gray-200 rounded-lg"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-medium mb-2">Stream Not Found</h2>
          <p className="text-gray-600 mb-4">
            This stream may have ended or the link is invalid.
          </p>
          <Button onClick={() => router.push('/streams')}>
            Browse Other Streams
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex-1">
            <h1 className="text-xl font-medium">{stream.title}</h1>
          </div>

          <Button variant="outline" size="sm" onClick={shareStream}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Player */}
            <div className="relative">
              {stream.is_active && stream.is_live && stream.hls_url ? (
                <VideoPlayer
                  src={stream.hls_url}
                  className="aspect-video w-full rounded-lg"
                  onError={() => {
                    showToast({ title: 'Failed to load stream', type: 'error' })
                  }}
                />
              ) : (
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                      <Eye className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Stream Offline</h3>
                    <p className="text-gray-400">
                      {stream.is_active ? 'Stream is starting up...' : 'This stream has ended'}
                    </p>
                  </div>
                </div>
              )}

              {/* Live indicator overlay */}
              {stream.is_active && stream.is_live && (
                <div className="absolute top-4 left-4">
                  <Badge variant="destructive" className="animate-pulse">
                    🔴 LIVE
                  </Badge>
                </div>
              )}
            </div>

            {/* Stream Info */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    {stream.users?.avatar_ipfs ? (
                      <img
                        src={`https://gateway.pinata.cloud/ipfs/${stream.users.avatar_ipfs}`}
                        alt="Streamer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-medium">
                        {(stream.users?.display_name || stream.users?.username || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </Avatar>

                  <div>
                    <h2 className="text-lg font-medium">{stream.title}</h2>
                    <p className="text-gray-600">
                      {stream.users?.display_name || stream.users?.username || 'Unknown Streamer'}
                    </p>
                    {stream.game_name && (
                      <div className="flex items-center gap-2 mt-2">
                        <Gamepad2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{stream.game_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={isFollowing ? "default" : "outline"}
                    size="sm"
                    onClick={toggleFollow}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => setShowTipModal(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Tip
                  </Button>
                </div>
              </div>

              {/* Stream Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {formatViewerCount(stream.viewer_count || 0)} viewers
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  ${Number(stream.total_tips || 0).toFixed(2)} in tips
                </span>
                {stream.started_at && stream.is_live && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatStreamDuration(stream.started_at)} live
                  </span>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Tips */}
            <Card className="p-4">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                Recent Tips
              </h3>

              {tips.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {tips.map((tip) => (
                    <div key={tip.id} className="bg-gray-50 rounded p-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-green-600">
                          {tip.amount} ETH
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(tip.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-gray-600">
                        From: {tip.tipper_wallet.slice(0, 6)}...{tip.tipper_wallet.slice(-4)}
                      </div>
                      {tip.message && (
                        <div className="text-gray-800 mt-1 italic">
                          "{tip.message}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Gift className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No tips yet</p>
                  <p className="text-xs">Be the first to tip!</p>
                </div>
              )}
            </Card>

            {/* Stream Actions */}
            <Card className="p-4">
              <h3 className="font-medium mb-4">Support the Stream</h3>
              <div className="space-y-2">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => setShowTipModal(true)}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Send Tip
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={toggleFollow}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={shareStream}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Stream
                </Button>
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