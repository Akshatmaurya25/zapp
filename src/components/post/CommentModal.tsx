'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useComments, Comment } from '@/hooks/useComments'
import { useToast } from '@/hooks/useToast'
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

interface CommentModalProps {
  post: Post
  isOpen: boolean
  onClose: () => void
}

export function CommentModal({ post, isOpen, onClose }: CommentModalProps) {
  const { user } = useUserProfile()
  const [newComment, setNewComment] = useState('')
  const { comments, loading, error, isCreating, createComment } = useComments(post.id)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    try {
      await createComment(newComment.trim())
      setNewComment('')
      toast({
        title: 'Comment posted!',
        description: 'Your comment has been added to the post',
        variant: 'default'
      })
    } catch (error) {
      console.error('Failed to create comment:', error)
      toast({
        title: 'Failed to post comment',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 overflow-y-auto">
          {/* Original Post */}
          <div className="pb-4 border-b border-gray-700">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                {post.user?.avatar_ipfs ? (
                  <AvatarImage
                    src={`https://gateway.pinata.cloud/ipfs/${post.user.avatar_ipfs}`}
                    alt={post.user.display_name || 'User'}
                  />
                ) : (
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary">
                    {post.user?.display_name || 'Anonymous'}
                  </span>
                  <span className="text-text-tertiary text-sm">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {post.content}
                </p>
              </div>
            </div>
          </div>

          {/* Comment Form */}
          {user && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  {user.avatar_ipfs ? (
                    <AvatarImage
                      src={`https://gateway.pinata.cloud/ipfs/${user.avatar_ipfs}`}
                      alt={user.display_name || 'You'}
                    />
                  ) : (
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="bg-gray-800/50 border-gray-600 focus:border-blue-500 resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={!newComment.trim() || isCreating}
                      className="bg-blue-600 hover:bg-blue-700"
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
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Loading comments...</p>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    {comment.user?.avatar_ipfs ? (
                      <AvatarImage
                        src={`https://gateway.pinata.cloud/ipfs/${comment.user.avatar_ipfs}`}
                        alt={comment.user.display_name || 'User'}
                      />
                    ) : (
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-primary text-sm">
                        {comment.user?.display_name || 'Anonymous'}
                      </span>
                      <span className="text-text-tertiary text-xs">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="h-3 w-3" />
                        <span>Like</span>
                      </button>
                      <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors">
                        <Reply className="h-3 w-3" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">No comments yet</p>
                <p className="text-gray-500 text-sm">Be the first to comment!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}