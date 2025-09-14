'use client'

import { useConnect, useDisconnect, useAccount } from 'wagmi'
import { useWeb3 } from '@/contexts/Web3Context'
import { useEffect, useState } from 'react'

export function useWallet() {
  const { connect, connectors, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { connection, isOnSomnia, switchNetwork, connectionRejected, resetConnectionState } = useWeb3()
  const [isConnecting, setIsConnecting] = useState(false)

  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize the hook state
  useEffect(() => {
    setIsInitialized(true)
  }, [])

  // Auto-connect to Somnia network only after manual connection
  useEffect(() => {
    if (connection.isConnected && !isOnSomnia) {
      // Only switch network if user manually connected, not on auto-reconnect
      const hasUserConnected = localStorage.getItem('wallet-manually-connected')
      if (hasUserConnected) {
        switchNetwork().catch(console.error)
      }
    }
  }, [connection.isConnected, isOnSomnia, switchNetwork])

  const connectWallet = async (connectorId?: string) => {
    setIsConnecting(true)
    resetConnectionState() // Clear any previous rejection state
    
    try {
      // Mark that user has attempted connection and manually connected
      localStorage.setItem('wallet-connection-attempted', 'true')
      localStorage.setItem('wallet-manually-connected', 'true')
      
      const selectedConnector = connectorId 
        ? connectors.find(c => c.id === connectorId) 
        : connectors[0] // Default to first connector (usually MetaMask)

      if (selectedConnector) {
        await connect({ connector: selectedConnector })
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err)
      // Don't immediately mark as rejected - let the useEffect handle it
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    // Clear manual connection flag on disconnect
    localStorage.removeItem('wallet-manually-connected')
    localStorage.removeItem('wallet-connection-attempted')
    disconnect()
  }

  const switchToSomnia = async (testnet = false) => {
    return await switchNetwork(testnet)
  }

  // Calculate combined connecting state only after initialization
  const combinedIsConnecting = isInitialized ? (isConnecting || connection.isConnecting || isPending) : false

  return {
    // Connection state
    address: connection.address,
    isConnected: connection.isConnected,
    isConnecting: combinedIsConnecting,
    isOnSomnia,
    chain: connection.chain,
    connectionRejected,
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchToSomnia,
    resetConnectionState,
    
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