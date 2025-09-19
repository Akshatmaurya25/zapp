'use client'

import { Suspense } from 'react'
import StreamBrowser from '@/components/streaming/StreamBrowser'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'

export default function StreamsPage() {
  return (
    <Container className="py-8">
      <Suspense fallback={<StreamsPageSkeleton />}>
        <StreamBrowser showActiveOnly={true} />
      </Suspense>
    </Container>
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