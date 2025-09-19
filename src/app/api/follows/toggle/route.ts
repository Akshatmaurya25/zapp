import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { followingId, action } = await request.json()

    // Get user ID from request headers (set by your auth middleware)
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      )
    }

    if (!followingId) {
      return NextResponse.json(
        { error: 'Following ID is required' },
        { status: 400 }
      )
    }

    if (userId === followingId) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    if (action === 'follow') {
      // Create follow relationship
      const { error } = await supabase
        .from('follows')
        .insert([{
          follower_id: userId,
          following_id: followingId
        }])

      if (error) {
        // Check if already following
        if (error.code === '23505') {
          return NextResponse.json(
            { error: 'Already following this user' },
            { status: 409 }
          )
        }
        throw error
      }

      // Update follower counts
      const [followerUser, followingUser] = await Promise.all([
        supabase.from('users').select('following_count').eq('id', userId).single(),
        supabase.from('users').select('followers_count').eq('id', followingId).single()
      ])

      await Promise.all([
        supabase
          .from('users')
          .update({ following_count: (followerUser.data?.following_count || 0) + 1 })
          .eq('id', userId),
        supabase
          .from('users')
          .update({ followers_count: (followingUser.data?.followers_count || 0) + 1 })
          .eq('id', followingId)
      ])

      return NextResponse.json({
        success: true,
        action: 'followed',
        message: 'Successfully followed user'
      })

    } else if (action === 'unfollow') {
      // Remove follow relationship
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', userId)
        .eq('following_id', followingId)

      if (error) throw error

      // Update follower counts
      const [followerUser, followingUser] = await Promise.all([
        supabase.from('users').select('following_count').eq('id', userId).single(),
        supabase.from('users').select('followers_count').eq('id', followingId).single()
      ])

      await Promise.all([
        supabase
          .from('users')
          .update({ following_count: Math.max((followerUser.data?.following_count || 0) - 1, 0) })
          .eq('id', userId),
        supabase
          .from('users')
          .update({ followers_count: Math.max((followingUser.data?.followers_count || 0) - 1, 0) })
          .eq('id', followingId)
      ])

      return NextResponse.json({
        success: true,
        action: 'unfollowed',
        message: 'Successfully unfollowed user'
      })

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "follow" or "unfollow"' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Follow toggle error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}