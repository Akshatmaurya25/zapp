'use client'

import React, { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProfileSetup } from '@/components/profile/ProfileSetup'
import { AchievementGrid } from '@/components/achievements/AchievementGrid'
import { useUser } from '@/contexts/UserContext'
import { useWallet } from '@/hooks/useWallet'
import { useFaucet, useTestnetBalance } from '@/hooks/useFaucet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Loading, InlineLoading } from '@/components/ui/Loading'
import { Stack, Flex, Container, Section } from '@/components/ui/Container'
import { formatAddress } from '@/lib/web3'
import { formatNumber, cn } from '@/lib/utils'
import { NetworkInfoCard } from '@/components/ui/AddNetworkButton'
import {
  User,
  Edit3,
  Calendar,
  Users,
  Heart,
  MessageSquare,
  Trophy,
  Wallet,
  Coins,
  Zap,
  ExternalLink,
  Copy,
  Droplets,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

function TestnetFaucetCard() {
  const { address } = useWallet()
  const { requestTokens, getFaucetStatus, getFormattedCooldown, isRequesting, error, clearError } = useFaucet()
  const { balance, isLoading: isCheckingBalance, checkBalance, hasBalance, error: balanceError } = useTestnetBalance()
  const [lastRequest, setLastRequest] = useState<Date | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const faucetStatus = getFaucetStatus()
  const cooldownText = getFormattedCooldown()

  const handleRequestTokens = async () => {
    try {
      clearError()
      setSuccess(null)
      const result = await requestTokens()
      setLastRequest(new Date())
      setSuccess(`Successfully received ${result.amount} STT! Transaction: ${result.txHash?.slice(0, 8)}...`)
      // Refresh balance after successful request
      setTimeout(() => checkBalance(), 2000)
    } catch (err) {
      console.error('Faucet request failed:', err)
    }
  }

  const handleOpenOfficialFaucet = () => {
    window.open('https://testnet.somnia.network/', '_blank', 'noopener,noreferrer')
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Droplets className="h-4 w-4 text-blue-400" />
          Somnia Testnet Faucet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">STT Balance</div>
            <div className="flex items-center gap-2">
              {isCheckingBalance ? (
                <InlineLoading size="sm" />
              ) : (
                <div className="text-lg font-bold text-white">{balance}</div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={checkBalance}
                className="h-auto p-1 text-gray-400 hover:text-white"
                disabled={isCheckingBalance}
              >
                <Zap className="h-3 w-3" />
              </Button>
            </div>
            {balanceError && (
              <div className="text-xs text-red-400 mt-1">
                Balance check failed
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleRequestTokens}
              disabled={!faucetStatus.canRequest || isRequesting || !address}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
              size="sm"
            >
              {isRequesting ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Requesting...
                </>
              ) : faucetStatus.canRequest ? (
                <>
                  <Droplets className="h-3 w-3 mr-2" />
                  Request Tokens
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 mr-2" />
                  Cooldown
                </>
              )}
            </Button>

            <Button
              onClick={handleOpenOfficialFaucet}
              variant="outline"
              size="sm"
              className="text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            >
              <ExternalLink className="h-3 w-3 mr-2" />
              Official Faucet
            </Button>
          </div>
        </div>

        {!faucetStatus.canRequest && cooldownText && (
          <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-400/10 p-2 rounded-lg">
            <Clock className="h-3 w-3" />
            {cooldownText}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 p-2 rounded-lg">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 p-2 rounded-lg">
            <CheckCircle className="h-3 w-3" />
            {success}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <div>• Get free STT tokens for testing on Somnia testnet</div>
          <div>• One request per 24 hours (integrated faucets)</div>
          <div>• Use Official Faucet button for direct access</div>
          <div>• Tokens are required for blockchain transactions</div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileContent() {
  const { user } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'achievements'>('profile')

  if (!user) return null

  if (isEditing) {
    return (
      <ProfileSetup
        existingUser={true}
        onComplete={() => setIsEditing(false)}
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Enhanced Header */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-3xl blur-3xl" />
        <div className="relative bg-glass-card rounded-3xl p-8 border border-primary-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl shadow-glow">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gradient animate-gradient-shift">
                  Your Profile
                </h1>
                <p className="text-text-tertiary mt-1">Manage your gaming identity</p>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-glow hover-lift"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="cyber-card hover-lift">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <Avatar className="h-24 w-24 mx-auto border-2 border-primary-500/30 shadow-glow">
                    {user.avatar_ipfs ? (
                      <AvatarImage
                        src={`https://gateway.pinata.cloud/ipfs/${user.avatar_ipfs}`}
                        alt={user.display_name || user.username || 'User avatar'}
                      />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-r from-primary-500 to-secondary-500">
                        <User className="h-12 w-12 text-white" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {user.is_verified && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-gray-900">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-gradient flex items-center justify-center gap-2">
                      {user.display_name}
                    </h2>
                    <p className="text-primary-400 font-medium">@{user.username}</p>
                  </div>
                  {user.bio && (
                    <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
                      <p className="text-gray-300 text-sm leading-relaxed">{user.bio}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-700/50">
                  <div className="text-center p-3 bg-primary-500/5 rounded-lg border border-primary-500/10">
                    <div className="text-2xl font-bold text-gradient">
                      {user.followers_count}
                    </div>
                    <div className="text-sm text-text-tertiary">Followers</div>
                  </div>
                  <div className="text-center p-3 bg-secondary-500/5 rounded-lg border border-secondary-500/10">
                    <div className="text-2xl font-bold text-gradient">
                      {user.following_count}
                    </div>
                    <div className="text-sm text-text-tertiary">Following</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Wallet Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs text-gray-400">Address</div>
                <div className="font-mono text-sm text-white flex items-center gap-2">
                  {formatAddress(user.wallet_address, 6)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(user.wallet_address)}
                    className="h-auto p-1 text-gray-400 hover:text-white"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Joined</div>
                <div className="text-sm text-white flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          <TestnetFaucetCard />

          <NetworkInfoCard className="mt-6" />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                <div className="text-xl font-bold text-white">
                  {user.posts_count}
                </div>
                <div className="text-xs text-gray-400">Posts</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="h-6 w-6 mx-auto mb-2 text-red-400" />
                <div className="text-xl font-bold text-white">
                  {user.total_likes_received}
                </div>
                <div className="text-xs text-gray-400">Likes</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
                <div className="text-xl font-bold text-white">
                  {user.achievements_count}
                </div>
                <div className="text-xs text-gray-400">Achievements</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-green-400" />
                <div className="text-xl font-bold text-white">
                  {user.total_donations_received}
                </div>
                <div className="text-xs text-gray-400">SOMI Earned</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm mt-2">Start posting to see your activity here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <AppLayout>
      <ProfileContent />
    </AppLayout>
  )
}