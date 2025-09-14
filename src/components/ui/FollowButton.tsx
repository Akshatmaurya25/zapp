'use client'

import React from 'react'
import { Button } from './Button'
import { useSocial, useIsFollowing } from '@/hooks/useSocial'
import { UserPlus, UserCheck, Loader2 } from 'lucide-react'

interface FollowButtonProps {
  userId: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export function FollowButton({ userId, className, variant = 'default', size = 'default' }: FollowButtonProps) {
  const { followUser, isFollowing: isFollowingMutating, canFollow } = useSocial()
  const { data: isFollowing = false, isLoading } = useIsFollowing(userId)

  const handleFollow = async () => {
    try {
      await followUser({ userId, isFollowing })
    } catch (error) {
      console.error('Failed to toggle follow:', error)
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
      className={`${
        isFollowing
          ? 'border-gray-600 text-gray-300 hover:border-red-500 hover:text-red-400 hover:bg-red-500/10'
          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
      } ${className}`}
    >
      {isLoading_ ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          <span className="hidden sm:inline">Following</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Follow</span>
        </div>
      )}
    </Button>
  )
}