'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAccount } from 'wagmi'
import { Eye, EyeOff } from 'lucide-react'

interface WalletDebuggerProps {
  stream?: any
  post?: any
  className?: string
}

export function WalletDebugger({ stream, post, className }: WalletDebuggerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { address: userAddress, isConnected } = useAccount()

  if (process.env.NODE_ENV === 'production') {
    return null // Don't show in production
  }

  const debugData = {
    userWallet: {
      connected: isConnected,
      address: userAddress
    },
    streamData: stream ? {
      id: stream.id,
      title: stream.title,
      streamer_id: stream.streamer_id,
      users: stream.users,
      wallet_address: stream.users?.wallet_address
    } : null,
    postData: post ? {
      id: post.id,
      title: post.title || post.content?.slice(0, 50),
      user_id: post.user_id,
      author: post.author,
      wallet_address: post.author?.wallet_address
    } : null
  }

  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(true)}
        className={`fixed bottom-4 right-4 z-50 bg-red-500/20 text-red-600 hover:bg-red-500/30 ${className}`}
      >
        <Eye className="w-4 h-4 mr-2" />
        Debug Wallets
      </Button>
    )
  }

  return (
    <Card className={`fixed bottom-4 right-4 z-50 max-w-md bg-gray-900 text-white border-red-500 ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-red-400">🔍 Wallet Debug Info</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white"
          >
            <EyeOff className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3 text-xs">
          {/* User Wallet */}
          <div>
            <div className="text-blue-400 font-semibold">Your Wallet:</div>
            <div className="pl-2 text-gray-300">
              <div>Connected: {debugData.userWallet.connected ? '✅ Yes' : '❌ No'}</div>
              <div>Address: {debugData.userWallet.address || '❌ None'}</div>
            </div>
          </div>

          {/* Stream Data */}
          {debugData.streamData && (
            <div>
              <div className="text-purple-400 font-semibold">Stream Data:</div>
              <div className="pl-2 text-gray-300">
                <div>ID: {debugData.streamData.id || '❌ None'}</div>
                <div>Title: {debugData.streamData.title || '❌ None'}</div>
                <div>Users Object: {debugData.streamData.users ? '✅ Present' : '❌ Missing'}</div>
                <div>Wallet Address: {debugData.streamData.wallet_address || '❌ Missing'}</div>
                {debugData.streamData.users && (
                  <div className="mt-1 text-gray-400">
                    <div>Display Name: {debugData.streamData.users.display_name || 'None'}</div>
                    <div>Username: {debugData.streamData.users.username || 'None'}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Post Data */}
          {debugData.postData && (
            <div>
              <div className="text-green-400 font-semibold">Post Data:</div>
              <div className="pl-2 text-gray-300">
                <div>ID: {debugData.postData.id || '❌ None'}</div>
                <div>Title: {debugData.postData.title || '❌ None'}</div>
                <div>Author Object: {debugData.postData.author ? '✅ Present' : '❌ Missing'}</div>
                <div>Wallet Address: {debugData.postData.wallet_address || '❌ Missing'}</div>
                {debugData.postData.author && (
                  <div className="mt-1 text-gray-400">
                    <div>Display Name: {debugData.postData.author.display_name || 'None'}</div>
                    <div>Username: {debugData.postData.author.username || 'None'}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Issues Detection */}
          <div className="border-t border-gray-700 pt-2">
            <div className="text-yellow-400 font-semibold">Issues Detected:</div>
            <div className="pl-2 text-gray-300">
              {!debugData.userWallet.connected && <div>❌ User wallet not connected</div>}
              {debugData.streamData && !debugData.streamData.wallet_address && <div>❌ Stream creator has no wallet address</div>}
              {debugData.postData && !debugData.postData.wallet_address && <div>❌ Post author has no wallet address</div>}
              {debugData.userWallet.connected &&
               debugData.streamData?.wallet_address &&
               debugData.postData?.wallet_address &&
               <div>✅ All wallet addresses present</div>}
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-gray-700 text-xs text-gray-400">
          💡 Using Somnia testnet with STT tokens. If creator wallet addresses are missing, they need to update their profiles with wallet addresses.
        </div>
      </div>
    </Card>
  )
}

export default WalletDebugger