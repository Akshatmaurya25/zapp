import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const activeOnly = searchParams.get('active') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('live_streams')
      .select('*')
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data: streams, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch streams' },
        { status: 500 }
      )
    }

    // Manually fetch user data for each stream
    const streamsWithUsers = await Promise.all(
      streams.map(async (stream) => {
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id, username, display_name, avatar_ipfs')
          .eq('id', stream.streamer_id)
          .single()

        if (userError) {
          console.error('Failed to fetch user for stream:', stream.stream_key, 'Error:', userError)
        } else {
          console.log('Fetched user for stream:', stream.stream_key, 'User:', user)
        }

        return {
          ...stream,
          users: user || null
        }
      })
    )

    // Fetch real-time viewer counts from streaming server
    const streamsWithViewers = await Promise.all(
      streamsWithUsers.map(async (stream) => {
        try {
          const response = await fetch(`http://localhost:9000/api/streams/${stream.stream_key}`)
          if (response.ok) {
            const streamData = await response.json()
            return {
              ...stream,
              viewer_count: streamData.viewer_count || 0,
              is_live: streamData.is_live || false
            }
          }
        } catch {
          console.log('Could not fetch viewer count for stream:', stream.stream_key)
        }
        return {
          ...stream,
          viewer_count: 0,
          is_live: false
        }
      })
    )

    return NextResponse.json({
      streams: streamsWithViewers,
      total: streams.length
    })
  } catch (error) {
    console.error('Stream list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}