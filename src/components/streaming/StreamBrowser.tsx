'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
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
  TrendingUp
} from 'lucide-react'
import { streamingService, Stream, formatViewerCount, formatStreamDuration } from '@/lib/streaming'
import { useToast } from '@/components/ui/Toast'

interface StreamBrowserProps {
  showActiveOnly?: boolean
}

type SortOption = 'viewers' | 'recent' | 'tips' | 'duration'
type CategoryFilter = 'all' | 'gaming' | 'just-chatting' | 'creative' | 'music'

export default function StreamBrowser({ showActiveOnly = true }: StreamBrowserProps) {
  const [streams, setStreams] = useState<Stream[]>([])
  const [filteredStreams, setFilteredStreams] = useState<Stream[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('viewers')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [showFilters, setShowFilters] = useState(false)

  const router = useRouter()
  const { showToast } = useToast()

  useEffect(() => {
    fetchStreams()

    // Set up real-time updates
    const socket = streamingService.connectSocket()

    streamingService.onStreamStarted(() => {
      fetchStreams()
    })

    streamingService.onStreamEnded(() => {
      fetchStreams()
    })

    streamingService.onViewerCountUpdate((data) => {
      setStreams(prev => prev.map(stream =>
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
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [streams, searchQuery, sortBy, categoryFilter])

  const fetchStreams = async () => {
    try {
      const { streams: fetchedStreams } = await streamingService.getStreams(showActiveOnly, 50)
      setStreams(fetchedStreams)
    } catch (error) {
      console.error('Failed to fetch streams:', error)
      showToast({ title: 'Failed to fetch streams', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSort = () => {
    let filtered = [...streams]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(stream =>
        stream.title.toLowerCase().includes(query) ||
        stream.game_name?.toLowerCase().includes(query) ||
        stream.users?.display_name?.toLowerCase().includes(query) ||
        stream.users?.username?.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(stream => {
        const gameName = stream.game_name?.toLowerCase() || ''
        switch (categoryFilter) {
          case 'gaming':
            return gameName && !['just chatting', 'art', 'music'].includes(gameName)
          case 'just-chatting':
            return gameName.includes('chatting') || gameName.includes('talk')
          case 'creative':
            return gameName.includes('art') || gameName.includes('creative') || gameName.includes('drawing')
          case 'music':
            return gameName.includes('music') || gameName.includes('singing')
          default:
            return true
        }
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
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

    setFilteredStreams(filtered)
  }

  const watchStream = (streamKey: string) => {
    router.push(`/stream/${streamKey}`)
  }

  const getStreamThumbnail = (stream: Stream) => {
    // In a real app, you'd generate thumbnails from the stream
    return `https://picsum.photos/320/180?random=${stream.id}`
  }

  const getCategoryColor = (gameName: string) => {
    if (!gameName) return 'bg-gray-500'

    const name = gameName.toLowerCase()
    if (name.includes('chat')) return 'bg-purple-500'
    if (name.includes('music')) return 'bg-pink-500'
    if (name.includes('art') || name.includes('creative')) return 'bg-orange-500'
    return 'bg-blue-500'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Play className="w-6 h-6 text-red-600" />
            Live Streams
          </h1>
          <p className="text-gray-600">
            {filteredStreams.length} {showActiveOnly ? 'live' : ''} streams available
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button onClick={() => fetchStreams()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search streams, games, or streamers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <Select
                value={sortBy}
                onValueChange={(value: SortOption) => setSortBy(value)}
              >
                <option value="viewers">Most Viewers</option>
                <option value="recent">Recently Started</option>
                <option value="tips">Most Tips</option>
                <option value="duration">Longest Running</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select
                value={categoryFilter}
                onValueChange={(value: CategoryFilter) => setCategoryFilter(value)}
              >
                <option value="all">All Categories</option>
                <option value="gaming">Gaming</option>
                <option value="just-chatting">Just Chatting</option>
                <option value="creative">Creative</option>
                <option value="music">Music</option>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Stream Grid */}
      {filteredStreams.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <Play className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {streams.length === 0 ? 'No streams available' : 'No streams match your filters'}
            </h3>
            <p className="text-gray-600 mb-4">
              {streams.length === 0
                ? 'Be the first to start streaming!'
                : 'Try adjusting your search or filters'
              }
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setCategoryFilter('all')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStreams.map((stream) => (
            <Card key={stream.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-900">
                <img
                  src={getStreamThumbnail(stream)}
                  alt={stream.title}
                  className="w-full h-full object-cover"
                />

                {/* Live indicator */}
                {stream.is_active && stream.is_live && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="destructive" className="animate-pulse">
                      🔴 LIVE
                    </Badge>
                  </div>
                )}

                {/* Viewer count */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {formatViewerCount(stream.viewer_count || 0)}
                </div>

                {/* Duration */}
                {stream.started_at && stream.is_live && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatStreamDuration(stream.started_at)}
                  </div>
                )}

                {/* Play overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                     onClick={() => watchStream(stream.stream_key)}>
                  <Button variant="ghost" size="lg" className="text-white">
                    <Play className="w-8 h-8" />
                  </Button>
                </div>
              </div>

              {/* Stream Info */}
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10 flex-shrink-0">
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

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate" title={stream.title}>
                      {stream.title}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {stream.users?.display_name || stream.users?.username || 'Unknown Streamer'}
                    </p>
                  </div>
                </div>

                {/* Game/Category */}
                {stream.game_name && (
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-gray-400" />
                    <span
                      className={`px-2 py-1 rounded text-xs text-white ${getCategoryColor(stream.game_name)}`}
                    >
                      {stream.game_name}
                    </span>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {formatViewerCount(stream.viewer_count || 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ${Number(stream.total_tips || 0).toFixed(2)}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => watchStream(stream.stream_key)}
                    className="ml-2"
                  >
                    Watch
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Load More */}
      {filteredStreams.length > 0 && filteredStreams.length >= 20 && (
        <div className="text-center">
          <Button variant="outline" onClick={() => fetchStreams()}>
            Load More Streams
          </Button>
        </div>
      )}
    </div>
  )
}