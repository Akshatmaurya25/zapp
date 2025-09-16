import { WalletConnect } from '@/components/auth/WalletConnect'
import {
  Zap,
  Trophy,
  Users,
  MessageSquare,
  Coins,
  Shield,
  Gamepad2,
  Sparkles,
  TrendingUp,
  Gift
} from 'lucide-react'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(124, 93, 250, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(124, 93, 250, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite'
          }}
        />
      </div>

      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-full blur-3xl animate-glow-pulse" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-green-500/15 to-blue-500/15 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-pink-500/15 to-purple-500/15 rounded-full blur-2xl animate-float delay-1000" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Hero Content */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
          <div className="max-w-2xl text-center lg:text-left space-y-8">
            {/* Enhanced Logo */}
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl blur-lg opacity-50 animate-glow-pulse" />
                <div className="relative p-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl shadow-2xl border border-white/10">
                  <Zap className="h-10 w-10 text-white animate-bounce" />
                </div>
              </div>
              <div className="text-left">
                <span className="text-4xl lg:text-5xl font-black text-gradient bg-gradient-to-r from-primary-400 via-secondary-400 to-green-400 bg-clip-text text-transparent animate-gradient-shift">
                  Zapp
                </span>
                <div className="text-sm text-primary-300 font-medium tracking-widest uppercase">
                  Gaming • Social • Web3
                </div>
              </div>
            </div>

            {/* Enhanced Hero Text */}
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-8xl font-black leading-tight tracking-tight">
                <div className="relative">
                  <span className="text-white drop-shadow-2xl">The Future of</span>
                  <div className="absolute top-0 left-0 text-white opacity-20 blur-sm">The Future of</div>
                </div>
                <br />
                <div className="relative mt-4">
                  <span className="text-gradient bg-gradient-to-r from-primary-400 via-secondary-400 via-green-400 to-blue-400 bg-clip-text text-transparent animate-gradient-shift">
                    Gaming Social
                  </span>
                  <div className="absolute top-0 left-0 bg-gradient-to-r from-primary-400 via-secondary-400 via-green-400 to-blue-400 bg-clip-text text-transparent opacity-30 blur-sm animate-gradient-shift">
                    Gaming Social
                  </div>
                </div>
              </h1>
              <div className="space-y-4">
                <p className="text-2xl lg:text-3xl text-gray-100 leading-relaxed font-light">
                  Connect, compete, and earn in the ultimate
                </p>
                <p className="text-xl lg:text-2xl text-primary-200 leading-relaxed">
                  <span className="text-gradient bg-gradient-to-r from-secondary-400 to-green-400 bg-clip-text text-transparent font-semibold">
                    Web3 gaming community
                  </span>
                </p>
                <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
                  Share achievements • Mint NFTs • Build your digital legacy • Earn rewards
                </p>
              </div>
            </div>

            {/* Enhanced Features Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
              {[
                { icon: Trophy, title: 'Earn NFT Badges', desc: 'Achievement system', color: 'from-yellow-400 to-orange-500' },
                { icon: Users, title: 'Gaming Community', desc: 'Connect with gamers', color: 'from-blue-400 to-purple-500' },
                { icon: Shield, title: 'Blockchain Verified', desc: 'Somnia Network', color: 'from-green-400 to-emerald-500' },
                { icon: MessageSquare, title: 'Social Posts', desc: 'Share your victories', color: 'from-purple-400 to-pink-500' },
                { icon: Coins, title: 'Earn Rewards', desc: 'SOMI tokens', color: 'from-emerald-400 to-green-500' },
                { icon: TrendingUp, title: 'Trending Feed', desc: 'Discover content', color: 'from-pink-400 to-red-500' }
              ].map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-all duration-500" style={{background: `linear-gradient(135deg, var(--tw-gradient-stops))`}} />
                    <div className="relative bg-glass-card rounded-2xl p-6 border border-white/10 hover-lift group transition-all duration-300 hover:border-white/20">
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6 text-white group-hover:animate-bounce" />
                      </div>
                      <p className="text-base font-semibold text-white mb-2 group-hover:text-gradient transition-colors duration-300">
                        {feature.title}
                      </p>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Enhanced Stats */}
            <div className="flex justify-center lg:justify-start gap-8 lg:gap-12 text-center pt-12 mt-12 border-t border-gradient-to-r from-primary-500/20 via-secondary-500/20 to-green-500/20">
              {[
                { value: '2.5K+', label: 'Active Gamers', icon: '🎮' },
                { value: '12K+', label: 'Posts Created', icon: '📝' },
                { value: '1.2K+', label: 'NFTs Minted', icon: '🏆' },
                { value: '50K+', label: 'SOMI Earned', icon: '💰' }
              ].map((stat, index) => (
                <div key={index} className="group">
                  <div className="text-xs mb-1 opacity-60">{stat.icon}</div>
                  <div className="text-3xl lg:text-4xl font-black text-gradient bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent group-hover:animate-pulse">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-300 font-medium mt-1 group-hover:text-white transition-colors duration-300">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Wallet Connection */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-lg">
            {/* Enhanced Connection Card */}
            <div className="relative">
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-green-500/20 rounded-3xl blur-2xl animate-glow-pulse" />

              <div className="relative bg-glass-card rounded-3xl p-10 shadow-2xl border border-white/20 backdrop-blur-xl">
                <div className="text-center space-y-8">
                  {/* Enhanced Badge */}
                  <div className="relative inline-flex">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full blur-md opacity-30 animate-pulse" />
                    <div className="relative inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-full border border-primary-400/30 backdrop-blur-sm">
                      <Sparkles className="h-5 w-5 text-primary-300 animate-spin-slow" />
                      <span className="text-sm text-primary-200 font-semibold tracking-wide uppercase">
                        Join the Revolution
                      </span>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    </div>
                  </div>

                  {/* Enhanced Title */}
                  <div className="space-y-4">
                    <h2 className="text-3xl lg:text-4xl font-black text-gradient bg-gradient-to-r from-white via-primary-200 to-secondary-200 bg-clip-text text-transparent">
                      Connect Your Wallet
                    </h2>
                    <p className="text-lg text-gray-300 leading-relaxed">
                      Enter the next generation of
                      <span className="text-gradient bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent font-semibold"> Web3 gaming</span>
                    </p>
                  </div>

                  {/* Wallet Connect Component */}
                  <div className="relative">
                    <WalletConnect />
                  </div>

                  {/* Enhanced Security Badge */}
                  <div className="pt-8 border-t border-gradient-to-r from-transparent via-gray-600/50 to-transparent">
                    <div className="flex items-center justify-center gap-3 text-sm">
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20">
                        <Shield className="h-4 w-4 text-green-400" />
                        <span className="text-green-300 font-medium">Secured by Somnia</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 max-w-xs mx-auto leading-relaxed">
                      Your wallet and data are protected by military-grade encryption
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Additional Info */}
            <div className="mt-10 space-y-6">
              {/* Network Status */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 border border-green-500/30 rounded-2xl backdrop-blur-sm">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                    <div className="absolute top-0 left-0 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                  </div>
                  <span className="text-sm text-green-300 font-semibold">
                    Somnia Testnet Active
                  </span>
                  <div className="text-xs text-green-400/60">✓ Ready
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-2 p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span className="text-gray-300">Instant Setup</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  <span className="text-gray-300">Zero Gas Fees</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-gray-300">Secure & Private</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                  <span className="text-gray-300">NFT Ready</span>
                </div>
              </div>

              {/* Legal Text */}
              <div className="text-center">
                <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                  By connecting, you agree to our
                  <span className="text-primary-400 hover:text-primary-300 cursor-pointer"> Terms of Service</span> and
                  <span className="text-primary-400 hover:text-primary-300 cursor-pointer"> Privacy Policy</span>.
                  All transactions are secured on-chain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-green-400" />
    </div>
  )
}