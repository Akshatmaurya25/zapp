'use client'

import React, { useState } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  Wallet, 
  AlertCircle, 
  Loader2, 
  CheckCircle, 
  ExternalLink,
  Shield,
  Chrome
} from 'lucide-react'

interface WalletSelectorProps {
  onConnect?: () => void
}

export function WalletSelector({ onConnect }: WalletSelectorProps) {
  const { 
    connectWallet, 
    isConnecting, 
    connectors, 
    error,
    connectionRejected,
    resetConnectionState 
  } = useWallet()
  
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null)

  const handleConnect = async (connectorId: string) => {
    setSelectedConnector(connectorId)
    try {
      await connectWallet(connectorId)
      onConnect?.()
    } catch (err) {
      console.error('Connection failed:', err)
      setSelectedConnector(null)
    }
  }

  const getWalletInfo = (connectorId: string, connectorName: string) => {
    const walletInfo: Record<string, { 
      name: string; 
      description: string; 
      icon: React.ReactNode;
      supported: boolean;
      installUrl?: string;
    }> = {
      'io.metamask': {
        name: 'MetaMask',
        description: 'Popular Ethereum wallet with browser extension',
        icon: <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">M</div>,
        supported: true,
        installUrl: 'https://metamask.io/download/'
      },
      'com.coinbase.wallet': {
        name: 'Coinbase Wallet',
        description: 'Secure wallet by Coinbase with mobile and extension support',
        icon: <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>,
        supported: true,
        installUrl: 'https://www.coinbase.com/wallet'
      },
      'walletconnect': {
        name: 'WalletConnect',
        description: 'Connect with mobile wallets via QR code',
        icon: <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>,
        supported: true
      },
      'injected': {
        name: 'Browser Wallet',
        description: 'Use any installed browser wallet extension',
        icon: <Chrome className="w-8 h-8 text-gray-400" />,
        supported: true
      }
    }

    return walletInfo[connectorId] || {
      name: connectorName,
      description: 'Connect with your preferred wallet',
      icon: <Wallet className="w-8 h-8 text-gray-400" />,
      supported: false
    }
  }

  if (connectionRejected) {
    return (
      <Card className="max-w-md mx-auto border-orange-500/20 bg-orange-900/20">
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Wallet Connection Required
          </h3>
          <p className="text-gray-300 text-sm mb-4">
            To access Zapp's features, please connect your EVM-compatible wallet.
            We support Ethereum wallets like MetaMask.
          </p>
          <Button 
            onClick={resetConnectionState}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Choose Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-lg mx-auto border-gray-700 bg-gray-900/50 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Wallet className="h-6 w-6 text-blue-400" />
          Connect Your Wallet
        </CardTitle>
        <p className="text-gray-400 text-sm">
          Choose your preferred EVM-compatible wallet to get started
        </p>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Filter to only show EVM-compatible wallets */}
        {connectors
          .filter(connector => 
            connector.id !== 'app.phantom' && // Filter out Phantom (Solana wallet)
            !connector.name.toLowerCase().includes('phantom')
          )
          .map((connector) => {
            const walletInfo = getWalletInfo(connector.id, connector.name)
            const isSelected = selectedConnector === connector.id
            const isConnectingWallet = isConnecting && isSelected
            
            return (
              <div
                key={connector.id}
                className={`
                  p-4 rounded-xl border transition-all duration-200 cursor-pointer
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                  }
                `}
                onClick={() => !isConnecting && handleConnect(connector.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {walletInfo.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white">
                        {walletInfo.name}
                      </h3>
                      {walletInfo.supported && (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {walletInfo.description}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {isConnecting ? (
                      <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                    ) : walletInfo.supported ? (
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    ) : (
                      <ExternalLink className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        
        {/* Error Display */}
        {error && !isConnecting && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}
        
        {/* Info */}
        <div className="text-center pt-4 border-t border-gray-700">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Shield className="h-3 w-3" />
            <span>Only EVM-compatible wallets supported</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Somnia is an Ethereum-compatible network
          </p>
        </div>
      </CardContent>
    </Card>
  )
}