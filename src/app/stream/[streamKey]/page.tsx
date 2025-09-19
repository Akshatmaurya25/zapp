'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'
import StreamPage from '@/components/streaming/StreamPage'
import { Card } from '@/components/ui/Card'

export default function IndividualStreamPage() {
  const params = useParams()
  const streamKey = params.streamKey as string

  if (!streamKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-medium mb-2">Invalid Stream</h2>
          <p className="text-gray-600">
            No stream key provided in the URL.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <Suspense fallback={<StreamPageSkeleton />}>
      <StreamPage streamKey={streamKey} />
    </Suspense>
  )
}

function StreamPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <div className="aspect-video bg-gray-200 rounded-lg"></div>
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="p-4">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
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