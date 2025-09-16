'use client'

import React, { useState } from 'react'
import { usePosts } from '@/hooks/usePosts'
import { useUserProfile } from '@/hooks/useUserProfile'
import { usePostContract } from '@/hooks/usePostContract'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { FollowButton } from '@/components/ui/FollowButton'
import { CommentModal } from './CommentModal'
import { DonationModal } from './DonationModal'
import { useToastHelpers } from '@/components/ui/Toast'
import { cn, formatTimeAgo, formatNumber } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Trash2,
  Edit,
  ExternalLink,
  User,
  Clock,
  Shield,
  Verified,
  Copy,
  Gift,
  Coins
} from 'lucide-react'
import { Post } from '@/types'

interface PostItemProps {
  post: Post
  onEdit?: (post: Post) => void
  onDelete?: (postId: string) => void
  className?: string
}

export function PostItem({ post, onEdit, onDelete, className }: PostItemProps) {
  const { user } = useUserProfile()
  const { toggleLike, isTogglingLike } = usePosts()
  const { toggleLike: toggleBlockchainLike } = usePostContract()
  const { success } = useToastHelpers()
  const [showActions, setShowActions] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showDonation, setShowDonation] = useState(false)

  const isOwner = user?.id === post.user_id
  const isLiked = post.user_has_liked || false
  const isBlockchainPost = !!(post as any).blockchain_tx_hash

  const handleLike = async () => {
    try {
      if (isBlockchainPost && (post as any).blockchain_post_id) {
        // Use blockchain like
        await toggleBlockchainLike(BigInt((post as any).blockchain_post_id))
      } else {
        // Use traditional like
        await toggleLike(post.id)
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/post/${post.id}`
    try {
      await navigator.clipboard.writeText(url)
      // TODO: Show toast notification
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const handleViewOnChain = () => {
    if ((post as any).blockchain_tx_hash) {
      window.open(
        `https://shannon-explorer.somnia.network/tx/${(post as any).blockchain_tx_hash}`,
        '_blank'
      )
    }
  }

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.user?.display_name}`,
          text: post.content,
          url: postUrl
        })
      } catch (error) {
        console.error('Failed to share:', error)
        // Fallback to clipboard
        handleCopyLinkDirectly()
      }
    } else {
      // Fallback: copy link to clipboard
      handleCopyLinkDirectly()
    }
  }

  const handleCopyLinkDirectly = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`
    try {
      await navigator.clipboard.writeText(postUrl)
      success('Link copied!', 'Post link has been copied to your clipboard')
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const handleDonate = () => {
    setShowDonation(true)
  }

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isBlockchainPost && 'border-primary-500/30 shadow-glow-sm',
        className
      )}
      variant={isBlockchainPost ? 'elevated' : 'default'}
      hover="subtle"
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {post.user?.avatar_ipfs ? (
                <AvatarImage
                  src={`https://gateway.pinata.cloud/ipfs/${post.user.avatar_ipfs}`}
                  alt={post.user.display_name || post.user.username || 'User'}
                />
              ) : (
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-text-primary">
                  {post.user?.display_name || 'Anonymous'}
                </h3>
                {post.user?.is_verified && (
                  <Verified className="h-4 w-4 text-primary-500" />
                )}
                {isBlockchainPost && (
                  <Badge variant="outline" className="text-xs border-primary-500 text-primary-400">
                    <Shield className="h-3 w-3 mr-1" />
                    On-Chain
                  </Badge>
                )}
                {post.user?.username && (
                  <span className="text-text-tertiary text-sm">
                    @{post.user.username}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                {post.game_category && (
                  <>
                    <span>•</span>
                    <Badge variant="secondary" className="text-xs">
                      {post.game_category}
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {/* Follow Button */}
            {!isOwner && (
              <FollowButton userId={post.user_id} size="sm" />
            )}
          </div>

          {/* Actions Menu */}
          {isOwner && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowActions(!showActions)}
                className="text-gray-400 hover:text-white"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>

              {showActions && (
                <div className="absolute right-0 top-8 z-10 bg-background-elevated border border-border-primary rounded-lg shadow-lg py-1 min-w-[160px]">
                  <button
                    onClick={() => {
                      handleCopyLinkDirectly()
                      setShowActions(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-text-secondary hover:bg-background-tertiary flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </button>

                  {isBlockchainPost && (
                    <button
                      onClick={() => {
                        handleViewOnChain()
                        setShowActions(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-text-secondary hover:bg-background-tertiary flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View on Chain
                    </button>
                  )}

                  {isOwner && (
                    <>
                      {onEdit && (
                        <button
                          onClick={() => {
                            onEdit?.(post)
                            setShowActions(false)
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-text-secondary hover:bg-background-tertiary flex items-center gap-2"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => {
                            onDelete?.(post.id)
                            setShowActions(false)
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-error-400 hover:bg-background-tertiary flex items-center gap-2"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-text-primary whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        </div>

        {/* Blockchain Verification */}
        {isBlockchainPost && (post as any).blockchain_tx_hash && (
          <div className="mb-4 p-3 bg-primary-500/5 border border-primary-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary-500" />
              <span className="text-text-secondary">
                Verified on Somnia blockchain
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewOnChain}
                className="ml-auto h-auto p-1 text-primary-500"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Media */}
        {post.media_ipfs && post.media_ipfs.length > 0 && (
          <div className="mb-4">
            <div className={`grid gap-2 ${
              post.media_ipfs.length === 1 ? 'grid-cols-1' :
              post.media_ipfs.length === 2 ? 'grid-cols-2' :
              post.media_ipfs.length === 3 ? 'grid-cols-3' :
              'grid-cols-2'
            }`}>
              {post.media_ipfs.slice(0, 4).map((hash, index) => (
                <div
                  key={hash}
                  className={`relative group cursor-pointer ${
                    post.media_ipfs!.length === 3 && index === 0 ? 'row-span-2' : ''
                  } ${
                    post.media_ipfs!.length > 4 && index === 3 ? 'relative' : ''
                  }`}
                >
                  <img
                    src={`https://gateway.pinata.cloud/ipfs/${hash}`}
                    alt={`Media ${index + 1}`}
                    className="w-full h-full object-contain rounded-lg max-h-80 bg-gray-800"
                  />

                  {/* Overlay for +N more */}
                  {post.media_ipfs!.length > 4 && index === 3 && (
                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl font-semibold">
                        +{post.media_ipfs!.length - 4}
                      </span>
                    </div>
                  )}

                  {/* Expand overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ExternalLink className="h-6 w-6 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Engagement Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-700">
          <div className="flex items-center gap-6">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isTogglingLike}
              className={`flex items-center gap-2 transition-colors ${
                isLiked
                  ? 'text-red-500 hover:text-red-400'
                  : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart
                className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
              />
              <span className="text-sm">{post.likes_count || 0}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={() => setShowComments(true)}
              className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{post.comments_count || 0}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors"
            >
              <Share className="h-4 w-4" />
              <span className="text-sm">Share</span>
            </button>

            {/* Donate Button (only show if not owner) */}
            {!isOwner && (
              <button
                onClick={handleDonate}
                className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors"
              >
                <Coins className="h-4 w-4" />
                <span className="text-sm">Tip</span>
              </button>
            )}
          </div>
        </div>
      </CardContent>

      {/* Comment Modal */}
      <CommentModal
        post={post}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />

      {/* Donation Modal */}
      <DonationModal
        post={post}
        isOpen={showDonation}
        onClose={() => setShowDonation(false)}
      />
    </Card>
  )
}