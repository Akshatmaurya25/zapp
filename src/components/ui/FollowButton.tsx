'use client'

import React, { useState } from 'react'
import { Button } from './Button'
import { useSocial, useIsFollowing } from '@/hooks/useSocial'
import { UserPlus, UserCheck, Loader2, AlertCircle } from 'lucide-react'
import { useToastHelpers } from './Toast'

interface FollowButtonProps {
  userId: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export function FollowButton({ userId, className, variant = 'default', size = 'default' }: FollowButtonProps) {
  const { followUser, isFollowing: isFollowingMutating, canFollow } = useSocial()
  const { data: isFollowing = false, isLoading } = useIsFollowing(userId)
  const { success, error: showError } = useToastHelpers()
  const [localError, setLocalError] = useState<string | null>(null)

  const handleFollow = async () => {
    try {
      setLocalError(null)
      await followUser({ userId, isFollowing })

      // Show success feedback
      if (isFollowing) {
        success('Unfollowed!', 'You have unfollowed this user')
      } else {
        success('Following!', 'You are now following this user')
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update follow status'
      setLocalError(errorMessage)
      showError('Follow Error', errorMessage)
    }
  }

  if (!canFollow(userId)) {
    return null
  }

  const isLoading_ = isLoading || isFollowingMutating

  return (
    <Button
      onClick={handleFollow}
      disabled={isLoading_}
      variant={isFollowing ? 'outline' : variant}
      size={size}
      className={`transition-all duration-200 ${
        isFollowing
          ? 'border-gray-600/80 text-gray-300 hover:border-red-500/80 hover:text-red-400 hover:bg-red-500/10 hover:scale-105'
          : 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-md hover:shadow-lg hover:scale-105'
      } ${localError ? 'border-red-500/50 bg-red-500/10' : ''} ${className}`}
      title={localError || undefined}
    >
      {isLoading_ ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="hidden sm:inline">Loading...</span>
        </div>
      ) : localError ? (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Error</span>
        </div>
      ) : isFollowing ? (
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
          <span className="hidden sm:inline font-medium">Following</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
          <span className="hidden sm:inline font-medium">Follow</span>
        </div>
      )}
    </Button>
  )
}