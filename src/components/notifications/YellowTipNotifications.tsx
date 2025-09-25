'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  DollarSign,
  Zap,
  X,
  CheckCircle,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react'
import { useYellowTipEvents } from '@/hooks/useYellowNetwork'
import type { InstantTip } from '@/lib/yellowNetwork'

interface TipNotification {
  id: string
  tip: InstantTip
  timestamp: Date
  isRead: boolean
}

export function YellowTipNotifications() {
  const { recentTips } = useYellowTipEvents()
  const [notifications, setNotifications] = useState<TipNotification[]>([])
  const [isVisible, setIsVisible] = useState(true)

  // Convert recentTips to notifications
  useEffect(() => {
    const newNotifications = recentTips.map(tip => ({
      id: `notif_${tip.id}`,
      tip,
      timestamp: tip.timestamp,
      isRead: false
    }))

    setNotifications(prev => {
      // Merge with existing, avoiding duplicates
      const existingIds = new Set(prev.map(n => n.id))
      const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id))

      return [...uniqueNew, ...prev].slice(0, 5) // Keep only last 5
    })
  }, [recentTips])

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    )
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const formatAmount = (amount: bigint): string => {
    const eth = parseFloat(amount.toString()) / 1e18
    return eth.toFixed(4)
  }

  if (!isVisible || notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-80 space-y-2">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.4
            }}
            layout
          >
            <Card className={`p-4 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 backdrop-blur-md shadow-xl ${
              !notification.isRead ? 'ring-2 ring-yellow-400/50' : ''
            }`}>
              <div className="flex items-start gap-3">
                {/* Tip Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800 px-2 py-1">
                        ⚡ Instant Tip
                      </Badge>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNotification(notification.id)}
                      className="h-6 w-6 p-0 hover:bg-yellow-200/20"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Tip Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-yellow-100">
                        {formatAmount(notification.tip.amount)} ETH
                      </span>
                      <span className="text-xs text-yellow-200/80">
                        {notification.timestamp.toLocaleTimeString()}
                      </span>
                    </div>

                    {notification.tip.message && (
                      <div className="text-sm text-yellow-100/90 bg-black/20 rounded px-2 py-1 italic">
                        "{notification.tip.message}"
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-yellow-200/80">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Delivered instantly
                      </span>
                      <span className="font-mono">
                        {notification.tip.channelId.slice(0, 8)}...
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  {!notification.isRead && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-3"
                    >
                      <Button
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="w-full bg-yellow-600/30 hover:bg-yellow-600/50 text-yellow-100 border border-yellow-400/30"
                      >
                        Mark as Read
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Control Panel */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-3 bg-black/50 backdrop-blur-md border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-yellow-300 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>{notifications.length} recent tips</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="text-yellow-300 hover:text-yellow-100 hover:bg-yellow-600/20 h-6 px-2"
              >
                Hide All
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

// Floating tip celebration component
export function TipCelebration({ isVisible, amount }: { isVisible: boolean; amount?: bigint }) {
  if (!isVisible || !amount) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: -50 }}
      transition={{
        type: "spring",
        damping: 15,
        stiffness: 300,
        duration: 0.6
      }}
      className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
    >
      <div className="text-center">
        {/* Celebration Effect */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: 2,
            ease: "easeInOut"
          }}
          className="text-6xl mb-4"
        >
          🎉
        </motion.div>

        {/* Amount Display */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 10 }}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-8 py-4 rounded-full shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8" />
            <div>
              <div className="text-sm opacity-90">Tip Sent!</div>
              <div className="text-2xl font-bold">
                {(parseFloat(amount.toString()) / 1e18).toFixed(4)} ETH
              </div>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 text-yellow-100 text-lg font-medium"
        >
          ⚡ Delivered Instantly!
        </motion.div>
      </div>
    </motion.div>
  )
}

// Mini tip counter for stream overlay
export function LiveTipCounter() {
  const { recentTips } = useYellowTipEvents()
  const [totalTips, setTotalTips] = useState(0n)
  const [tipCount, setTipCount] = useState(0)

  useEffect(() => {
    const total = recentTips.reduce((sum, tip) => sum + tip.amount, 0n)
    setTotalTips(total)
    setTipCount(recentTips.length)
  }, [recentTips])

  if (tipCount === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-4 right-4 z-40"
    >
      <Card className="p-3 bg-gradient-to-r from-yellow-500/90 to-yellow-600/90 backdrop-blur-md border-yellow-400/50 shadow-lg">
        <div className="flex items-center gap-3 text-white">
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Live Tips</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">
              {(parseFloat(totalTips.toString()) / 1e18).toFixed(3)} ETH
            </div>
            <div className="text-xs opacity-90">
              {tipCount} tips • ⚡ Instant
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}