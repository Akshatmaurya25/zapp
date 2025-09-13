'use client'

import { useConnect, useDisconnect, useAccount } from 'wagmi'
import { useWeb3 } from '@/contexts/Web3Context'
import { useEffect, useState } from 'react'

export function useWallet() {
  const { connect, connectors, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { connection, isOnSomnia, switchNetwork } = useWeb3()
  const [isConnecting, setIsConnecting] = useState(false)

  // Auto-connect to Somnia network after wallet connection
  useEffect(() => {
    if (connection.isConnected && !isOnSomnia && !isPending) {
      switchNetwork().catch(console.error)
    }
  }, [connection.isConnected, isOnSomnia, isPending, switchNetwork])

  const connectWallet = async (connectorId?: string) => {
    setIsConnecting(true)
    try {
      const selectedConnector = connectorId 
        ? connectors.find(c => c.id === connectorId) 
        : connectors[0] // Default to first connector (usually MetaMask)

      if (selectedConnector) {
        await connect({ connector: selectedConnector })
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    disconnect()
  }

  const switchToSomnia = async (testnet = false) => {
    return await switchNetwork(testnet)
  }

  return {
    // Connection state
    address: connection.address,
    isConnected: connection.isConnected,
    isConnecting: isConnecting || connection.isConnecting || isPending,
    isOnSomnia,
    chain: connection.chain,
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchToSomnia,
    
    // Available connectors
    connectors: connectors.map(connector => ({
      id: connector.id,
      name: connector.name,
      icon: connector.icon,
    })),
    
    // Error state
    error: error?.message,
  }
}