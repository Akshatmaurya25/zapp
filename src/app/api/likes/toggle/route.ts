import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

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

    // Check if like already exists
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user_id)
      .eq('post_id', post_id)
      .single()

    let liked = false

    if (existingLike) {
      // Remove like
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user_id)
        .eq('post_id', post_id)

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
          post_id,
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

    // Update the likes count on the post
    if (liked) {
      await supabase.rpc('increment_post_likes', { post_id })
    } else {
      await supabase.rpc('decrement_post_likes', { post_id })
    }

    // Get the updated likes count
    const { data: post } = await supabase
      .from('posts')
      .select('likes_count')
      .eq('id', post_id)
      .single()

    const likesCount = post?.likes_count || 0

    return NextResponse.json({ liked, likesCount }, { status: 200 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}