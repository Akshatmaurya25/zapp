'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useBalance } from 'wagmi'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { NETWORK_CONFIG } from '@/lib/nitroliteService'
import {
  Droplet,
  Clock,
  Check,
  Loader2,
  Gift,
  AlertCircle,
  ExternalLink
} from 'lucide-react'

// Test Token ABI (only functions we need)
const TEST_TOKEN_ABI = [
  {
    name: 'faucet',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    name: 'canUseFaucet',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'timeUntilFaucet',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const

interface TokenFaucetProps {
  className?: string
}

export default function TokenFaucet({ className }: TokenFaucetProps) {
  const { address, isConnected } = useAccount()
  const { showToast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  // Get token address from config
  const tokenAddress = NETWORK_CONFIG.usdcAddress

  // Check if we have a valid token address (not the zero address)
  const hasRealToken = tokenAddress !== '0x0000000000000000000000000000000000000000'

  // Contract interactions
  const { writeContract, data: hash, error: writeError } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Read contract data
  const { data: canUseFaucet, refetch: refetchCanUseFaucet } = useReadContract({
    address: tokenAddress,
    abi: TEST_TOKEN_ABI,
    functionName: 'canUseFaucet',
    args: address ? [address] : undefined,
    enabled: hasRealToken && !!address
  })

  const { data: timeUntilFaucet, refetch: refetchTimeUntil } = useReadContract({
    address: tokenAddress,
    abi: TEST_TOKEN_ABI,
    functionName: 'timeUntilFaucet',
    args: address ? [address] : undefined,
    enabled: hasRealToken && !!address
  })

  // Get token balance
  const { data: tokenBalance, refetch: refetchBalance } = useBalance({
    address: address,
    token: hasRealToken ? tokenAddress : undefined,
    enabled: hasRealToken && !!address
  })

  // Handle faucet claim
  const handleClaimTokens = async () => {
    if (!address || !hasRealToken) return

    setIsProcessing(true)

    try {
      await writeContract({
        address: tokenAddress,
        abi: TEST_TOKEN_ABI,
        functionName: 'faucet',
      })

      showToast({
        title: '🚰 Faucet claim submitted!',
        description: 'Transaction sent - waiting for confirmation...',
        type: 'info'
      })

    } catch (error: any) {
      console.error('Faucet claim failed:', error)
      showToast({
        title: 'Faucet claim failed',
        description: error.message || 'Please try again',
        type: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle successful transaction
  if (isSuccess) {
    showToast({
      title: '🎉 Tokens received!',
      description: '1000 NTT added to your wallet',
      type: 'success'
    })

    // Refetch all data
    refetchCanUseFaucet()
    refetchTimeUntil()
    refetchBalance()
  }

  // Format time until next faucet use
  const formatTimeUntil = (seconds: bigint): string => {
    const totalSeconds = Number(seconds)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  // Don't render if no real token deployed
  if (!hasRealToken) {
    return (
      <Card className={`p-6 border-orange-200 bg-orange-50 ${className}`}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-orange-800 mb-2">Token Not Deployed</h3>
            <p className="text-sm text-orange-700 mb-4">
              Test token needs to be deployed for real state channels
            </p>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => showToast({
                title: 'Deploy required',
                description: 'Run: npm run deploy:complete-nitrolite',
                type: 'info'
              })}
            >
              Deploy Instructions
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-6 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Droplet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-800">Token Faucet</h3>
            <p className="text-sm text-purple-600">Get NTT tokens for state channels</p>
          </div>
        </div>

        {/* Balance Display */}
        {tokenBalance && (
          <div className="bg-white/70 rounded-lg p-3 border border-purple-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-700">Your Balance:</span>
              <Badge className="bg-purple-100 text-purple-800 font-mono">
                {parseFloat(tokenBalance.formatted).toFixed(2)} NTT
              </Badge>
            </div>
          </div>
        )}

        {/* Faucet Status */}
        <div className="space-y-3">
          {!isConnected ? (
            <div className="text-center py-2">
              <p className="text-sm text-gray-600 mb-2">Connect wallet to use faucet</p>
            </div>
          ) : canUseFaucet ? (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Faucet Available</span>
                </div>
                <p className="text-xs text-green-700 mt-1">Get 1000 NTT tokens</p>
              </div>

              <Button
                onClick={handleClaimTokens}
                disabled={isProcessing || isConfirming}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg"
              >
                {isProcessing || isConfirming ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isProcessing ? 'Claiming...' : 'Confirming...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Claim 1000 NTT
                  </div>
                )}
              </Button>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Cooldown Active</span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                Next claim in: {timeUntilFaucet ? formatTimeUntil(timeUntilFaucet) : 'Loading...'}
              </p>
            </div>
          )}
        </div>

        {/* Error Display */}
        {writeError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Error</span>
            </div>
            <p className="text-xs text-red-700 mt-1">
              {writeError.message.includes('cooldown')
                ? 'Faucet is on cooldown (24h)'
                : 'Transaction failed - please try again'
              }
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center pt-2 border-t border-purple-200">
          <p className="text-xs text-purple-600 mb-2">
            • 1000 NTT per claim • 24 hour cooldown • Testnet only
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-purple-700 hover:text-purple-800 hover:bg-purple-100"
            onClick={() => window.open(`${NETWORK_CONFIG.explorerUrl}/address/${tokenAddress}`, '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            View Token Contract
          </Button>
        </div>
      </div>
    </Card>
  )
}