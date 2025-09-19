import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { AchievementTracker } from '@/lib/achievement-tracker'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { post_id, user_id, content } = body

    // Validate required fields
    if (!post_id || !user_id || !content?.trim()) {
      console.error('Validation failed:', { post_id, user_id, content })
      return NextResponse.json(
        { error: 'Post ID, user ID, and content are required' },
        { status: 400 }
      )
    }

    // Additional validation
    if (content.trim().length < 1 || content.trim().length > 1000) {
      return NextResponse.json(
        { error: 'Comment content must be between 1 and 1000 characters' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    console.log('Creating comment:', { post_id, user_id, content: content.trim() })

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

    // First verify the post exists
    const { data: postExists, error: postError } = await supabase
      .from('posts')
      .select('id, user_id')
      .eq('id', queryPostId)
      .single()

    if (postError || !postExists) {
      console.error('Post not found:', postError)
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Verify user exists
    const { data: userExists, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user_id)
      .single()

    if (userError || !userExists) {
      console.error('User not found:', userError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create the comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert([{
        post_id: queryPostId,
        user_id,
        content: content.trim(),
        created_at: new Date().toISOString(),
        is_deleted: false
      }])
      .select(`
        *,
        user:users(id, username, display_name, avatar_ipfs, is_verified)
      `)
      .single()

    if (error) {
      console.error('Database error creating comment:', error)
      return NextResponse.json(
        { error: `Failed to create comment: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('Comment created successfully:', comment)

    // Update the post's comments count by fetching current count and incrementing
    const { data: currentPost, error: fetchError } = await supabase
      .from('posts')
      .select('comments_count')
      .eq('id', queryPostId)
      .single()

    if (!fetchError && currentPost) {
      const newCount = (currentPost.comments_count || 0) + 1
      const { error: updateError } = await supabase
        .from('posts')
        .update({ comments_count: newCount })
        .eq('id', queryPostId)

      if (updateError) {
        console.error('Failed to update comments count:', updateError)
      }
    }

    // Create notification for the post author (don't fail if this fails)
    try {
      if (postExists && postExists.user_id !== user_id) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([{
            user_id: postExists.user_id,
            type: 'comment',
            title: 'New comment on your post',
            message: `${comment.user?.display_name || 'Someone'} commented on your post`,
            data: {
              post_id: queryPostId,
              comment_id: comment.id,
              commenter_id: user_id
            },
            created_at: new Date().toISOString(),
            is_read: false
          }])

        if (notificationError) {
          console.error('Failed to create notification:', notificationError)
        }
      }
    } catch (notificationError) {
      console.error('Notification creation failed:', notificationError)
      // Don't fail the request if notification creation fails
    }

    // Track achievement for comment creation
    try {
      await AchievementTracker.onUserAction(user_id, 'COMMENT_MADE', {
        postId: queryPostId,
        commentId: comment.id,
        targetUserId: postExists?.user_id
      })

      // Also track for post owner (comment received)
      if (postExists && postExists.user_id !== user_id) {
        await AchievementTracker.onUserAction(postExists.user_id, 'COMMENT_RECEIVED', {
          postId: queryPostId,
          commentId: comment.id,
          fromUserId: user_id
        })
      }
    } catch (achievementError) {
      console.error('Achievement tracking error:', achievementError)
      // Don't fail the comment creation if achievement tracking fails
    }

    return NextResponse.json({
      comment
    }, { status: 200 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}