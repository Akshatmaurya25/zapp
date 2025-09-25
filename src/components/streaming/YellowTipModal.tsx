'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import {
  DollarSign,
  Heart,
  Gift,
  Zap,
  Check,
  Loader2,
  ArrowRight,
  Sparkles,
  TrendingUp
} from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { useBaseStateChannels } from '@/hooks/useBaseStateChannels'
import type { Address } from 'viem'
import Image from 'next/image'

interface BaseTipModalProps {
  isOpen: boolean
  onClose: () => void
  stream: {
    id: string
    stream_key: string
    title: string
    streamer_id: string
    users?: {
      display_name?: string
      username?: string
      wallet_address?: string
    }
  }
}

// Quick tip amounts for Base USDC (better UX)
const QUICK_TIP_AMOUNTS = [
  {
    label: '$1',
    value: '1.0',
    icon: DollarSign,
    color: 'from-blue-500 to-blue-600',
    description: 'Coffee tip'
  },
  {
    label: '$5',
    value: '5.0',
    icon: Heart,
    color: 'from-pink-500 to-pink-600',
    description: 'Nice stream!'
  },
  {
    label: '$10',
    value: '10.0',
    icon: Gift,
    color: 'from-purple-500 to-purple-600',
    description: 'Great content'
  },
  {
    label: '$25',
    value: '25.0',
    icon: Zap,
    color: 'from-yellow-500 to-yellow-600',
    description: 'Amazing!'
  }
]

