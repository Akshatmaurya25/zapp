'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/contexts/UserContext'

export function useSocial() {
  const { user } = useUser()
  const queryClient = useQueryClient()

  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: async ({ userId, isFollowing }: { userId: string; isFollowing: boolean }) => {
      if (!user) throw new Error('User must be logged in')

      const action = isFollowing ? 'unfollow' : 'follow'

      const response = await fetch('/api/follows/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          followingId: userId,
          action: action
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to toggle follow')
      }

      // Trigger achievement for first follow
      if (action === 'follow') {
        await triggerFirstFollowAchievement(user.id)
      }

      return !isFollowing
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['followers'] })
      queryClient.invalidateQueries({ queryKey: ['following'] })
    },
  })

  // Check if user is following another user
  const checkIsFollowing = async (targetUserId: string): Promise<boolean> => {
    if (!user || user.id === targetUserId) return false

    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking follow status:', error)
      return false
    }

    return !!data
  }

  // Get followers list
  const getFollowers = async (userId: string) => {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        follower_id,
        created_at,
        follower:users!follows_follower_id_fkey(
          id,
          username,
          display_name,
          avatar_ipfs,
          is_verified
        )
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to get followers: ${error.message}`)

    return data
  }

  // Get following list
  const getFollowing = async (userId: string) => {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        following_id,
        created_at,
        following:users!follows_following_id_fkey(
          id,
          username,
          display_name,
          avatar_ipfs,
          is_verified
        )
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to get following: ${error.message}`)

    return data
  }

  // Trigger first follow achievement
  const triggerFirstFollowAchievement = async (userId: string) => {
    try {
      // Check if user already has first follow achievement
      const { data: existingAchievement } = await supabase
        .from('achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_type', 'first_follow')
        .single()

      if (!existingAchievement) {
        // Create first follow achievement
        await supabase
          .from('achievements')
          .insert([{
            user_id: userId,
            achievement_type: 'first_follow',
            metadata: {
              name: 'Social Butterfly',
              description: 'Followed your first user on Zapp',
              image_ipfs: '', // Add default achievement image
              rarity: 'common',
              category: 'social'
            }
          }])
      }
    } catch (error) {
      console.error('Failed to create first follow achievement:', error)
    }
  }

  return {
    // Mutations
    followUser: followMutation.mutateAsync,
    isFollowing: followMutation.isPending,

    // Queries
    checkIsFollowing,
    getFollowers,
    getFollowing,

    // Utils
    canFollow: (targetUserId: string) => user && user.id !== targetUserId,
  }
}

// Hook for getting followers of a specific user
export function useFollowers(userId: string) {
  const { getFollowers } = useSocial()

  return useQuery({
    queryKey: ['followers', userId],
    queryFn: () => getFollowers(userId),
    enabled: !!userId,
  })
}

// Hook for getting who a user is following
export function useFollowing(userId: string) {
  const { getFollowing } = useSocial()

  return useQuery({
    queryKey: ['following', userId],
    queryFn: () => getFollowing(userId),
    enabled: !!userId,
  })
}

// Hook for checking if current user follows a target user
export function useIsFollowing(targetUserId: string) {
  const { user } = useUser()
  const { checkIsFollowing } = useSocial()

  return useQuery({
    queryKey: ['isFollowing', user?.id, targetUserId],
    queryFn: () => checkIsFollowing(targetUserId),
    enabled: !!user && !!targetUserId && user.id !== targetUserId,
  })
}