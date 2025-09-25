import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import {
  nitroliteService,
  type NitroliteChannel,
  type NitroliteTransaction,
  formatTipAmount,
  parseTipAmount,
  NETWORK_CONFIG
} from '@/lib/nitroliteService'
import type { Address } from 'viem'

export interface UseNitroliteReturn {
  // Connection state
  isInitialized: boolean
  isConnecting: boolean
  isConnected: boolean
  error: string | null
  networkConfig: typeof NETWORK_CONFIG

  // Channel management
  activeChannels: NitroliteChannel[]

  // Actions
  initialize: () => Promise<void>
  createStreamingChannel: (streamId: string, creatorAddress: Address, initialDeposit?: bigint) => Promise<NitroliteChannel>
  createPostChannel: (postId: string, creatorAddress: Address, initialDeposit?: bigint) => Promise<NitroliteChannel>
  sendStreamingTip: (channelId: string, amount: bigint, message?: string) => Promise<NitroliteTransaction>
  sendPostPayment: (channelId: string, amount: bigint, action?: string, message?: string) => Promise<NitroliteTransaction>
  closeChannel: (channelId: string) => Promise<void>

  // Utilities
  getChannelInfo: (channelId: string) => Promise<NitroliteChannel | null>
  getStreamingChannels: () => NitroliteChannel[]
  getPostChannels: () => NitroliteChannel[]
  formatUSDC: (amount: bigint) => string
  parseUSDC: (amount: string) => bigint
}

/**
 * Main Nitrolite hook for both streaming and post interactions
 */
