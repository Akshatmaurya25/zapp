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
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import { useToastHelpers } from '@/components/ui/Toast'
import { cn, formatTimeAgo, formatNumber, formatIPFSUrl } from '@/lib/utils'
import { detectMediaType, getIPFSUrl, getVideoAttributes } from '@/lib/media-utils'
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
  Coins,
  Sparkles,
  TrendingUp,
  Eye,
  Zap,
  Globe
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

  const isOwner = user?.id === post.user?.id
  const isLiked = post.user_has_liked || false
  const isBlockchainPost = !!(post as any).blockchain_tx_hash

  const handleLike = async () => {
    if (!user) {
      console.error('User must be logged in to like posts')
      return
    }

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
      variant={isBlockchainPost ? "gaming" : "default"}
      className={cn(
        'group relative overflow-hidden transition-all duration-500 hover:shadow-2xl',
        isBlockchainPost
          ? 'border-primary-500/50 shadow-lg shadow-primary-500/15 hover:shadow-primary-500/25'
          : 'border-gray-800/60 hover:border-gray-700/70',
        'backdrop-blur-xl',
        // Remove hover translate on mobile for better performance
        'md:hover:-translate-y-1',
        // Add mobile-specific spacing
        'mx-3 md:mx-0',
        className
      )}
    >
      {/* Blockchain Post Glow Effect */}
      {isBlockchainPost && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-secondary-500/5 to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}

      <CardContent className="relative p-0">
        {/* Header Section */}
        <div className="p-4 md:p-6 pb-3 md:pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 md:gap-4 flex-1">
              {/* Avatar with Gaming Theme */}
              <Avatar
                src={formatIPFSUrl(post.user?.avatar_ipfs)}
                alt={post.user?.display_name || post.user?.username || 'User'}
                fallbackText={post.user?.display_name || post.user?.username || 'U'}
                identifier={post.user?.id || post.user?.username || post.user_id}
                size="lg"
                className="h-10 w-10 md:h-12 md:w-12"
              />

              <div className="flex-1 min-w-0">
                {/* User Info Row */}
                <div className="flex items-center gap-1 md:gap-2 mb-1">
                  <h3 className="font-bold text-white truncate text-sm md:text-base">
                    {post.user?.display_name || 'Anonymous Gamer'}
                  </h3>
                  {post.user?.is_verified && (
                    <Verified className="h-3 w-3 md:h-4 md:w-4 text-blue-400 flex-shrink-0" />
                  )}
                  {isBlockchainPost && (
                    <Badge
                      variant="outline"
                      className="text-xs border-primary-500/60 bg-primary-500/10 text-primary-400 backdrop-blur-sm hidden md:inline-flex"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      On-Chain
                    </Badge>
                  )}
                </div>

                {/* Username and Metadata */}
                <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400 flex-wrap">
                  {post.user?.username && (
                    <span className="text-gray-500">@{post.user.username}</span>
                  )}
                  <span className="hidden md:inline">•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                  </div>
                  {post.game_category && (
                    <>
                      <span className="hidden md:inline">•</span>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-slate-700/50 text-slate-300 border-slate-600"
                      >
                        🎮 {post.game_category}
                      </Badge>
                    </>
                  )}
                </div>

                {/* Mobile-only blockchain badge */}
                {isBlockchainPost && (
                  <div className="mt-1 md:hidden">
                    <Badge
                      variant="outline"
                      className="text-xs border-primary-500/60 bg-primary-500/10 text-primary-400 backdrop-blur-sm"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      On-Chain
                    </Badge>
                  </div>
                )}
              </div>

              {/* Follow Button */}
              {!isOwner && post.user?.id && (
                <FollowButton userId={post.user.id} size="sm" className="hidden md:block" />
              )}
            </div>

            {/* Actions Menu */}
            {isOwner && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActions(!showActions)}
                  className="text-gray-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>

                {showActions && (
                  <div className="absolute right-0 top-8 z-20 bg-gray-950/95 border border-gray-700/80 rounded-xl shadow-2xl py-2 min-w-[180px] backdrop-blur-xl">
                    <button
                      onClick={() => {
                        handleCopyLinkDirectly()
                        setShowActions(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800/80 hover:text-white flex items-center gap-3 transition-colors"
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
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800/80 hover:text-white flex items-center gap-3 transition-colors"
                      >
                        <Globe className="h-4 w-4" />
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
                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800/80 hover:text-white flex items-center gap-3 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => {
                              onDelete?.(post.id)
                              setShowActions(false)
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-3 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
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
        </div>

        {/* Content Section */}
        <div className="px-4 md:px-6 pb-3 md:pb-4">
          <div className="mb-3 md:mb-4">
            <p className="text-gray-100 whitespace-pre-wrap leading-relaxed text-sm md:text-[15px] font-medium">
              {post.content}
            </p>
          </div>

          {/* Blockchain Verification Banner */}
          {isBlockchainPost && (post as any).blockchain_tx_hash && (
            <div className="mb-4 p-4 bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-primary-500/10 border border-primary-500/30 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-500/20 rounded-lg">
                  <Shield className="h-4 w-4 text-primary-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-primary-300">
                    Blockchain Verified
                  </div>
                  <div className="text-xs text-primary-400/80">
                    Permanently stored on Somnia Network
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewOnChain}
                  className="text-primary-400 hover:text-primary-300 hover:bg-primary-500/20 transition-colors"
                >
                  <Globe className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Media Gallery */}
        {post.media_ipfs && post.media_ipfs.length > 0 && (
          <div className="px-4 md:px-6 pb-3 md:pb-4">
            <div className={cn(
              "grid gap-2 md:gap-3 rounded-xl overflow-hidden",
              post.media_ipfs.length === 1 ? 'grid-cols-1' :
              post.media_ipfs.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
              post.media_ipfs.length === 3 ? 'grid-cols-2 md:grid-cols-3' :
              'grid-cols-2'
            )}>
              {post.media_ipfs.slice(0, 4).map((hash, index) => {
                // Use enhanced media detection
                const mediaType = detectMediaType(
                  hash,
                  (post as any).media_types?.[index],
                  index,
                  post.media_types
                )
                const isVideo = mediaType === 'video'

                // Debug logging
                if (process.env.NODE_ENV === 'development') {
                  console.log('Media debug:', {
                    hash,
                    index,
                    storedMediaTypes: post.media_types,
                    specificType: post.media_types?.[index],
                    detectedType: mediaType,
                    isVideo
                  })
                }

                return (
                  <div
                    key={hash}
                    className={cn(
                      "relative group cursor-pointer overflow-hidden rounded-xl",
                      post.media_ipfs!.length === 3 && index === 0 ? 'row-span-2' : '',
                      post.media_ipfs!.length > 4 && index === 3 ? 'relative' : ''
                    )}
                  >
                    {isVideo ? (
                      <VideoPlayer
                        hash={hash}
                        mediaType={post.media_types?.[index]}
                        className="w-full h-full"
                        style={{ aspectRatio: post.media_ipfs!.length === 1 ? 'auto' : '1' }}
                        isMainVideo={post.media_ipfs!.length === 1}
                      />
                    ) : (
                      <img
                        src={getIPFSUrl(hash)}
                        alt={`Media ${index + 1}`}
                        className="w-full h-full object-cover bg-slate-800 transition-transform duration-300 group-hover:scale-105"
                        style={{ aspectRatio: post.media_ipfs!.length === 1 ? 'auto' : '1' }}
                        loading="lazy"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          const fallbackUrl = getIPFSUrl(hash, 1);
                          if (img.src !== fallbackUrl) {
                            img.src = fallbackUrl;
                          }
                        }}
                      />
                    )}

                  {/* Overlay for +N more */}
                  {post.media_ipfs!.length > 4 && index === 3 && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-white text-2xl font-bold">
                          +{post.media_ipfs!.length - 4}
                        </span>
                        <div className="text-white/80 text-sm">more</div>
                      </div>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Engagement Section */}
        <div className="border-t border-gray-800/50 bg-gray-950/40 p-3 md:p-4">
          {/* Mobile-friendly Follow Button */}
          {!isOwner && post.user?.id && (
            <div className="mb-3 md:hidden">
              <FollowButton userId={post.user.id} size="sm" className="w-full" />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-1 flex-wrap">
              {/* Like Button */}
              <button
                onClick={handleLike}
                disabled={isTogglingLike}
                className={cn(
                  "group flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-full transition-all duration-300",
                  "md:hover:scale-105", // Remove scale on mobile
                  isLiked
                    ? "text-red-400 bg-red-500/10 hover:bg-red-500/20"
                    : "text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                )}
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-all duration-300",
                    isLiked ? "fill-current scale-110" : "group-hover:scale-110"
                  )}
                />
                <span className="text-xs md:text-sm font-medium">{formatNumber(post.likes_count || 0)}</span>
              </button>

              {/* Comment Button */}
              <button
                onClick={() => setShowComments(true)}
                className="group flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-full text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-300 md:hover:scale-105"
              >
                <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xs md:text-sm font-medium">{formatNumber(post.comments_count || 0)}</span>
              </button>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="group flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-full text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all duration-300 md:hover:scale-105"
              >
                <Share className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xs md:text-sm font-medium hidden md:inline">Share</span>
              </button>

              {/* Donate Button - Always show, better visual hierarchy */}
              {!isOwner && (
                <button
                  onClick={handleDonate}
                  className="group flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-full text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all duration-300 md:hover:scale-105"
                  title="Send a tip to the creator"
                >
                  <Coins className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-xs md:text-sm font-medium">Tip</span>
                </button>
              )}
            </div>

            {/* Trending Indicator */}
            {(post.likes_count || 0) > 10 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full">
                <TrendingUp className="h-3 w-3 text-orange-400" />
                <span className="text-xs font-medium text-orange-400">Trending</span>
              </div>
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