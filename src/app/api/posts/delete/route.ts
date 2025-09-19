import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase admin client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function DELETE(request: NextRequest) {
  try {
    const { user_id, post_id } = await request.json()

    if (!user_id || !post_id) {
      return NextResponse.json(
        { error: 'User ID and Post ID are required' },
        { status: 400 }
      )
    }

    // Verify the post belongs to the user before deleting
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('user_id')
      .eq('id', post_id)
      .single()

    if (fetchError) {
      console.error('Error fetching post:', fetchError)
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (post.user_id !== user_id) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only delete your own posts' },
        { status: 403 }
      )
    }

    // Soft delete the post
    const { error: deleteError } = await supabaseAdmin
      .from('posts')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', post_id)
      .eq('user_id', user_id)

    if (deleteError) {
      console.error('Error deleting post:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}