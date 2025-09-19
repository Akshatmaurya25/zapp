import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const {
      stream_id,
      streamer_wallet,
      tipper_wallet,
      amount,
      message,
      tx_hash
    } = await request.json()

    if (!stream_id || !streamer_wallet || !tipper_wallet || !amount || !tx_hash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Verify the stream exists
    const { data: stream, error: streamError } = await supabase
      .from('live_streams')
      .select('*')
      .eq('id', stream_id)
      .single()

    if (streamError || !stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      )
    }

    // Get user IDs from wallet addresses
    const { data: fromUser, error: fromUserError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', tipper_wallet.toLowerCase())
      .single()

    const { data: toUser, error: toUserError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', streamer_wallet.toLowerCase())
      .single()

    if (fromUserError || !fromUser) {
      return NextResponse.json(
        { error: 'Tipper user not found' },
        { status: 404 }
      )
    }

    if (toUserError || !toUser) {
      return NextResponse.json(
        { error: 'Streamer user not found' },
        { status: 404 }
      )
    }

    // Record the tip
    const { data: tip, error: tipError } = await supabase
      .from('stream_tips')
      .insert([
        {
          stream_id,
          from_user_id: fromUser.id,
          to_user_id: toUser.id,
          amount: parseFloat(amount),
          message: message || '',
          tx_hash
        }
      ])
      .select()
      .single()

    if (tipError) {
      console.error('Tip recording error:', tipError)
      return NextResponse.json(
        { error: 'Failed to record tip' },
        { status: 500 }
      )
    }

    // Update stream total tips
    const { error: updateError } = await supabase
      .from('live_streams')
      .update({
        total_tips: parseFloat(stream.total_tips || '0') + parseFloat(amount)
      })
      .eq('id', stream_id)

    if (updateError) {
      console.error('Stream update error:', updateError)
    }

    // Notify streaming server for real-time updates
    try {
      await fetch('http://localhost:9000/api/tip-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          streamKey: stream.stream_key,
          tip: {
            id: tip.id,
            amount,
            message,
            tipper_wallet,
            timestamp: tip.created_at
          }
        })
      })
    } catch (error) {
      console.log('Failed to notify streaming server:', error)
    }

    return NextResponse.json({
      success: true,
      tip,
      message: 'Tip recorded successfully'
    })
  } catch (error) {
    console.error('Tip processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const streamId = searchParams.get('stream_id')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!streamId) {
      return NextResponse.json(
        { error: 'Stream ID required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { data: tips, error } = await supabase
      .from('stream_tips')
      .select('*')
      .eq('stream_id', streamId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Tips fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tips' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      tips,
      total: tips.length
    })
  } catch (error) {
    console.error('Tips list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}