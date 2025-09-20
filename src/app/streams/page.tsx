'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import StreamBrowser from '@/components/streaming/StreamBrowser'
import { Container } from '@/components/ui/Container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Play,
  Radio,
  Users,
  TrendingUp,
  Zap,
  Video,
  Monitor,
  ExternalLink,
  Eye,
  DollarSign
} from 'lucide-react'

export default function StreamsPage() {
  return (
    <div className="min-h-screen bg-background-primary">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-pink-600/20 border-b border-border-primary">
        <Container className="py-16">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full">
                <Radio className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-text-primary">
              Live Gaming Streams
            </h1>

            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Watch amazing gaming content, support your favorite streamers with crypto tips,
              and join the most vibrant Web3 gaming community.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/streaming/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Streaming
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                onClick={() => window.open('https://obsproject.com/', '_blank')}
                className="border-border-primary text-text-secondary hover:text-text-primary"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Download OBS
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">Live Now</div>
                <div className="text-text-tertiary">Active Streams</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">24/7</div>
                <div className="text-text-tertiary">Broadcasting</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">Web3</div>
                <div className="text-text-tertiary">Crypto Tips</div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="border-border-primary bg-surface-secondary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-text-primary">
                <Eye className="w-5 h-5 text-purple-400" />
                Watch & Engage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">
                Discover amazing gaming content, interact with streamers in real-time,
                and be part of an active community.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border-primary bg-surface-secondary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-text-primary">
                <DollarSign className="w-5 h-5 text-green-400" />
                Crypto Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">
                Support your favorite streamers with instant crypto tips.
                97.5% goes directly to creators with minimal platform fees.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border-primary bg-surface-secondary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-text-primary">
                <Video className="w-5 h-5 text-blue-400" />
                Start Streaming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">
                Create your own stream in minutes. Professional RTMP support
                with OBS integration and real-time analytics.
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>

      {/* Live Streams Section */}
      <Container className="pb-12">
        <Suspense fallback={<StreamsPageSkeleton />}>
          <StreamBrowser showActiveOnly={true} />
        </Suspense>
      </Container>
    </div>
  )
}

function StreamsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="aspect-video bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}