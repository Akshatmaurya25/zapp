'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Select } from '@/components/ui/Select'
import {
  Search,
  Eye,
  DollarSign,
  Clock,
  Filter,
  Play,
  Users,
  Gamepad2,
  Radio,
  Zap
} from 'lucide-react'
import { streamingService, Stream, formatViewerCount, formatStreamDuration } from '@/lib/streaming'
import { useToast } from '@/components/ui/Toast'
import { getGameLogo, getGameCategoryColor } from '@/utils/gameLogos'

interface StreamBrowserProps {
  showActiveOnly?: boolean
}

type SortOption = 'viewers' | 'recent' | 'tips' | 'duration'
type CategoryFilter = 'all' | 'gaming' | 'just-chatting' | 'creative' | 'music'

export default function StreamBrowser({ showActiveOnly = false }: StreamBrowserProps) {
  const [allStreams, setAllStreams] = useState<Stream[]>([])
  const [liveStreams, setLiveStreams] = useState<Stream[]>([])
  const [endedStreams, setEndedStreams] = useState<Stream[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('viewers')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [showFilters, setShowFilters] = useState(false)

  const router = useRouter()
  const { showToast } = useToast()

  const fetchStreams = useCallback(async () => {
    try {
      // Fetch both live and ended streams
      const { streams: fetchedStreams } = await streamingService.getStreams(false, 100)
      console.log('Fetched streams for browser:', fetchedStreams)

      const live = fetchedStreams.filter(stream => stream.is_active && stream.is_live)
      const ended = fetchedStreams.filter(stream => !stream.is_active || !stream.is_live)

      setAllStreams(fetchedStreams)
      setLiveStreams(live)
      setEndedStreams(ended)
    } catch (err) {
      console.error('Failed to fetch streams:', err)
      showToast({ title: 'Failed to fetch streams', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const applyFiltersAndSort = useCallback(() => {
    // Sort live streams
    const sortedLive = [...liveStreams].sort((a, b) => {
      switch (sortBy) {
        case 'viewers':
          return (b.viewer_count || 0) - (a.viewer_count || 0)
        case 'recent':
          return new Date(b.started_at || b.created_at).getTime() -
                 new Date(a.started_at || a.created_at).getTime()
        case 'tips':
          return (parseFloat(b.total_tips?.toString() || '0')) -
                 (parseFloat(a.total_tips?.toString() || '0'))
        case 'duration':
          if (!a.started_at || !b.started_at) return 0
          const aDuration = Date.now() - new Date(a.started_at).getTime()
          const bDuration = Date.now() - new Date(b.started_at).getTime()
          return bDuration - aDuration
        default:
          return 0
      }
    })

    // Sort ended streams
    const sortedEnded = [...endedStreams].sort((a, b) => {
      return new Date(b.ended_at || b.created_at).getTime() -
             new Date(a.ended_at || a.created_at).getTime()
    })

    setLiveStreams(sortedLive)
    setEndedStreams(sortedEnded)
  }, [liveStreams, endedStreams, sortBy])

  useEffect(() => {
    fetchStreams()

    // Set up real-time updates
    streamingService.connectSocket()

    streamingService.onStreamStarted(() => {
      fetchStreams()
    })

    streamingService.onStreamEnded(() => {
      fetchStreams()
    })

    streamingService.onViewerCountUpdate((data) => {
      setLiveStreams(prev => prev.map(stream =>
        stream.stream_key === data.streamKey
          ? { ...stream, viewer_count: data.viewerCount }
          : stream
      ))
    })

    return () => {
      streamingService.offStreamStarted()
      streamingService.offStreamEnded()
      streamingService.offViewerCountUpdate()
    }
  }, [showActiveOnly, showToast])

  useEffect(() => {
    applyFiltersAndSort()
  }, [allStreams, sortBy])

  const watchStream = (streamKey: string) => {
    window.open(`/stream/${streamKey}`, '_blank')
  }

  const getStreamThumbnail = (stream: Stream) => {
    // Use uploaded thumbnail if available
    if (stream.thumbnail_hash) {
      return `https://gateway.pinata.cloud/ipfs/${stream.thumbnail_hash}`
    }
    // Fallback to random image
    return `https://picsum.photos/320/180?random=${stream.id}`
  }

  const getCategoryColor = (gameName: string) => {
    return getGameCategoryColor(gameName)
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Live Streams Section Skeleton */}
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-2">
                <div className="h-8 bg-surface-secondary rounded-lg w-48"></div>
                <div className="h-4 bg-surface-secondary rounded w-64"></div>
              </div>
              <div className="h-10 bg-surface-secondary rounded-lg w-24"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden border-border-primary bg-surface-secondary">
                  <div className="aspect-video bg-gradient-to-br from-surface-tertiary to-surface-secondary relative">
                    <div className="absolute top-4 left-4 h-8 bg-surface-tertiary rounded-full w-16"></div>
                    <div className="absolute top-4 right-4 h-6 bg-surface-tertiary rounded-full w-20"></div>
                    <div className="absolute bottom-4 left-4 h-7 bg-surface-tertiary rounded-full w-16"></div>
                    <div className="absolute bottom-4 right-4 h-7 bg-surface-tertiary rounded-full w-20"></div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 bg-surface-tertiary rounded-full flex-shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-surface-tertiary rounded w-full"></div>
                        <div className="h-4 bg-surface-tertiary rounded w-2/3"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-background-primary/50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-surface-tertiary rounded-lg"></div>
                          <div className="space-y-1">
                            <div className="h-4 bg-surface-tertiary rounded w-8"></div>
                            <div className="h-3 bg-surface-tertiary rounded w-12"></div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-background-primary/50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-surface-tertiary rounded-lg"></div>
                          <div className="space-y-1">
                            <div className="h-4 bg-surface-tertiary rounded w-8"></div>
                            <div className="h-3 bg-surface-tertiary rounded w-12"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Recently Ended Section Skeleton */}
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-2">
                <div className="h-8 bg-surface-secondary rounded-lg w-56"></div>
                <div className="h-4 bg-surface-secondary rounded w-48"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden border-border-primary bg-surface-secondary">
                  <div className="aspect-video bg-gradient-to-br from-surface-tertiary to-surface-secondary relative">
                    <div className="absolute top-4 right-4 h-6 bg-surface-tertiary rounded-full w-20"></div>
                    <div className="absolute bottom-4 left-4 h-7 bg-surface-tertiary rounded-full w-16"></div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 bg-surface-tertiary rounded-full flex-shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-surface-tertiary rounded w-full"></div>
                        <div className="h-4 bg-surface-tertiary rounded w-2/3"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-background-primary/50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-surface-tertiary rounded-lg"></div>
                          <div className="space-y-1">
                            <div className="h-4 bg-surface-tertiary rounded w-8"></div>
                            <div className="h-3 bg-surface-tertiary rounded w-12"></div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-background-primary/50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-surface-tertiary rounded-lg"></div>
                          <div className="space-y-1">
                            <div className="h-4 bg-surface-tertiary rounded w-8"></div>
                            <div className="h-3 bg-surface-tertiary rounded w-12"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderStreamCard = (stream: Stream, isLive: boolean = true) => (
    <Card key={stream.id} className="overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-border-primary bg-surface-secondary group relative">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 cursor-pointer overflow-hidden" onClick={() => watchStream(stream.stream_key)}>
        <Image
          src={getStreamThumbnail(stream)}
          alt={stream.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

        {/* Live indicator */}
        {isLive && (
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-full shadow-xl animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              <span className="text-white font-bold text-sm">LIVE</span>
            </div>
          </div>
        )}

        {/* Category badge with logo */}
        {stream.game_name && (
          <div className="absolute top-4 right-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-lg ${getCategoryColor(stream.game_name)}`}>
              <img
                src={getGameLogo(stream.game_name)}
                alt={stream.game_name}
                className="w-4 h-4 rounded object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <span>{stream.game_name}</span>
            </div>
          </div>
        )}

        {/* Viewer count */}
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2 shadow-lg">
          <Users className="w-4 h-4 text-blue-400" />
          <span className="font-semibold">{formatViewerCount(stream.viewer_count || 0)}</span>
        </div>

        {/* Duration */}
        {stream.started_at && isLive && (
          <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2 shadow-lg">
            <Clock className="w-4 h-4 text-green-400" />
            <span className="font-semibold">{formatStreamDuration(stream.started_at)}</span>
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-12 h-12 text-white drop-shadow-lg" />
          </div>
        </div>
      </div>

      {/* Enhanced Stream Info */}
      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <Avatar className="w-14 h-14 flex-shrink-0 ring-2 ring-purple-500/30 shadow-lg">
              {stream.users?.avatar_ipfs ? (
                <img
                  src={`https://gateway.pinata.cloud/ipfs/${stream.users.avatar_ipfs}`}
                  alt="Streamer"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement
                    if (fallback) fallback.style.display = 'flex'
                  }}
                />
              ) : null}
              <div
                className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold rounded-full text-lg"
                style={{ display: stream.users?.avatar_ipfs ? 'none' : 'flex' }}
              >
                {(stream.users?.display_name || stream.users?.username || 'U')[0].toUpperCase()}
              </div>
            </Avatar>
            {isLive && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-2 text-text-primary line-clamp-2 group-hover:text-purple-400 transition-colors" title={stream.title}>
              {stream.title}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 bg-purple-500/20 rounded-lg">
                <Radio className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-sm font-medium text-text-secondary">
                {stream.users?.display_name || stream.users?.username || 'Unknown Streamer'}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background-primary/50 rounded-lg p-3 flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/20 rounded-lg">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">{formatViewerCount(stream.viewer_count || 0)}</p>
              <p className="text-xs text-text-tertiary">Viewers</p>
            </div>
          </div>

          <div className="bg-background-primary/50 rounded-lg p-3 flex items-center gap-2">
            <div className="p-1.5 bg-green-500/20 rounded-lg">
              <DollarSign className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">${Number(stream.total_tips || 0).toFixed(2)}</p>
              <p className="text-xs text-text-tertiary">Tips</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="space-y-8">
      {/* Live Streams Section */}
      {liveStreams.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-1">
                🔴 Live Now
              </h2>
              <p className="text-text-secondary">
                {liveStreams.length} streamers broadcasting right now
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => fetchStreams()}
              className="border-border-primary text-text-secondary hover:text-text-primary"
            >
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {liveStreams.slice(0, 8).map((stream) => renderStreamCard(stream, true))}
          </div>

          {liveStreams.length > 8 && (
            <div className="text-center mt-6">
              <Button variant="outline" className="border-border-primary text-text-secondary hover:text-text-primary">
                View All {liveStreams.length} Live Streams
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Recently Ended Streams Section */}
      {endedStreams.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-1">
                📺 Recently Ended
              </h2>
              <p className="text-text-secondary">
                Catch up on streams you missed
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {endedStreams.slice(0, 8).map((stream) => renderStreamCard(stream, false))}
          </div>

          {endedStreams.length > 8 && (
            <div className="text-center mt-6">
              <Button variant="outline" className="border-border-primary text-text-secondary hover:text-text-primary">
                View All {endedStreams.length} Recent Streams
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Empty State */}
      {liveStreams.length === 0 && endedStreams.length === 0 && !loading && (
        <Card className="border-border-primary bg-surface-secondary">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full flex items-center justify-center">
              <Radio className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-text-primary">
              No streams available
            </h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Be the first to go live! Create a stream and start broadcasting to the community.
            </p>
            <Link href="/streaming/dashboard">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Zap className="w-4 h-4 mr-2" />
                Start Streaming
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}