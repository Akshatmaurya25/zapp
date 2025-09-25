'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Heart,
  DollarSign,
  Zap,
  Eye,
  MessageCircle,
  Loader2,
  Star,
  Gift,
  Sparkles
} from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { usePostPayments } from '@/hooks/useNitrolite'
import type { Address } from 'viem'
import { cn } from '@/lib/utils'

interface NitrolitePostActionsProps {
  post: {
    id: string
    title?: string
    content?: string
    author?: {
      display_name?: string
      username?: string
      wallet_address?: string
    }
  }
  className?: string
}

// Post interaction types with micro-payments
const POST_ACTIONS = [
  {
    id: 'like',
    label: 'Like',
    icon: Heart,
    amount: '0.10',
    color: 'text-pink-500 hover:text-pink-600',
    bgColor: 'hover:bg-pink-50',
    description: 'Show appreciation'
  },
  {
    id: 'premium_view',
    label: 'Premium',
    icon: Eye,
    amount: '0.25',
    color: 'text-purple-500 hover:text-purple-600',
    bgColor: 'hover:bg-purple-50',
    description: 'Unlock premium content'
  },
  {
    id: 'tip',
    label: 'Tip',
    icon: DollarSign,
    amount: '1.00',
    color: 'text-green-500 hover:text-green-600',
    bgColor: 'hover:bg-green-50',
    description: 'Send a tip'
  },
  {
    id: 'super_like',
    label: 'Super',
    icon: Star,
    amount: '2.00',
    color: 'text-yellow-500 hover:text-yellow-600',
    bgColor: 'hover:bg-yellow-50',
    description: 'Super appreciation'
  }
]

