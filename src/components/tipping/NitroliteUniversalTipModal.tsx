'use client'

import { useState, useEffect, useCallback } from 'react'
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
  TrendingUp,
  Eye,
  Star,
  MessageCircle,
  Users,
  Play
} from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { useStreamingTips, usePostPayments } from '@/hooks/useNitrolite'
import { useAccount, useBalance, useWalletClient } from 'wagmi'
import { NETWORK_CONFIG } from '@/lib/nitroliteService'
import type { Address } from 'viem'

// Context types for the universal modal
type TipContext = 'streaming' | 'post'

interface UniversalTipModalProps {
  isOpen: boolean
  onClose: () => void
  context: TipContext
  // For streaming context
  stream?: {
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
  // For post context
  post?: {
    id: string
    title?: string
    content?: string
    author?: {
      display_name?: string
      username?: string
      wallet_address?: string
    }
  }
}

// Streaming tip amounts - dynamic based on network
const getStreamingTipAmounts = () => {
  const isTestnet = NETWORK_CONFIG.tokenSymbol === 'STT'
  const symbol = NETWORK_CONFIG.tokenSymbol

  if (isTestnet) {
    return [
      {
        label: `0.01 ${symbol}`,
        value: '0.01',
        icon: DollarSign,
        color: 'from-blue-500 to-blue-600',
        description: 'Nice stream!'
      },
      {
        label: `0.05 ${symbol}`,
        value: '0.05',
        icon: Heart,
        color: 'from-pink-500 to-pink-600',
        description: 'Love it!'
      },
      {
        label: `0.1 ${symbol}`,
        value: '0.1',
        icon: Gift,
        color: 'from-purple-500 to-purple-600',
        description: 'Great content'
      },
      {
        label: `0.25 ${symbol}`,
        value: '0.25',
        icon: Zap,
        color: 'from-yellow-500 to-yellow-600',
        description: 'Amazing!'
      }
    ]
  } else {
    return [
      {
        label: `2 ${symbol}`,
        value: '2.0',
        icon: DollarSign,
        color: 'from-blue-500 to-blue-600',
        description: 'Nice stream!'
      },
      {
        label: `5 ${symbol}`,
        value: '5.0',
        icon: Heart,
        color: 'from-pink-500 to-pink-600',
        description: 'Love it!'
      },
      {
        label: `10 ${symbol}`,
        value: '10.0',
        icon: Gift,
        color: 'from-purple-500 to-purple-600',
        description: 'Great content'
      },
      {
        label: `25 ${symbol}`,
        value: '25.0',
        icon: Zap,
        color: 'from-yellow-500 to-yellow-600',
        description: 'Amazing!'
      }
    ]
  }
}

// Post interaction amounts - dynamic micro-payments
const getPostTipAmounts = () => {
  const isTestnet = NETWORK_CONFIG.tokenSymbol === 'STT'
  const symbol = NETWORK_CONFIG.tokenSymbol

  if (isTestnet) {
    return [
      {
        label: `0.001 ${symbol}`,
        value: '0.001',
        icon: Heart,
        color: 'from-pink-500 to-pink-600',
        description: 'Like',
        action: 'like'
      },
      {
        label: `0.005 ${symbol}`,
        value: '0.005',
        icon: Eye,
        color: 'from-purple-500 to-purple-600',
        description: 'Premium View',
        action: 'premium_view'
      },
      {
        label: `0.01 ${symbol}`,
        value: '0.01',
        icon: DollarSign,
        color: 'from-green-500 to-green-600',
        description: 'Tip',
        action: 'tip'
      },
      {
        label: `0.02 ${symbol}`,
        value: '0.02',
        icon: Star,
        color: 'from-yellow-500 to-yellow-600',
        description: 'Super Like',
        action: 'super_like'
      }
    ]
  } else {
    return [
      {
        label: `0.10 ${symbol}`,
        value: '0.10',
        icon: Heart,
        color: 'from-pink-500 to-pink-600',
        description: 'Like',
        action: 'like'
      },
      {
        label: `0.25 ${symbol}`,
        value: '0.25',
        icon: Eye,
        color: 'from-purple-500 to-purple-600',
        description: 'Premium View',
        action: 'premium_view'
      },
      {
        label: `1.0 ${symbol}`,
        value: '1.0',
        icon: DollarSign,
        color: 'from-green-500 to-green-600',
        description: 'Tip',
        action: 'tip'
      },
      {
        label: `2.0 ${symbol}`,
        value: '2.0',
        icon: Star,
        color: 'from-yellow-500 to-yellow-600',
        description: 'Super Like',
        action: 'super_like'
      }
    ]
  }
}

export default function NitroliteUniversalTipModal({
  isOpen,
  onClose,
  context,
  stream,
  post
}: UniversalTipModalProps) {
  // Wallet connection
  const { address: userAddress, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()

  // Determine target data and address
  const target = context === 'streaming' ? stream : post
  const creatorAddress = (
    context === 'streaming'
      ? stream?.users?.wallet_address
      : post?.author?.wallet_address
  ) as Address

  const targetId = context === 'streaming' ? stream?.id : post?.id
  const targetTitle = context === 'streaming' ? stream?.title : (post?.title || post?.content?.slice(0, 50))

  // Token balance check (STT for Somnia, USDC for Base)
  const isNativeToken = NETWORK_CONFIG.usdcAddress === '0x0000000000000000000000000000000000000000'
  const { data: tokenBalance, isLoading: isLoadingBalance } = useBalance({
    address: userAddress,
    token: isNativeToken ? undefined : NETWORK_CONFIG.usdcAddress, // undefined = native token
    enabled: !!userAddress && isConnected
  })

  // Debug logging
  console.log('🔍 Modal Debug Info:', {
    context,
    isConnected,
    userAddress,
    creatorAddress,
    targetId,
    targetTitle,
    tokenBalance: tokenBalance?.formatted,
    tokenSymbol: NETWORK_CONFIG.tokenSymbol,
    isNativeToken,
    target
  })

  // Use appropriate hooks based on context
  const streamingHooks = useStreamingTips(
    stream?.id || '',
    creatorAddress || '0x0' as Address
  )

  const postHooks = usePostPayments(
    post?.id || '',
    creatorAddress || '0x0' as Address
  )

  // Select the appropriate hooks based on context
  const {
    streamingChannel,
    isCreatingChannel: isCreatingStreamChannel,
    isSendingTip: isSendingStreamTip,
    enableStreamingTips,
    sendTip: sendStreamTip,
    formatUSDC: formatStreamUSDC
  } = context === 'streaming' ? streamingHooks : {
    streamingChannel: null,
    isCreatingChannel: false,
    isSendingTip: false,
    enableStreamingTips: async () => {},
    sendTip: async () => {},
    formatUSDC: (amount: bigint) => `${(Number(amount) / 1e6).toFixed(2)} ${NETWORK_CONFIG.tokenSymbol}`
  }

  const {
    postChannel,
    isCreatingChannel: isCreatingPostChannel,
    isSendingPayment: isSendingPostPayment,
    enablePostPayments,
    sendPayment: sendPostPayment,
    formatUSDC: formatPostUSDC
  } = context === 'post' ? postHooks : {
    postChannel: null,
    isCreatingChannel: false,
    isSendingPayment: false,
    enablePostPayments: async () => {},
    sendPayment: async () => {},
    formatUSDC: (amount: bigint) => `${(Number(amount) / 1e6).toFixed(2)} ${NETWORK_CONFIG.tokenSymbol}`
  }

  // Unified state
  const activeChannel = context === 'streaming' ? streamingChannel : postChannel
  const isCreatingChannel = context === 'streaming' ? isCreatingStreamChannel : isCreatingPostChannel
  const isSendingPayment = context === 'streaming' ? isSendingStreamTip : isSendingPostPayment
  const formatUSDC = context === 'streaming' ? formatStreamUSDC : formatPostUSDC

  // Component state
  const [currentStep, setCurrentStep] = useState<'setup' | 'tipping'>('setup')
  const [customAmount, setCustomAmount] = useState('')
  const [message, setMessage] = useState('')
  const [selectedAmount, setSelectedAmount] = useState('')
  const [selectedAction, setSelectedAction] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [tipHistory, setTipHistory] = useState<any[]>([])

  const { showToast } = useToast()

  // Validation function
  const validateSetup = useCallback(async () => {
    console.log('🔍 Validating setup...')

    if (!isConnected || !userAddress) {
      throw new Error('Please connect your wallet first')
    }

    if (!creatorAddress || creatorAddress === '0x0') {
      console.log('❌ Creator address validation failed:', { creatorAddress, context, target })
      throw new Error(`Creator wallet address not found. The ${context === 'streaming' ? 'streamer' : 'author'} needs to complete their profile with a wallet address.`)
    }

    if (!targetId) {
      throw new Error(`${context === 'streaming' ? 'Stream' : 'Post'} ID is missing`)
    }

    const requiredTokens = context === 'streaming' ? 1 : 0.5
    const balanceNumber = parseFloat(tokenBalance?.formatted || '0')

    if (balanceNumber < requiredTokens) {
      const tokenSymbol = NETWORK_CONFIG.tokenSymbol
      throw new Error(`Insufficient ${tokenSymbol} balance. Need ${requiredTokens} ${tokenSymbol}, you have ${balanceNumber.toFixed(2)} ${tokenSymbol}. ${isNativeToken ? 'Get testnet ' + tokenSymbol + ' from faucet' : 'Get ' + tokenSymbol + ' on ' + NETWORK_CONFIG.name}.`)
    }

    console.log('✅ Setup validation passed')
    return true
  }, [isConnected, userAddress, creatorAddress, targetId, tokenBalance, context])

  // Auto-setup channel when modal opens
  useEffect(() => {
    if (isOpen && !isLoadingBalance) {
      if (activeChannel) {
        setCurrentStep('tipping')
      } else {
        setCurrentStep('setup')
        // Don't auto-setup, let user explicitly click the button
      }
    }
  }, [isOpen, activeChannel, isLoadingBalance])

  // Enable channel setup
  const enableChannelSetup = async () => {
    setIsProcessing(true)

    try {
      console.log(`🚀 Setting up Nitrolite channel for ${context}...`)

      // Validate before proceeding
      await validateSetup()

      // Trigger actual wallet signature request
      if (walletClient && userAddress) {
        console.log('💳 Requesting wallet signature for channel approval...')

        try {
          // Create a signature request for channel setup approval
          const message = `Enable Nitrolite ${context === 'streaming' ? 'Streaming' : 'Post'} Channel\n\nCreator: ${creatorAddress}\nDeposit: ${context === 'streaming' ? '1.0' : '0.5'} ${NETWORK_CONFIG.tokenSymbol}\nTimestamp: ${Date.now()}`

          showToast({
            title: '💳 Signature Required',
            description: 'Please sign the message in your wallet',
            type: 'info'
          })

          // Request signature from wallet
          await walletClient.signMessage({
            account: userAddress,
            message: message
          })

          console.log('✅ Wallet signature approved')
        } catch (signError: any) {
          if (signError.code === 4001) {
            throw new Error('User rejected the signature request')
          }
          throw new Error(`Signature failed: ${signError.message}`)
        }
      }

      if (context === 'streaming') {
        await enableStreamingTips('1.0') // 1 NTT for streaming (testing)
        showToast({
          title: '⚡ Streaming Tips Enabled!',
          description: 'Nitrolite state channel active for instant tips',
          type: 'success'
        })
      } else {
        await enablePostPayments('0.5') // 0.5 NTT for posts (testing)
        showToast({
          title: '⚡ Post Payments Enabled!',
          description: 'Nitrolite state channel active for micropayments',
          type: 'success'
        })
      }

      // Add 2-second delay after wallet approval before showing tip modal
      console.log('⏳ Waiting 2 seconds before showing tip interface...')
      await new Promise(resolve => setTimeout(resolve, 2000))

      setCurrentStep('tipping')
    } catch (error: any) {
      console.error('Failed to enable channel:', error)
      showToast({
        title: 'Channel setup failed',
        description: error.message,
        type: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle tip amount selection
  const handleQuickTip = (amount: string, action?: string) => {
    setSelectedAmount(amount)
    setSelectedAction(action || '')
    setCustomAmount('')
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setSelectedAmount('')
    setSelectedAction('')
  }

  const getFinalAmount = () => {
    const amount = selectedAmount || customAmount
    return amount ? parseFloat(amount) : 0
  }

  // Send payment
  const sendPayment = async (amount?: string, action?: string) => {
    const finalAmount = amount || getFinalAmount()
    const paymentAction = action || selectedAction || (context === 'streaming' ? 'tip' : 'like')

    console.log('🔍 Payment Debug:', {
      finalAmount,
      paymentAction,
      activeChannel: !!activeChannel,
      selectedAmount,
      customAmount
    })

    if (!activeChannel) {
      showToast({
        title: 'Channel not ready',
        description: 'Please wait for the Nitrolite channel to be created first',
        type: 'error'
      })
      return
    }

    if (finalAmount <= 0) {
      showToast({
        title: 'Invalid amount',
        description: 'Please select an amount or enter a custom amount greater than 0',
        type: 'error'
      })
      return
    }

    setIsProcessing(true)

    try {
      // Static explorer URL as requested
      const staticExplorerUrl = 'https://somnia-testnet.socialscan.io/tx/0x9a41ce51e57f032cf0eac990be1200f427db8c7825c515d866a09d70c3cc1f36'

      if (context === 'streaming') {
        await sendStreamTip(finalAmount.toString(), message)
        showToast({
          title: `⚡ ${finalAmount} ${NETWORK_CONFIG.tokenSymbol} sent!`,
          description: `View transaction: ${staticExplorerUrl}`,
          type: 'success'
        })
      } else {
        await sendPostPayment(finalAmount.toString(), paymentAction, message)
        showToast({
          title: `⚡ ${finalAmount} ${NETWORK_CONFIG.tokenSymbol} sent!`,
          description: `View transaction: ${staticExplorerUrl}`,
          type: 'success'
        })
      }

      // Log the static explorer URL for reference
      console.log('🔗 Transaction URL:', staticExplorerUrl)

      // Add to history
      setTipHistory(prev => [{
        id: Date.now(),
        amount: finalAmount,
        action: paymentAction,
        message,
        timestamp: new Date()
      }, ...prev.slice(0, 4)])

      // Reset form
      setSelectedAmount('')
      setCustomAmount('')
      setSelectedAction('')
      setMessage('')

      // Close modal after successful tip
      setTimeout(() => {
        onClose()
      }, 1500) // Small delay to let user see the success message

    } catch (error: any) {
      console.error('Payment failed:', error)
      showToast({
        title: 'Payment failed',
        description: error.message,
        type: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Get contextual UI elements
  const getContextualElements = () => {
    if (context === 'streaming') {
      return {
        icon: <Play className="w-6 h-6" />,
        title: 'Streaming Tips',
        description: `Send instant ${NETWORK_CONFIG.tokenSymbol} tips to support the streamer`,
        amounts: getStreamingTipAmounts(),
        setupTitle: 'Enable Live Streaming Tips',
        setupDesc: `Create a Nitrolite state channel for instant, low-cost tipping on ${NETWORK_CONFIG.name}`,
        channelDeposit: `1 ${NETWORK_CONFIG.tokenSymbol}`
      }
    } else {
      return {
        icon: <MessageCircle className="w-6 h-6" />,
        title: 'Post Interactions',
        description: 'Send micropayments for likes, premium content, and tips',
        amounts: getPostTipAmounts(),
        setupTitle: 'Enable Post Micropayments',
        setupDesc: `Create a Nitrolite state channel for instant post interactions on ${NETWORK_CONFIG.name}`,
        channelDeposit: `0.5 ${NETWORK_CONFIG.tokenSymbol}`
      }
    }
  }

  const contextual = getContextualElements()

  // Setup step UI
  const renderSetupStep = () => (
    <div className="space-y-6 text-center">
      {/* Pre-flight Status */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
        <h4 className="font-semibold text-gray-800 mb-3">Setup Requirements</h4>
        <div className="space-y-2 text-sm">
          <div className={`flex items-center gap-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? <Check className="w-4 h-4" /> : <Loader2 className="w-4 h-4" />}
            Wallet: {isConnected ? `Connected (${userAddress?.slice(0, 6)}...)` : 'Not connected'}
          </div>
          <div className={`flex items-center gap-2 ${creatorAddress ? 'text-green-600' : 'text-red-600'}`}>
            {creatorAddress ? <Check className="w-4 h-4" /> : <Loader2 className="w-4 h-4" />}
            Creator wallet: {creatorAddress ? `${creatorAddress.slice(0, 6)}...` : 'Missing'}
          </div>
          <div className={`flex items-center gap-2 ${isLoadingBalance ? 'text-yellow-600' : (parseFloat(tokenBalance?.formatted || '0') >= (context === 'streaming' ? 10 : 5) ? 'text-green-600' : 'text-red-600')}`}>
            {isLoadingBalance ? <Loader2 className="w-4 h-4 animate-spin" /> : (parseFloat(tokenBalance?.formatted || '0') >= (context === 'streaming' ? 10 : 5) ? <Check className="w-4 h-4" /> : <Loader2 className="w-4 h-4" />)}
            {NETWORK_CONFIG.tokenSymbol} Balance: {isLoadingBalance ? 'Checking...' : `${tokenBalance?.formatted || '0'} ${NETWORK_CONFIG.tokenSymbol} (need ${context === 'streaming' ? '1' : '0.5'})`}
          </div>
        </div>

        {/* Quick fixes */}
        {!isConnected && (
          <Button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => showToast({ title: 'Please connect your wallet using the connect button', type: 'info' })}>
            Connect Wallet First
          </Button>
        )}

        {isConnected && parseFloat(tokenBalance?.formatted || '0') < (context === 'streaming' ? 10 : 5) && (
          <div className="mt-3 space-y-2">
            {isNativeToken ? (
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={() => window.open(NETWORK_CONFIG.explorerUrl, '_blank')}>
                Get {NETWORK_CONFIG.tokenSymbol} from Faucet
              </Button>
            ) : (
              <>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => window.open('https://app.uniswap.org/', '_blank')}>
                  Buy {NETWORK_CONFIG.tokenSymbol}
                </Button>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => window.open(NETWORK_CONFIG.explorerUrl, '_blank')}>
                  Bridge {NETWORK_CONFIG.tokenSymbol}
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
          {contextual.icon}
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-text-primary">
          {contextual.setupTitle}
        </h3>
        <p className="text-text-secondary max-w-md mx-auto leading-relaxed">
          {contextual.setupDesc}
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="font-semibold text-green-800">Instant</div>
          <div className="text-green-600">~200ms delivery</div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <div className="font-semibold text-purple-800">Low Cost</div>
          <div className="text-purple-600">State channels</div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div className="font-semibold text-blue-800">Scalable</div>
          <div className="text-blue-600">Off-chain txs</div>
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={enableChannelSetup}
        disabled={isProcessing || isCreatingChannel}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all"
      >
        {isProcessing || isCreatingChannel ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating Channel...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Enable Nitrolite
            <ArrowRight className="w-4 h-4" />
          </div>
        )}
      </Button>

      <p className="text-xs text-text-tertiary">
        Creates a state channel with {contextual.channelDeposit} deposit
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
            <div className="font-medium text-green-800">⚡ Nitrolite Channel Active</div>
            <div className="text-sm text-green-600 truncate">
              {context === 'streaming' ? 'Streaming tips' : 'Post payments'} enabled
              • Total: {formatUSDC(activeChannel?.metadata?.totalTipped || 0n)}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tip Buttons */}
      <div>
        <label className="block text-sm font-semibold mb-3 text-text-primary">
          🚀 {context === 'streaming' ? 'Quick Tips' : 'Quick Actions'} (Instant Delivery)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {contextual.amounts.map((tip: any) => {
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
                onClick={() => handleQuickTip(tip.value, tip.action)}
                disabled={isProcessing || isSendingPayment}
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
          💰 Custom Amount ({NETWORK_CONFIG.tokenSymbol})
        </label>
        <div className="relative">
          <Input
            id="custom-amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder={context === 'streaming' ? '0.05' : '0.005'}
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            disabled={isProcessing || isSendingPayment}
            className="pl-12 bg-background-primary border-border-secondary text-text-primary placeholder-text-tertiary focus:border-purple-500 focus:ring-purple-500"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary font-bold">
            $
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Badge className="bg-green-100 text-green-800 text-xs">
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
          placeholder={context === 'streaming' ? "Thanks for the great stream!" : "Love this post!"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={200}
          rows={3}
          disabled={isProcessing || isSendingPayment}
          className="bg-background-primary border-border-secondary text-text-primary placeholder-text-tertiary focus:border-purple-500 focus:ring-purple-500"
        />
        <p className="text-xs text-text-tertiary mt-1">
          {message.length}/200 characters
        </p>
      </div>

      {/* Payment Summary */}
      {getFinalAmount() > 0 && (
        <Card className="p-4 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-purple-500/30">
          <h4 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Payment Summary
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Amount:</span>
              <span className="font-bold text-purple-600">{getFinalAmount()} {NETWORK_CONFIG.tokenSymbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Delivery:</span>
              <span className="font-medium text-green-600">⚡ Instant</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Type:</span>
              <span className="font-medium text-purple-600">
                {context === 'streaming' ? '🎥 Stream Tip' : '📝 Post Payment'}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Recent History */}
      {tipHistory.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2 text-text-primary">Recent Payments</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {tipHistory.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between text-xs bg-green-50 p-2 rounded">
                <span>${payment.amount} • {payment.action}</span>
                <Badge className="bg-green-100 text-green-800">Sent ✓</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isProcessing || isSendingPayment}
          className="flex-1 border-border-secondary text-text-secondary hover:text-text-primary"
        >
          Close
        </Button>

        {/* Send Payment Button */}
        {(selectedAmount || customAmount) && (
          <Button
            onClick={() => sendPayment()}
            disabled={getFinalAmount() <= 0 || isProcessing || isSendingPayment}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg"
          >
            {isProcessing || isSendingPayment ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Send {getFinalAmount()} {NETWORK_CONFIG.tokenSymbol}
              </div>
            )}
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-surface-primary border-border-primary">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            {contextual.icon}
            Nitrolite {contextual.title}
          </DialogTitle>
          <DialogDescription>
            {contextual.description}
          </DialogDescription>
        </DialogHeader>

        {/* Target Info */}
        <div className="bg-background-primary border border-border-secondary rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {(target?.title?.[0] || 'T').toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-text-primary truncate">{targetTitle}</h3>
              <p className="text-sm text-text-secondary truncate">
                {context === 'streaming'
                  ? `Supporting: ${stream?.users?.display_name || 'Streamer'}`
                  : `Author: ${post?.author?.display_name || 'Creator'}`
                }
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