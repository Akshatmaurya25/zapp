'use client'

import { Suspense } from 'react'
import StreamDashboard from '@/components/streaming/StreamDashboard'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { WalletGuard } from '@/components/auth/WalletGuard'
import { useUser } from '@/contexts/UserContext'

export default function StreamingDashboardPage() {
  return (
    <WalletGuard>
      <Container className="py-8">
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
      <Card className="p-8 text-center max-w-md mx-auto">
        <h2 className="text-xl font-medium mb-2">User Profile Required</h2>
        <p className="text-gray-600 mb-4">
          Please complete your profile setup to access the streaming dashboard.
        </p>
        <button
          onClick={() => {
            // You can navigate to profile creation or trigger createUser
            window.location.href = '/profile'
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Profile
        </button>
      </Card>
    )
  }

  return (
    <StreamDashboard
      userToken={user.wallet_address} // Use wallet address as identifier
      userId={user.id}
    />
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <Card className="p-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </Card>
      </div>
    </div>
  )
}