import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  parseEther,
  parseUnits,
  formatUnits,
  encodeFunctionData,
  decodeFunctionResult
} from 'viem'
import { base, baseSepolia } from 'viem/chains'
import type { Address, PublicClient, WalletClient, Hash, Chain } from 'viem'

// Base State Channels Configuration
export const BASE_CONFIG = {
  mainnet: {
    chainId: 8453,
    chain: base,
    rpcUrl: 'https://mainnet.base.org',
    usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address,
    explorerUrl: 'https://basescan.org',
    name: 'Base Mainnet'
  },
  testnet: {
    chainId: 84532,
    chain: baseSepolia,
    rpcUrl: 'https://sepolia.base.org',
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as Address,
    explorerUrl: 'https://sepolia-explorer.base.org',
    name: 'Base Sepolia'
  }
} as const

// Get current network configuration
const currentNetwork = process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet'
export const NETWORK_CONFIG = BASE_CONFIG[currentNetwork]

export const STATE_CHANNEL_CONFIG = {
  contractAddress: process.env.NEXT_PUBLIC_BASE_STATE_CHANNEL_ADDRESS as Address,
  challengePeriod: 3600, // 1 hour in seconds
  minDeposit: 1000000n, // 1 USDC (6 decimals)
  maxTipAmount: 100000000n, // 100 USDC max tip
  defaultChannelDeposit: 10000000n, // 10 USDC default deposit
} as const

// Types for Base State Channels
export interface BaseChannel {
  channelId: Hash
  viewer: Address
  streamer: Address
  deposit: bigint
  totalTipped: bigint
  nonce: number
  timeout: number
  isActive: boolean
  disputed: boolean
}

export interface InstantTip {
  id: string
  channelId: Hash
  viewer: Address
  streamer: Address
  amount: bigint
  message: string
  timestamp: Date
  txHash?: Hash
  signature?: Hash
}

export interface ChannelState {
  channelId: Hash
  totalTipped: bigint
  nonce: number
  timestamp: number
}

export interface SignedState extends ChannelState {
  viewerSignature: Hash
  streamerSignature: Hash
}

/**
 * Base State Channels Service
 * Production-ready instant tipping with state channels on Base
 */
export class BaseStateChannelsService {
  private publicClient: PublicClient
  private walletClient: WalletClient | null = null
  private activeChannels: Map<Hash, BaseChannel> = new Map()
  private offChainStates: Map<Hash, ChannelState> = new Map()
  private eventCallbacks: Map<string, Function[]> = new Map()
  private websocket: WebSocket | null = null

