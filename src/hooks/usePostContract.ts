import React, { useState, useCallback } from 'react'
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { useToastHelpers } from '@/components/ui/Toast'

// Contract ABI - SimplePostRegistry functions
const POST_REGISTRY_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_content", "type": "string"},
      {"internalType": "string", "name": "_mediaIpfs", "type": "string"},
      {"internalType": "string", "name": "_gameCategory", "type": "string"}
    ],
    "name": "createPost",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_postId", "type": "uint256"}],
    "name": "getPost",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "address", "name": "author", "type": "address"},
          {"internalType": "string", "name": "content", "type": "string"},
          {"internalType": "string", "name": "mediaIpfs", "type": "string"},
          {"internalType": "string", "name": "gameCategory", "type": "string"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
          {"internalType": "bool", "name": "isDeleted", "type": "bool"},
          {"internalType": "uint256", "name": "likesCount", "type": "uint256"},
          {"internalType": "uint256", "name": "commentsCount", "type": "uint256"}
        ],
        "internalType": "struct PostRegistry.Post",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_count", "type": "uint256"}],
    "name": "getRecentPosts",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserPosts",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_postId", "type": "uint256"}],
    "name": "toggleLike",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "postFee",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalPosts",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_postId", "type": "uint256"},
      {"internalType": "address", "name": "_user", "type": "address"}
    ],
    "name": "hasUserLikedPost",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Contract address - this will be set after deployment
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_POST_REGISTRY_ADDRESS as `0x${string}`

export interface PostData {
  content: string
  mediaIpfs?: string
  gameCategory?: string
}

export interface OnChainPost {
  id: bigint
  author: `0x${string}`
  content: string
  mediaIpfs: string
  gameCategory: string
  timestamp: bigint
  isDeleted: boolean
  likesCount: bigint
  commentsCount: bigint
}

export function usePostContract() {
  const [isCreating, setIsCreating] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [createHash, setCreateHash] = useState<`0x${string}` | undefined>()
  const [likeHash, setLikeHash] = useState<`0x${string}` | undefined>()
  const { success, error: showError } = useToastHelpers()

  // Read contract data
  const { data: postFeeData, refetch: refetchFee } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: POST_REGISTRY_ABI,
    functionName: 'postFee',
  })

  const { data: totalPostsData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: POST_REGISTRY_ABI,
    functionName: 'getTotalPosts',
  })

  const { data: recentPostIds, refetch: refetchRecentPosts } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: POST_REGISTRY_ABI,
    functionName: 'getRecentPosts',
    args: [BigInt(20)], // Get last 20 posts
  })

  // Contract write hooks
  const { writeContract } = useWriteContract()

  // Transaction status
  const { isLoading: isCreateTxLoading } = useWaitForTransactionReceipt({
    hash: createHash,
  })

  const { isLoading: isLikeTxLoading } = useWaitForTransactionReceipt({
    hash: likeHash,
  })

  // Derived values
  const postFee = postFeeData ? formatEther(postFeeData) : '0.001'
  const totalPosts = totalPostsData ? Number(totalPostsData) : 0
  const isContractAvailable = !!CONTRACT_ADDRESS && CONTRACT_ADDRESS !== '0x'

  // Create post function
  const createPost = useCallback(async (postData: PostData) => {
    if (!isContractAvailable) {
      throw new Error('Contract not available. Please check deployment.')
    }

    if (!postFeeData) {
      throw new Error('Unable to fetch post fee')
    }

    try {
      setIsCreating(true)

      const hash = await writeContract({
        address: CONTRACT_ADDRESS,
        abi: POST_REGISTRY_ABI,
        functionName: 'createPost',
        args: [
          postData.content,
          postData.mediaIpfs || '',
          postData.gameCategory || 'general'
        ],
        value: postFeeData,
      })

      setCreateHash(hash)
      success('Transaction Submitted', 'Your post is being processed on the blockchain')

    } catch (error: any) {
      setIsCreating(false)
      const message = error?.message || 'Failed to create post'
      showError('Transaction Failed', message)
      throw error
    }
  }, [isContractAvailable, postFeeData, writeContract, success, showError])

  // Toggle like function
  const toggleLike = useCallback(async (postId: bigint) => {
    if (!isContractAvailable) {
      throw new Error('Contract not available')
    }

    try {
      setIsLiking(true)

      const hash = await writeContract({
        address: CONTRACT_ADDRESS,
        abi: POST_REGISTRY_ABI,
        functionName: 'toggleLike',
        args: [postId],
      })

      setLikeHash(hash)
      success('Like Updated', 'Your like is being recorded on the blockchain')

    } catch (error: any) {
      setIsLiking(false)
      const message = error?.message || 'Failed to update like'
      showError('Transaction Failed', message)
      throw error
    }
  }, [isContractAvailable, writeContract, success, showError])

  // Get single post
  const usePost = (postId: bigint) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: POST_REGISTRY_ABI,
      functionName: 'getPost',
      args: [postId],
    })
  }

  // Get user posts
  const useUserPosts = (userAddress: `0x${string}`) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: POST_REGISTRY_ABI,
      functionName: 'getUserPosts',
      args: [userAddress],
    })
  }

  // Check if user liked a post
  const useUserLikedPost = (postId: bigint, userAddress: `0x${string}`) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: POST_REGISTRY_ABI,
      functionName: 'hasUserLikedPost',
      args: [postId, userAddress],
    })
  }

  // Update loading states when transactions complete
  React.useEffect(() => {
    if (!isCreateTxLoading && createHash) {
      setIsCreating(false)
      setCreateHash(undefined)
      success('Post Created!', 'Your post has been permanently stored on Somnia blockchain')
      refetchRecentPosts()
    }
  }, [isCreateTxLoading, createHash, success, refetchRecentPosts])

  React.useEffect(() => {
    if (!isLikeTxLoading && likeHash) {
      setIsLiking(false)
      setLikeHash(undefined)
    }
  }, [isLikeTxLoading, likeHash])

  return {
    // State
    isCreating: isCreating || isCreateTxLoading,
    isLiking: isLiking || isLikeTxLoading,
    isContractAvailable,

    // Data
    postFee,
    totalPosts,
    recentPostIds: recentPostIds as bigint[] | undefined,

    // Functions
    createPost,
    toggleLike,
    usePost,
    useUserPosts,
    useUserLikedPost,

    // Refetch functions
    refetchRecentPosts,
    refetchFee,
  }
}

// Hook for getting post details
export function usePostDetails(postId: bigint) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: POST_REGISTRY_ABI,
    functionName: 'getPost',
    args: [postId],
  })

  return {
    post: data as OnChainPost | undefined,
    isLoading,
    error,
    refetch
  }
}

// Hook for getting user's posts
export function useUserPostsList(userAddress: `0x${string}`) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: POST_REGISTRY_ABI,
    functionName: 'getUserPosts',
    args: [userAddress],
  })

  return {
    postIds: data as bigint[] | undefined,
    isLoading,
    error,
    refetch
  }
}