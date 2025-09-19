import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loader2, Sparkles } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface SimpleAchievementCardProps {
  achievement: unknown
  onMint: (id: string) => void
  isMinting: boolean
}

export function SimpleAchievementCard({
  achievement,
  onMint,
  isMinting
}: SimpleAchievementCardProps) {
  const metadata = achievement.metadata || {}

  return (
    <Card
      className="transition-all duration-200 hover:shadow-lg border-l-4 border-l-purple-500"
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <span className="text-2xl">{metadata.badge_icon || '🏆'}</span>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary">
                {metadata.name || achievement.achievement_type}
              </h4>
              <span className="text-sm text-text-tertiary capitalize">
                {metadata.category || 'general'}
              </span>
            </div>
          </div>

          <p className="text-text-secondary text-sm">
            {metadata.description || 'Achievement earned!'}
          </p>

          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>
              Earned {formatDistanceToNow(new Date(achievement.earned_at), { addSuffix: true })}
            </span>
            <span className="text-purple-400 capitalize">
              {metadata.rarity || 'common'}
            </span>
          </div>

          <Button
            onClick={() => onMint(achievement.id)}
            disabled={isMinting}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isMinting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Minting NFT...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Mint NFT
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}