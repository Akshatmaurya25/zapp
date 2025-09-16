import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, fromUserId, toUserId, amount, message, transactionHash } = body

    // Validate required fields
    if (!postId || !fromUserId || !toUserId || !amount || !transactionHash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate amount is positive
    if (parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Record the donation
    const { data: donation, error } = await supabase
      .from('donations')
      .insert([{
        post_id: postId,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        amount: parseFloat(amount),
        message: message || null,
        transaction_hash: transactionHash,
        created_at: new Date().toISOString(),
        status: 'completed'
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: `Failed to record donation: ${error.message}` },
        { status: 500 }
      )
    }

    // Update user's total received donations
    const { error: updateError } = await supabase.rpc('increment_user_donations', {
      user_id: toUserId,
      donation_amount: parseFloat(amount)
    })

    if (updateError) {
      console.error('Failed to update user donation total:', updateError)
    }

    // Create notification for the recipient
    await supabase
      .from('notifications')
      .insert([{
        user_id: toUserId,
        type: 'donation_received',
        title: 'You received a tip!',
        message: `Someone tipped you ${amount} SOMI for your post`,
        data: {
          post_id: postId,
          amount: amount,
          from_user_id: fromUserId,
          donation_id: donation.id
        },
        created_at: new Date().toISOString(),
        is_read: false
      }])

    return NextResponse.json({
      success: true,
      donation: donation
    }, { status: 200 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}