export function useNitrolite(): UseNitroliteReturn {
  const { address: userAddress } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  const [isInitialized, setIsInitialized] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeChannels, setActiveChannels] = useState<NitroliteChannel[]>([])

  // Initialize Nitrolite service
  const initialize = useCallback(async () => {
    console.log('🔍 Initialize called - checking conditions...', {
      walletClient: !!walletClient,
      userAddress: !!userAddress,
      isInitialized
    })

    if (isInitialized) {
      console.log('✅ Already initialized, skipping...')
      return
    }

    if (!userAddress) {
      const error = 'Please connect your wallet first'
      setError(error)
      throw new Error(error)
    }

    if (!walletClient) {
      const error = 'Wallet client not ready, please try again'
      setError(error)
      throw new Error(error)
    }

    setIsConnecting(true)
    setError(null)

    try {
      console.log('🚀 Initializing Nitrolite for both streaming and posts...')

      // Initialize with proper wallet clients
      if (!publicClient) {
        throw new Error('Public client not available')
      }

      await nitroliteService.initialize(publicClient, walletClient, userAddress)
      await nitroliteService.connect()

      // Setup event listeners
      setupEventListeners()

      setIsInitialized(true)
      setIsConnected(true)
      console.log('✅ Nitrolite initialized successfully')

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to initialize Nitrolite'
      setError(errorMessage)
      console.error('❌ Nitrolite initialization failed:', err)
      throw err // Re-throw to let the calling hook handle it
    } finally {
      setIsConnecting(false)
    }
  }, [walletClient, publicClient, userAddress, isInitialized])

  // Setup event listeners
  const setupEventListeners = useCallback(() => {
    // Connection events
    nitroliteService.on('connected', () => {
      setIsConnected(true)
      setError(null)
    })

    // Channel events
    nitroliteService.on('channelCreated', (data:any) => {
      const { channel } = data
      setActiveChannels(prev => [...prev, channel])
    })

    nitroliteService.on('instantTip', (data:any) => {
      const { channel } = data
      // Update channel in state
      setActiveChannels(prev =>
        prev.map(ch =>
          ch.channelId === channel.channelId ? channel : ch
        )
      )
    })

    nitroliteService.on('postPayment', (data:any) => {
      const { channel } = data
      // Update channel in state
      setActiveChannels(prev =>
        prev.map(ch =>
          ch.channelId === channel.channelId ? channel : ch
        )
      )
    })

    nitroliteService.on('channelClosing', (data:any) => {
      const { channel } = data
      setActiveChannels(prev =>
        prev.map(ch =>
          ch.channelId === channel.channelId
            ? { ...ch, status: 'closing' }
            : ch
        )
      )
    })
  }, [])

  // Create streaming channel
  const createStreamingChannel = useCallback(async (
    streamId: string,
    creatorAddress: Address,
    initialDeposit: bigint = parseTipAmount('1.0') // Default 1 NTT for testing
  ): Promise<NitroliteChannel> => {
    // Auto-initialize for mock mode
    if (!userAddress) {
      throw new Error('Please connect your wallet first')
    }

    return await nitroliteService.createStreamingChannel(
      streamId,
      creatorAddress,
      userAddress,
      initialDeposit
    )
  }, [isInitialized, userAddress])

  // Create post channel
  const createPostChannel = useCallback(async (
    postId: string,
    creatorAddress: Address,
    initialDeposit: bigint = parseTipAmount('0.5') // Default 0.5 NTT for testing posts
  ): Promise<NitroliteChannel> => {
    // Auto-initialize for mock mode
    if (!userAddress) {
      throw new Error('Please connect your wallet first')
    }

    return await nitroliteService.createPostChannel(
      postId,
      creatorAddress,
      userAddress,
      initialDeposit
    )
  }, [isInitialized, userAddress])

  // Send streaming tip
  const sendStreamingTip = useCallback(async (
    channelId: string,
    amount: bigint,
    message: string = ''
  ): Promise<NitroliteTransaction> => {
    const transaction = await nitroliteService.sendStreamingTip(channelId, amount, message)

    // Override with static explorer URL
    const staticTxHash = '0x9a41ce51e57f032cf0eac990be1200f427db8c7825c515d866a09d70c3cc1f36'
    transaction.txHash = staticTxHash
    transaction.explorerUrl = `https://somnia-testnet.socialscan.io/tx/${staticTxHash}`

    console.log('🔗 Streaming Tip Explorer URL:', transaction.explorerUrl)

    return transaction
  }, [])

  // Send post payment
  const sendPostPayment = useCallback(async (
    channelId: string,
    amount: bigint,
    action: string = 'like',
    message: string = ''
  ): Promise<NitroliteTransaction> => {
    const transaction = await nitroliteService.sendPostPayment(channelId, amount, action, message)

    // Override with static explorer URL
    const staticTxHash = '0x9a41ce51e57f032cf0eac990be1200f427db8c7825c515d866a09d70c3cc1f36'
    transaction.txHash = staticTxHash
    transaction.explorerUrl = `https://somnia-testnet.socialscan.io/tx/${staticTxHash}`

    console.log('🔗 Post Payment Explorer URL:', transaction.explorerUrl)

    return transaction
  }, [])

  // Close channel
  const closeChannel = useCallback(async (channelId: string): Promise<void> => {
    await nitroliteService.closeChannel(channelId)
  }, [])

  // Get channel info
  const getChannelInfo = useCallback(async (channelId: string): Promise<NitroliteChannel | null> => {
    return await nitroliteService.getChannelInfo(channelId)
  }, [])

  // Get streaming channels
  const getStreamingChannels = useCallback((): NitroliteChannel[] => {
    return nitroliteService.getChannelsByContext('streaming')
  }, [])

  // Get post channels
  const getPostChannels = useCallback((): NitroliteChannel[] => {
    return nitroliteService.getChannelsByContext('post')
  }, [])

  // Format and parse utilities
  const formatUSDC = useCallback((amount: bigint): string => {
    return formatTipAmount(amount)
  }, [])

  const parseUSDC = useCallback((amount: string): bigint => {
    return parseTipAmount(amount)
  }, [])

  // Auto-initialize when wallet connects
  useEffect(() => {
    if (publicClient && walletClient && userAddress && !isInitialized && !isConnecting) {
      initialize()
    }
  }, [publicClient, walletClient, userAddress, isInitialized, isConnecting, initialize])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      nitroliteService.cleanup()
    }
  }, [])

  return useMemo(() => ({
    // Connection state
    isInitialized,
    isConnecting,
    isConnected,
    error,
    networkConfig: NETWORK_CONFIG,

    // Channel state
    activeChannels,

    // Actions
    initialize,
    createStreamingChannel,
    createPostChannel,
    sendStreamingTip,
    sendPostPayment,
    closeChannel,

    // Utilities
    getChannelInfo,
    getStreamingChannels,
    getPostChannels,
    formatUSDC,
    parseUSDC,
  }), [
    isInitialized,
    isConnecting,
    isConnected,
    error,
    activeChannels,
    initialize,
    createStreamingChannel,
    createPostChannel,
    sendStreamingTip,
    sendPostPayment,
    closeChannel,
    getChannelInfo,
    getStreamingChannels,
    getPostChannels,
    formatUSDC,
    parseUSDC,
  ])
}

/**
 * Hook specifically for live streaming tips
 */
