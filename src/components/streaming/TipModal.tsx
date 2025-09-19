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
  { label: '$1', value: '0.001', icon: DollarSign },
  { label: '$5', value: '0.005', icon: Heart },
  { label: '$10', value: '0.01', icon: Gift },
  { label: '$25', value: '0.025', icon: Zap }
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Send Tip
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stream Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium truncate">{stream.title}</h3>
            <p className="text-sm text-gray-600">
              To: {stream.users?.display_name || stream.users?.username || 'Unknown Streamer'}
            </p>
          </div>

          {/* Quick Tip Amounts */}
          <div>
            <label className="block text-sm font-medium mb-3">Quick Tip</label>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_TIP_AMOUNTS.map((tip) => {
                const Icon = tip.icon
                return (
                  <Button
                    key={tip.value}
                    variant={selectedAmount === tip.value ? "default" : "outline"}
                    className="flex items-center gap-2 p-3"
                    onClick={() => handleQuickTip(tip.value)}
                    disabled={isLoading}
                  >
                    <Icon className="w-4 h-4" />
                    {tip.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label htmlFor="custom-amount" className="block text-sm font-medium mb-2">
              Custom Amount (ETH)
            </label>
            <Input
              id="custom-amount"
              type="number"
              step="0.001"
              min="0.001"
              placeholder="0.001"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="tip-message" className="block text-sm font-medium mb-2">
              Message (optional)
            </label>
            <Textarea
              id="tip-message"
              placeholder="Say something nice..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              rows={3}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/200 characters
            </p>
          </div>

          {/* Tip Summary */}
          {getFinalAmount() > 0 && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span>Tip Amount:</span>
                <span className="font-medium">{getFinalAmount()} ETH</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>~ USD Value:</span>
                <span>${(getFinalAmount() * 2000).toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Wallet Connection Status */}
          {!isConnected && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                Please connect your wallet to send tips
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={sendTip}
              disabled={!isConnected || getFinalAmount() <= 0 || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Sending...'}
                </div>
              ) : (
                `Send ${getFinalAmount()} ETH`
              )}
            </Button>
          </div>

          {/* Transaction Hash */}
          {hash && (
            <div className="text-xs text-gray-500">
              <p>Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}