import { useState, useEffect, useCallback, useMemo } from 'react'
import { useWalletClient, useAccount, usePublicClient } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import type { Address, Hash } from 'viem'
import {
  baseStateChannelsService,
  type BaseChannel,
  type InstantTip,
  formatTipAmount,
  parseTipAmount,
  NETWORK_CONFIG
} from '@/lib/baseStateChannels'

export interface UseBaseStateChannelsReturn {
  // State
  isInitialized: boolean
  isConnecting: boolean
  error: string | null
  activeChannels: BaseChannel[]
  networkConfig: typeof NETWORK_CONFIG

  // Actions
  initialize: () => Promise<void>
  openChannel: (streamerAddress: Address, initialDeposit?: string) => Promise<BaseChannel>
  sendInstantTip: (channelId: Hash, amount: string, message?: string) => Promise<InstantTip>
  closeChannel: (channelId: Hash) => Promise<void>

  // Utilities
  getChannelInfo: (channelId: Hash) => Promise<BaseChannel | null>
  getUserChannels: (address: Address) => BaseChannel[]
  formatTipAmount: (amount: bigint) => string
  parseUSDC: (amount: string) => bigint
  getChannelId: (viewer: Address, streamer: Address) => Promise<Hash>
}

/**
 * React hook for Base State Channels tipping functionality
 * Complete replacement for Yellow Network with native Base integration
 */
