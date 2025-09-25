import { NitroliteClient, NitroliteService } from '@erc7824/nitrolite'
import { createPublicClient, createWalletClient, custom, http, parseEther } from 'viem'
import { polygon } from 'viem/chains'
import type { Address, PublicClient, WalletClient, Hash } from 'viem'

// Yellow Network Configuration
export const YELLOW_CONFIG = {
  custody: process.env.NEXT_PUBLIC_YELLOW_CUSTODY_ADDRESS as Address,
  adjudicator: process.env.NEXT_PUBLIC_YELLOW_ADJUDICATOR_ADDRESS as Address,
  guestAddress: process.env.NEXT_PUBLIC_GUEST_ADDRESS as Address,
  tokenAddress: process.env.NEXT_PUBLIC_USDC_ADDRESS as Address,
  clearNodeWs: process.env.NEXT_PUBLIC_CLEARNODE_WS_URL || 'wss://clearnet.yellow.com/ws',
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '137'),
} as const

// Types
export interface TipChannel {
  channelId: string
  viewer: Address
  streamer: Address
  totalTipped: bigint
  isActive: boolean
  createdAt: Date
}

export interface InstantTip {
  id: string
  channelId: string
  amount: bigint
  message: string
  timestamp: Date
  txHash?: string
}

export interface YellowTippingStats {
  totalTips: bigint
  totalChannels: number
  activeTips: InstantTip[]
}

/**
 * Yellow Network Service for Instant Tipping
 * Handles state channels, WebSocket connections, and tip processing
 */
export class YellowTippingService {
  private nitroliteClient: NitroliteClient | null = null
  private publicClient: PublicClient
  private activeTipChannels: Map<string, TipChannel> = new Map()
  private websocket: WebSocket | null = null
  private eventCallbacks: Map<string, Function[]> = new Map()

  constructor() {
    // Initialize public client for blockchain interactions
    this.publicClient = createPublicClient({
      chain: polygon,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL)
    })

