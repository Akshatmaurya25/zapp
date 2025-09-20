'use client'

import { Suspense } from 'react'
import StreamDashboard from '@/components/streaming/StreamDashboard'
import { Container } from '@/components/ui/Container'
import { Card, CardContent } from '@/components/ui/Card'
import { WalletGuard } from '@/components/auth/WalletGuard'
import { useUser } from '@/contexts/UserContext'

export default function StreamingDashboardPage() {
  return (
    <WalletGuard>
      <Container className="py-8" center>
        <Suspense fallback={<DashboardSkeleton />}>
          <AuthenticatedStreamDashboard />
        </Suspense>
      </Container>
    </WalletGuard>
  )
}

function AuthenticatedStreamDashboard() {
  const { user, isLoading, createUser } = useUser()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (!user) {
    return (
      <Card className="p-8 text-center max-w-md mx-auto border-border-primary bg-surface-secondary">
        <h2 className="text-xl font-medium mb-2 text-text-primary">User Profile Required</h2>
        <p className="text-text-secondary mb-4">
          Please complete your profile setup to access the streaming dashboard.
        </p>
        <button
          onClick={() => {
            // You can navigate to profile creation or trigger createUser
            window.location.href = '/profile'
          }}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors"
        >
          Create Profile
        </button>
      </Card>
    )
  }

  return (
    <StreamDashboard
      userToken={user.wallet_address || ''} // Use wallet address as identifier
      userId={user.id}
    />
  )
}

function DashboardSkeleton() {
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