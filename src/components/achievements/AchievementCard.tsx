'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Achievement, useAchievements } from '@/hooks/useAchievements'
import { formatDistanceToNow } from 'date-fns'
import {
  Trophy,
  Gift,
  ExternalLink,
  Loader2,
  CheckCircle,
  Sparkles
} from 'lucide-react'
import { useToastHelpers } from '@/components/ui/Toast'

interface AchievementCardProps {
  achievement: Achievement
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const { mintNFT, isMinting } = useAchievements()
  const { success, error } = useToastHelpers()

  const handleMintNFT = async () => {
    try {
      await mintNFT({ achievementId: achievement.id })
      success('NFT Minted!', 'Your achievement NFT has been minted to your wallet')
    } catch (err) {
      error('Minting Failed', err instanceof Error ? err.message : 'Failed to mint NFT')
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500 bg-gray-500/10'
      case 'rare': return 'border-blue-500 bg-blue-500/10'
      case 'epic': return 'border-purple-500 bg-purple-500/10'
      case 'legendary': return 'border-yellow-500 bg-yellow-500/10'
      default: return 'border-gray-500 bg-gray-500/10'
    }
  }

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400'
      case 'rare': return 'text-blue-400'
      case 'epic': return 'text-purple-400'
      case 'legendary': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const isNFTMinted = achievement.metadata.nft_minted

  return (
    <Card className={`transition-all duration-200 ${getRarityColor(achievement.metadata.rarity)} hover:shadow-lg`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${getRarityColor(achievement.metadata.rarity)}`}>
                <Trophy className={`h-6 w-6 ${getRarityTextColor(achievement.metadata.rarity)}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {achievement.metadata.name}
                </h3>
                <p className="text-sm text-text-tertiary">
                  Earned {formatDistanceToNow(new Date(achievement.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`capitalize ${getRarityTextColor(achievement.metadata.rarity)} border-current`}
            >
              {achievement.metadata.rarity}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-text-secondary leading-relaxed">
            {achievement.metadata.description}
          </p>

          {/* NFT Status */}
          <div className="pt-4 border-t border-border-primary">
            {isNFTMinted ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-success-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">NFT Minted</span>
                </div>
                <div className="flex gap-2">
                  {achievement.metadata.nft_token_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Open NFT marketplace or explorer
                        window.open(`https://shannon-explorer.somnia.network/tx/${achievement.metadata.mint_transaction_hash}`, '_blank')
                      }}
                      className="text-xs"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View NFT
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-text-tertiary">
                  <Gift className="h-4 w-4" />
                  <span className="text-sm">Ready to mint as NFT</span>
                </div>
                <Button
                  onClick={handleMintNFT}
                  disabled={isMinting}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
                >
                  {isMinting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Minting NFT...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Mint as NFT
                    </>
                  )}
                </Button>
                <p className="text-xs text-text-muted text-center">
                  Mint your achievement as an NFT to showcase it in your wallet
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}