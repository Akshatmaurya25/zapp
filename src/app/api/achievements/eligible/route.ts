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

    // Get user's achievements that haven't been minted as NFTs
    const { data: eligibleAchievements, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        nft_achievement_types (*)
      `)
      .eq('user_id', userId)
      .eq('is_nft_minted', false)
      .order('achieved_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: `Failed to fetch eligible achievements: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ eligibleAchievements }, { status: 200 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}