'use client'

import { DashboardLayout } from '@/components/layout/AppLayout'
import { Section, Stack } from '@/components/ui/Container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import {
  Trophy,
  Star,
  Crown,
  Zap,
  Target,
  Medal,
  Award,
  Gem,
  Shield,
  Sword,
  GamepadIcon,
  TrendingUp,
  Users,
  MessageSquare,
  Heart,
  Share
} from 'lucide-react'
import { useState } from 'react'

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', name: 'All Achievements', icon: Trophy },
    { id: 'gaming', name: 'Gaming', icon: GamepadIcon },
    { id: 'social', name: 'Social', icon: Users },
    { id: 'content', name: 'Content', icon: MessageSquare },
    { id: 'community', name: 'Community', icon: Heart },
    { id: 'rare', name: 'Rare & Legendary', icon: Crown }
  ]

  const achievements = [
    {
      id: 1,
      name: 'First Steps',
      description: 'Welcome to Zapp! You\'ve successfully created your account.',
      category: 'social',
      rarity: 'common',
      points: 10,
      unlocked: true,
      unlockedDate: '2024-01-15',
      icon: Star,
      color: 'from-blue-400 to-blue-600',
      progress: 100,
      requirement: 'Create your first account'
    },
    {
      id: 2,
      name: 'Content Creator',
      description: 'Share your first gaming moment with the community.',
      category: 'content',
      rarity: 'common',
      points: 25,
      unlocked: true,
      unlockedDate: '2024-01-16',
      icon: MessageSquare,
      color: 'from-green-400 to-green-600',
      progress: 100,
      requirement: 'Create your first post'
    },
    {
      id: 3,
      name: 'Popular Post',
      description: 'Your post received 100+ likes from the community.',
      category: 'content',
      rarity: 'uncommon',
      points: 50,
      unlocked: false,
      icon: TrendingUp,
      color: 'from-yellow-400 to-yellow-600',
      progress: 75,
      requirement: 'Get 100 likes on a single post',
      currentProgress: 75,
      maxProgress: 100
    },
    {
      id: 4,
      name: 'Social Butterfly',
      description: 'Connect with other gamers by following 10 users.',
      category: 'social',
      rarity: 'common',
      points: 15,
      unlocked: false,
      icon: Users,
      color: 'from-purple-400 to-purple-600',
      progress: 60,
      requirement: 'Follow 10 users',
      currentProgress: 6,
      maxProgress: 10
    },
    {
      id: 5,
      name: 'Gaming Legend',
      description: 'Achieve victory in 50 different games.',
      category: 'gaming',
      rarity: 'epic',
      points: 200,
      unlocked: false,
      icon: Crown,
      color: 'from-orange-400 to-red-600',
      progress: 25,
      requirement: 'Win in 50 different games',
      currentProgress: 12,
      maxProgress: 50
    },
    {
      id: 6,
      name: 'NFT Pioneer',
      description: 'Mint your first achievement as an NFT on Somnia.',
      category: 'rare',
      rarity: 'rare',
      points: 100,
      unlocked: false,
      icon: Gem,
      color: 'from-pink-400 to-purple-600',
      progress: 0,
      requirement: 'Mint your first NFT achievement',
      currentProgress: 0,
      maxProgress: 1
    },
    {
      id: 7,
      name: 'Community Hero',
      description: 'Help grow the community by inviting 5 friends.',
      category: 'community',
      rarity: 'uncommon',
      points: 75,
      unlocked: false,
      icon: Shield,
      color: 'from-emerald-400 to-teal-600',
      progress: 40,
      requirement: 'Invite 5 friends to join Zapp',
      currentProgress: 2,
      maxProgress: 5
    },
    {
      id: 8,
      name: 'Master Strategist',
      description: 'Win 100 competitive matches across all games.',
      category: 'gaming',
      rarity: 'legendary',
      points: 500,
      unlocked: false,
      icon: Sword,
      color: 'from-red-400 to-orange-600',
      progress: 15,
      requirement: 'Win 100 competitive matches',
      currentProgress: 15,
      maxProgress: 100
    }
  ]

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(achievement => achievement.category === selectedCategory)

  const stats = {
    total: achievements.length,
    unlocked: achievements.filter(a => a.unlocked).length,
    totalPoints: achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0),
    rareUnlocked: achievements.filter(a => a.unlocked && (a.rarity === 'rare' || a.rarity === 'legendary')).length
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400'
      case 'uncommon': return 'text-green-400 border-green-400'
      case 'rare': return 'text-blue-400 border-blue-400'
      case 'epic': return 'text-purple-400 border-purple-400'
      case 'legendary': return 'text-yellow-400 border-yellow-400'
      default: return 'text-gray-400 border-gray-400'
    }
  }

  return (
    <DashboardLayout>
      <Stack gap="xl" className="animate-slideUp">
        {/* Header */}
        <Section spacing="lg">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full border border-gray-700">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-gray-300 text-sm font-medium">
                Achievement System
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gradient leading-tight">
              Your Gaming Legacy
            </h1>

            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Unlock achievements, earn points, and mint your gaming accomplishments as NFTs on the blockchain.
            </p>
          </div>
        </Section>

        {/* Stats Overview */}
        <Section>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-center border-gray-700 bg-gray-900/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Trophy className="h-8 w-8 text-yellow-500 mx-auto" />
                  <div className="text-2xl font-bold text-gradient">{stats.unlocked}/{stats.total}</div>
                  <div className="text-gray-400 text-sm">Achievements Unlocked</div>
                </div>
              </CardContent>
            </Card>
            <Card className="text-center border-gray-700 bg-gray-900/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Star className="h-8 w-8 text-blue-500 mx-auto" />
                  <div className="text-2xl font-bold text-gradient">{stats.totalPoints}</div>
                  <div className="text-gray-400 text-sm">Achievement Points</div>
                </div>
              </CardContent>
            </Card>
            <Card className="text-center border-gray-700 bg-gray-900/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Crown className="h-8 w-8 text-purple-500 mx-auto" />
                  <div className="text-2xl font-bold text-gradient">{stats.rareUnlocked}</div>
                  <div className="text-gray-400 text-sm">Rare Achievements</div>
                </div>
              </CardContent>
            </Card>
            <Card className="text-center border-gray-700 bg-gray-900/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Gem className="h-8 w-8 text-pink-500 mx-auto" />
                  <div className="text-2xl font-bold text-gradient">0</div>
                  <div className="text-gray-400 text-sm">NFTs Minted</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Category Filter */}
        <Section>
          <Card className="border-gray-700 bg-gray-900/50">
            <CardHeader>
              <CardTitle>Filter by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {category.name}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* Achievements Grid */}
        <Section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAchievements.map((achievement) => {
              const Icon = achievement.icon
              return (
                <Card
                  key={achievement.id}
                  className={`border-gray-700 transition-all duration-300 ${
                    achievement.unlocked
                      ? 'bg-gray-900/50 hover:bg-gray-900/70'
                      : 'bg-gray-900/30 hover:bg-gray-900/50 opacity-75'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Achievement Icon */}
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${achievement.color} ${
                        achievement.unlocked ? '' : 'opacity-50'
                      }`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>

                      {/* Achievement Details */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${
                              achievement.unlocked ? 'text-gray-200' : 'text-gray-400'
                            }`}>
                              {achievement.name}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`text-xs capitalize ${getRarityColor(achievement.rarity)}`}
                            >
                              {achievement.rarity}
                            </Badge>
                            <span className={`text-sm font-medium ${
                              achievement.unlocked ? 'text-blue-400' : 'text-gray-500'
                            }`}>
                              {achievement.points} pts
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm leading-relaxed">
                            {achievement.description}
                          </p>
                        </div>

                        {/* Progress Bar for Incomplete Achievements */}
                        {!achievement.unlocked && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">{achievement.requirement}</span>
                              <span className="text-gray-400">
                                {achievement.currentProgress || 0}/{achievement.maxProgress || 100}
                              </span>
                            </div>
                            <Progress
                              value={achievement.progress}
                              className="h-2 bg-gray-800"
                            />
                          </div>
                        )}

                        {/* Unlocked Date */}
                        {achievement.unlocked && achievement.unlockedDate && (
                          <div className="text-xs text-gray-500">
                            Unlocked on {achievement.unlockedDate}
                          </div>
                        )}

                        {/* Mint NFT Button for Unlocked Achievements */}
                        {achievement.unlocked && (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                          >
                            <Gem className="h-4 w-4 mr-2" />
                            Mint as NFT
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </Section>

        {/* Achievement Tips */}
        <Section>
          <Card className="border-gray-700 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
                Pro Tips for Achievement Hunters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-200">Quick Wins</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Complete your profile to unlock social achievements</li>
                    <li>• Share your first gaming moment for instant points</li>
                    <li>• Follow other gamers to build your network</li>
                    <li>• Engage with community posts through likes and comments</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-200">Rare Achievements</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Mint NFTs to unlock exclusive blockchain achievements</li>
                    <li>• Participate in tournaments for competitive badges</li>
                    <li>• Create viral content for legendary status</li>
                    <li>• Help grow the community through referrals</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>
      </Stack>
    </DashboardLayout>
  )
}