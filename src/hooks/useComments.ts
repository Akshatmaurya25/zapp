'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'

export interface Comment {
  id: string
  content: string
  user_id: string
  post_id: string
  created_at: string
  is_deleted: boolean
  user?: {
    id: string
    username: string
    display_name: string
    avatar_ipfs?: string
    is_verified?: boolean
  }
}

export function useComments(postId: string) {
  const { user } = useUser()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Fetch comments for a post
  const fetchComments = async () => {
    if (!postId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/comments/${postId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }

      const data = await response.json()
      setComments(data.comments || [])
    } catch (err) {
      console.error('Error fetching comments:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch comments')
    } finally {
      setLoading(false)
    }
  }

  // Create a new comment
  const createComment = async (content: string): Promise<Comment | null> => {
    if (!user || !content.trim()) {
      throw new Error('User must be logged in and content cannot be empty')
    }

    setIsCreating(true)
    setError(null)

    try {
      const response = await fetch('/api/comments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          user_id: user.id,
          content: content.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create comment')
      }

      const data = await response.json()
      const newComment = data.comment

      // Add the new comment to the beginning of the list
      setComments(prev => [newComment, ...prev])

      return newComment
    } catch (err) {
      console.error('Error creating comment:', err)
      setError(err instanceof Error ? err.message : 'Failed to create comment')
      throw err
    } finally {
      setIsCreating(false)
    }
  }

  // Load comments when postId changes
  useEffect(() => {
    if (postId) {
      fetchComments()
    }
  }, [postId])

  return {
    comments,
    loading,
    error,
    isCreating,
    createComment,
    refetch: fetchComments
  }
}