'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/contexts/UserContext'
import { Post, CreatePostData, UpdatePostData, GameCategory, QueryParams } from '@/types'

export function usePosts(params?: QueryParams) {
  const { user } = useUser()
  const queryClient = useQueryClient()

  // Fetch posts with pagination
  const {
    data: posts,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['posts', params],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          user:users(id, username, display_name, avatar_ipfs, is_verified)
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      // Apply filters
      if (params?.filter?.game_category) {
        query = query.eq('game_category', params.filter.game_category)
      }

      if (params?.filter?.user_id) {
        query = query.eq('user_id', params.filter.user_id)
      }

      if (params?.filter?.following_only && user) {
        // Get posts from users the current user follows
        const { data: following } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)

        const followingIds = following?.map(f => f.following_id) || []
        if (followingIds.length > 0) {
          query = query.in('user_id', followingIds)
        } else {
          // Return empty if not following anyone
          return []
        }
      }

      // Pagination
      const page = params?.page || 1
      const limit = params?.limit || 20
      const offset = (page - 1) * limit

      query = query.range(offset, offset + limit - 1)

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to fetch posts: ${error.message}`)
      }

      return data as Post[]
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: CreatePostData): Promise<Post> => {
      if (!user) {
        throw new Error('User must be logged in to create posts')
      }

      // Use API route for post creation to bypass RLS
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          content: postData.content,
          media_ipfs: postData.media_ipfs || null,
          game_category: postData.game_category || 'general',
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create post')
      }

      const data = await response.json()
      return data.post as Post
    },
    onSuccess: (newPost) => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      
      // Trigger achievement for first post
      triggerFirstPostAchievement(user?.id)
    },
  })

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async ({ postId, data }: { postId: string; data: UpdatePostData }): Promise<Post> => {
      if (!user) {
        throw new Error('User must be logged in to update posts')
      }

      const { data: updatedPost, error } = await supabase
        .from('posts')
        .update({
          content: data.content,
          game_category: data.game_category,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId)
        .eq('user_id', user.id) // Ensure user can only update their own posts
        .select(`
          *,
          user:users(id, username, display_name, avatar_ipfs, is_verified)
        `)
        .single()

      if (error) {
        throw new Error(`Failed to update post: ${error.message}`)
      }

      return updatedPost as Post
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string): Promise<void> => {
      if (!user) {
        throw new Error('User must be logged in to delete posts')
      }

      const { error } = await supabase
        .from('posts')
        .update({ is_deleted: true })
        .eq('id', postId)
        .eq('user_id', user.id) // Ensure user can only delete their own posts

      if (error) {
        throw new Error(`Failed to delete post: ${error.message}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

  // Like/Unlike post mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async (postId: string): Promise<{ liked: boolean }> => {
      if (!user) {
        throw new Error('User must be logged in to like posts')
      }

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single()

      if (existingLike) {
        // Remove like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId)

        if (error) {
          throw new Error(`Failed to unlike post: ${error.message}`)
        }

        return { liked: false }
      } else {
        // Add like
        const { error } = await supabase
          .from('likes')
          .insert([{
            user_id: user.id,
            post_id: postId,
          }])

        if (error) {
          throw new Error(`Failed to like post: ${error.message}`)
        }

        return { liked: true }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

  // Get trending posts
  const getTrendingPosts = useCallback(async (timeframe: '24h' | '7d' | '30d' = '24h') => {
    const timeAgo = new Date()
    switch (timeframe) {
      case '24h':
        timeAgo.setDate(timeAgo.getDate() - 1)
        break
      case '7d':
        timeAgo.setDate(timeAgo.getDate() - 7)
        break
      case '30d':
        timeAgo.setDate(timeAgo.getDate() - 30)
        break
    }

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(id, username, display_name, avatar_ipfs, is_verified)
      `)
      .eq('is_deleted', false)
      .gte('created_at', timeAgo.toISOString())
      .order('likes_count', { ascending: false })
      .limit(20)

    if (error) {
      throw new Error(`Failed to fetch trending posts: ${error.message}`)
    }

    return data as Post[]
  }, [])

  // Trigger first post achievement
  const triggerFirstPostAchievement = async (userId?: string) => {
    if (!userId) return

    try {
      // Check if user already has first post achievement
      const { data: existingAchievement } = await supabase
        .from('achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_type', 'first_post')
        .single()

      if (!existingAchievement) {
        // Create first post achievement
        await supabase
          .from('achievements')
          .insert([{
            user_id: userId,
            achievement_type: 'first_post',
            metadata: {
              name: 'Content Creator',
              description: 'Created your first post on Zapp',
              image_ipfs: '', // Add default achievement image
              rarity: 'common',
              category: 'content'
            }
          }])
      }
    } catch (error) {
      console.error('Failed to create first post achievement:', error)
    }
  }

  return {
    // Data
    posts: posts || [],
    
    // Loading states
    isLoading,
    isError,
    error: error?.message,
    
    // Actions
    createPost: createPostMutation.mutateAsync,
    updatePost: updatePostMutation.mutateAsync,
    deletePost: deletePostMutation.mutateAsync,
    toggleLike: toggleLikeMutation.mutateAsync,
    getTrendingPosts,
    refetch,
    
    // Mutation states
    isCreating: createPostMutation.isPending,
    isUpdating: updatePostMutation.isPending,
    isDeleting: deletePostMutation.isPending,
    isTogglingLike: toggleLikeMutation.isPending,
  }
}