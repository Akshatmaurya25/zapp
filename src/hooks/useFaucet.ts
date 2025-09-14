import React, { useState, useCallback } from 'react'
import { useAccount } from 'wagmi'

// Somnia testnet faucet configuration
const FAUCET_ENDPOINTS = {
  official: 'https://testnet.somnia.network/api/faucet',
  google: 'https://cloud.google.com/application/web3/faucet/somnia/shannon/api/request',
  stakely: 'https://stakely.io/faucet/somnia-testnet-stt/api/request',
  // Backup endpoints
  thirdweb: 'https://thirdweb.com/somnia-shannon-testnet/faucet'
}

export interface FaucetResponse {
  success: boolean
  txHash?: string
  message: string
  amount?: string
  waitTime?: number
}

export interface FaucetStatus {
  canRequest: boolean
  remainingTime?: number
  lastRequestTime?: number
  dailyLimit?: number
  requestsToday?: number
}

export function useFaucet() {
  const { address } = useAccount()
  const [isRequesting, setIsRequesting] = useState(false)
  const [lastRequest, setLastRequest] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Request tokens from faucet
  const requestTokens = useCallback(async (): Promise<FaucetResponse> => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    setIsRequesting(true)
    setError(null)

    try {
      // Try official faucet first
      const response = await requestFromOfficialFaucet(address)
      setLastRequest(Date.now())
      return response
    } catch (officialError) {
      console.warn('Official faucet failed, trying alternatives...', officialError)

      // Try alternative faucets
      try {
        const response = await requestFromAlternativeFaucet(address)
        setLastRequest(Date.now())
        return response
      } catch (altError) {
        const errorMessage = altError instanceof Error ? altError.message : 'All faucets are currently unavailable'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    } finally {
      setIsRequesting(false)
    }
  }, [address])

  // Check faucet status and cooldown
  const getFaucetStatus = useCallback((): FaucetStatus => {
    const now = Date.now()
    const lastRequestTime = lastRequest || getStoredLastRequest(address)
    const cooldownPeriod = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

    if (!lastRequestTime) {
      return { canRequest: true }
    }

    const timeSinceLastRequest = now - lastRequestTime
    const canRequest = timeSinceLastRequest >= cooldownPeriod

    return {
      canRequest,
      remainingTime: canRequest ? 0 : cooldownPeriod - timeSinceLastRequest,
      lastRequestTime,
      dailyLimit: 1, // Most faucets allow 1 request per day
      requestsToday: lastRequestTime > now - cooldownPeriod ? 1 : 0
    }
  }, [address, lastRequest])

  // Format remaining time for display
  const getFormattedCooldown = useCallback((): string | null => {
    const status = getFaucetStatus()
    if (status.canRequest || !status.remainingTime) return null

    const hours = Math.floor(status.remainingTime / (1000 * 60 * 60))
    const minutes = Math.floor((status.remainingTime % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`
    } else {
      return `${minutes}m remaining`
    }
  }, [getFaucetStatus])

  return {
    requestTokens,
    getFaucetStatus,
    getFormattedCooldown,
    isRequesting,
    error,
    clearError: () => setError(null),
  }
}

// Request from official Somnia faucet
async function requestFromOfficialFaucet(address: string): Promise<FaucetResponse> {
  try {
    const response = await fetch(FAUCET_ENDPOINTS.official, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        amount: '1', // 1 STT
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Faucet request failed: ${errorData}`)
    }

    const data = await response.json()

    return {
      success: true,
      txHash: data.txHash || data.transactionHash,
      message: 'Successfully requested 1 STT from Somnia faucet',
      amount: '1',
      waitTime: 24 * 60 * 60 // 24 hours
    }
  } catch (error) {
    throw new Error(`Official faucet failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Fallback to alternative faucets
async function requestFromAlternativeFaucet(address: string): Promise<FaucetResponse> {
  // Try Google Cloud faucet
  try {
    const response = await fetch(FAUCET_ENDPOINTS.google, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        network: 'somnia-shannon-testnet'
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        txHash: data.txHash,
        message: 'Successfully requested tokens from Google Cloud faucet',
        amount: '0.5',
        waitTime: 24 * 60 * 60
      }
    }
  } catch (error) {
    console.warn('Google Cloud faucet failed:', error)
  }

  // Try Stakely faucet
  try {
    const response = await fetch(FAUCET_ENDPOINTS.stakely, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        network: 'somnia-testnet'
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        txHash: data.txHash,
        message: 'Successfully requested tokens from Stakely faucet',
        amount: '0.1',
        waitTime: 24 * 60 * 60
      }
    }
  } catch (error) {
    console.warn('Stakely faucet failed:', error)
  }

  throw new Error('All alternative faucets are currently unavailable')
}

// Helper functions for local storage
function getStoredLastRequest(address?: string): number | null {
  if (!address || typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(`faucet_last_request_${address.toLowerCase()}`)
    return stored ? parseInt(stored, 10) : null
  } catch {
    return null
  }
}

function storeLastRequest(address: string, timestamp: number): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(`faucet_last_request_${address.toLowerCase()}`, timestamp.toString())
  } catch {
    // Ignore storage errors
  }
}

// Custom hook for balance checking
export function useTestnetBalance() {
  const { address } = useAccount()
  const [balance, setBalance] = useState<string>('0')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkBalance = useCallback(async () => {
    if (!address) {
      setBalance('0')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get balance using standard ETH JSON-RPC call
      const response = await fetch('https://dream-rpc.somnia.network/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch balance from RPC')
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error.message || 'RPC error')
      }

      // Convert hex balance to decimal and format (18 decimals for STT)
      const balanceWei = BigInt(data.result || '0x0')
      const balanceEth = Number(balanceWei) / Math.pow(10, 18)
      setBalance(balanceEth.toFixed(4))

    } catch (error) {
      console.error('Failed to check balance:', error)
      setError(error instanceof Error ? error.message : 'Failed to check balance')
      setBalance('0')
    } finally {
      setIsLoading(false)
    }
  }, [address])

  // Auto-check balance when address changes
  React.useEffect(() => {
    checkBalance()
  }, [checkBalance])

  return {
    balance,
    isLoading,
    error,
    checkBalance,
    hasBalance: parseFloat(balance) > 0
  }
}