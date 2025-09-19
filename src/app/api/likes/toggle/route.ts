import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { AchievementTracker } from '@/lib/achievement-tracker'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, post_id } = body

    // Validate required fields
    if (!user_id || !post_id) {
      return NextResponse.json(
        { error: 'User ID and post ID are required' },
        { status: 400 }
      )
    }

    // Create server-side Supabase client with service role key to bypass RLS
    const supabase = createServerClient()

    // Handle both UUID and integer formats for post_id
    let queryPostId = post_id
    if (/^\d+$/.test(post_id.toString())) {
      try {
        // Try to find the post with integer ID
        const { data: checkPost } = await supabase
          .from('posts')
          .select('id')
          .eq('id', parseInt(post_id.toString()))
          .single()

        if (checkPost) {
          queryPostId = checkPost.id
        }
      } catch {
        console.log('Post with integer ID not found:', post_id)
      }
    }

    // Check if like already exists
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user_id)
      .eq('post_id', queryPostId)
      .single()

    let liked = false

    if (existingLike) {
      // Remove like
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user_id)
        .eq('post_id', queryPostId)

      if (deleteError) {
        console.error('Delete like error:', deleteError)
        return NextResponse.json(
          { error: `Failed to unlike post: ${deleteError.message}` },
          { status: 500 }
        )
      }
      liked = false
    } else {
      // Add like
      const { error: insertError } = await supabase
        .from('likes')
        .insert([{
          user_id,
          post_id: queryPostId,
          created_at: new Date().toISOString(),
        }])

      if (insertError) {
        console.error('Insert like error:', insertError)
        return NextResponse.json(
          { error: `Failed to like post: ${insertError.message}` },
          { status: 500 }
        )
      }
      liked = true
    }

    // Get the updated likes count (triggers will handle the count update automatically)
    const { data: post } = await supabase
      .from('posts')
      .select('likes_count, user_id')
      .eq('id', queryPostId)
      .single()

    const likesCount = post?.likes_count || 0

    // Track achievement for like action
    try {
      if (liked) {
        // User gave a like
        await AchievementTracker.onUserAction(user_id, 'LIKE_GIVEN', {
          postId: queryPostId,
          targetUserId: post?.user_id
        })

        // Also track for the post owner (like received)
        if (post?.user_id && post.user_id !== user_id) {
          await AchievementTracker.onUserAction(post.user_id, 'LIKE_RECEIVED', {
            postId: queryPostId,
            fromUserId: user_id
          })
        }
      }
    } catch (achievementError) {
      console.error('Achievement tracking error:', achievementError)
      // Don't fail the like operation if achievement tracking fails
    }

    return NextResponse.json({ liked, likesCount }, { status: 200 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}