'use client'

import { WalletGuard } from '@/components/auth/WalletGuard'
import { useWallet } from '@/hooks/useWallet'
import { formatAddress } from '@/lib/web3'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Wallet, Settings, User, MessageSquare, Trophy } from 'lucide-react'

function DashboardContent() {
  const { address, disconnectWallet, chain } = useWallet()

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">Zapp</h1>
              <div className="text-sm text-gray-400">
                Next-gen social platform
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Wallet className="h-4 w-4" />
                {formatAddress(address || '')}
              </div>
              <div className="text-xs text-gray-500">
                {chain?.name}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={disconnectWallet}
              >
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Welcome to Zapp!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-400">
                  Your wallet is connected and you're ready to start using Zapp. 
                  This is a next-generation social platform for the Somnia ecosystem.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">
                    <MessageSquare className="h-4 w-4" />
                    Create Post
                  </Button>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4" />
                    Setup Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trophy className="h-4 w-4" />
                    View Achievements
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-gray-400">Wallet Address</div>
                <div className="font-mono text-xs">
                  {formatAddress(address || '', 6)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Network</div>
                <div className="text-sm">{chain?.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Status</div>
                <div className="text-sm text-green-400">Connected</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:bg-gray-800 transition-colors">
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                <h3 className="font-medium mb-1">Social Posts</h3>
                <p className="text-sm text-gray-400">Share gameplay and connect with gamers</p>
              </CardContent>
            </Card>
            
            <Card className="hover:bg-gray-800 transition-colors">
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                <h3 className="font-medium mb-1">NFT Achievements</h3>
                <p className="text-sm text-gray-400">Earn NFTs for milestones</p>
              </CardContent>
            </Card>
            
            <Card className="hover:bg-gray-800 transition-colors">
              <CardContent className="p-4 text-center">
                <Wallet className="h-8 w-8 mx-auto mb-2 text-green-400" />
                <h3 className="font-medium mb-1">Donations</h3>
                <p className="text-sm text-gray-400">Support creators with SOMI</p>
              </CardContent>
            </Card>
            
            <Card className="hover:bg-gray-800 transition-colors">
              <CardContent className="p-4 text-center">
                <Settings className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <h3 className="font-medium mb-1">Coming Soon</h3>
                <p className="text-sm text-gray-400">More features in development</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <WalletGuard>
      <DashboardContent />
    </WalletGuard>
  )
}