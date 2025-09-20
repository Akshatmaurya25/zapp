'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import StreamBrowser from '@/components/streaming/StreamBrowser'
import { Container } from '@/components/ui/Container'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Search,
  Video,
  Filter,

  Clock,
  Users,
  Gamepad2,
  Radio,
  Zap,
  Sparkles,
  Play,
  TrendingUp
} from 'lucide-react'
import { Card } from '@/components/ui/Card'

export default function StreamsPage() {
  return (
    <div className="min-h-screen bg-background-primary">
      {/* Modern Hero Header */}
      <div className="bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-purple-900/20 border-b border-border-primary">
        <Container className="py-8" center>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg">
                <Radio className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Live Streams
              </h1>
            </div>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Discover amazing live content from creators around the world
            </p>
          </div>

          {/* Enhanced Search Section */}
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Search Bar */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-surface-secondary/80 backdrop-blur-sm border border-border-primary rounded-2xl p-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                    <Input
                      placeholder="Search streams, games, or streamers..."
                      className="pl-12 pr-4 py-4 bg-transparent border-none text-text-primary text-lg placeholder:text-text-tertiary focus:ring-0 focus:outline-none"
                    />
                  </div>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-4 rounded-xl shadow-lg">
                    <Search className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Badge variant="outline" className="px-4 py-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 cursor-pointer transition-colors">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trending
              </Badge>
              <Badge variant="outline" className="px-4 py-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 cursor-pointer transition-colors">
                <Gamepad2 className="w-4 h-4 mr-2" />
                Gaming
              </Badge>
              <Badge variant="outline" className="px-4 py-2 border-pink-500/30 text-pink-400 hover:bg-pink-500/10 cursor-pointer transition-colors">
                <Users className="w-4 h-4 mr-2" />
                Just Chatting
              </Badge>
              <Badge variant="outline" className="px-4 py-2 border-orange-500/30 text-orange-400 hover:bg-orange-500/10 cursor-pointer transition-colors">
                <Sparkles className="w-4 h-4 mr-2" />
                Creative
              </Badge>
              <Badge variant="outline" className="px-4 py-2 border-green-500/30 text-green-400 hover:bg-green-500/10 cursor-pointer transition-colors">
                <Clock className="w-4 h-4 mr-2" />
                Recent
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                className="border-border-primary text-text-secondary hover:text-text-primary px-6 py-3"
              >
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg px-8 py-3"
                asChild
              >
                <Link href="/streaming/dashboard" className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Start Streaming
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="py-8" center>
        <Suspense fallback={<StreamsPageSkeleton />}>
          <StreamBrowser showActiveOnly={false} />
        </Suspense>
      </Container>
    </div>
  )
}

function StreamsPageSkeleton() {
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
                  <div className="absolute top-3 left-3 h-6 bg-surface-tertiary rounded-full w-16"></div>
                  <div className="absolute top-3 right-3 h-6 bg-surface-tertiary rounded-full w-12"></div>
                  <div className="absolute bottom-3 right-3 h-6 bg-surface-tertiary rounded-full w-16"></div>
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-surface-tertiary rounded-full flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-surface-tertiary rounded w-full"></div>
                      <div className="h-4 bg-surface-tertiary rounded w-2/3"></div>
                      <div className="h-3 bg-surface-tertiary rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-4 bg-surface-tertiary rounded w-16"></div>
                      <div className="h-4 bg-surface-tertiary rounded w-12"></div>
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
                  <div className="absolute top-3 right-3 h-6 bg-surface-tertiary rounded-full w-12"></div>
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-surface-tertiary rounded-full flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-surface-tertiary rounded w-full"></div>
                      <div className="h-4 bg-surface-tertiary rounded w-2/3"></div>
                      <div className="h-3 bg-surface-tertiary rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-4 bg-surface-tertiary rounded w-16"></div>
                      <div className="h-4 bg-surface-tertiary rounded w-12"></div>
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