export function useBaseStateChannels(): UseBaseStateChannelsReturn {
  // Wagmi hooks
  const { data: walletClient } = useWalletClient()
  const { address: userAddress } = useAccount()
  const publicClient = usePublicClient()

  // State
  const [isInitialized, setIsInitialized] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeChannels, setActiveChannels] = useState<BaseChannel[]>([])
  const [tipNotifications, setTipNotifications] = useState<InstantTip[]>([])

  // Initialize Base State Channels service
  const initialize = useCallback(async () => {
    if (!walletClient || !userAddress || isInitialized) return

    setIsConnecting(true)
    setError(null)

    try {
      console.log('🚀 Initializing Base State Channels...')

      await baseStateChannelsService.initialize(walletClient)

      // Setup event listeners
      setupEventListeners()

      // Load existing channels for user
      const userChannels = baseStateChannelsService.getUserChannels(userAddress)
      setActiveChannels(userChannels)

      setIsInitialized(true)
      console.log('✅ Base State Channels initialized successfully')

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to initialize Base State Channels'
      setError(errorMessage)
      console.error('❌ Base State Channels initialization failed:', err)

      // If Base contracts aren't deployed, show helpful message
      if (errorMessage.includes('contract address not configured')) {
        setError('Base State Channel contracts need to be deployed. Run: npm run deploy:base')
      }
    } finally {
      setIsConnecting(false)
    }
  }, [walletClient, userAddress, isInitialized])

  // Setup event listeners for real-time updates
  const setupEventListeners = useCallback(() => {
    // Listen for new channels
    baseStateChannelsService.on('channelOpened', (channel: BaseChannel) => {
      console.log('📢 Channel opened:', channel.channelId)
      setActiveChannels(prev => {
        const exists = prev.some(ch => ch.channelId === channel.channelId)
        return exists ? prev : [...prev, channel]
      })
    })

    // Listen for instant tips
    baseStateChannelsService.on('instantTip', (data: any) => {
      const { tip, channel, newState } = data
      console.log('🎉 Instant tip received:', tip)

      // Update channel stats with off-chain state
      setActiveChannels(prev =>
        prev.map(ch =>
          ch.channelId === channel.channelId
            ? { ...ch, totalTipped: newState.totalTipped, nonce: newState.nonce }
            : ch
        )
      )

      // Add to notifications
      setTipNotifications(prev => [tip, ...prev.slice(0, 19)]) // Keep last 20 tips
    })

    // Listen for channel closures
    baseStateChannelsService.on('channelClosed', (data: any) => {
      console.log('🔒 Channel closed:', data.channelId)
      setActiveChannels(prev =>
        prev.map(ch =>
          ch.channelId === data.channelId
            ? { ...ch, isActive: false }
            : ch
        )
      )
    })

    // Listen for real-time connection status
    baseStateChannelsService.on('realtimeConnected', () => {
      console.log('🌐 Real-time service connected')
    })

    baseStateChannelsService.on('realtimeDisconnected', () => {
      console.log('🔌 Real-time service disconnected')
    })

  }, [])

  // Open a new tipping channel
  const openChannel = useCallback(async (
    streamerAddress: Address,
    initialDeposit: string = '10.0' // Default 10 USDC
  ): Promise<BaseChannel> => {
    if (!isInitialized || !userAddress) {
      throw new Error('Base State Channels not initialized')
    }

    if (streamerAddress.toLowerCase() === userAddress.toLowerCase()) {
      throw new Error('Cannot create a channel with yourself')
    }

    try {
      console.log(`🚀 Opening channel to ${streamerAddress} with ${initialDeposit} USDC`)

      const depositAmount = parseTipAmount(initialDeposit)
      const channel = await baseStateChannelsService.openChannel(streamerAddress, depositAmount)

      return channel

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to open channel'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [isInitialized, userAddress])

  // Send an instant tip
  const sendInstantTip = useCallback(async (
    channelId: Hash,
    amount: string,
    message: string = ''
  ): Promise<InstantTip> => {
    if (!isInitialized) {
      throw new Error('Base State Channels not initialized')
    }

    try {
      console.log(`💸 Sending instant tip: ${amount} USDC`)

      const tipAmount = parseTipAmount(amount)

      // Validate tip amount
      if (tipAmount <= 0n) {
        throw new Error('Tip amount must be greater than 0')
      }

      // Check if we have sufficient balance in channel
      const channel = activeChannels.find(ch => ch.channelId === channelId)
      if (!channel) {
        throw new Error('Channel not found')
      }

      const offChainState = baseStateChannelsService.getChannelOffChainState(channelId)
      const currentTotal = offChainState?.totalTipped || channel.totalTipped

      if (currentTotal + tipAmount > channel.deposit) {
        throw new Error(`Insufficient channel balance. Available: ${formatTipAmount(channel.deposit - currentTotal)}`)
      }

      const tip = await baseStateChannelsService.sendInstantTip(
        channelId,
        tipAmount,
        message
      )

      return tip

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send instant tip'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [isInitialized, activeChannels])

  // Close a tip channel
  const closeChannel = useCallback(async (channelId: Hash): Promise<void> => {
    if (!isInitialized) {
      throw new Error('Base State Channels not initialized')
    }

    try {
      console.log(`🔒 Closing channel: ${channelId}`)
      await baseStateChannelsService.closeChannel(channelId)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to close channel'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [isInitialized])

  // Get channel information from contract
  const getChannelInfo = useCallback(async (channelId: Hash): Promise<BaseChannel | null> => {
    return await baseStateChannelsService.getChannelInfo(channelId)
  }, [])

  // Get user's channels
  const getUserChannels = useCallback((address: Address): BaseChannel[] => {
    return baseStateChannelsService.getUserChannels(address)
  }, [])

  // Get channel ID for viewer/streamer pair
  const getChannelId = useCallback(async (viewer: Address, streamer: Address): Promise<Hash> => {
    return await baseStateChannelsService.getChannelId(viewer, streamer)
  }, [])

  // Format USDC amount for display
  const formatUSDCAmount = useCallback((amount: bigint): string => {
    return formatTipAmount(amount)
  }, [])

  // Parse USDC amount from string
  const parseUSDC = useCallback((amount: string): bigint => {
    return parseTipAmount(amount)
  }, [])

  // Auto-initialize when wallet is connected
  useEffect(() => {
    if (walletClient && userAddress && !isInitialized && !isConnecting) {
      initialize()
    }
  }, [walletClient, userAddress, isInitialized, isConnecting, initialize])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      baseStateChannelsService.cleanup()
    }
  }, [])

  // Memoized return value
  return useMemo(() => ({
    // State
    isInitialized,
    isConnecting,
    error,
    activeChannels,
    networkConfig: NETWORK_CONFIG,

    // Actions
    initialize,
    openChannel,
    sendInstantTip,
    closeChannel,

    // Utilities
    getChannelInfo,
    getUserChannels,
    formatTipAmount: formatUSDCAmount,
    parseUSDC,
    getChannelId,
  }), [
    isInitialized,
    isConnecting,
    error,
    activeChannels,
    initialize,
    openChannel,
    sendInstantTip,
    closeChannel,
    getChannelInfo,
    getUserChannels,
    formatUSDCAmount,
    parseUSDC,
    getChannelId,
  ])
}

/**
 * Hook for listening to real-time tip events
 * Useful for notifications and live updates
 */
export function useBaseStateTipEvents() {
  const [recentTips, setRecentTips] = useState<InstantTip[]>([])
  const [channelUpdates, setChannelUpdates] = useState<BaseChannel[]>([])

  useEffect(() => {
    const handleTipEvent = (data: any) => {
      const { tip } = data
      setRecentTips(prev => [tip, ...prev.slice(0, 29)]) // Keep last 30 tips
    }

    const handleChannelUpdate = (channel: BaseChannel) => {
      setChannelUpdates(prev => {
        const exists = prev.some(ch => ch.channelId === channel.channelId)
        if (exists) {
          return prev.map(ch => ch.channelId === channel.channelId ? channel : ch)
        }
        return [channel, ...prev.slice(0, 14)] // Keep last 15 updates
      })
    }

    baseStateChannelsService.on('instantTip', handleTipEvent)
    baseStateChannelsService.on('channelOpened', handleChannelUpdate)

    return () => {
      baseStateChannelsService.off('instantTip', handleTipEvent)
      baseStateChannelsService.off('channelOpened', handleChannelUpdate)
    }
  }, [])

  return {
    recentTips,
    channelUpdates,
  }
}

/**
 * Hook for Base State Channels connection status
 * Provides real-time connection information
 */
export function useBaseConnectionStatus() {
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    const handleConnect = () => {
      setIsRealtimeConnected(true)
      setConnectionError(null)
    }

    const handleDisconnect = () => {
      setIsRealtimeConnected(false)
    }

    const handleError = (error: any) => {
      setConnectionError(error.message || 'Real-time connection error')
      setIsRealtimeConnected(false)
    }

    baseStateChannelsService.on('realtimeConnected', handleConnect)
    baseStateChannelsService.on('realtimeDisconnected', handleDisconnect)
    baseStateChannelsService.on('realtimeError', handleError)

    return () => {
      baseStateChannelsService.off('realtimeConnected', handleConnect)
      baseStateChannelsService.off('realtimeDisconnected', handleDisconnect)
      baseStateChannelsService.off('realtimeError', handleError)
    }
  }, [])

  return {
    isRealtimeConnected,
    connectionError,
  }
}

/**
 * Hook for channel balance tracking
 * Tracks both on-chain and off-chain balances
 */
export function useChannelBalance(channelId: Hash | null) {
  const [onChainBalance, setOnChainBalance] = useState<bigint>(0n)
  const [offChainBalance, setOffChainBalance] = useState<bigint>(0n)
  const [channel, setChannel] = useState<BaseChannel | null>(null)

  useEffect(() => {
    if (!channelId) return

    const updateBalances = async () => {
      try {
        // Get on-chain channel info
        const channelInfo = await baseStateChannelsService.getChannelInfo(channelId)
        if (channelInfo) {
          setChannel(channelInfo)
          setOnChainBalance(channelInfo.deposit - channelInfo.totalTipped)
        }

        // Get off-chain state
        const offChainState = baseStateChannelsService.getChannelOffChainState(channelId)
        if (offChainState && channelInfo) {
          setOffChainBalance(channelInfo.deposit - offChainState.totalTipped)
        }
      } catch (error) {
        console.error('Error updating channel balances:', error)
      }
    }

    updateBalances()

    // Listen for updates
    const handleChannelUpdate = (data: any) => {
      if (data.channel?.channelId === channelId || data.channelId === channelId) {
        updateBalances()
      }
    }

    baseStateChannelsService.on('instantTip', handleChannelUpdate)
    baseStateChannelsService.on('channelClosed', handleChannelUpdate)

    return () => {
      baseStateChannelsService.off('instantTip', handleChannelUpdate)
      baseStateChannelsService.off('channelClosed', handleChannelUpdate)
    }
  }, [channelId])

  return {
    onChainBalance,
    offChainBalance,
    channel,
    hasOffChainUpdates: offChainBalance !== onChainBalance
  }
}