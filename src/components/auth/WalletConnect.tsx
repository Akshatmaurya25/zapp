'use client'

import React from 'react'
import { useWallet } from '@/hooks/useWallet'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Wallet, AlertCircle, Loader2 } from 'lucide-react'

interface WalletConnectProps {
  onConnect?: () => void
}

export function WalletConnect({ onConnect }: WalletConnectProps) {
  const { 
    connectWallet, 
    isConnecting, 
    connectors, 
    error,
    switchToSomnia,
    isOnSomnia,
    isConnected
  } = useWallet()

  const handleConnect = async (connectorId?: string) => {
    try {
      await connectWallet(connectorId)
      onConnect?.()
    } catch (err) {
      console.error('Connection failed:', err)
    }
  }

  const handleNetworkSwitch = async () => {
    const success = await switchToSomnia()
    if (success && onConnect) {
      onConnect()
    }
  }

  // If connected but wrong network
  if (isConnected && !isOnSomnia) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            Wrong Network
          </CardTitle>
          <CardDescription>
            Please switch to Somnia network to continue using Zapp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleNetworkSwitch}
            className="w-full"
            disabled={isConnecting}
          >
            Switch to Somnia Network
          </Button>
          <Button 
            onClick={() => switchToSomnia(true)}
            variant="outline"
            className="w-full"
            disabled={isConnecting}
          >
            Use Somnia Testnet
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Wallet className="h-6 w-6" />
          Connect Your Wallet
        </CardTitle>
        <CardDescription>
          Connect your wallet to start using Zapp social platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectors.map((connector) => (
          <Button
            key={connector.id}
            onClick={() => handleConnect(connector.id)}
            disabled={isConnecting}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              connector.icon && (
                <img 
                  src={connector.icon} 
                  alt={connector.name} 
                  className="h-5 w-5" 
                />
              )
            )}
            {isConnecting ? 'Connecting...' : `Connect ${connector.name}`}
          </Button>
        ))}
        
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>By connecting your wallet, you agree to our Terms of Service</p>
          <p>Zapp will auto-add Somnia network if not present</p>
        </div>
      </CardContent>
    </Card>
  )
}