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

    // Get user's minted NFTs
    const { data: nftCollection, error } = await supabase
      .from('platform_nfts')
      .select(`
        *,
        user_achievements (
          *,
          nft_achievement_types (*)
        )
      `)
      .eq('user_id', userId)
      .order('minted_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: `Failed to fetch NFT collection: ${error.message}` },
        { status: 500 }
      )
    }

    // Get collection statistics
    const stats = {
      total_nfts: nftCollection?.length || 0,
      by_category: {},
      by_rarity: {},
      total_value_estimate: 0 // Could calculate based on rarity
    }

    nftCollection?.forEach(nft => {
      const achievement = nft.user_achievements?.nft_achievement_types
      if (achievement) {
        // Count by category
        stats.by_category[achievement.category] = (stats.by_category[achievement.category] || 0) + 1

        // Count by rarity
        const rarityName = getRarityName(achievement.rarity_level)
        stats.by_rarity[rarityName] = (stats.by_rarity[rarityName] || 0) + 1
      }
    })

    return NextResponse.json({
      collection: nftCollection,
      stats
    }, { status: 200 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getRarityName(rarity_level: number): string {
  switch (rarity_level) {
    case 1: return "Common"
    case 2: return "Uncommon"
    case 3: return "Rare"
    case 4: return "Epic"
    case 5: return "Legendary"
    default: return "Common"
  }
}