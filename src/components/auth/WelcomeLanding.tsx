'use client'

import React, { useEffect, useState } from 'react'
import { WalletSelector } from './WalletSelector'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import {
  Zap,
  Users,
  Trophy,
  Coins,
  Gamepad2,
  MessageSquare,
  TrendingUp,
  Star,
  Shield,
  Sparkles,
  ArrowRight,
  Play,
  Globe,
  Lock,
  Rocket,
  ChevronDown,
  Activity
} from 'lucide-react'

interface WelcomeLandingProps {
  onConnect?: () => void
}

export function WelcomeLanding({ onConnect }: WelcomeLandingProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    { text: "Share Epic Gaming Moments", icon: Gamepad2, color: "from-blue-500 to-cyan-500" },
    { text: "Earn SOMI Rewards", icon: Coins, color: "from-yellow-500 to-orange-500" },
    { text: "Collect NFT Achievements", icon: Trophy, color: "from-purple-500 to-pink-500" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />

        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 pt-20 pb-16">
          <div className={cn(
            "text-center space-y-12 max-w-6xl mx-auto transition-all duration-1000",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}>
            {/* Logo & Title */}
            <div className="space-y-8">
              <div className="flex items-center justify-center gap-4 group">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-2xl shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-110">
                    <Zap className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
                </div>
                <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent tracking-tight">
                  Zapp
                </h1>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl md:text-4xl font-bold text-white/90">
                  The Ultimate Web3 Gaming Social Hub
                </h2>

                {/* Dynamic Feature Display */}
                <div className="h-16 flex items-center justify-center">
                  {features.map((feature, index) => {
                    const Icon = feature.icon
                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center gap-3 text-xl md:text-2xl font-semibold transition-all duration-500 absolute",
                          currentFeature === index
                            ? "opacity-100 translate-y-0 scale-100"
                            : "opacity-0 translate-y-4 scale-95"
                        )}
                      >
                        <div className={cn("p-2 rounded-xl bg-gradient-to-r", feature.color)}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                          {feature.text}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Join the future of gaming social networks. Connect with players worldwide, share your victories, earn crypto rewards, and collect unique NFT achievements—all powered by Somnia's lightning-fast blockchain.
                </p>
              </div>
            </div>

            {/* Connection CTA */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                  <Rocket className="h-8 w-8 text-yellow-400" />
                  Ready to Level Up?
                </h3>
                <WalletSelector onConnect={onConnect} />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-8">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    1M+
                  </div>
                  <div className="text-sm text-gray-400">TPS</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    &lt;$0.01
                  </div>
                  <div className="text-sm text-gray-400">Gas Fees</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    &lt;1s
                  </div>
                  <div className="text-sm text-gray-400">Finality</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    100%
                  </div>
                  <div className="text-sm text-gray-400">EVM</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-4 pb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose Zapp?
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Experience the next generation of gaming social platforms with cutting-edge Web3 features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

            <Card className="group border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl hover:bg-slate-700/50 transition-all duration-500 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="relative mb-6">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl w-fit mx-auto shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-110">
                    <Gamepad2 className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">Gaming Community</h3>
                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                  Connect with millions of gamers worldwide. Share epic moments, strategies, and build lasting friendships.
                </p>
              </CardContent>
            </Card>

            <Card className="group border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl hover:bg-slate-700/50 transition-all duration-500 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="relative mb-6">
                  <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl w-fit mx-auto shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-110">
                    <Coins className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">Earn SOMI Rewards</h3>
                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                  Get rewarded for creating quality content and engaging with the community. Turn your passion into profit.
                </p>
              </CardContent>
            </Card>

            <Card className="group border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl hover:bg-slate-700/50 transition-all duration-500 hover:border-yellow-500/50 hover:shadow-2xl hover:shadow-yellow-500/10 hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="relative mb-6">
                  <div className="p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl w-fit mx-auto shadow-lg shadow-yellow-500/25 group-hover:shadow-yellow-500/40 transition-all duration-300 group-hover:scale-110">
                    <Trophy className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-300 transition-colors">Achievement NFTs</h3>
                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                  Unlock exclusive NFT achievements for milestones and special actions. Build your digital trophy collection.
                </p>
              </CardContent>
            </Card>

            <Card className="group border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl hover:bg-slate-700/50 transition-all duration-500 hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="relative mb-6">
                  <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl w-fit mx-auto shadow-lg shadow-green-500/25 group-hover:shadow-green-500/40 transition-all duration-300 group-hover:scale-110">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-green-300 transition-colors">Blockchain Security</h3>
                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                  Your content is secure and verifiable on Somnia blockchain. True ownership of your digital assets.
                </p>
              </CardContent>
            </Card>

            <Card className="group border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl hover:bg-slate-700/50 transition-all duration-500 hover:border-pink-500/50 hover:shadow-2xl hover:shadow-pink-500/10 hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="relative mb-6">
                  <div className="p-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl w-fit mx-auto shadow-lg shadow-pink-500/25 group-hover:shadow-pink-500/40 transition-all duration-300 group-hover:scale-110">
                    <TrendingUp className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-pink-300 transition-colors">Trending Discovery</h3>
                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                  Discover what's hot in gaming with AI-powered feeds and personalized recommendations.
                </p>
              </CardContent>
            </Card>

            <Card className="group border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl hover:bg-slate-700/50 transition-all duration-500 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="relative mb-6">
                  <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl w-fit mx-auto shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300 group-hover:scale-110">
                    <Globe className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">Decentralized Media</h3>
                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                  Share images, videos, and stories with IPFS-powered decentralized storage. Your content, forever.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="border-t border-slate-700/30 bg-slate-900/50 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Join the Gaming Revolution?
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Be part of the first Web3 social platform built specifically for the gaming community on Somnia's ultra-fast blockchain.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={onConnect}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  Connect Wallet & Start Gaming
                </Button>
                <p className="text-sm text-gray-400">
                  Free to join • No gas fees for basic features
                </p>
              </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="text-center group">
                <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:bg-slate-700/50 hover:shadow-lg hover:shadow-blue-500/10">
                  <Activity className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    1M+
                  </div>
                  <div className="text-gray-400 text-sm font-medium">TPS on Somnia</div>
                  <div className="text-gray-500 text-xs mt-1">Lightning Fast</div>
                </div>
              </div>
              <div className="text-center group">
                <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-green-500/50 transition-all duration-300 hover:bg-slate-700/50 hover:shadow-lg hover:shadow-green-500/10">
                  <Coins className="h-8 w-8 text-green-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                    &lt;$0.01
                  </div>
                  <div className="text-gray-400 text-sm font-medium">Gas Fees</div>
                  <div className="text-gray-500 text-xs mt-1">Ultra Low Cost</div>
                </div>
              </div>
              <div className="text-center group">
                <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:bg-slate-700/50 hover:shadow-lg hover:shadow-purple-500/10">
                  <Zap className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    &lt;1s
                  </div>
                  <div className="text-gray-400 text-sm font-medium">Finality</div>
                  <div className="text-gray-500 text-xs mt-1">Instant Confirm</div>
                </div>
              </div>
              <div className="text-center group">
                <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 hover:bg-slate-700/50 hover:shadow-lg hover:shadow-orange-500/10">
                  <Shield className="h-8 w-8 text-orange-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                    100%
                  </div>
                  <div className="text-gray-400 text-sm font-medium">EVM Compatible</div>
                  <div className="text-gray-500 text-xs mt-1">Full Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700/30 bg-slate-900">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Zapp</span>
              </div>
              <p className="text-gray-400 mb-6">
                © 2024 Zapp - The Ultimate Web3 Gaming Social Platform
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span>Built on Somnia Network</span>
                <span>•</span>
                <span>Powered by IPFS & Web3</span>
                <Sparkles className="h-4 w-4 text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}