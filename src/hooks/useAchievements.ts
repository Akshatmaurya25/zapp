'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/contexts/UserContext'

export interface Achievement {
  id: string
  user_id: string
  achievement_type: string
  metadata: {
    name: string
    description: string
    image_ipfs?: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    category: string
    nft_minted?: boolean
    nft_token_id?: string
    mint_transaction_hash?: string
  }
  created_at: string
  updated_at: string
}

export function useAchievements() {
  const { user } = useUser()
  const queryClient = useQueryClient()

  // Fetch user achievements
  const {
    data: achievements,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch achievements: ${error.message}`)
      }

      return data as Achievement[]
    },
    enabled: !!user?.id,
  })

  // Create achievement mutation
  const createAchievementMutation = useMutation({
    mutationFn: async ({ achievementType, metadata }: {
      achievementType: string
      metadata: Achievement['metadata']
    }): Promise<Achievement> => {
      if (!user?.id) {
        throw new Error('User must be logged in')
      }

      const { data, error } = await supabase
        .from('achievements')
        .insert([{
          user_id: user.id,
          achievement_type: achievementType,
          metadata,
        }])
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create achievement: ${error.message}`)
      }

      return data as Achievement
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
    },
  })

  // Mint NFT mutation
  const mintNFTMutation = useMutation({
    mutationFn: async ({ achievementId }: { achievementId: string }): Promise<Achievement> => {
      if (!user?.id) {
        throw new Error('User must be logged in')
      }

      // This would integrate with your NFT minting smart contract
      // For now, we'll just update the achievement metadata
      const mockTxHash = `0x${Date.now().toString(16)}`
      const mockTokenId = Date.now().toString()

      const { data, error } = await supabase
        .from('achievements')
        .update({
          metadata: {
            ...achievements?.find(a => a.id === achievementId)?.metadata,
            nft_minted: true,
            nft_token_id: mockTokenId,
            mint_transaction_hash: mockTxHash,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', achievementId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to mint NFT: ${error.message}`)
      }

      return data as Achievement
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
    },
  })

  // Check for and create specific achievements
  const checkFirstPostAchievement = useCallback(async () => {
    if (!user?.id) return

    // Check if user already has this achievement
    const existingAchievement = achievements?.find(a => a.achievement_type === 'first_post')
    if (existingAchievement) return

    // Check if user has any posts
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    if (error || !posts?.length) return

    // Create the achievement
    await createAchievementMutation.mutateAsync({
      achievementType: 'first_post',
      metadata: {
        name: 'Content Creator',
        description: 'Created your first post on Zapp',
        rarity: 'common',
        category: 'content',
        nft_minted: false,
      }
    })
  }, [user?.id, achievements, createAchievementMutation])

  const checkFirstDonationAchievement = useCallback(async () => {
    if (!user?.id) return

    // Check if user already has this achievement
    const existingAchievement = achievements?.find(a => a.achievement_type === 'first_donation')
    if (existingAchievement) return

    // Check if user has received any donations
    // This would check your donations table when implemented

    // Create the achievement (mock for now)
    await createAchievementMutation.mutateAsync({
      achievementType: 'first_donation',
      metadata: {
        name: 'Supporter Magnet',
        description: 'Received your first donation from the community',
        rarity: 'rare',
        category: 'social',
        nft_minted: false,
      }
    })
  }, [user?.id, achievements, createAchievementMutation])

  const checkFollowerMilestoneAchievement = useCallback(async (milestone: number) => {
    if (!user?.id) return

    const achievementType = `${milestone}_followers`
    const existingAchievement = achievements?.find(a => a.achievement_type === achievementType)
    if (existingAchievement) return

    // Check current follower count
    if ((user.followers_count || 0) >= milestone) {
      const rarityMap: Record<number, Achievement['metadata']['rarity']> = {
        10: 'common',
        50: 'rare',
        100: 'epic',
        500: 'legendary',
        1000: 'legendary'
      }

      await createAchievementMutation.mutateAsync({
        achievementType,
        metadata: {
          name: `${milestone} Followers`,
          description: `Reached ${milestone} followers milestone`,
          rarity: rarityMap[milestone] || 'common',
          category: 'social',
          nft_minted: false,
        }
      })
    }
  }, [user?.id, user?.followers_count, achievements, createAchievementMutation])

  // Achievement definitions for display
  const achievementDefinitions = {
    'first_post': {
      name: 'Content Creator',
      description: 'Create your first post on Zapp',
      icon: '📝',
      rarity: 'common' as const,
    },
    'first_donation': {
      name: 'Supporter Magnet',
      description: 'Receive your first donation',
      icon: '💰',
      rarity: 'rare' as const,
    },
    '10_followers': {
      name: 'Rising Star',
      description: 'Reach 10 followers',
      icon: '⭐',
      rarity: 'common' as const,
    },
    '50_followers': {
      name: 'Influencer',
      description: 'Reach 50 followers',
      icon: '🌟',
      rarity: 'rare' as const,
    },
    '100_followers': {
      name: 'Community Leader',
      description: 'Reach 100 followers',
      icon: '👑',
      rarity: 'epic' as const,
    },
  }

  return {
    // Data
    achievements: achievements || [],
    achievementDefinitions,

    // Loading states
    isLoading,
    isError,
    error: error?.message,

    // Actions
    createAchievement: createAchievementMutation.mutateAsync,
    mintNFT: mintNFTMutation.mutateAsync,
    refetch,

    // Achievement checkers
    checkFirstPostAchievement,
    checkFirstDonationAchievement,
    checkFollowerMilestoneAchievement,

    // Mutation states
    isCreating: createAchievementMutation.isPending,
    isMinting: mintNFTMutation.isPending,
  }
}