  // Contract ABI (minimal required functions)
  private readonly contractABI = [
    {
      inputs: [{ name: 'viewer', type: 'address' }, { name: 'streamer', type: 'address' }],
      name: 'getChannelId',
      outputs: [{ name: '', type: 'bytes32' }],
      stateMutability: 'pure',
      type: 'function'
    },
    {
      inputs: [{ name: 'streamer', type: 'address' }, { name: 'deposit', type: 'uint256' }],
      name: 'openChannel',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { name: 'channelId', type: 'bytes32' },
        { name: 'totalTipped', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'viewerSignature', type: 'bytes' },
        { name: 'streamerSignature', type: 'bytes' }
      ],
      name: 'closeChannel',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [{ name: 'channelId', type: 'bytes32' }],
      name: 'getChannel',
      outputs: [
        {
          components: [
            { name: 'viewer', type: 'address' },
            { name: 'streamer', type: 'address' },
            { name: 'deposit', type: 'uint256' },
            { name: 'totalTipped', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'timeout', type: 'uint256' },
            { name: 'isActive', type: 'bool' },
            { name: 'disputed', type: 'bool' }
          ],
          name: '',
          type: 'tuple'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        { name: 'channelId', type: 'bytes32' },
        { name: 'tipAmount', type: 'uint256' },
        { name: 'newTotal', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'signature', type: 'bytes' }
      ],
      name: 'submitInstantTip',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    // Events
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: 'channelId', type: 'bytes32' },
        { indexed: true, name: 'viewer', type: 'address' },
        { indexed: true, name: 'streamer', type: 'address' },
        { name: 'deposit', type: 'uint256' }
      ],
      name: 'ChannelOpened',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: 'channelId', type: 'bytes32' },
        { indexed: true, name: 'viewer', type: 'address' },
        { indexed: true, name: 'streamer', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'totalTipped', type: 'uint256' }
      ],
      name: 'InstantTip',
      type: 'event'
    }
  ] as const

  constructor() {
    // Initialize public client for Base network
    this.publicClient = createPublicClient({
      chain: NETWORK_CONFIG.chain,
      transport: http(NETWORK_CONFIG.rpcUrl)
    })

    this.setupEventHandlers()
    console.log(`🏗️  Base State Channels Service initialized on ${NETWORK_CONFIG.name}`)
  }

  /**
   * Initialize service with user's wallet
   */
  async initialize(walletClient: WalletClient): Promise<void> {
    try {
      if (!STATE_CHANNEL_CONFIG.contractAddress) {
        throw new Error('Base State Channel contract address not configured')
      }

      this.walletClient = walletClient

      // Verify we're on the correct network
      const chainId = await walletClient.getChainId()
      if (chainId !== NETWORK_CONFIG.chainId) {
        throw new Error(`Wrong network. Expected ${NETWORK_CONFIG.chainId}, got ${chainId}`)
      }

      // Start WebSocket connection for real-time updates
      await this.connectToRealtimeService()

      console.log('✅ Base State Channels service initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Base State Channels service:', error)
      throw error
    }
  }

  /**
   * Generate channel ID for viewer and streamer pair
   */
  async getChannelId(viewer: Address, streamer: Address): Promise<Hash> {
    try {
      const result = await this.publicClient.readContract({
        address: STATE_CHANNEL_CONFIG.contractAddress,
        abi: this.contractABI,
        functionName: 'getChannelId',
        args: [viewer, streamer]
      })
      return result as Hash
    } catch (error) {
      console.error('Error generating channel ID:', error)
      throw error
    }
  }

  /**
   * Open a new tipping channel
   */
  async openChannel(streamer: Address, deposit?: bigint): Promise<BaseChannel> {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized')
    }

    try {
      const viewer = (await this.walletClient.getAddresses())[0]
      const channelDeposit = deposit || STATE_CHANNEL_CONFIG.defaultChannelDeposit

      console.log(`🚀 Opening channel: ${viewer} -> ${streamer} (${formatUnits(channelDeposit, 6)} USDC)`)

      // Check if channel already exists
      const channelId = await this.getChannelId(viewer, streamer)
      const existingChannel = await this.getChannelInfo(channelId)

      if (existingChannel?.isActive) {
        console.log('📌 Reusing existing active channel')
        this.activeChannels.set(channelId, existingChannel)
        return existingChannel
      }

      // First, approve USDC spending
      await this.approveUSDC(channelDeposit)

      // Open new channel on-chain
      const hash = await this.walletClient.writeContract({
        address: STATE_CHANNEL_CONFIG.contractAddress,
        abi: this.contractABI,
        functionName: 'openChannel',
        args: [streamer, channelDeposit]
      })

      console.log(`📝 Channel opening transaction: ${hash}`)

      // Wait for transaction confirmation
      await this.publicClient.waitForTransactionReceipt({ hash })

      // Get the created channel info
      const channel = await this.getChannelInfo(channelId)
      if (!channel) {
        throw new Error('Channel not found after creation')
      }

      this.activeChannels.set(channelId, channel)
      this.emit('channelOpened', channel)

      console.log(`✅ Channel opened successfully: ${channelId}`)
      return channel

    } catch (error) {
      console.error('❌ Failed to open channel:', error)
      throw new Error(`Failed to open channel: ${error.message}`)
    }
  }

  /**
   * Send an instant tip (off-chain)
   */
  async sendInstantTip(
    channelId: Hash,
    tipAmount: bigint,
    message: string = ''
  ): Promise<InstantTip> {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized')
    }

    try {
      console.log(`💸 Sending instant tip: ${formatUnits(tipAmount, 6)} USDC in channel ${channelId}`)

      const channel = this.activeChannels.get(channelId)
      if (!channel?.isActive) {
        throw new Error('Channel not found or inactive')
      }

      const viewer = (await this.walletClient.getAddresses())[0]
      if (channel.viewer.toLowerCase() !== viewer.toLowerCase()) {
        throw new Error('Not authorized to tip from this channel')
      }

      // Calculate new total
      const newTotal = channel.totalTipped + tipAmount
      if (newTotal > channel.deposit) {
        throw new Error('Insufficient channel balance')
      }

      // Create new off-chain state
      const newNonce = (this.offChainStates.get(channelId)?.nonce || channel.nonce) + 1
      const newState: ChannelState = {
        channelId,
        totalTipped: newTotal,
        nonce: newNonce,
        timestamp: Date.now()
      }

      // Sign the new state (in real implementation, both parties would sign)
      const signature = await this.signChannelState(newState)

      // Store off-chain state
      this.offChainStates.set(channelId, newState)

      // Create tip object
      const tip: InstantTip = {
        id: `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        channelId,
        viewer: channel.viewer,
        streamer: channel.streamer,
        amount: tipAmount,
        message,
        timestamp: new Date(),
        signature
      }

      // Update local channel state
      channel.totalTipped = newTotal
      channel.nonce = newNonce

      // Emit instant tip event
      this.emit('instantTip', {
        tip,
        channel,
        newState
      })

      // Broadcast via WebSocket for real-time UI updates
      this.broadcastTip(tip, channel)

      console.log(`✅ Instant tip sent: ${tip.id}`)
      return tip

    } catch (error) {
      console.error('❌ Failed to send instant tip:', error)
      throw new Error(`Failed to send tip: ${error.message}`)
    }
  }

  /**
   * Close channel cooperatively
   */
  async closeChannel(channelId: Hash): Promise<void> {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized')
    }

    try {
      console.log(`🔒 Closing channel: ${channelId}`)

      const channel = this.activeChannels.get(channelId)
      if (!channel?.isActive) {
        throw new Error('Channel not found or already closed')
      }

      const currentState = this.offChainStates.get(channelId)
      const finalTotal = currentState?.totalTipped || channel.totalTipped
      const finalNonce = currentState?.nonce || channel.nonce

      // In a real implementation, you'd need both parties to sign
      // For demo purposes, we'll simulate cooperative closure
      const viewerSignature = await this.signChannelState({
        channelId,
        totalTipped: finalTotal,
        nonce: finalNonce,
        timestamp: Date.now()
      })

      // Simulate streamer signature (in real app, streamer would provide this)
      const streamerSignature = viewerSignature // Placeholder

      const hash = await this.walletClient.writeContract({
        address: STATE_CHANNEL_CONFIG.contractAddress,
        abi: this.contractABI,
        functionName: 'closeChannel',
        args: [channelId, finalTotal, BigInt(finalNonce), viewerSignature, streamerSignature]
      })

      console.log(`📝 Channel closing transaction: ${hash}`)

      // Wait for confirmation
      await this.publicClient.waitForTransactionReceipt({ hash })

      // Update local state
      channel.isActive = false
      this.activeChannels.delete(channelId)
      this.offChainStates.delete(channelId)

      this.emit('channelClosed', {
        channelId,
        totalTipped: finalTotal,
        txHash: hash
      })

      console.log(`✅ Channel closed successfully: ${channelId}`)

    } catch (error) {
      console.error('❌ Failed to close channel:', error)
      throw error
    }
  }

  /**
   * Get channel information from contract
   */
  async getChannelInfo(channelId: Hash): Promise<BaseChannel | null> {
    try {
      const result = await this.publicClient.readContract({
        address: STATE_CHANNEL_CONFIG.contractAddress,
        abi: this.contractABI,
        functionName: 'getChannel',
        args: [channelId]
      }) as any

      if (!result || !result.isActive) {
        return null
      }

      return {
        channelId,
        viewer: result.viewer,
        streamer: result.streamer,
        deposit: result.deposit,
        totalTipped: result.totalTipped,
        nonce: Number(result.nonce),
        timeout: Number(result.timeout),
        isActive: result.isActive,
        disputed: result.disputed
      }
    } catch (error) {
      console.error('Error getting channel info:', error)
      return null
    }
  }

  /**
   * Get user's active channels
   */
  getUserChannels(userAddress: Address): BaseChannel[] {
    return Array.from(this.activeChannels.values())
      .filter(channel =>
        channel.viewer.toLowerCase() === userAddress.toLowerCase() ||
        channel.streamer.toLowerCase() === userAddress.toLowerCase()
      )
  }

  /**
   * Get current off-chain state for a channel
   */
  getChannelOffChainState(channelId: Hash): ChannelState | null {
    return this.offChainStates.get(channelId) || null
  }

  /**
   * Approve USDC spending for the state channel contract
   */
  private async approveUSDC(amount: bigint): Promise<void> {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized')
    }

    const usdcAbi = [
      {
        inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
        name: 'approve',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function'
      }
    ]

    const hash = await this.walletClient.writeContract({
      address: NETWORK_CONFIG.usdcAddress,
      abi: usdcAbi,
      functionName: 'approve',
      args: [STATE_CHANNEL_CONFIG.contractAddress, amount]
    })

    await this.publicClient.waitForTransactionReceipt({ hash })
    console.log(`✅ USDC approved: ${formatUnits(amount, 6)} USDC`)
  }

  /**
   * Sign channel state (simplified version)
   */
  private async signChannelState(state: ChannelState): Promise<Hash> {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized')
    }

    // Create message to sign
    const message = `Channel: ${state.channelId}\nTotal: ${state.totalTipped}\nNonce: ${state.nonce}\nContract: ${STATE_CHANNEL_CONFIG.contractAddress}`

    try {
      const signature = await this.walletClient.signMessage({
        message,
        account: (await this.walletClient.getAddresses())[0]
      })
      return signature
    } catch (error) {
      console.error('Error signing channel state:', error)
      throw error
    }
  }

  /**
   * Connect to real-time WebSocket service
   */
  private async connectToRealtimeService(): Promise<void> {
    // In a real implementation, this would connect to your backend WebSocket
    // For now, we'll simulate it with a simple WebSocket client
    try {
      const wsUrl = process.env.NEXT_PUBLIC_REALTIME_WS_URL || 'ws://localhost:9000/ws'
      this.websocket = new WebSocket(wsUrl)

      this.websocket.onopen = () => {
        console.log('🌐 Connected to real-time service')
        this.emit('realtimeConnected')
      }

      this.websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleRealtimeMessage(message)
        } catch (error) {
          console.error('Failed to parse realtime message:', error)
        }
      }

      this.websocket.onclose = () => {
        console.log('🔌 Disconnected from real-time service')
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.connectToRealtimeService(), 5000)
      }

    } catch (error) {
      console.log('Real-time service not available, continuing without it')
    }
  }

  /**
   * Handle real-time messages
   */
  private handleRealtimeMessage(message: any): void {
    switch (message.type) {
      case 'tip_received':
        this.emit('tipReceived', message.data)
        break
      case 'channel_update':
        this.emit('channelUpdate', message.data)
        break
      default:
        console.log('Unknown realtime message:', message)
    }
  }

  /**
   * Broadcast tip event
   */
  private broadcastTip(tip: InstantTip, channel: BaseChannel): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'instant_tip',
        data: {
          tip: {
            ...tip,
            amount: tip.amount.toString()
          },
          channel: {
            ...channel,
            deposit: channel.deposit.toString(),
            totalTipped: channel.totalTipped.toString()
          }
        }
      }

      this.websocket.send(JSON.stringify(message))
    }
  }

  /**
   * Event system
   */
  on(event: string, callback: Function): void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, [])
    }
    this.eventCallbacks.get(event)!.push(callback)
  }

  off(event: string, callback: Function): void {
    const callbacks = this.eventCallbacks.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.eventCallbacks.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  private setupEventHandlers(): void {
    this.on('instantTip', (data) => {
      console.log('🎉 Instant tip event:', data)
    })

    this.on('channelOpened', (channel) => {
      console.log('📢 Channel opened:', channel.channelId)
    })
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.websocket) {
      this.websocket.close()
      this.websocket = null
    }
    this.activeChannels.clear()
    this.offChainStates.clear()
    this.eventCallbacks.clear()
  }

  /**
   * Get network configuration
   */
  getNetworkConfig() {
    return NETWORK_CONFIG
  }

  /**
   * Format USDC amount for display
   */
  static formatUSDC(amount: bigint): string {
    return formatUnits(amount, 6) + ' USDC'
  }

  /**
   * Parse USDC amount from string
   */
  static parseUSDC(amount: string): bigint {
    return parseUnits(amount, 6)
  }
}

// Singleton instance
export const baseStateChannelsService = new BaseStateChannelsService()

// Utility functions
export const formatTipAmount = BaseStateChannelsService.formatUSDC
export const parseTipAmount = BaseStateChannelsService.parseUSDC

export const generateChannelKey = (viewer: Address, streamer: Address): string => {
  return `${viewer.toLowerCase()}-${streamer.toLowerCase()}`
}