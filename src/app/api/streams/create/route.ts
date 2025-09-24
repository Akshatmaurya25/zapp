import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { title, game_name, thumbnail_hash, userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Try to find the user by ID first
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, wallet_address')
      .eq('id', userId)
      .single()

    // If user not found by ID, try to find by wallet address from context
    if (userError || !user) {
      console.log('User not found by ID, checking if we can find by wallet address...')
      return NextResponse.json(
        { error: 'User not found. Please make sure you have connected your wallet and created a profile.' },
        { status: 404 }
      )
    }

    // Generate unique stream key
    const streamKey = Math.random().toString(36).substring(2, 15) +
                     Math.random().toString(36).substring(2, 15) +
                     Date.now().toString(36)

    // Create stream record in database - set as active so streamers can configure OBS
    const { data: stream, error } = await supabase
      .from('live_streams')
      .insert([
        {
          streamer_id: userId,
          stream_key: streamKey,
          title: title || 'Gaming Stream',
          game_name: game_name || null,
          thumbnail_hash: thumbnail_hash || null,
          is_active: true, // Set to true so streamers can immediately use RTMP details
          viewer_count: 0,
          total_tips: 0,
          rtmp_url: `rtmp://localhost:1935/live/${streamKey}`,
          hls_url: `http://localhost:9000/media/hls/${streamKey}/index.m3u8`,
          started_at: new Date().toISOString() // Set start time when created
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create stream' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      stream,
      rtmp_url: `rtmp://localhost:1935/live/${streamKey}`,
      stream_key: streamKey,
      hls_url: `http://localhost:9000/media/hls/${streamKey}/index.m3u8`
    })
  } catch (error) {
    console.error('Stream creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}