export default function NitrolitePostActions({ post, className }: NitrolitePostActionsProps) {
  const creatorAddress = post.author?.wallet_address as Address
  const { showToast } = useToast()

  // Nitrolite post payments integration
  const {
    postChannel,
    isCreatingChannel,
    isSendingPayment,
    enablePostPayments,
    sendPayment,
    formatUSDC
  } = usePostPayments(post.id, creatorAddress)

  // Component state
  const [channelReady, setChannelReady] = useState(false)
  const [actionCounts, setActionCounts] = useState<Record<string, number>>({
    like: 0,
    premium_view: 0,
    tip: 0,
    super_like: 0
  })

  // Auto-enable post payments when component mounts
  useEffect(() => {
    if (creatorAddress && !postChannel && !isCreatingChannel) {
      enablePostPayments('2.00') // 2 USDC for post interactions
        .then(() => {
          setChannelReady(true)
          showToast({
            title: '⚡ Nitrolite Enabled',
            description: 'Instant post interactions ready!',
            type: 'success'
          })
        })
        .catch((error) => {
          console.error('Failed to enable post payments:', error)
          // Continue without Nitrolite - could fallback to regular blockchain txs
        })
    }
  }, [creatorAddress, postChannel, isCreatingChannel, enablePostPayments, showToast])

  // Handle post action
  const handlePostAction = async (actionId: string) => {
    if (!postChannel || !channelReady) {
      showToast({
        title: 'Payment channel not ready',
        description: 'Please wait for Nitrolite channel to initialize',
        type: 'warning'
      })
      return
    }

    const action = POST_ACTIONS.find(a => a.id === actionId)
    if (!action) return

    try {
      await sendPayment(action.amount, actionId, `${action.label} on post`)

      // Update action counts
      setActionCounts(prev => ({
        ...prev,
        [actionId]: prev[actionId] + 1
      }))

      // Show success message with different styles per action
      const messages = {
        like: { title: '❤️ Liked!', description: `Sent ${action.amount} USDC instantly` },
        premium_view: { title: '👁️ Premium Unlocked!', description: `Paid ${action.amount} USDC for premium content` },
        tip: { title: '💰 Tip Sent!', description: `Tipped ${action.amount} USDC to creator` },
        super_like: { title: '⭐ Super Liked!', description: `Sent ${action.amount} USDC super appreciation` }
      }

      const message = messages[actionId as keyof typeof messages]
      showToast({
        title: message.title,
        description: message.description,
        type: 'success'
      })

    } catch (error: any) {
      console.error('Failed to send post payment:', error)
      showToast({
        title: 'Payment failed',
        description: error.message,
        type: 'error'
      })
    }
  }

  // If no creator address, show regular buttons without payments
  if (!creatorAddress) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {POST_ACTIONS.slice(0, 2).map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              className={cn("flex items-center gap-2", action.color, action.bgColor)}
              onClick={() => showToast({ title: 'Creator wallet not configured', type: 'warning' })}
            >
              <Icon className="w-4 h-4" />
              {action.label}
            </Button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Channel Status */}
      {postChannel && (
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <div className={cn(
            "w-2 h-2 rounded-full",
            channelReady ? "bg-green-500 animate-pulse" : "bg-yellow-500"
          )} />
          <span>
            {channelReady ? 'Nitrolite Channel Active' : 'Initializing...'}
          </span>
          {channelReady && (
            <Badge className="bg-green-100 text-green-800 text-xs">
              <Zap className="w-2 h-2 mr-1" />
              Instant
            </Badge>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {POST_ACTIONS.map((action) => {
          const Icon = action.icon
          const count = actionCounts[action.id]
          const hasInteracted = count > 0

          return (
            <Button
              key={action.id}
              variant={hasInteracted ? "default" : "ghost"}
              size="sm"
              className={cn(
                "flex items-center gap-2 transition-all duration-200",
                hasInteracted
                  ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md"
                  : cn(action.color, action.bgColor),
                "hover:scale-105"
              )}
              onClick={() => handlePostAction(action.id)}
              disabled={isSendingPayment || isCreatingChannel || !channelReady}
            >
              {isSendingPayment ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Icon className="w-4 h-4" />
                  {action.label}
                  <span className="text-xs opacity-75">${action.amount}</span>
                  {count > 0 && (
                    <Badge className="bg-white/20 text-white text-xs ml-1">
                      {count}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          )
        })}
      </div>

      {/* Channel Stats */}
      {postChannel && channelReady && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-purple-800 font-medium">
                Total Paid: {formatUSDC(postChannel.metadata.totalTipped)}
              </span>
            </div>
            <Badge className="bg-purple-100 text-purple-800">
              <MessageCircle className="w-3 h-3 mr-1" />
              {postChannel.currentState.postInteractions || 0} interactions
            </Badge>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isCreatingChannel && (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Setting up Nitrolite payments...</span>
        </div>
      )}
    </div>
  )
}

// Simpler version for inline use in feed items
export function NitrolitePostActionsInline({ post, className }: NitrolitePostActionsProps) {
  const creatorAddress = post.author?.wallet_address as Address
  const { showToast } = useToast()

  const {
    postChannel,
    isCreatingChannel,
    isSendingPayment,
    enablePostPayments,
    sendPayment
  } = usePostPayments(post.id, creatorAddress)

  const [quickActionEnabled, setQuickActionEnabled] = useState(false)

  // Enable quick payments
  useEffect(() => {
    if (creatorAddress && !postChannel && !isCreatingChannel) {
      enablePostPayments('1.00')
        .then(() => setQuickActionEnabled(true))
        .catch(() => {}) // Silent fail for inline version
    }
  }, [creatorAddress, postChannel, isCreatingChannel, enablePostPayments])

  const handleQuickLike = async () => {
    if (!quickActionEnabled || !postChannel) return

    try {
      await sendPayment('0.10', 'like', 'Quick like')
      showToast({
        title: '❤️ Liked instantly!',
        description: 'Sent $0.10 USDC',
        type: 'success'
      })
    } catch (error: any) {
      showToast({
        title: 'Like failed',
        description: error.message,
        type: 'error'
      })
    }
  }

  const handleQuickTip = async () => {
    if (!quickActionEnabled || !postChannel) return

    try {
      await sendPayment('1.00', 'tip', 'Quick tip')
      showToast({
        title: '💰 Tip sent!',
        description: 'Sent $1.00 USDC instantly',
        type: 'success'
      })
    } catch (error: any) {
      showToast({
        title: 'Tip failed',
        description: error.message,
        type: 'error'
      })
    }
  }

  if (!creatorAddress) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <Button variant="ghost" size="sm" className="text-pink-500 hover:text-pink-600">
          <Heart className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-green-500 hover:text-green-600">
          <DollarSign className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="text-pink-500 hover:text-pink-600 hover:bg-pink-50 transition-all duration-200"
        onClick={handleQuickLike}
        disabled={!quickActionEnabled || isSendingPayment}
      >
        {isSendingPayment ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Heart className="w-4 h-4" />
            <span className="text-xs ml-1">$0.10</span>
          </>
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="text-green-500 hover:text-green-600 hover:bg-green-50 transition-all duration-200"
        onClick={handleQuickTip}
        disabled={!quickActionEnabled || isSendingPayment}
      >
        {isSendingPayment ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <DollarSign className="w-4 h-4" />
            <span className="text-xs ml-1">$1.00</span>
          </>
        )}
      </Button>

      {quickActionEnabled && (
        <Badge className="bg-green-100 text-green-800 text-xs">
          <Zap className="w-2 h-2 mr-1" />
          Instant
        </Badge>
      )}
    </div>
  )
}