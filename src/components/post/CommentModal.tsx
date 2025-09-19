'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useComments, Comment } from '@/hooks/useComments'
import { useToastHelpers } from '@/components/ui/Toast'
import {
  MessageSquare,
  Send,
  X,
  User,
  Heart,
  Reply,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Post } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { formatIPFSUrl } from '@/lib/utils'

interface CommentModalProps {
  post: Post
  isOpen: boolean
  onClose: () => void
}

export function CommentModal({ post, isOpen, onClose }: CommentModalProps) {
  const { user } = useUserProfile()
  const [newComment, setNewComment] = useState('')
  const { comments, loading, error, isCreating, createComment } = useComments(post.id)
  const { success, error: showError } = useToastHelpers()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    try {
      await createComment(newComment.trim())
      setNewComment('')
      success('Comment Posted!', 'Your comment has been added to the post')
    } catch (error) {
      console.error('Failed to create comment:', error)
      showError('Failed to Post Comment', error instanceof Error ? error.message : 'Please try again')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6" style={{ zIndex: 9999 }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        style={{ zIndex: 9999 }}
      />

      {/* Modal */}
      <Card className="relative w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden bg-gray-950/98 border-gray-700/90 shadow-2xl backdrop-blur-xl animate-slideUp" style={{ zIndex: 10000 }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-700/50 bg-gray-800/50 sticky top-0 z-10">
          <CardTitle className="flex items-center gap-2 text-gray-100">
            <MessageSquare className="h-5 w-5 text-primary-400" />
            Comments ({comments.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex flex-col h-full max-h-[calc(90vh-80px)] sm:max-h-[calc(85vh-80px)]">
          {/* Original Post */}
          <div className="flex-shrink-0 pb-4 border-b border-gray-700/50 bg-gray-800/30 -mx-6 px-6 -mt-6 pt-6">
            <div className="flex items-start gap-3">
              <Avatar
                src={formatIPFSUrl(post.user?.avatar_ipfs)}
                alt={post.user?.display_name || 'User'}
                fallbackText={post.user?.display_name || 'U'}
                identifier={post.user?.id || post.user?.username || 'unknown'}
                size="md"
                className="h-10 w-10"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-100">
                    {post.user?.display_name || 'Anonymous'}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed mt-2">
                  {post.content}
                </p>
              </div>
            </div>
          </div>

          {/* Comment Form */}
          {user && (
            <div className="flex-shrink-0 pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar
                    src={formatIPFSUrl(user.avatar_ipfs)}
                    alt={user.display_name || 'You'}
                    fallbackText={user.display_name || 'Y'}
                    identifier={user.id || user.username || user.wallet_address}
                    size="md"
                    className="h-10 w-10 ring-2 ring-primary-500/20"
                  />
                  <div className="flex-1 space-y-3">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a thoughtful comment..."
                      rows={3}
                      className="bg-gray-800/80 border-gray-600/80 focus:border-primary-500 resize-none text-gray-100 placeholder-gray-400 transition-all duration-200 focus:bg-gray-800/90 focus:shadow-lg focus:shadow-primary-500/10"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {newComment.length > 0 && `${newComment.length} characters`}
                      </span>
                      <Button
                        type="submit"
                        disabled={!newComment.trim() || isCreating}
                        className="bg-primary-600 hover:bg-primary-700 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                      >
                        {isCreating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Comment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-900/30 border border-red-500/30 rounded-xl backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-200 font-medium">{error}</p>
            </div>
          )}

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pr-2 -mr-2">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Loading comments...</p>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4 pb-4">
                {comments.map((comment, index) => (
                  <div key={comment.id} className="flex items-start gap-3 p-4 rounded-xl bg-gray-800/40 hover:bg-gray-800/60 transition-all duration-200 hover:shadow-lg border border-transparent hover:border-gray-700/50">
                    <Avatar
                      src={formatIPFSUrl(comment.user?.avatar_ipfs)}
                      alt={comment.user?.display_name || 'User'}
                      fallbackText={comment.user?.display_name || 'U'}
                      identifier={comment.user?.id || comment.user?.username}
                      size="md"
                      className="h-9 w-9 ring-1 ring-gray-600/50"
                    />
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-100 text-sm">
                          {comment.user?.display_name || 'Anonymous'}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                        {index === 0 && (
                          <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full border border-primary-500/30">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed break-words">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition-all duration-200 hover:scale-105 px-2 py-1 rounded-lg hover:bg-red-500/10">
                          <Heart className="h-3.5 w-3.5" />
                          <span>Like</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-400 transition-all duration-200 hover:scale-105 px-2 py-1 rounded-lg hover:bg-primary-500/10">
                          <Reply className="h-3.5 w-3.5" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 rounded-full bg-gray-800/50 w-fit mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-gray-300 font-medium">No comments yet</p>
                <p className="text-gray-500 text-sm mt-1">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}