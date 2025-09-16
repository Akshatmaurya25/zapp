import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

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

    // First verify the post exists
    const { data: postExists, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', post_id)
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
        post_id,
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
      .eq('id', post_id)
      .single()

    if (!fetchError && currentPost) {
      const newCount = (currentPost.comments_count || 0) + 1
      const { error: updateError } = await supabase
        .from('posts')
        .update({ comments_count: newCount })
        .eq('id', post_id)

      if (updateError) {
        console.error('Failed to update comments count:', updateError)
      }
    }

    // Create notification for the post author (don't fail if this fails)
    try {
      const { data: post } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', post_id)
        .single()

      if (post && post.user_id !== user_id) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([{
            user_id: post.user_id,
            type: 'comment',
            title: 'New comment on your post',
            message: `${comment.user?.display_name || 'Someone'} commented on your post`,
            data: {
              post_id,
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

    return NextResponse.json({
      success: true,
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