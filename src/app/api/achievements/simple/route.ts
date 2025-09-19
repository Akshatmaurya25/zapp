import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get achievements from the simple achievements table that haven't been minted as NFTs
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: `Failed to fetch achievements: ${error.message}` },
        { status: 500 }
      )
    }

    // Filter out achievements that have already been minted
    const unmintedAchievements = achievements?.filter(achievement =>
      !achievement.metadata?.nft_minted
    ) || []

    return NextResponse.json({
      achievements: unmintedAchievements,
      total: achievements?.length || 0,
      unminted: unmintedAchievements.length
    }, { status: 200 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}