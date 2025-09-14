'use client'

import React from 'react'
import { useProfileSetup } from '@/contexts/UserContext'
import { ProfileSetup } from './ProfileSetup'
import { Loading } from '@/components/ui/Loading'
import { Loader2 } from 'lucide-react'

interface ProfileGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProfileGuard({ children, fallback }: ProfileGuardProps) {
  const { needsSetup, isComplete, isLoading } = useProfileSetup()

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <Loading
          size="lg"
          text="Loading profile..."
          className="text-text-primary"
        />
      </div>
    )
  }

  // Show profile setup if needed
  if (needsSetup) {
    return (
      <div className="min-h-screen bg-background-primary py-8">
        {fallback || <ProfileSetup />}
      </div>
    )
  }

  // Profile is complete
  if (isComplete) {
    return <>{children}</>
  }

  // Default loading state
  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center">
      <Loading
        size="lg"
        text="Initializing profile..."
        className="text-text-primary"
      />
    </div>
  )
}

// HOC version for pages that need complete profile
export function withProfileGuard<T extends object>(
  Component: React.ComponentType<T>,
  options?: {
    fallback?: React.ReactNode
  }
) {
  return function GuardedComponent(props: T) {
    return (
      <ProfileGuard fallback={options?.fallback}>
        <Component {...props} />
      </ProfileGuard>
    )
  }
}