'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { useNitrolite } from '@/hooks/useNitrolite'
import { NETWORK_CONFIG } from '@/lib/nitroliteService'
import {
  Zap,
  Users,
  Clock,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react'

interface ChannelManagerProps {
  className?: string
}

export default function ChannelManager({ className }: ChannelManagerProps) {
  const { address, isConnected } = useAccount()
  const { showToast } = useToast()

  const {
    isInitialized,
    isConnecting,
    isConnected: nitroliteConnected,
    error,
    activeChannels,
    networkConfig,
    initialize,
    closeChannel,
    getChannelInfo,
    formatUSDC
  } = useNitrolite()

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [channelDetails, setChannelDetails] = useState<Map<string, any>>(new Map())

  // Initialize Nitrolite when component mounts
  useEffect(() => {
    if (isConnected && !isInitialized && !isConnecting) {
      initialize().catch(console.error)
    }
  }, [isConnected, isInitialized, isConnecting, initialize])

  // Refresh channel details
  const refreshChannelDetails = useCallback(async () => {
    if (!nitroliteConnected || activeChannels.length === 0) return

    setIsRefreshing(true)
    const newDetails = new Map()

    try {
      for (const channel of activeChannels) {
        const details = await getChannelInfo(channel.channelId)
        if (details) {
          newDetails.set(channel.channelId, details)
        }
      }
      setChannelDetails(newDetails)
    } catch (error) {
      console.error('Failed to refresh channel details:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [nitroliteConnected, activeChannels, getChannelInfo])

  // Auto-refresh channel details
  useEffect(() => {
    refreshChannelDetails()
    const interval = setInterval(refreshChannelDetails, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [refreshChannelDetails])

  // Handle channel closure
  const handleCloseChannel = async (channelId: string) => {
    try {
      await closeChannel(channelId)
      showToast({
        title: '⚡ Channel closed',
        description: 'Funds settled on-chain',
        type: 'success'
      })
      refreshChannelDetails()
    } catch (error: any) {
      showToast({
        title: 'Failed to close channel',
        description: error.message,
        type: 'error'
      })
    }
  }

  // Get status color and icon
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'opening':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          label: 'Opening'
        }
      case 'open':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          label: 'Active'
        }
      case 'closing':
        return {
          color: 'bg-orange-100 text-orange-800',
          icon: AlertTriangle,
          label: 'Closing'
        }
      case 'closed':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: XCircle,
          label: 'Closed'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: Activity,
          label: 'Unknown'
        }
    }
  }

  // Don't render if not connected
  if (!isConnected) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Connect wallet to manage channels</p>
      </Card>
    )
  }

  // Show initialization state
  if (!isInitialized && !error) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-gray-600">Initializing Nitrolite...</p>
      </Card>
    )
  }

  // Show error state
  if (error) {
    return (
      <Card className={`p-6 border-red-200 bg-red-50 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="font-semibold text-red-800 mb-2">Connection Error</h3>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <Button
            onClick={() => initialize()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Retry Connection
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Active Channels</h3>
              <p className="text-sm text-gray-600">
                {activeChannels.length} channel{activeChannels.length !== 1 ? 's' : ''} on {networkConfig.name}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={refreshChannelDetails}
            disabled={isRefreshing}
            className="text-purple-700 hover:text-purple-800 hover:bg-purple-100"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Connection Status */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Nitrolite Connected
            </span>
            <Badge className="bg-green-100 text-green-800 ml-auto">
              Ready
            </Badge>
          </div>
        </div>

        {/* Channels List */}
        <div className="space-y-3">
          {activeChannels.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">No active channels</p>
              <p className="text-sm text-gray-500">
                Create a channel by enabling tips or payments
              </p>
            </div>
          ) : (
            activeChannels.map((channel) => {
              const details = channelDetails.get(channel.channelId) || channel
              const statusDisplay = getStatusDisplay(details.status)
              const StatusIcon = statusDisplay.icon

              return (
                <Card key={channel.channelId} className="p-4 border border-gray-200 hover:border-purple-300 transition-colors">
                  <div className="space-y-3">
                    {/* Channel Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          details.context === 'streaming' ? 'bg-purple-100' : 'bg-blue-100'
                        }`}>
                          {details.context === 'streaming' ? (
                            <Activity className={`w-4 h-4 ${
                              details.context === 'streaming' ? 'text-purple-600' : 'text-blue-600'
                            }`} />
                          ) : (
                            <Users className={`w-4 h-4 ${
                              details.context === 'streaming' ? 'text-purple-600' : 'text-blue-600'
                            }`} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {details.context === 'streaming' ? 'Streaming Channel' : 'Post Channel'}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            {channel.channelId.slice(0, 10)}...{channel.channelId.slice(-6)}
                          </p>
                        </div>
                      </div>
                      <Badge className={statusDisplay.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusDisplay.label}
                      </Badge>
                    </div>

                    {/* Channel Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Wallet className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700 font-medium">Balance</span>
                        </div>
                        <p className="font-mono text-gray-800">
                          {formatUSDC(details.balance || 0n)}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700 font-medium">Total Tipped</span>
                        </div>
                        <p className="font-mono text-gray-800">
                          {formatUSDC(details.metadata?.totalTipped || 0n)}
                        </p>
                      </div>
                    </div>

                    {/* Participants */}
                    <div className="bg-blue-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Participants</h4>
                      <div className="space-y-1 text-xs">
                        {details.participants?.map((participant: string, index: number) => (
                          <div key={participant} className="flex items-center justify-between">
                            <span className="text-blue-700">
                              {index === 0 ? 'Creator' : 'Viewer'}:
                            </span>
                            <span className="font-mono text-blue-800">
                              {participant.slice(0, 6)}...{participant.slice(-4)}
                            </span>
                          </div>
                        )) || (
                          <div className="flex items-center justify-between">
                            <span className="text-blue-700">Loading...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Channel Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`${networkConfig.explorerUrl}/address/${channel.channelId}`, '_blank')}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Explorer
                      </Button>

                      {details.status === 'open' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCloseChannel(channel.channelId)}
                          className="text-orange-600 hover:text-orange-800 hover:bg-orange-100"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Close Channel
                        </Button>
                      )}

                      <div className="ml-auto">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {details.challengeDuration}s timeout
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>

        {/* Footer Stats */}
        {activeChannels.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-semibold text-gray-800">
                  {activeChannels.filter(ch => ch.status === 'open').length}
                </div>
                <div className="text-gray-600">Active</div>
              </div>
              <div>
                <div className="font-semibold text-gray-800">
                  {formatUSDC(activeChannels.reduce((total, ch) =>
                    total + (ch.metadata?.totalTipped || 0n), 0n
                  ))}
                </div>
                <div className="text-gray-600">Total Tipped</div>
              </div>
              <div>
                <div className="font-semibold text-gray-800">
                  {formatUSDC(activeChannels.reduce((total, ch) =>
                    total + (ch.balance || 0n), 0n
                  ))}
                </div>
                <div className="text-gray-600">Total Balance</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}