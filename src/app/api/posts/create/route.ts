import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { AchievementTracker } from '@/lib/achievement-tracker'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.user_id || !body.content) {
      return NextResponse.json(
        { error: 'User ID and content are required' },
        { status: 400 }
      )
    }

    // Create server-side Supabase client with service role key to bypass RLS
    const supabase = createServerClient()

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', body.user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    // Process media types - default to image and detect videos
    let processedMediaTypes = null
    if (body.media_ipfs && body.media_ipfs.length > 0) {
      processedMediaTypes = body.media_ipfs.map((hash: string, index: number) => {
        // Check if media type was explicitly provided
        if (body.media_types && body.media_types[index]) {
          return body.media_types[index]
        }

        // Check if the hash or filename suggests a video format
        const hashLower = hash.toLowerCase()
        const videoPatterns = [
          '.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v',
          '.flv', '.wmv', '.3gp', '.ogv', 'mp4', 'webm', 'mov', '.ogg'
        ]

        const isVideo = videoPatterns.some(pattern => hashLower.includes(pattern))
        return isVideo ? 'video/mp4' : 'image/jpeg'
      })
    }

    // Create new post
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          user_id: body.user_id,
          content: body.content,
          media_ipfs: body.media_ipfs || null,
          media_types: processedMediaTypes,
          game_category: body.game_category || 'general',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select(`
        *,
        user:users(id, username, display_name, avatar_ipfs, is_verified)
      `)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: `Failed to create post: ${error.message}` },
        { status: 500 }
      )
    }

    // Track achievement for post creation
    try {
      await AchievementTracker.onUserAction(body.user_id, 'POST_CREATED', {
        postId: data.id,
        postType: body.game_category === 'general' ? 'general' : 'gaming',
        gameGenre: body.game_category !== 'general' ? body.game_category : undefined,
        isScreenshot: body.media_ipfs ? true : false
      })
    } catch (achievementError) {
      console.error('Achievement tracking error:', achievementError)
      // Don't fail the post creation if achievement tracking fails
    }

    return NextResponse.json({ post: data }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}