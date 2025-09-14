'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig, isOnSomniaNetwork, switchToSomniaNetwork } from '@/lib/web3'
import { WalletConnection } from '@/types'
import { useAccount, useChainId } from 'wagmi'

interface Web3ContextType {
  connection: WalletConnection
  isOnSomnia: boolean
  connectionRejected: boolean
  switchNetwork: (testnet?: boolean) => Promise<boolean>
  disconnect: () => void
  resetConnectionState: () => void
}

const Web3Context = createContext<Web3ContextType | null>(null)

// Query client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
})

// Wagmi config with disabled auto-reconnect
const wagmiConfigWithoutAutoReconnect = {
  ...wagmiConfig,
  autoConnect: false,
}

// Inner component that uses hooks
function Web3ProviderInner({ children }: { children: React.ReactNode }) {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount()
  const chainId = useChainId()
  const [isOnSomnia, setIsOnSomnia] = useState(false)
  const [connectionRejected, setConnectionRejected] = useState(false)

  const connection: WalletConnection = {
    address,
    isConnected,
    isConnecting,
    isReconnecting,
    chain: chainId ? {
      id: chainId,
      name: chainId === 5031 ? 'Somnia Mainnet' : chainId === 50312 ? 'Somnia Testnet' : 'Unknown',
      unsupported: !isOnSomniaNetwork(chainId)
    } : undefined,
  }

  useEffect(() => {
    setIsOnSomnia(isOnSomniaNetwork(chainId))
  }, [chainId])

  const switchNetwork = async (testnet = false): Promise<boolean> => {
    return await switchToSomniaNetwork(testnet)
  }

  const disconnect = () => {
    // Wagmi disconnect will be handled by the hook
  }

  const resetConnectionState = () => {
    setConnectionRejected(false)
  }

  // Track connection rejections
  useEffect(() => {
    if (!isConnected && !isConnecting && !isReconnecting) {
      // User might have rejected connection
      const hasTriedConnection = localStorage.getItem('wallet-connection-attempted')
      if (hasTriedConnection) {
        setConnectionRejected(true)
      }
    } else if (isConnected) {
      setConnectionRejected(false)
      localStorage.removeItem('wallet-connection-attempted')
    }
  }, [isConnected, isConnecting, isReconnecting])

  const contextValue: Web3ContextType = {
    connection,
    isOnSomnia,
    connectionRejected,
    switchNetwork,
    disconnect,
    resetConnectionState,
  }

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  )
}

// Main provider component
export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Web3ProviderInner>
          {children}
        </Web3ProviderInner>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

// Hook to use Web3 context
export function useWeb3() {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

// Hook to check if user needs to connect wallet
export function useRequireWallet() {
  const { connection, isOnSomnia } = useWeb3()
  
  return {
    needsConnection: !connection.isConnected,
    needsNetworkSwitch: connection.isConnected && !isOnSomnia,
    isReady: connection.isConnected && isOnSomnia,
  }
}