'use client'

import React from 'react'
import { useRequireWallet } from '@/contexts/Web3Context'
import { WalletConnect } from './WalletConnect'
import { Loading } from '@/components/ui/Loading'
import { Loader2 } from 'lucide-react'

interface WalletGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  loadingComponent?: React.ReactNode
}

export function WalletGuard({ 
  children, 
  fallback,
  loadingComponent 
}: WalletGuardProps) {
  const { needsConnection, needsNetworkSwitch, isReady } = useRequireWallet()

  // Show loading state
  if (loadingComponent && !isReady && !needsConnection && !needsNetworkSwitch) {
    return <>{loadingComponent}</>
  }

  // Show wallet connection if needed
  if (needsConnection || needsNetworkSwitch) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
        {fallback || <WalletConnect />}
      </div>
    )
  }

  // Wallet connected and on correct network
  if (isReady) {
    return <>{children}</>
  }

  // Default loading state
  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center">
      <Loading
        size="lg"
        text="Initializing wallet connection..."
        className="text-text-primary"
      />
    </div>
  )
}

// HOC version for pages that need wallet connection
export function withWalletGuard<T extends object>(
  Component: React.ComponentType<T>,
  options?: {
    fallback?: React.ReactNode
    loadingComponent?: React.ReactNode
  }
) {
  return function GuardedComponent(props: T) {
    return (
      <WalletGuard 
        fallback={options?.fallback}
        loadingComponent={options?.loadingComponent}
      >
        <Component {...props} />
      </WalletGuard>
    )
  }
}