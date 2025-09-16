import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Validate postId
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Fetch comments for the post
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:users(id, username, display_name, avatar_ipfs, is_verified)
      `)
      .eq('post_id', postId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: `Failed to fetch comments: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      comments: comments || [],
      pagination: {
        page,
        limit,
        total: comments?.length || 0
      }
    }, { status: 200 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}