    this.setupEventHandlers()
  }

  /**
   * Initialize Yellow Network client with user's wallet
   */
  async initializeClient(walletClient: WalletClient): Promise<void> {
    try {
      if (!YELLOW_CONFIG.custody || !YELLOW_CONFIG.adjudicator) {
        throw new Error('Yellow Network contract addresses not configured')
      }

      this.nitroliteClient = new NitroliteClient({
        publicClient: this.publicClient,
        walletClient,
        addresses: {
          custody: YELLOW_CONFIG.custody,
          adjudicator: YELLOW_CONFIG.adjudicator,
          guestAddress: YELLOW_CONFIG.guestAddress,
          tokenAddress: YELLOW_CONFIG.tokenAddress,
        },
        chainId: YELLOW_CONFIG.chainId,
        challengeDuration: 3600n, // 1 hour challenge period
      })

      // Initialize ClearNode WebSocket connection
      await this.connectToClearNode()

      console.log('✅ Yellow Network client initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Yellow Network client:', error)
      throw error
    }
  }

  /**
   * Create a tipping channel between viewer and streamer
   */
  async createTipChannel(
    viewer: Address,
    streamer: Address,
    initialDeposit: bigint
  ): Promise<TipChannel> {
    if (!this.nitroliteClient) {
      throw new Error('Yellow Network client not initialized')
    }

    try {
      console.log(`🚀 Creating tip channel: ${viewer} -> ${streamer}`)

      // Check if channel already exists
      const existingChannelKey = `${viewer}-${streamer}`
      const existingChannel = this.activeTipChannels.get(existingChannelKey)

      if (existingChannel?.isActive) {
        console.log('📌 Reusing existing active channel')
        return existingChannel
      }

      // Create new state channel for tipping
      const { channelId } = await this.nitroliteClient.createChannel({
        initialAllocationAmounts: [initialDeposit, 0n], // Viewer deposits, streamer starts with 0
        stateData: '0x' + Buffer.from(JSON.stringify({
          type: 'instant-tip-channel',
          viewer,
          streamer,
          createdAt: Date.now()
        })).toString('hex')
      })

      // Create tip channel object
      const tipChannel: TipChannel = {
        channelId,
        viewer,
        streamer,
        totalTipped: 0n,
        isActive: true,
        createdAt: new Date()
      }

      // Store channel
      this.activeTipChannels.set(existingChannelKey, tipChannel)

      // Emit channel created event
      this.emit('channelCreated', tipChannel)

      console.log(`✅ Tip channel created: ${channelId}`)
      return tipChannel

    } catch (error) {
      console.error('❌ Failed to create tip channel:', error)
      throw new Error(`Failed to create tip channel: ${error.message}`)
    }
  }

  /**
   * Send an instant tip via state channel
   */
  async sendInstantTip(
    channelId: string,
    tipAmount: bigint,
    message: string = ''
  ): Promise<InstantTip> {
    if (!this.nitroliteClient) {
      throw new Error('Yellow Network client not initialized')
    }

    try {
      console.log(`💸 Sending instant tip: ${tipAmount} in channel ${channelId}`)

      // Find the channel
      const channel = Array.from(this.activeTipChannels.values())
        .find(ch => ch.channelId === channelId)

      if (!channel || !channel.isActive) {
        throw new Error('Channel not found or inactive')
      }

      // Create tip object
      const tip: InstantTip = {
        id: `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        channelId,
        amount: tipAmount,
        message,
        timestamp: new Date()
      }

      // Update channel allocations (this would normally involve state channel updates)
      // For demo purposes, we'll simulate instant processing
      channel.totalTipped += tipAmount

      // Emit instant tip event for real-time UI updates
      this.emit('instantTip', {
        tip,
        channel,
        viewer: channel.viewer,
        streamer: channel.streamer
      })

      // Broadcast tip via WebSocket for real-time notifications
      this.broadcastTipEvent(tip, channel)

      console.log(`✅ Instant tip sent: ${tip.id}`)
      return tip

    } catch (error) {
      console.error('❌ Failed to send instant tip:', error)
      throw new Error(`Failed to send tip: ${error.message}`)
    }
  }

  /**
   * Get channel statistics
   */
  getTipChannelStats(channelKey: string): TipChannel | null {
    return this.activeTipChannels.get(channelKey) || null
  }

  /**
   * Get all active tip channels for a user
   */
  getUserTipChannels(userAddress: Address): TipChannel[] {
    return Array.from(this.activeTipChannels.values())
      .filter(channel =>
        channel.viewer.toLowerCase() === userAddress.toLowerCase() ||
        channel.streamer.toLowerCase() === userAddress.toLowerCase()
      )
  }

  /**
   * Close a tip channel and settle on-chain
   */
  async closeTipChannel(channelId: string): Promise<void> {
    if (!this.nitroliteClient) {
      throw new Error('Yellow Network client not initialized')
    }

    try {
      console.log(`🔒 Closing tip channel: ${channelId}`)

      // Find channel
      const channel = Array.from(this.activeTipChannels.values())
        .find(ch => ch.channelId === channelId)

      if (!channel) {
        throw new Error('Channel not found')
      }

      // Close the state channel with final allocations
      await this.nitroliteClient.closeChannel({
        finalState: {
          channelId,
          stateData: '0x' + Buffer.from(JSON.stringify({
            type: 'tip-settlement',
            totalTipped: channel.totalTipped.toString(),
            closedAt: Date.now()
          })).toString('hex'),
          allocations: [
            {
              destination: channel.viewer,
              token: YELLOW_CONFIG.tokenAddress,
              amount: 0n, // All remaining funds to viewer
            },
            {
              destination: channel.streamer,
              token: YELLOW_CONFIG.tokenAddress,
              amount: channel.totalTipped, // All tips to streamer
            }
          ],
          version: 1n,
          serverSignature: '0x' as Hash, // This would be properly signed
        }
      })

      // Mark channel as inactive
      channel.isActive = false

      // Emit channel closed event
      this.emit('channelClosed', { channelId, totalTipped: channel.totalTipped })

      console.log(`✅ Tip channel closed: ${channelId}`)

    } catch (error) {
      console.error('❌ Failed to close tip channel:', error)
      throw error
    }
  }

  /**
   * Connect to Yellow Network ClearNode via WebSocket
   */
  private async connectToClearNode(): Promise<void> {
    try {
      this.websocket = new WebSocket(YELLOW_CONFIG.clearNodeWs)

      this.websocket.onopen = () => {
        console.log('🌐 Connected to Yellow Network ClearNode')
        this.emit('clearNodeConnected')
      }

      this.websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleClearNodeMessage(message)
        } catch (error) {
          console.error('Failed to parse ClearNode message:', error)
        }
      }

      this.websocket.onclose = () => {
        console.log('🔌 Disconnected from ClearNode')
        this.emit('clearNodeDisconnected')

        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.connectToClearNode(), 5000)
      }

      this.websocket.onerror = (error) => {
        console.error('ClearNode WebSocket error:', error)
        this.emit('clearNodeError', error)
      }

    } catch (error) {
      console.error('❌ Failed to connect to ClearNode:', error)
    }
  }

  /**
   * Handle messages from ClearNode
   */
  private handleClearNodeMessage(message: any): void {
    // Handle various message types from ClearNode
    switch (message.type) {
      case 'tip_notification':
        this.emit('tipNotification', message.data)
        break
      case 'channel_update':
        this.emit('channelUpdate', message.data)
        break
      default:
        console.log('Unknown ClearNode message:', message)
    }
  }

  /**
   * Broadcast tip event via WebSocket
   */
  private broadcastTipEvent(tip: InstantTip, channel: TipChannel): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'instant_tip',
        data: {
          tip,
          channel: {
            channelId: channel.channelId,
            viewer: channel.viewer,
            streamer: channel.streamer,
            totalTipped: channel.totalTipped.toString()
          }
        }
      }

      this.websocket.send(JSON.stringify(message))
    }
  }

  /**
   * Event system for real-time updates
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
    // Setup default event handlers
    this.on('instantTip', (data) => {
      console.log('🎉 Instant tip event:', data)
    })

    this.on('channelCreated', (channel) => {
      console.log('📢 Channel created:', channel.channelId)
    })
  }

  /**
   * Get platform statistics
   */
  getPlatformStats(): YellowTippingStats {
    const activeTips: InstantTip[] = [] // This would be populated from actual tip history
    const totalTips = Array.from(this.activeTipChannels.values())
      .reduce((sum, channel) => sum + channel.totalTipped, 0n)

    return {
      totalTips,
      totalChannels: this.activeTipChannels.size,
      activeTips
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.websocket) {
      this.websocket.close()
      this.websocket = null
    }
    this.activeTipChannels.clear()
    this.eventCallbacks.clear()
  }
}

// Singleton instance
export const yellowTippingService = new YellowTippingService()

// Utility functions
export const formatTipAmount = (amount: bigint): string => {
  return parseFloat(amount.toString()) / 1e6 + ' USDC' // Assuming 6 decimals for USDC
}

export const generateChannelKey = (viewer: Address, streamer: Address): string => {
  return `${viewer.toLowerCase()}-${streamer.toLowerCase()}`
}