export default function BaseTipModal({ isOpen, onClose, stream }: BaseTipModalProps) {
  // Base State Channels integration
  const {
    isInitialized,
    isConnecting,
    error: baseError,
    activeChannels,
    networkConfig,
    initialize,
    openChannel,
    sendInstantTip,
    getChannelInfo,
    formatTipAmount: formatBaseTipAmount,
    getChannelId
  } = useBaseStateChannels()

  // Component state
  const [currentStep, setCurrentStep] = useState<'setup' | 'tipping'>('setup')
  const [customAmount, setCustomAmount] = useState('')
  const [message, setMessage] = useState('')
  const [selectedAmount, setSelectedAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentTipChannel, setCurrentTipChannel] = useState<any>(null)
  const [tipHistory, setTipHistory] = useState<any[]>([])
  const [baseNetworkStatus, setBaseNetworkStatus] = useState<'disconnected' | 'demo' | 'connected'>('disconnected')
  const [channelProof, setChannelProof] = useState<string | null>(null)
  const [lastTransactionHash, setLastTransactionHash] = useState<string | null>(null)

  const { showToast } = useToast()

  const streamerAddress = stream.users?.wallet_address as Address
  const isChannelActive = currentTipChannel?.isActive

  // Check for existing tip channel
  useEffect(() => {
    if (isInitialized && streamerAddress) {
      // Find existing active channel with this streamer
      const existingChannel = activeChannels.find(
        ch => ch.streamer.toLowerCase() === streamerAddress.toLowerCase() && ch.isActive
      )

      if (existingChannel) {
        setCurrentTipChannel(existingChannel)
        setCurrentStep('tipping')
        setBaseNetworkStatus('connected')
      }
    }
  }, [isInitialized, streamerAddress, activeChannels])

  // Handle tip amount selection
  const handleQuickTip = (amount: string) => {
    setSelectedAmount(amount)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setSelectedAmount('')
  }

  const getFinalAmount = () => {
    const amount = selectedAmount || customAmount
    return amount ? parseFloat(amount) : 0
  }

  // Enable instant tipping by creating a channel
  const enableInstantTipping = async () => {
    if (!streamerAddress) {
      showToast({ title: 'Streamer wallet address not found', type: 'error' })
      return
    }

    setIsProcessing(true)

    try {
      // Start with demo mode in case Base contracts aren't deployed
      setBaseNetworkStatus('demo')

      // For demo purposes, create a mock channel
      const mockChannel = {
        channelId: `demo_channel_${Date.now()}` as any,
        viewer: '0xViewer123...' as Address,
        streamer: streamerAddress,
        deposit: 10000000n, // 10 USDC in smallest units
        totalTipped: 0n,
        nonce: 0,
        timeout: 0,
        isActive: true,
        disputed: false
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      setCurrentTipChannel(mockChannel)
      setCurrentStep('tipping')
      setChannelProof(`DEMO_BASE_${mockChannel.channelId}`)

      showToast({
        title: '⚡ Instant Tipping Enabled!',
        description: `🚧 Demo mode: Simulated Base (${networkConfig.name})`,
        type: 'success'
      })

      // Try to initialize Base State Channels in background
      try {
        console.log('🔄 Attempting to connect to Base State Channels...')

        if (!isInitialized) {
          await initialize()
        }

        // If successful, create real channel with 10 USDC deposit
        const realChannel = await openChannel(streamerAddress, '10.0')
        setCurrentTipChannel(realChannel)
        setBaseNetworkStatus('connected')
        setChannelProof(`BASE_CHANNEL_${realChannel.channelId.slice(0, 8)}...`)

        showToast({
          title: `🌟 Base State Channels Connected!`,
          description: `✅ Real state channels on ${networkConfig.name}`,
          type: 'success'
        })
      } catch (baseError: any) {
        console.log('❌ Base State Channels unavailable, using demo mode:', baseError)

        // Show helpful message if contracts need deployment
        if (baseError.message.includes('deploy:base')) {
          showToast({
            title: 'ℹ️ Base Contracts Not Deployed',
            description: 'Demo mode active - contracts need deployment',
            type: 'info'
          })
        }

        // Continue with demo mode
        setBaseNetworkStatus('demo')
      }

    } catch (error: any) {
      console.error('Failed to enable instant tipping:', error)
      showToast({
        title: 'Failed to enable instant tipping',
        description: error.message,
        type: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Send instant tip
  const sendTip = async (amount?: string) => {
    const finalAmount = amount || getFinalAmount()

    if (!currentTipChannel || finalAmount <= 0) {
      showToast({ title: 'Invalid tip amount', type: 'error' })
      return
    }

    setIsProcessing(true)

    try {
      // Use static transaction hash as requested
      const transactionHash = '0x9a41ce51e57f032cf0eac990be1200f427db8c7825c515d866a09d70c3cc1f36'
      const explorerUrl = `https://somnia-testnet.socialscan.io/tx/${transactionHash}`

      // Create tip with transaction tracking (USDC with 6 decimals)
      const tipData = {
        id: `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        channelId: currentTipChannel.channelId,
        amount: BigInt(Math.floor(finalAmount * 1e6)), // Convert to USDC smallest units (6 decimals)
        message: message,
        timestamp: new Date(),
        transactionHash: transactionHash,
        networkType: baseNetworkStatus,
        proof: channelProof
      }

      // Set transaction hash
      setLastTransactionHash(transactionHash)

      if (baseNetworkStatus === 'connected' && isInitialized) {
        // Try real Base State Channels first
        try {
          const realTip = await sendInstantTip(
            currentTipChannel.channelId,
            finalAmount.toString(),
            message
          )

          // Real Base State Channel tip succeeded
          const enhancedTip = {
            ...tipData,
            id: realTip.id,
            transactionHash: realTip.txHash || `BASE_${realTip.id}`,
            networkType: 'connected' as const,
            proof: `BASE_CHANNEL_${currentTipChannel.channelId.slice(0, 8)}...`
          }

          setTipHistory(prev => [enhancedTip, ...prev.slice(0, 4)])

          showToast({
            title: `🌟 $${finalAmount} USDC sent via Base!`,
            description: `✅ View: ${explorerUrl}`,
            type: 'success'
          })

        } catch (baseError) {
          console.log('Base State Channels failed, falling back to demo:', baseError)

          // Fallback to demo
          const demoTip = {
            ...tipData,
            transactionHash: `DEMO_${transactionHash}`,
            networkType: 'demo' as const
          }

          await new Promise(resolve => setTimeout(resolve, 300))
          setTipHistory(prev => [demoTip, ...prev.slice(0, 4)])

          showToast({
            title: `💸 $${finalAmount} USDC sent (Demo)!`,
            description: `🚧 View: ${explorerUrl}`,
            type: 'success'
          })
        }
      } else {
        // Demo mode only
        const demoTip = {
          ...tipData,
          transactionHash: `DEMO_${transactionHash}`,
          networkType: 'demo' as const
        }

        await new Promise(resolve => setTimeout(resolve, 300))
        setTipHistory(prev => [demoTip, ...prev.slice(0, 4)])

        showToast({
          title: `💸 $${finalAmount} USDC sent (Demo)!`,
          description: `🚧 View: ${explorerUrl}`,
          type: 'success'
        })
      }

      // Update channel total
      setCurrentTipChannel(prev => prev ? {
        ...prev,
        totalTipped: prev.totalTipped + tipData.amount
      } : prev)

      // Reset form
      setSelectedAmount('')
      setCustomAmount('')
      setMessage('')

      // Trigger celebration animation
      triggerCelebrationEffect()

      // Close modal after successful tip
      setTimeout(() => {
        onClose()
      }, 1500) // Small delay to let user see the success message

    } catch (error: any) {
      console.error('Failed to send tip:', error)
      showToast({
        title: 'Failed to send tip',
        description: error.message,
        type: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Format tip amount for display
  const formatTipAmount = (amount: bigint): string => {
    return `${(Number(amount) / 1e6).toFixed(2)} USDC`
  }

  // Celebration effect
  const triggerCelebrationEffect = () => {
    // This would trigger confetti or other celebration animations
    console.log('🎉 Tip sent successfully!')
  }

  // Setup step UI
  const renderSetupStep = () => (
    <div className="space-y-6 text-center">
      {/* Hero Section */}
      <div className="relative">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
          <Image src="/logo.svg" alt="Zap Icon" width={40} height={40} />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-text-primary">
          Enable Instant Tipping on Base
        </h3>
        <p className="text-text-secondary max-w-md mx-auto leading-relaxed">
          Create a Base state channel for lightning-fast, low-cost USDC tips!
          Powered by Layer 2 technology and state channels.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="font-semibold text-green-800">Instant Tips</div>
          <div className="text-green-600">~200ms delivery</div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <div className="font-semibold text-blue-800">Low Gas Fees</div>
          <div className="text-blue-600">~$0.01 on Base L2</div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div className="font-semibold text-purple-800">Better UX</div>
          <div className="text-purple-600">No confirmations</div>
        </div>
      </div>

      {/* Connection Status */}
      {baseError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{baseError}</p>
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={enableInstantTipping}
        disabled={isProcessing || isConnecting}
        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all"
      >
        {isProcessing || isConnecting ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            {isConnecting ? 'Connecting...' : 'Creating Channel...'}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Enable Instant Tips
            <ArrowRight className="w-4 h-4" />
          </div>
        )}
      </Button>

      <p className="text-xs text-text-tertiary">
        Creates a state channel with 10 USDC deposit on {networkConfig.name}
      </p>
    </div>
  )

  // Tipping step UI
  const renderTippingStep = () => (
    <div className="space-y-6">
      {/* Channel Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-green-800">⚡ Instant Tipping Active</div>
            <div className="text-sm text-green-600 truncate">
              Channel: {currentTipChannel?.channelId?.slice(0, 10)}...
              • Total tipped: {formatTipAmount(currentTipChannel?.totalTipped || 0n)}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tip Buttons */}
      <div>
        <label className="block text-sm font-semibold mb-3 text-text-primary">
          🚀 Quick Tips (Instant Delivery)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_TIP_AMOUNTS.map((tip) => {
            const Icon = tip.icon
            const isSelected = selectedAmount === tip.value

            return (
              <Button
                key={tip.value}
                variant={isSelected ? "default" : "outline"}
                className={`relative overflow-hidden h-20 flex flex-col items-center gap-1 transition-all duration-200 ${
                  isSelected
                    ? `bg-gradient-to-r ${tip.color} text-white border-transparent shadow-lg transform scale-105`
                    : 'border-border-secondary text-text-secondary hover:text-text-primary hover:border-purple-500/50 hover:bg-purple-50'
                }`}
                onClick={() => handleQuickTip(tip.value)}
                disabled={isProcessing}
              >
                <Icon className="w-6 h-6" />
                <span className="font-bold text-lg">{tip.label}</span>
                <span className="text-xs opacity-75">{tip.description}</span>

                {/* Instant indicator */}
                <div className="absolute top-1 right-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                </div>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Custom Amount */}
      <div>
        <label htmlFor="custom-amount" className="block text-sm font-semibold mb-2 text-text-primary">
          💰 Custom Amount (USDC)
        </label>
        <div className="relative">
          <Input
            id="custom-amount"
            type="number"
            step="0.10"
            min="0.10"
            placeholder="1.00"
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            disabled={isProcessing}
            className="pl-12 bg-background-primary border-border-secondary text-text-primary placeholder-text-tertiary focus:border-purple-500 focus:ring-purple-500"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary font-bold">
            $
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
              ⚡ Instant
            </Badge>
          </div>
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="tip-message" className="block text-sm font-semibold mb-2 text-text-primary">
          💬 Message (optional)
        </label>
        <Textarea
          id="tip-message"
          placeholder="Say something nice to the streamer..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={200}
          rows={3}
          disabled={isProcessing}
          className="bg-background-primary border-border-secondary text-text-primary placeholder-text-tertiary focus:border-purple-500 focus:ring-purple-500"
        />
        <p className="text-xs text-text-tertiary mt-1">
          {message.length}/200 characters
        </p>
      </div>

      {/* Tip Summary */}
      {getFinalAmount() > 0 && (
        <Card className="p-4 bg-gradient-to-r from-green-600/10 to-emerald-600/10 border-green-500/30">
          <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
            <Image src="/logo.svg" alt="Zap Icon" width={24} height={24} />
            Instant Tip Summary
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Tip Amount:</span>
              <span className="font-bold text-green-600">${getFinalAmount()} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Delivery Time:</span>
              <span className="font-medium text-green-600">⚡ Instant</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Gas Fees:</span>
              <span className="font-medium text-green-600">💚 ~$0.01</span>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Tips History */}
      {tipHistory.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2 text-text-primary">Recent Tips</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {tipHistory.map((tip, index) => (
              <div key={tip.id} className="flex items-center justify-between text-xs bg-green-50 p-2 rounded">
                <span>{formatTipAmount(tip.amount)}</span>
                <Badge className="bg-green-100 text-green-800">Sent ✓</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isProcessing}
          className="flex-1 border-border-secondary text-text-secondary hover:text-text-primary"
        >
          Close
        </Button>

        {/* Send Custom Tip */}
        {customAmount && (
          <Button
            onClick={() => sendTip()}
            disabled={getFinalAmount() <= 0 || isProcessing}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Send ${getFinalAmount()} USDC
              </div>
            )}
          </Button>
        )}
      </div>

      {/* Quick tip action buttons */}
      {selectedAmount && (
        <Button
          onClick={() => sendTip(selectedAmount)}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 shadow-lg"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending Instant Tip...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Send ${selectedAmount} USDC Instantly!
            </div>
          )}
        </Button>
      )}
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-[#181818] border-border-primary">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Image src="/logo.svg" alt="Base Icon" width={24} height={24} />
            Base State Channels Tipping
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'setup'
              ? 'Enable instant, low-cost USDC tipping with Base state channels'
              : 'Send instant USDC tips with minimal gas fees!'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Stream Info */}
        <div className="bg-background-primary border border-border-secondary rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {(stream.users?.display_name || stream.users?.username || 'S')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-text-primary truncate">{stream.title}</h3>
              <p className="text-sm text-text-secondary truncate">
                Supporting: {stream.users?.display_name || stream.users?.username || 'Anonymous Streamer'}
              </p>
            </div>
          </div>
        </div>

        {/* Render current step */}
        {currentStep === 'setup' ? renderSetupStep() : renderTippingStep()}
      </DialogContent>
    </Dialog>
  )
}