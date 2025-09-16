import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { post_id, user_id, content } = body

    // Validate required fields
    if (!post_id || !user_id || !content?.trim()) {
      return NextResponse.json(
        { error: 'Post ID, user ID, and content are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

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
      console.error('Database error:', error)
      return NextResponse.json(
        { error: `Failed to create comment: ${error.message}` },
        { status: 500 }
      )
    }

    // Update the post's comments count
    const { error: updateError } = await supabase.rpc('increment_post_comments', {
      post_id
    })

    if (updateError) {
      console.error('Failed to update comments count:', updateError)
    }

    // Create notification for the post author
    const { data: post } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', post_id)
      .single()

    if (post && post.user_id !== user_id) {
      await supabase
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