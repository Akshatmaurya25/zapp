'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { DollarSign, Heart, Gift, Zap } from 'lucide-react'
import { streamingService } from '@/lib/streaming'
import { useToast } from '@/components/ui/Toast'

interface TipModalProps {
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

const QUICK_TIP_AMOUNTS = [
  { label: '$1', value: '0.001', icon: DollarSign, color: 'from-blue-500 to-blue-600' },
  { label: '$5', value: '0.005', icon: Heart, color: 'from-pink-500 to-pink-600' },
  { label: '$10', value: '0.01', icon: Gift, color: 'from-purple-500 to-purple-600' },
  { label: '$25', value: '0.025', icon: Zap, color: 'from-yellow-500 to-yellow-600' }
]

// Mock contract ABI for StreamTipping
const STREAM_TIPPING_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "streamer", "type": "address"},
      {"internalType": "string", "name": "message", "type": "string"},
      {"internalType": "string", "name": "streamId", "type": "string"}
    ],
    "name": "sendTip",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
] as const

export default function TipModal({ isOpen, onClose, stream }: TipModalProps) {
  const [customAmount, setCustomAmount] = useState('')
  const [message, setMessage] = useState('')
  const [selectedAmount, setSelectedAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const { address, isConnected } = useAccount()
  const { showToast } = useToast()

  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  })

  const contractAddress = process.env.NEXT_PUBLIC_STREAM_TIPPING_CONTRACT as `0x${string}`
  const streamerAddress = stream.users?.wallet_address as `0x${string}`

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

  const sendTip = async () => {
    if (!isConnected || !address) {
      showToast({ title: 'Please connect your wallet first', type: 'error' })
      return
    }

    if (!streamerAddress) {
      showToast({ title: 'Streamer wallet address not found', type: 'error' })
      return
    }

    const finalAmount = getFinalAmount()
    if (finalAmount <= 0) {
      showToast({ title: 'Please enter a valid tip amount', type: 'error' })
      return
    }

    if (!contractAddress) {
      showToast({ title: 'Contract address not configured', type: 'error' })
      return
    }

    setIsProcessing(true)

    try {
      // Send transaction to smart contract
      writeContract({
        address: contractAddress,
        abi: STREAM_TIPPING_ABI,
        functionName: 'sendTip',
        args: [
          streamerAddress,
          message || '',
          stream.stream_key
        ],
        value: parseEther(finalAmount.toString())
      })

    } catch (error) {
      console.error('Tip transaction failed:', error)
      showToast({ title: 'Failed to send tip transaction', type: 'error' })
      setIsProcessing(false)
    }
  }

  // Handle transaction confirmation
  if (hash && !isConfirming && !isProcessing) {
    // Transaction was successful, record it in our database
    const recordTip = async () => {
      try {
        await streamingService.recordTip({
          stream_id: stream.id,
          streamer_wallet: streamerAddress,
          tipper_wallet: address!,
          amount: getFinalAmount().toString(),
          message: message || '',
          tx_hash: hash
        })

        showToast({ title: 'Tip sent successfully! 🎉', type: 'success' })

        // Reset form
        setSelectedAmount('')
        setCustomAmount('')
        setMessage('')
        onClose()

      } catch (error) {
        console.error('Failed to record tip:', error)
        showToast({ title: 'Tip sent but failed to record. Please refresh the page.', type: 'warning' })
      }
      setIsProcessing(false)
    }

    recordTip()
  }

  // Handle transaction error
  if (error) {
    showToast({ title: 'Transaction failed: ' + error.message, type: 'error' })
    setIsProcessing(false)
  }

  const isLoading = isPending || isConfirming || isProcessing

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-surface-secondary border-border-primary">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            Send Crypto Tip
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stream Info */}
          <div className="bg-background-primary border border-border-secondary rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {(stream.users?.display_name || stream.users?.username || 'S')[0].toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-text-primary truncate">{stream.title}</h3>
                <p className="text-sm text-text-secondary">
                  Supporting: {stream.users?.display_name || stream.users?.username || 'Anonymous Streamer'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Tip Amounts */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-text-primary">💡 Quick Tip Amounts</label>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_TIP_AMOUNTS.map((tip) => {
                const Icon = tip.icon
                return (
                  <Button
                    key={tip.value}
                    variant={selectedAmount === tip.value ? "default" : "outline"}
                    className={`relative overflow-hidden h-16 flex flex-col items-center gap-1 transition-all duration-200 ${
                      selectedAmount === tip.value
                        ? `bg-gradient-to-r ${tip.color} text-white border-transparent shadow-lg transform scale-105`
                        : 'border-border-secondary text-text-secondary hover:text-text-primary hover:border-purple-500/50'
                    }`}
                    onClick={() => handleQuickTip(tip.value)}
                    disabled={isLoading}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{tip.label}</span>
                    <span className="text-xs opacity-75">{tip.value} ETH</span>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label htmlFor="custom-amount" className="block text-sm font-semibold mb-2 text-text-primary">
              💰 Custom Amount (ETH)
            </label>
            <div className="relative">
              <Input
                id="custom-amount"
                type="number"
                step="0.001"
                min="0.001"
                placeholder="0.001"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                disabled={isLoading}
                className="pl-12 bg-background-primary border-border-secondary text-text-primary placeholder-text-tertiary focus:border-purple-500 focus:ring-purple-500"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                Ξ
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
              disabled={isLoading}
              className="bg-background-primary border-border-secondary text-text-primary placeholder-text-tertiary focus:border-purple-500 focus:ring-purple-500"
            />
            <p className="text-xs text-text-tertiary mt-1">
              {message.length}/200 characters
            </p>
          </div>

          {/* Tip Summary */}
          {getFinalAmount() > 0 && (
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-green-300 mb-2 flex items-center gap-2">
                🎯 Tip Summary
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Tip Amount:</span>
                  <span className="font-semibold text-green-400">{getFinalAmount()} ETH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">~ USD Value:</span>
                  <span className="font-medium text-green-300">${(getFinalAmount() * 2000).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Network:</span>
                  <span className="font-medium text-text-primary">Ethereum</span>
                </div>
              </div>
            </div>
          )}

          {/* Wallet Connection Status */}
          {!isConnected && (
            <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                  ⚠️
                </div>
                <p className="text-sm text-yellow-300 font-medium">
                  Please connect your wallet to send tips
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 border-border-secondary text-text-secondary hover:text-text-primary"
            >
              Cancel
            </Button>
            <Button
              onClick={sendTip}
              disabled={!isConnected || getFinalAmount() <= 0 || isLoading}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Sending...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {getFinalAmount() > 0 ? `Send ${getFinalAmount()} ETH` : 'Send Tip'}
                </div>
              )}
            </Button>
          </div>

          {/* Transaction Hash */}
          {hash && (
            <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3">
              <p className="text-xs text-blue-300 font-medium">
                🔗 Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                Your tip is being processed on the blockchain
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}