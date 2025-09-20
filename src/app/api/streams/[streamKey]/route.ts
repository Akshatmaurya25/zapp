import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ streamKey: string }> }
) {
  try {
    const { streamKey } = await params
    const supabase = createServerClient()

    const { data: stream, error } = await supabase
      .from('live_streams')
      .select('*')
      .eq('stream_key', streamKey)
      .single()

    if (error || !stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      )
    }

    // Fetch user data separately
    const { data: user } = await supabase
      .from('users')
      .select('id, username, display_name, avatar_ipfs, wallet_address')
      .eq('id', stream.streamer_id)
      .single()

    // Get real-time data from streaming server
    let liveData = {
      viewer_count: 0,
      is_live: false
    }

    try {
      const response = await fetch(`http://localhost:9000/api/streams/${streamKey}`)
      if (response.ok) {
        const data = await response.json()
        liveData = {
          viewer_count: data.viewer_count || 0,
          is_live: data.is_live || false
        }
      }
    } catch {
      console.log('Could not fetch live data for stream:', streamKey)
    }

    return NextResponse.json({
      ...stream,
      ...liveData,
      users: user
    })
  } catch (error) {
    console.error('Stream fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ streamKey: string }> }
) {
  try {
    const { streamKey } = await params
    const { title, game_name } = await request.json()

    // Get user from session
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Update stream
    const { data: stream, error } = await supabase
      .from('live_streams')
      .update({
        title: title || 'Gaming Stream',
        game_name: game_name || null,
        updated_at: new Date().toISOString()
      })
      .eq('stream_key', streamKey)
      .eq('streamer_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update stream' },
        { status: 500 }
      )
    }

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json(stream)
  } catch (error) {
    console.error('Stream update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ streamKey: string }> }
) {
  try {
    const { streamKey } = await params
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Mark stream as inactive
    const { data: stream, error } = await supabase
      .from('live_streams')
      .update({
        is_active: false,
        ended_at: new Date().toISOString()
      })
      .eq('stream_key', streamKey)
      .eq('streamer_id', userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to end stream' },
        { status: 500 }
      )
    }

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Stream ended successfully' })
  } catch (error) {
    console.error('Stream delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}