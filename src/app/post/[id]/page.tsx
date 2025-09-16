'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/AppLayout'
import { Section, Stack } from '@/components/ui/Container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PostItem } from '@/components/post/PostItem'
import { CommentModal } from '@/components/post/CommentModal'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/lib/supabase'
import { Post } from '@/types'
import {
  ArrowLeft,
  MessageSquare,
  Share,
  ExternalLink,
  AlertCircle,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function PostDetailPage() {
  const params = useParams()
  const postId = params.id as string
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showComments, setShowComments] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId])

  const fetchPost = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(id, username, display_name, avatar_ipfs, is_verified)
        `)
        .eq('id', postId)
        .eq('is_deleted', false)
        .single()

      if (error) {
        throw error
      }

      if (!data) {
        setError('Post not found')
        return
      }

      setPost(data as Post)
    } catch (err) {
      console.error('Error fetching post:', err)
      setError(err instanceof Error ? err.message : 'Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!post) return

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
    if (!post) return

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

  if (loading) {
    return (
      <DashboardLayout>
        <Section>
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
              <p className="text-gray-400">Loading post...</p>
            </div>
          </div>
        </Section>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <Section>
          <Card className="border-red-500/20 bg-red-900/10">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-400 mb-2">
                Post Not Found
              </h3>
              <p className="text-gray-400 mb-6">
                {error === 'Post not found'
                  ? 'This post may have been deleted or made private.'
                  : 'There was an error loading this post. Please try again.'
                }
              </p>
              <div className="space-y-2">
                <Link href="/feed">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Feed
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </Section>
      </DashboardLayout>
    )
  }

  if (!post) {
    return null
  }

  return (
    <DashboardLayout>
      <Stack gap="lg" className="animate-slideUp max-w-4xl mx-auto">
        {/* Header */}
        <Section>
          <div className="flex items-center justify-between mb-6">
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
        </Section>

        {/* Post Detail */}
        <Section>
          <PostItem post={post} />
        </Section>

        {/* Related Posts */}
        <Section>
          <Card className="border-gray-700 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                More from {post.user?.display_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-center py-8">
                Related posts coming soon...
              </p>
            </CardContent>
          </Card>
        </Section>

        {/* SEO Meta Tags */}
        <div className="hidden">
          <h1>{post.user?.display_name}'s Gaming Post</h1>
          <meta name="description" content={post.content.slice(0, 160)} />
          <meta property="og:title" content={`Post by ${post.user?.display_name}`} />
          <meta property="og:description" content={post.content.slice(0, 160)} />
          <meta property="og:url" content={`${typeof window !== 'undefined' ? window.location.origin : ''}/post/${post.id}`} />
          {post.media_ipfs && post.media_ipfs.length > 0 && (
            <meta property="og:image" content={`https://gateway.pinata.cloud/ipfs/${post.media_ipfs[0]}`} />
          )}
        </div>
      </Stack>

      {/* Comment Modal */}
      <CommentModal
        post={post}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </DashboardLayout>
  )
}