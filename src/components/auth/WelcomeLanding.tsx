'use client'

import React from 'react'
import { WalletSelector } from './WalletSelector'
import { Card, CardContent } from '@/components/ui/Card'
import { 
  Zap, 
  Users, 
  Trophy, 
  Coins, 
  Gamepad2,
  MessageSquare,
  TrendingUp,
  Star
} from 'lucide-react'

interface WelcomeLandingProps {
  onConnect?: () => void
}

export function WelcomeLanding({ onConnect }: WelcomeLandingProps) {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
      
      <div className="relative">
        {/* Hero Section */}
        <div className="container mx-auto px-4 pt-20 pb-16">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Logo & Title */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Zapp
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-gray-300 font-medium">
                The Next-Gen Web3 Social Platform for Gamers
              </p>
              <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Connect with the global gaming community, share your epic moments, 
                earn SOMI rewards, and collect exclusive achievement NFTs on the Somnia blockchain.
              </p>
            </div>

            {/* Connection CTA */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">
                  Connect Your Wallet to Get Started
                </h3>
                <WalletSelector onConnect={onConnect} />
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur hover:bg-gray-800/50 transition-all duration-300 hover:border-blue-500/30">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-blue-500/20 rounded-xl w-fit mx-auto mb-4">
                  <Gamepad2 className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Gaming Community</h3>
                <p className="text-gray-400 text-sm">
                  Connect with gamers worldwide. Share gameplay clips, strategies, and epic moments.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur hover:bg-gray-800/50 transition-all duration-300 hover:border-purple-500/30">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-purple-500/20 rounded-xl w-fit mx-auto mb-4">
                  <Coins className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Earn SOMI Rewards</h3>
                <p className="text-gray-400 text-sm">
                  Get rewarded for creating content and engaging with the community.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur hover:bg-gray-800/50 transition-all duration-300 hover:border-yellow-500/30">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-yellow-500/20 rounded-xl w-fit mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Achievement NFTs</h3>
                <p className="text-gray-400 text-sm">
                  Unlock exclusive NFT achievements for milestones and special actions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur hover:bg-gray-800/50 transition-all duration-300 hover:border-green-500/30">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-green-500/20 rounded-xl w-fit mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Social Features</h3>
                <p className="text-gray-400 text-sm">
                  Follow gamers, like posts, donate to creators, and build your network.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur hover:bg-gray-800/50 transition-all duration-300 hover:border-pink-500/30">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-pink-500/20 rounded-xl w-fit mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Trending Content</h3>
                <p className="text-gray-400 text-sm">
                  Discover what's hot in gaming with personalized feeds and trending posts.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur hover:bg-gray-800/50 transition-all duration-300 hover:border-indigo-500/30">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-indigo-500/20 rounded-xl w-fit mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Rich Media Posts</h3>
                <p className="text-gray-400 text-sm">
                  Share images, videos, and stories with IPFS-powered decentralized storage.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="border-t border-gray-800 bg-gray-900/30 backdrop-blur">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Join the Revolution
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Be part of the first Web3 social platform built specifically for the gaming community on Somnia.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  1M+
                </div>
                <div className="text-gray-400 text-sm">TPS on Somnia</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  &lt;$0.01
                </div>
                <div className="text-gray-400 text-sm">Transaction Cost</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  &lt;1s
                </div>
                <div className="text-gray-400 text-sm">Block Finality</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent mb-2">
                  100%
                </div>
                <div className="text-gray-400 text-sm">EVM Compatible</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-gray-400 text-sm">
              <p>© 2024 Zapp - Next-Gen Web3 Social Platform • Built on Somnia Network</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>Powered by decentralized technology</span>
                <Star className="h-4 w-4 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}