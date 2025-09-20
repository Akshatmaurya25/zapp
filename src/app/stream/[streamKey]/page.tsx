'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'
import StreamPage from '@/components/streaming/StreamPage'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Eye } from 'lucide-react'

export default function IndividualStreamPage() {
  const params = useParams()
  const streamKey = params.streamKey as string

  if (!streamKey) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md border-border-primary bg-surface-secondary">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-full flex items-center justify-center">
            <Eye className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-text-primary">Invalid Stream</h2>
          <p className="text-text-secondary mb-4">
            No stream key provided in the URL. Please check the link and try again.
          </p>
          <Button
            onClick={() => window.location.href = '/streams'}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Browse Streams
          </Button>
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
    <div className="min-h-screen bg-background-primary p-4">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-surface-secondary rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <div className="aspect-video bg-surface-secondary rounded-lg"></div>
              <Card className="p-6 border-border-primary bg-surface-secondary">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-background-primary rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-background-primary rounded w-2/3"></div>
                    <div className="h-4 bg-background-primary rounded w-1/2"></div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 p-4 bg-background-primary rounded-lg">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 bg-surface-secondary rounded"></div>
                  ))}
                </div>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="p-4 border-border-primary bg-surface-secondary">
                <div className="h-5 bg-background-primary rounded w-2/3 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 bg-background-primary rounded"></div>
                  ))}
                </div>
              </Card>
              <Card className="p-4 border-border-primary bg-surface-secondary">
                <div className="h-5 bg-background-primary rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 bg-background-primary rounded"></div>
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