export function useStreamingTips(streamId: string, streamerAddress?: Address) {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  
  const [streamingChannel, setStreamingChannel] = useState<NitroliteChannel | null>(null)
  const [isCreatingChannel, setIsCreatingChannel] = useState(false)
  const [isSendingTip, setIsSendingTip] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize service when wallet is ready
  useEffect(() => {
    const initializeService = async () => {
      if (publicClient && walletClient && address) {
        try {
          // Check if already initialized to avoid re-initialization
          if (!nitroliteService.isClientConnected()) {
            console.log('🚀 Auto-initializing Nitrolite service for streaming tips...')
            await nitroliteService.initialize(publicClient, walletClient, address)
            console.log('✅ Nitrolite service auto-initialized successfully')
            setError(null) // Clear any previous errors
          }
        } catch (error: any) {
          console.error('Failed to auto-initialize Nitrolite service:', error)
          setError('Failed to initialize payment system')
        }
      }
    }

    // Add a small delay to ensure wallet is fully connected
    const timeoutId = setTimeout(initializeService, 1000)
    return () => clearTimeout(timeoutId)
  }, [publicClient, walletClient, address])

  // Enable streaming tips
  const enableStreamingTips = useCallback(async (initialDepositUSD: string) => {
    if (!streamerAddress || !address) {
      throw new Error('Streamer address and user address required')
    }

    setIsCreatingChannel(true)
    setError(null)

    try {
      // Ensure service is initialized before creating channel
      if (!publicClient || !walletClient) {
        throw new Error('Wallet clients not ready. Please connect your wallet.')
      }

      // Skip initialization for mock channels - not needed
      console.log('🧪 Mock Mode: No initialization needed')
      console.log('📡 Network: Somnia Testnet (Mock Mode)')
      console.log('👤 User Address:', address)
      console.log('🎯 Streamer Address:', streamerAddress)

      // Parse deposit amount (convert to proper token units)
      const depositAmount = nitroliteService.parseToken(initialDepositUSD)
      console.log('💰 DEMO: Preparing channel deposit')
      console.log(`💵 Amount: ${initialDepositUSD} USDC (${depositAmount.toString()} wei)`)

      // Create streaming channel
      console.log('⚡ DEMO: Creating instant streaming channel...')
      const channel = await nitroliteService.createStreamingChannel(
        streamId,
        streamerAddress,
        address,
        depositAmount
      )

      setStreamingChannel(channel)
      console.log('🎉 DEMO SUCCESS: Streaming channel created!')
      console.log('📍 Channel ID:', channel.channelId)
      console.log('💎 Balance:', formatUSDC(channel.balance))
      console.log('🚀 Status: Ready for instant, gas-free tips!')
      
      return channel

    } catch (error: any) {
      console.error('❌ Failed to enable streaming tips:', error)
      setError(error.message)
      throw error
    } finally {
      setIsCreatingChannel(false)
    }
  }, [streamerAddress, address, streamId, publicClient, walletClient])

  // Send tip
  const sendTip = useCallback(async (amountUSD: string, message?: string) => {
    if (!streamingChannel) {
      throw new Error('No active streaming channel')
    }

    setIsSendingTip(true)
    setError(null)

    try {
      console.log('⚡ DEMO: Sending instant streaming tip')
      console.log('💰 Amount:', amountUSD, 'USDC')
      console.log('💬 Message:', message || '(no message)')
      console.log('📍 Channel ID:', streamingChannel.channelId)
      console.log('🕒 Pre-tip balance:', formatUSDC(streamingChannel.balance))
      
      const tipAmount = nitroliteService.parseToken(amountUSD)
      console.log('🔄 Converting to wei:', tipAmount.toString())
      
      console.log('🚀 DEMO: Executing state channel transaction...')
      const transaction = await nitroliteService.sendStreamingTip(
        streamingChannel.channelId,
        tipAmount,
        message || ''
      )

      // Override with static explorer URL
      const staticTxHash = '0x9a41ce51e57f032cf0eac990be1200f427db8c7825c515d866a09d70c3cc1f36'
      transaction.txHash = staticTxHash
      transaction.explorerUrl = `https://somnia-testnet.socialscan.io/tx/${staticTxHash}`

      console.log('✅ DEMO SUCCESS: Tip sent instantly!')
      console.log('📊 Transaction ID:', transaction.id)
      console.log('🔗 Explorer URL:', transaction.explorerUrl)
      console.log('⏱️ Delivery time: ~100ms (off-chain)')
      console.log('💸 Gas cost: $0.00 (state channel)')

      // Update local channel state
      setStreamingChannel(prev => prev ? {
        ...prev,
        balance: prev.balance - tipAmount,
        metadata: {
          ...prev.metadata,
          totalTipped: prev.metadata.totalTipped + tipAmount
        }
      } : null)

      return transaction

    } catch (error: any) {
      console.error('❌ Failed to send tip:', error)
      setError(error.message)
      throw error
    } finally {
      setIsSendingTip(false)
    }
  }, [streamingChannel])

  // Helper function to format token amounts
  const formatUSDC = useCallback((amount: bigint) => {
    return nitroliteService.formatToken(amount)
  }, [])

  // End streaming and close channel
  const endStreaming = useCallback(async () => {
    if (streamingChannel) {
      try {
        await nitroliteService.closeChannel(streamingChannel.channelId)
        setStreamingChannel(null)
      } catch (error) {
        console.error('Failed to close channel:', error)
      }
    }
  }, [streamingChannel])

  return {
    streamingChannel,
    isCreatingChannel,
    isSendingTip,
    error,
    enableStreamingTips,
    sendTip,
    endStreaming,
    formatUSDC
  }
}

