'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { AchievementCard } from './AchievementCard'
import { useAchievements } from '@/hooks/useAchievements'
import { useUser } from '@/contexts/UserContext'
import {
  Trophy,
  Target,
  Lock,
  Loader2,
  Sparkles,
  Award
} from 'lucide-react'

export function AchievementGrid() {
  const { user } = useUser()
  const {
    achievements,
    achievementDefinitions,
    isLoading,
    checkFirstPostAchievement,
    checkFirstDonationAchievement,
    checkFollowerMilestoneAchievement
  } = useAchievements()

  // Automatically check for achievements when component mounts
  React.useEffect(() => {
    if (user && achievements) {
      checkFirstPostAchievement()
      checkFirstDonationAchievement()
      checkFollowerMilestoneAchievement(10)
      checkFollowerMilestoneAchievement(50)
      checkFollowerMilestoneAchievement(100)
    }
  }, [user, achievements, checkFirstPostAchievement, checkFirstDonationAchievement, checkFollowerMilestoneAchievement])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-500" />
          <p className="text-text-secondary">Loading achievements...</p>
        </CardContent>
      </Card>
    )
  }

  const earnedAchievements = achievements.filter(a => a)
  const availableAchievements = Object.entries(achievementDefinitions).filter(
    ([key]) => !achievements.some(a => a.achievement_type === key)
  )

  const getProgressForAchievement = (type: string) => {
    switch (type) {
      case 'first_post':
        return { current: user?.posts_count || 0, required: 1 }
      case 'first_donation':
        return { current: user?.total_donations_received ? 1 : 0, required: 1 }
      case '10_followers':
        return { current: user?.followers_count || 0, required: 10 }
      case '50_followers':
        return { current: user?.followers_count || 0, required: 50 }
      case '100_followers':
        return { current: user?.followers_count || 0, required: 100 }
      default:
        return { current: 0, required: 1 }
    }
  }

  return (
    <div className="space-y-8">
      {/* Stats Header */}
      <Card className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border-primary-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <Award className="h-6 w-6 text-primary-400" />
            </div>
            Achievement Collection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gradient">
                {earnedAchievements.length}
              </div>
              <div className="text-sm text-text-tertiary">Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gradient">
                {earnedAchievements.filter(a => a.metadata.nft_minted).length}
              </div>
              <div className="text-sm text-text-tertiary">NFTs Minted</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gradient">
                {earnedAchievements.filter(a => a.metadata.rarity === 'rare' || a.metadata.rarity === 'epic' || a.metadata.rarity === 'legendary').length}
              </div>
              <div className="text-sm text-text-tertiary">Rare+</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gradient">
                {Object.keys(achievementDefinitions).length}
              </div>
              <div className="text-sm text-text-tertiary">Total Available</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earned Achievements */}
      {earnedAchievements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <h2 className="text-xl font-semibold text-text-primary">
              Your Achievements
            </h2>
            <Badge variant="secondary" className="ml-2">
              {earnedAchievements.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {earnedAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {/* Available Achievements */}
      {availableAchievements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-text-primary">
              Available Achievements
            </h2>
            <Badge variant="outline" className="ml-2">
              {availableAchievements.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableAchievements.map(([key, definition]) => {
              const progress = getProgressForAchievement(key)
              const isCompleted = progress.current >= progress.required
              const progressPercentage = Math.min((progress.current / progress.required) * 100, 100)

              return (
                <Card
                  key={key}
                  className={`transition-all duration-200 ${
                    isCompleted ? 'border-green-500/50 bg-green-500/5' : 'border-gray-700 bg-gray-900/50'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl ${
                            isCompleted ? 'bg-green-500/20' : 'bg-gray-700/50'
                          }`}>
                            {isCompleted ? (
                              <Sparkles className="h-6 w-6 text-green-400" />
                            ) : (
                              <Lock className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-text-primary">
                              {definition.name}
                            </h3>
                            <p className="text-sm text-text-tertiary">
                              {definition.icon} {definition.rarity}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-text-secondary text-sm">
                        {definition.description}
                      </p>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-text-tertiary">Progress</span>
                          <span className={isCompleted ? 'text-green-400' : 'text-text-secondary'}>
                            {progress.current}/{progress.required}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isCompleted ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        {isCompleted && (
                          <p className="text-xs text-green-400 text-center">
                            Achievement unlocked! Check back soon.
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {earnedAchievements.length === 0 && availableAchievements.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p className="text-text-secondary text-lg">No achievements available yet</p>
            <p className="text-text-muted text-sm mt-2">
              Start engaging with the platform to unlock achievements!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}