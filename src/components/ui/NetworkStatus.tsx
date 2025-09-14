'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToastHelpers } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import {
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Globe,
  RefreshCw
} from 'lucide-react'

interface NetworkStatusProps {
  showDetails?: boolean
  className?: string
}

export function NetworkStatus({ showDetails = false, className }: NetworkStatusProps) {
  const { isConnected, chain, switchToSomnia, isSwitchingNetwork } = useWallet()
  const { error, success } = useToastHelpers()
  const [isOnline, setIsOnline] = useState(true)
  const [blockNumber, setBlockNumber] = useState<number | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Mock block number updates (in real app, this would come from a provider)
  useEffect(() => {
    if (isConnected && isOnline) {
      const interval = setInterval(() => {
        setBlockNumber(prev => (prev || 1000000) + Math.floor(Math.random() * 3) + 1)
        setLastUpdate(new Date())
      }, 12000) // Simulate 12s block time

      return () => clearInterval(interval)
    }
  }, [isConnected, isOnline])

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        status: 'offline',
        icon: WifiOff,
        label: 'Offline',
        color: 'text-error-400',
        bgColor: 'bg-error-500/10 border-error-500/20'
      }
    }

    if (!isConnected) {
      return {
        status: 'disconnected',
        icon: AlertTriangle,
        label: 'Wallet Disconnected',
        color: 'text-warning-400',
        bgColor: 'bg-warning-500/10 border-warning-500/20'
      }
    }

    if (chain?.id !== 50312) {
      return {
        status: 'wrong-network',
        icon: Globe,
        label: 'Wrong Network',
        color: 'text-warning-400',
        bgColor: 'bg-warning-500/10 border-warning-500/20'
      }
    }

    return {
      status: 'connected',
      icon: CheckCircle,
      label: 'Connected to Somnia',
      color: 'text-success-400',
      bgColor: 'bg-success-500/10 border-success-500/20'
    }
  }

  const handleNetworkSwitch = async () => {
    try {
      await switchToSomnia()
      success('Successfully switched to Somnia Network')
    } catch (err) {
      error('Failed to switch network', 'Please try again or switch manually')
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  if (!showDetails) {
    return (
      <div className={cn('flex items-center gap-2 text-sm', className)}>
        <StatusIcon className={cn('h-3 w-3', statusInfo.color)} />
        <span className={statusInfo.color}>{statusInfo.label}</span>
        {statusInfo.status === 'connected' && blockNumber && (
          <div className="flex items-center gap-1 text-text-tertiary">
            <span>•</span>
            <span>#{blockNumber.toLocaleString()}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={cn('border', statusInfo.bgColor, className)} variant="elevated">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', statusInfo.bgColor)}>
              <StatusIcon className={cn('h-5 w-5', statusInfo.color)} />
            </div>
            <div>
              <h3 className="font-medium text-text-primary">Network Status</h3>
              <p className={cn('text-sm', statusInfo.color)}>{statusInfo.label}</p>
            </div>
          </div>

          {statusInfo.status === 'wrong-network' && (
            <Button
              size="sm"
              onClick={handleNetworkSwitch}
              disabled={isSwitchingNetwork}
              className="bg-gradient-to-r from-primary-500 to-secondary-500"
            >
              {isSwitchingNetwork ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                  Switching...
                </>
              ) : (
                <>
                  <Zap className="h-3 w-3 mr-2" />
                  Switch Network
                </>
              )}
            </Button>
          )}
        </div>

        {/* Network Details */}
        {statusInfo.status === 'connected' && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-secondary">
            <div>
              <div className="text-xs text-text-tertiary">Network</div>
              <div className="text-sm font-medium text-text-primary">
                {chain?.name || 'Somnia'}
              </div>
            </div>

            <div>
              <div className="text-xs text-text-tertiary">Chain ID</div>
              <div className="text-sm font-medium text-text-primary">
                {chain?.id || 50312}
              </div>
            </div>

            {blockNumber && (
              <>
                <div>
                  <div className="text-xs text-text-tertiary">Block Height</div>
                  <div className="text-sm font-medium text-text-primary">
                    #{blockNumber.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-text-tertiary">Last Update</div>
                  <div className="text-sm font-medium text-text-primary flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {lastUpdate.toLocaleTimeString()}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Connection Issues Help */}
        {statusInfo.status !== 'connected' && (
          <div className="pt-4 border-t border-border-secondary">
            <div className="text-xs text-text-tertiary space-y-1">
              {statusInfo.status === 'offline' && (
                <p>Check your internet connection and try again.</p>
              )}
              {statusInfo.status === 'disconnected' && (
                <p>Connect your wallet to access all features.</p>
              )}
              {statusInfo.status === 'wrong-network' && (
                <p>Switch to Somnia Network to use all platform features.</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Compact version for mobile or sidebars
export function CompactNetworkStatus({ className }: { className?: string }) {
  return <NetworkStatus showDetails={false} className={className} />
}

// Detailed version for dashboards
export function DetailedNetworkStatus({ className }: { className?: string }) {
  return <NetworkStatus showDetails={true} className={className} />
}