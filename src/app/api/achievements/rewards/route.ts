import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'completed', 'all'

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

    // Build query based on status filter
    let query = supabase
      .from('gaming_achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('verified_at', { ascending: false })

    if (status === 'pending') {
      query = query.is('tx_hash', null)
    } else if (status === 'completed') {
      query = query.not('tx_hash', 'is', null)
    }

    const { data: achievements, error } = await query

    if (error) {
      throw new Error(`Failed to fetch rewards: ${error.message}`)
    }

    // Calculate summary statistics
    const totalRewards = achievements?.reduce((sum, ach) => {
      return sum + parseFloat(ach.reward_amount || '0')
    }, 0) || 0

    const pendingRewards = achievements?.filter(ach => !ach.tx_hash) || []
    const completedRewards = achievements?.filter(ach => ach.tx_hash) || []

    const pendingAmount = pendingRewards.reduce((sum, ach) => {
      return sum + parseFloat(ach.reward_amount || '0')
    }, 0)

    const completedAmount = completedRewards.reduce((sum, ach) => {
      return sum + parseFloat(ach.reward_amount || '0')
    }, 0)

    return NextResponse.json({
      success: true,
      achievements: achievements || [],
      summary: {
        totalCount: achievements?.length || 0,
        totalRewards,
        pendingCount: pendingRewards.length,
        pendingAmount,
        completedCount: completedRewards.length,
        completedAmount
      },
      filter: status || 'all'
    })
  } catch (error) {
    console.error('Get rewards error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch rewards' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { achievementIds } = await request.json()

    if (!achievementIds || !Array.isArray(achievementIds)) {
      return NextResponse.json(
        { error: 'Achievement IDs array is required' },
        { status: 400 }
      )
    }

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

    // Get pending achievements
    const { data: achievements, error } = await supabase
      .from('gaming_achievements')
      .select('*')
      .eq('user_id', user.id)
      .in('id', achievementIds)
      .is('tx_hash', null)

    if (error) {
      throw new Error(`Failed to fetch achievements: ${error.message}`)
    }

    if (!achievements || achievements.length === 0) {
      return NextResponse.json(
        { error: 'No claimable achievements found' },
        { status: 404 }
      )
    }

    // In a real implementation, this would trigger the blockchain reward claiming process
    // For now, we'll simulate this by updating the achievements as "claimed"

    const totalReward = achievements.reduce((sum, ach) => {
      return sum + parseFloat(ach.reward_amount || '0')
    }, 0)

    // Simulate blockchain transaction
    const simulatedTxHash = `0x${Math.random().toString(16).substring(2)}${Date.now().toString(16)}`

    // Update achievements with simulated transaction hash
    const { error: updateError } = await supabase
      .from('gaming_achievements')
      .update({
        tx_hash: simulatedTxHash
      })
      .in('id', achievementIds)
      .eq('user_id', user.id)

    if (updateError) {
      throw new Error(`Failed to update achievements: ${updateError.message}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Rewards claimed successfully',
      claimedCount: achievements.length,
      totalReward,
      txHash: simulatedTxHash,
      achievements: achievements.map(ach => ({
        id: ach.id,
        achievement_name: ach.achievement_name,
        reward_amount: ach.reward_amount
      }))
    })
  } catch (error) {
    console.error('Claim rewards error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to claim rewards' },
      { status: 500 }
    )
  }
}