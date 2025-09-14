'use client'

import React from 'react'
import { Navigation, MobileBottomNav } from './Navigation'
import { WalletGuard } from '@/components/auth/WalletGuard'
import { ProfileGuard } from '@/components/profile/ProfileGuard'
import { Container } from '@/components/ui/Container'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
  requireProfile?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: boolean
  className?: string
}

export function AppLayout({
  children,
  requireProfile = true,
  maxWidth = 'xl',
  padding = true,
  className
}: AppLayoutProps) {
  const content = (
    <ErrorBoundary>
      <div className={cn(
        "min-h-screen bg-background-primary",
        // Subtle gradient background
        "bg-gradient-to-br from-background-primary via-background-secondary to-background-primary",
        className
      )}>
        {/* Navigation */}
        <Navigation />

        {/* Main Content Area */}
        <main className={cn(
          // Account for navigation height and mobile bottom nav
          "pt-16 pb-20 lg:pb-8",
          // Responsive padding
          "px-0"
        )}>
          <Container
            size={maxWidth}
            padding={padding ? 'md' : 'none'}
            center
            className="animate-fadeIn"
          >
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </Container>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </ErrorBoundary>
  )

  if (requireProfile) {
    return (
      <WalletGuard>
        <ProfileGuard>
          {content}
        </ProfileGuard>
      </WalletGuard>
    )
  }

  return (
    <WalletGuard>
      {content}
    </WalletGuard>
  )
}

// Specialized layout for full-width pages
export function FullWidthLayout({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <AppLayout
      maxWidth="full"
      padding={false}
      className={className}
      requireProfile={false}
    >
      {children}
    </AppLayout>
  )
}

// Layout for dashboard/feed pages
export function DashboardLayout({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <AppLayout
      maxWidth="xl"
      padding={true}
      className={className}
      requireProfile={true}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-8">
          {children}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Trending Posts */}
          <div className="bg-background-card rounded-xl border border-border-primary p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Trending Now
            </h3>
            <div className="space-y-3">
              <p className="text-text-tertiary text-sm">
                No trending posts yet. Be the first to create viral content!
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-background-card rounded-xl border border-border-primary p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Network Status
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
              <span className="text-text-secondary">Connected to Somnia</span>
            </div>
          </div>
        </aside>
      </div>
    </AppLayout>
  )
}