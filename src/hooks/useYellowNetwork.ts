import { useState, useEffect, useCallback, useMemo } from 'react'
import { useWalletClient, useAccount, usePublicClient } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import type { Address } from 'viem'
import { yellowTippingService, type TipChannel, type InstantTip } from '@/lib/yellowNetwork'

export interface UseYellowNetworkReturn {
  // State
  isInitialized: boolean
  isConnecting: boolean
  error: string | null
  activeTipChannels: TipChannel[]

  // Actions
  initializeYellow: () => Promise<void>
  createTipChannel: (streamerAddress: Address, initialDeposit?: string) => Promise<TipChannel>
  sendInstantTip: (channelId: string, amount: string, message?: string) => Promise<InstantTip>
  closeTipChannel: (channelId: string) => Promise<void>

  // Utilities
  getTipChannelStats: (viewer: Address, streamer: Address) => TipChannel | null
  formatTipAmount: (amount: bigint) => string
}

/**
 * React hook for Yellow Network tipping functionality
 * Provides easy integration with existing React components
 */
export function useYellowNetwork(): UseYellowNetworkReturn {
  // Wagmi hooks
  const { data: walletClient } = useWalletClient()
  const { address: userAddress } = useAccount()
  const publicClient = usePublicClient()

  // State
  const [isInitialized, setIsInitialized] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTipChannels, setActiveTipChannels] = useState<TipChannel[]>([])
  const [tipNotifications, setTipNotifications] = useState<InstantTip[]>([])

  // Initialize Yellow Network client
  const initializeYellow = useCallback(async () => {
    if (!walletClient || !userAddress || isInitialized) return

    setIsConnecting(true)
    setError(null)

    try {
      console.log('🚀 Initializing Yellow Network...')

      await yellowTippingService.initializeClient(walletClient)

      // Setup event listeners
      setupEventListeners()

      // Load existing channels
      const userChannels = yellowTippingService.getUserTipChannels(userAddress)
      setActiveTipChannels(userChannels)

      setIsInitialized(true)
      console.log('✅ Yellow Network initialized successfully')

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to initialize Yellow Network'
      setError(errorMessage)
      console.error('❌ Yellow Network initialization failed:', err)
    } finally {
      setIsConnecting(false)
    }
  }, [walletClient, userAddress, isInitialized])

  // Setup event listeners for real-time updates
  const setupEventListeners = useCallback(() => {
    // Listen for new tip channels
    yellowTippingService.on('channelCreated', (channel: TipChannel) => {
      setActiveTipChannels(prev => [...prev, channel])
    })

    // Listen for instant tips
    yellowTippingService.on('instantTip', (data: any) => {
      const { tip, channel } = data

      // Update channel stats
      setActiveTipChannels(prev =>
        prev.map(ch =>
          ch.channelId === channel.channelId
            ? { ...ch, totalTipped: channel.totalTipped }
            : ch
        )
      )

      // Add to notifications
      setTipNotifications(prev => [tip, ...prev.slice(0, 9)]) // Keep last 10 tips
    })

    // Listen for channel closures
    yellowTippingService.on('channelClosed', (data: any) => {
      setActiveTipChannels(prev =>
        prev.map(ch =>
          ch.channelId === data.channelId
            ? { ...ch, isActive: false }
            : ch
        )
      )
    })

    // Listen for ClearNode connection status
    yellowTippingService.on('clearNodeConnected', () => {
      console.log('🌐 ClearNode connected')
    })

    yellowTippingService.on('clearNodeDisconnected', () => {
      console.log('🔌 ClearNode disconnected')
    })

  }, [])

  // Create a new tipping channel
  const createTipChannel = useCallback(async (
    streamerAddress: Address,
    initialDeposit: string = '0.1'
  ): Promise<TipChannel> => {
    if (!isInitialized || !userAddress) {
      throw new Error('Yellow Network not initialized')
    }

    try {
      console.log(`🚀 Creating tip channel to ${streamerAddress}`)

      const channel = await yellowTippingService.createTipChannel(
        userAddress,
        streamerAddress,
        parseEther(initialDeposit)
      )

      return channel

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create tip channel'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [isInitialized, userAddress])

  // Send an instant tip
  const sendInstantTip = useCallback(async (
    channelId: string,
    amount: string,
    message: string = ''
  ): Promise<InstantTip> => {
    if (!isInitialized) {
      throw new Error('Yellow Network not initialized')
    }

    try {
      console.log(`💸 Sending instant tip: ${amount} ETH`)

      const tip = await yellowTippingService.sendInstantTip(
        channelId,
        parseEther(amount),
        message
      )

      return tip

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send instant tip'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [isInitialized])

  // Close a tip channel
  const closeTipChannel = useCallback(async (channelId: string): Promise<void> => {
    if (!isInitialized) {
      throw new Error('Yellow Network not initialized')
    }

    try {
      await yellowTippingService.closeTipChannel(channelId)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to close tip channel'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [isInitialized])

  // Get tip channel statistics
  const getTipChannelStats = useCallback((
    viewer: Address,
    streamer: Address
  ): TipChannel | null => {
    const channelKey = `${viewer.toLowerCase()}-${streamer.toLowerCase()}`
    return yellowTippingService.getTipChannelStats(channelKey)
  }, [])

  // Format tip amount for display
  const formatTipAmount = useCallback((amount: bigint): string => {
    return `${formatEther(amount)} ETH`
  }, [])

  // Auto-initialize when wallet is connected
  useEffect(() => {
    if (walletClient && userAddress && !isInitialized && !isConnecting) {
      initializeYellow()
    }
  }, [walletClient, userAddress, isInitialized, isConnecting, initializeYellow])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      yellowTippingService.cleanup()
    }
  }, [])

  // Memoized return value
  return useMemo(() => ({
    // State
    isInitialized,
    isConnecting,
    error,
    activeTipChannels,

    // Actions
    initializeYellow,
    createTipChannel,
    sendInstantTip,
    closeTipChannel,

    // Utilities
    getTipChannelStats,
    formatTipAmount,
  }), [
    isInitialized,
    isConnecting,
    error,
    activeTipChannels,
    initializeYellow,
    createTipChannel,
    sendInstantTip,
    closeTipChannel,
    getTipChannelStats,
    formatTipAmount,
  ])
}

/**
 * Hook for listening to real-time tip events
 * Useful for notifications and live updates
 */
export function useYellowTipEvents() {
  const [recentTips, setRecentTips] = useState<InstantTip[]>([])
  const [channelUpdates, setChannelUpdates] = useState<TipChannel[]>([])

  useEffect(() => {
    const handleTipEvent = (data: any) => {
      const { tip } = data
      setRecentTips(prev => [tip, ...prev.slice(0, 19)]) // Keep last 20 tips
    }

    const handleChannelUpdate = (channel: TipChannel) => {
      setChannelUpdates(prev => [channel, ...prev.slice(0, 9)]) // Keep last 10 updates
    }

    yellowTippingService.on('instantTip', handleTipEvent)
    yellowTippingService.on('channelCreated', handleChannelUpdate)

    return () => {
      yellowTippingService.off('instantTip', handleTipEvent)
      yellowTippingService.off('channelCreated', handleChannelUpdate)
    }
  }, [])

  return {
    recentTips,
    channelUpdates,
  }
}

/**
 * Hook for Yellow Network connection status
 * Provides real-time connection information
 */
export function useYellowConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true)
      setConnectionError(null)
    }

    const handleDisconnect = () => {
      setIsConnected(false)
    }

    const handleError = (error: any) => {
      setConnectionError(error.message || 'Connection error')
      setIsConnected(false)
    }

    yellowTippingService.on('clearNodeConnected', handleConnect)
    yellowTippingService.on('clearNodeDisconnected', handleDisconnect)
    yellowTippingService.on('clearNodeError', handleError)

    return () => {
      yellowTippingService.off('clearNodeConnected', handleConnect)
      yellowTippingService.off('clearNodeDisconnected', handleDisconnect)
      yellowTippingService.off('clearNodeError', handleError)
    }
  }, [])

  return {
    isConnected,
    connectionError,
  }
}