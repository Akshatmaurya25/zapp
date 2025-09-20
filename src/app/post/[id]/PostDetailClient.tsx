'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { PostItem } from '@/components/post/PostItem'
import { CommentModal } from '@/components/post/CommentModal'
import { useToast } from '@/hooks/useToast'
import { Post } from '@/types'
import {
  ArrowLeft,
  MessageSquare,
  Share,
} from 'lucide-react'
import Link from 'next/link'

interface PostDetailClientProps {
  post: Post
}

export default function PostDetailClient({ post }: PostDetailClientProps) {
  const [showComments, setShowComments] = useState(false)
  const { toast } = useToast()

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
        handleCopyLink()
      }
    } else {
      // Fallback: copy link to clipboard
      handleCopyLink()
    }
  }

  const handleCopyLink = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`
    try {
      await navigator.clipboard.writeText(postUrl)
      toast({
        title: 'Link copied!',
        description: 'Post link has been copied to your clipboard',
        variant: 'default'
      })
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast({
        title: 'Failed to copy link',
        description: 'Please try again',
        variant: 'destructive'
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header - Compact */}
        <div className="flex items-center justify-between">
          <Link href="/feed">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Feed
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComments(true)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Main Post - No extra padding */}
        <div>
          <PostItem post={post} />
        </div>
      </div>

      {/* Comment Modal */}
      <CommentModal
        post={post}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </DashboardLayout>
  )
}