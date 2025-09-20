import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Post } from '@/types'
import PostDetailClient from './PostDetailClient'

interface PageProps {
  params: { id: string }
}

async function getPost(id: string): Promise<Post | null> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(id, username, display_name, avatar_ipfs, is_verified)
      `)
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (error || !data) {
      return null
    }

    return data as Post
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPost(params.id)

  if (!post) {
    return {
      title: 'Post Not Found - Zapp',
      description: 'The requested post could not be found.',
    }
  }

  const title = `${post.user?.display_name || 'Anonymous'} on Zapp`
  const description = post.content.slice(0, 160) + (post.content.length > 160 ? '...' : '')
  const imageUrl = post.media_ipfs && post.media_ipfs.length > 0
    ? `https://gateway.pinata.cloud/ipfs/${post.media_ipfs[0]}`
    : '/og-default.png' // Add your default image to public folder

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zapp.social'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${baseUrl}/post/${post.id}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Post by ${post.user?.display_name}`,
        },
      ],
      siteName: 'Zapp - Gaming Social Platform',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: `@${post.user?.username || 'zapp'}`,
    },
    other: {
      'article:author': post.user?.display_name || 'Anonymous',
      'article:published_time': post.created_at,
      'article:tag': post.game_category || 'Gaming',
    },
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const post = await getPost(params.id)

  if (!post) {
    notFound()
  }

  return <PostDetailClient post={post} />
}