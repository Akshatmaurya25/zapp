import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/types/database'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')

    console.log('=== Debug Achievements API ===')
    console.log('Wallet address:', walletAddress)

    // 1. Check if we can connect to database
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1)

    console.log('Database connection test:', { testData, testError })

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }

    // 2. Find user by wallet address
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, wallet_address, username, display_name')
      .eq('wallet_address', walletAddress)
      .single()

    console.log('User lookup result:', { user, userError })

    if (!user) {
      // Try lowercase
      const { data: userLower, error: userLowerError } = await supabase
        .from('users')
        .select('id, wallet_address, username, display_name')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single()

      console.log('User lookup (lowercase) result:', { userLower, userLowerError })

      if (!userLower) {
        return NextResponse.json({
          debug: {
            walletProvided: walletAddress,
            walletLowercase: walletAddress.toLowerCase(),
            userFound: false,
            errors: { userError, userLowerError }
          }
        })
      }
    }

    const foundUser = user || await supabase
      .from('users')
      .select('id, wallet_address, username, display_name')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single()
      .then(r => r.data)

    if (!foundUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 3. Get user's achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select(`
        id,
        user_id,
        achievement_type_id,
        achieved_at,
        is_nft_minted,
        nft_achievement_types (
          id,
          name,
          display_name,
          description,
          category,
          rarity_level
        )
      `)
      .eq('user_id', foundUser.id)

    console.log('Achievements lookup result:', { achievements, achievementsError })

    return NextResponse.json({
      debug: {
        walletAddress,
        user: foundUser,
        achievements: achievements || [],
        achievementsCount: achievements?.length || 0,
        unmintedCount: achievements?.filter(a => !a.is_nft_minted).length || 0
      }
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', debug: error },
      { status: 500 }
    )
  }
}