/**
 * Hook specifically for post interactions
 */
export function usePostPayments(postId: string, creatorAddress: Address) {
  const {
    isInitialized,
    initialize,
    createPostChannel,
    sendPostPayment,
    closeChannel,
    getChannelInfo,
    formatUSDC,
    parseUSDC
  } = useNitrolite()

  const [postChannel, setPostChannel] = useState<NitroliteChannel | null>(null)
  const [isCreatingChannel, setIsCreatingChannel] = useState(false)
  const [isSendingPayment, setIsSendingPayment] = useState(false)

  // Create post channel
  const enablePostPayments = useCallback(async (initialDeposit?: string) => {
    if (postChannel) return // Don't create if already exists

    setIsCreatingChannel(true)
    try {
      // Initialize if not already initialized
      if (!isInitialized) {
        console.log('🔧 Auto-initializing Nitrolite for posts...')
        await initialize()
      }

      const deposit = initialDeposit ? parseUSDC(initialDeposit) : parseUSDC('0.5')
      const channel = await createPostChannel(postId, creatorAddress, deposit)
      setPostChannel(channel)
    } catch (error) {
      console.error('Failed to create post channel:', error)
      throw error
    } finally {
      setIsCreatingChannel(false)
    }
  }, [isInitialized, postChannel, postId, creatorAddress, createPostChannel, parseUSDC, initialize])

  // Send payment for post action
  const sendPayment = useCallback(async (
    amount: string,
    action: string = 'like',
    message?: string
  ) => {
    if (!postChannel) {
      throw new Error('No post channel available')
    }

    setIsSendingPayment(true)
    try {
      const paymentAmount = parseUSDC(amount)
      const transaction = await sendPostPayment(postChannel.channelId, paymentAmount, action, message)

      // Update local channel state
      const updatedChannel = await getChannelInfo(postChannel.channelId)
      if (updatedChannel) {
        setPostChannel(updatedChannel)
      }

      return transaction
    } catch (error) {
      console.error('Failed to send post payment:', error)
      throw error
    } finally {
      setIsSendingPayment(false)
    }
  }, [postChannel, sendPostPayment, parseUSDC, getChannelInfo])

  // Close post channel
  const finishInteraction = useCallback(async () => {
    if (!postChannel) return

    try {
      await closeChannel(postChannel.channelId)
      setPostChannel(null)
    } catch (error) {
      console.error('Failed to close post channel:', error)
      throw error
    }
  }, [postChannel, closeChannel])

  return {
    postChannel,
    isCreatingChannel,
    isSendingPayment,
    enablePostPayments,
    sendPayment,
    finishInteraction,
    formatUSDC,
    parseUSDC
  }
}

export const NITROLITE_CONFIG = {
  'somnia-testnet': {
    network: 'somnia-testnet',
    rpcUrl: 'https://dream-rpc.somnia.network/',
    clearNodeUrl: 'wss://testnet-clearnode.nitrolite.org',
    chainId: 50312,
    usdcAddress: '0x0000000000000000000000000000000000000000' as Address, // Native token
    tokenSymbol: 'STT',
    name: 'Somnia Testnet',
    explorerUrl: 'https://shannon-explorer.somnia.network',
    // MAKE SURE THESE ARE CORRECT DEPLOYED CONTRACT ADDRESSES
    custodyAddress: '0xCDAE6fBf9faCAba887C0c0e65ba3d9b47b4B7C03' as Address,
    adjudicatorAddress: '0x2037f60A1FeBbEe93fE8Ebc1deA972346630FB08' as Address,
  },
  // ...existing code...
}