'use client'

import React, { useState } from 'react'
import { usePosts } from '@/hooks/usePosts'
import { PostItem } from './PostItem'
import { PostCreate } from './PostCreate'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import {
  MessageSquare,
  Loader2,
  RefreshCw,
  Filter,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react'
import { QueryParams } from '@/types'

interface PostFeedProps {
  showCreatePost?: boolean
  initialFilter?: QueryParams['filter']
  className?: string
}

export function PostFeed({ showCreatePost = true, initialFilter, className }: PostFeedProps) {
  const [filter, setFilter] = useState<QueryParams['filter']>(initialFilter)
  const [feedType, setFeedType] = useState<'latest' | 'following' | 'trending'>('latest')

  const queryParams: QueryParams = {
    limit: 20,
    page: 1,
    filter: {
      ...filter,
      following_only: feedType === 'following'
    }
  }

  const {
    posts,
    isLoading,
    isError,
    error,
    refetch,
    deletePost,
    isDeleting
  } = usePosts(queryParams)

  const handleRefresh = () => {
    refetch()
  }

  const handleFeedTypeChange = (type: 'latest' | 'following' | 'trending') => {
    setFeedType(type)
  }

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(postId)
      } catch (error) {
        console.error('Failed to delete post:', error)
      }
    }
  }

  if (isError) {
    return (
      <Card className={`border-gray-700 bg-gray-900/50 ${className}`}>
        <CardContent className="p-8 text-center">
          <div className="text-red-400 mb-4">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold">Failed to load posts</p>
            <p className="text-sm text-gray-400 mt-2">{error}</p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="border-gray-600 hover:border-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Create Post */}
      {showCreatePost && (
        <PostCreate onSuccess={handleRefresh} />
      )}

      {/* Feed Controls */}
      <Card className="border-gray-700 bg-gray-900/50 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Feed Type Selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFeedTypeChange('latest')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  feedType === 'latest'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Clock className="h-4 w-4" />
                Latest
              </button>
              <button
                onClick={() => handleFeedTypeChange('following')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  feedType === 'following'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Users className="h-4 w-4" />
                Following
              </button>
              <button
                onClick={() => handleFeedTypeChange('trending')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  feedType === 'trending'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Trending
              </button>
            </div>

            {/* Refresh Button */}
            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              disabled={isLoading}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      {isLoading && posts.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-gray-700 bg-gray-900/50 animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-10 w-10 bg-gray-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-1/4" />
                    <div className="h-3 bg-gray-700 rounded w-1/6" />
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-700 rounded w-full" />
                  <div className="h-4 bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-700 rounded w-1/2" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-6 bg-gray-700 rounded w-16" />
                  <div className="h-6 bg-gray-700 rounded w-16" />
                  <div className="h-6 bg-gray-700 rounded w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              onDelete={handleDeletePost}
            />
          ))}

          {/* Load More */}
          {posts.length >= 20 && (
            <div className="text-center py-8">
              <Button
                onClick={() => {
                  // TODO: Implement pagination
                  console.log('Load more posts')
                }}
                variant="outline"
                className="border-gray-600 hover:border-blue-500"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Load More Posts
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card className="border-gray-700 bg-gray-900/50">
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg font-medium">
              {feedType === 'following' ? 'No posts from people you follow' : 'No posts yet'}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {feedType === 'following'
                ? 'Follow some gamers to see their posts here'
                : 'Be the first to share something amazing!'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}