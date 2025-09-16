'use client'

import { useState, useCallback, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usePostContract } from '@/hooks/usePostContract'
import { useAccount } from 'wagmi'

// API response interface (values are strings due to BigInt serialization)
interface OnChainPostResponse {
  id: string
  author: string
  content: string
  mediaIpfs: string
  gameCategory: string
  timestamp: string
  isDeleted: boolean
  likesCount: string
  commentsCount: string
}

export interface BlockchainPost {
  id: string
  author: string
  content: string
  mediaIpfs: string
  gameCategory: string
  timestamp: number
  isDeleted: boolean
  likesCount: number
  commentsCount: number
  // Additional UI fields
  user: {
    address: string
    display_name: string
    username: string
    avatar_ipfs?: string
    is_verified: boolean
  }
  created_at: string
  media_ipfs: string[]
  game_category: string
}

export function useBlockchainPosts() {
  const { recentPostIds, refetchRecentPosts, isContractAvailable } = usePostContract()
  const { address } = useAccount()
  const queryClient = useQueryClient()

  // Fetch detailed post data for each post ID
  const {
    data: posts,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['blockchain-posts', recentPostIds?.map(id => id.toString())],
    queryFn: async () => {
      if (!recentPostIds || recentPostIds.length === 0) {
        return []
      }

      const postPromises = recentPostIds.map(async (postId) => {
        try {
          // We need to call the contract directly for each post
          // This is a simplified approach - in production, you'd want to batch these calls
          const response = await fetch(`/api/blockchain/post/${postId.toString()}`)
          if (!response.ok) return null

          const postData: OnChainPostResponse = await response.json()

          // Transform blockchain data to UI format (values are already strings from API)
          const blockchainPost: BlockchainPost = {
            id: postData.id,
            author: postData.author,
            content: postData.content,
            mediaIpfs: postData.mediaIpfs,
            gameCategory: postData.gameCategory,
            timestamp: Number(postData.timestamp),
            isDeleted: postData.isDeleted,
            likesCount: Number(postData.likesCount),
            commentsCount: Number(postData.commentsCount),
            // Map to UI expected format
            user: {
              address: postData.author,
              display_name: generateDisplayName(postData.author),
              username: generateUsername(postData.author),
              avatar_ipfs: undefined,
              is_verified: false
            },
            created_at: new Date(Number(postData.timestamp) * 1000).toISOString(),
            media_ipfs: postData.mediaIpfs ? [postData.mediaIpfs] : [],
            game_category: postData.gameCategory
          }

          return blockchainPost
        } catch (error) {
          console.error(`Failed to fetch post ${postId}:`, error)
          return null
        }
      })

      const postsData = await Promise.all(postPromises)
      return postsData.filter(post => post !== null && !post.isDeleted) as BlockchainPost[]
    },
    enabled: !!recentPostIds && isContractAvailable,
    refetchInterval: 30000, // Refetch every 30 seconds for new posts
  })

  // Helper function to generate display name from address
  const generateDisplayName = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Helper function to generate username from address
  const generateUsername = (address: string) => {
    return `user_${address.slice(-6)}`
  }

  // Create post function (proxy to usePostContract)
  const createPost = useCallback(async (postData: {
    content: string
    mediaIpfs?: string
    gameCategory?: string
  }) => {
    throw new Error('Use createPost from usePostContract directly in components')
  }, [])

  // Refresh posts
  const refreshPosts = useCallback(async () => {
    await refetchRecentPosts()
    await refetch()
  }, [refetchRecentPosts, refetch])

  // Delete post function (for future implementation)
  const deletePost = useCallback(async (postId: string) => {
    // Blockchain posts can't be deleted, only marked as deleted by author
    // This would require a contract function
    throw new Error('Blockchain posts cannot be deleted')
  }, [])

  return {
    posts: posts || [],
    isLoading,
    isError,
    error,
    refetch: refreshPosts,
    createPost, // Note: This should be used from components with usePostContract
    deletePost,
    isCreating: false, // This comes from usePostContract in components
    isDeleting: false  // Blockchain posts can't be deleted
  }
}

// Hook for getting user's blockchain posts
export function useUserBlockchainPosts(userAddress: string) {
  const postContract = usePostContract()

  const postIds: string[] = []
  const isLoading = false
  const error = null
  const refetch = async () => {}

  const {
    data: posts,
    isLoading: isLoadingPosts
  } = useQuery({
    queryKey: ['user-blockchain-posts', userAddress, postIds?.map(id => id.toString())],
    queryFn: async () => {
      if (!postIds || postIds.length === 0) {
        return []
      }

      // Similar logic to fetch detailed post data
      const postPromises = postIds.map(async (postId) => {
        try {
          const response = await fetch(`/api/blockchain/post/${postId.toString()}`)
          if (!response.ok) return null

          const postData: OnChainPostResponse = await response.json()

          const blockchainPost: BlockchainPost = {
            id: postData.id,
            author: postData.author,
            content: postData.content,
            mediaIpfs: postData.mediaIpfs,
            gameCategory: postData.gameCategory,
            timestamp: Number(postData.timestamp),
            isDeleted: postData.isDeleted,
            likesCount: Number(postData.likesCount),
            commentsCount: Number(postData.commentsCount),
            user: {
              address: postData.author,
              display_name: `${postData.author.slice(0, 6)}...${postData.author.slice(-4)}`,
              username: `user_${postData.author.slice(-6)}`,
              avatar_ipfs: undefined,
              is_verified: false
            },
            created_at: new Date(Number(postData.timestamp) * 1000).toISOString(),
            media_ipfs: postData.mediaIpfs ? [postData.mediaIpfs] : [],
            game_category: postData.gameCategory
          }

          return blockchainPost
        } catch (error) {
          console.error(`Failed to fetch user post ${postId}:`, error)
          return null
        }
      })

      const postsData = await Promise.all(postPromises)
      return postsData.filter(post => post !== null && !post.isDeleted) as BlockchainPost[]
    },
    enabled: !!postIds && !!userAddress,
  })

  return {
    posts: posts || [],
    isLoading: isLoading || isLoadingPosts,
    error,
    refetch
  }
}