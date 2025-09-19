import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/types/database'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '0xf58207a53f6e3965DfF8bf17DD368F8157D88Eb9'

export async function POST(request: NextRequest) {
  try {
    const { achievementId, userWalletAddress, userId } = await request.json()

    if (!achievementId || (!userWalletAddress && !userId)) {
      return NextResponse.json(
        { error: 'Achievement ID and either user wallet address or user ID are required' },
        { status: 400 }
      )
    }

    console.log('=== Prepare Mint API ===')
    console.log('Achievement ID:', achievementId)
    console.log('Wallet Address:', userWalletAddress)
    console.log('User ID:', userId)

    // Find user either by ID or wallet address
    let user, userError

    if (userId) {
      // Direct lookup by user ID
      const result = await supabase
        .from('users')
        .select('id, wallet_address')
        .eq('id', userId)
        .single()

      user = result.data
      userError = result.error
    } else if (userWalletAddress) {
      // Try exact match first
      const exactMatch = await supabase
        .from('users')
        .select('id, wallet_address')
        .eq('wallet_address', userWalletAddress)
        .single()

      if (exactMatch.data) {
        user = exactMatch.data
        userError = null
      } else {
        // Try lowercase match
        const lowerMatch = await supabase
          .from('users')
          .select('id, wallet_address')
          .eq('wallet_address', userWalletAddress.toLowerCase())
          .single()

        user = lowerMatch.data
        userError = lowerMatch.error
      }
    }

    if (userError || !user) {
      console.error('User lookup error:', userError)
      console.error('Wallet address provided:', userWalletAddress)
      console.error('User ID provided:', userId)

      return NextResponse.json(
        { error: 'User not found with provided identifier' },
        { status: 404 }
      )
    }

    console.log('Found user:', user)

    // Get achievement details
    let achievement, achievementError

    // First try to get from proper user_achievements table
    const dbResult = await supabase
      .from('user_achievements')
      .select(`
        *,
        nft_achievement_types (
          id,
          name,
          display_name,
          description,
          category,
          rarity_level,
          color_scheme,
          badge_icon
        )
      `)
      .eq('id', achievementId)
      .eq('user_id', user.id)
      .single()

    if (dbResult.data) {
      achievement = dbResult.data
      achievementError = null
    } else {
      // If not found in database, check if it's a generated achievement
      console.log('Achievement not found in database, checking if it\'s a generated one...')

      // Check if the achievementId has the old format (contains userId)
      if (achievementId.includes(user.id)) {
        console.log('Detected old format achievement ID, creating mock achievement data')

        // Extract the achievement type from the ID
        const achievementType = achievementId.includes('welcome') ? 'welcome' :
                               achievementId.includes('explorer') ? 'explorer' :
                               achievementId.includes('gaming-explorer') ? 'gaming-explorer' :
                               'unknown'

        // Create mock achievement data for these generated IDs
        const mockAchievementTypes = {
          'welcome': {
            id: 'welcome-type',
            name: 'welcome',
            display_name: 'Welcome to Somnia',
            description: 'You\'ve successfully connected to our gaming platform!',
            category: 'journey',
            rarity_level: 1,
            color_scheme: '#8B5CF6',
            badge_icon: '🎮'
          },
          'explorer': {
            id: 'explorer-type',
            name: 'explorer',
            display_name: 'Platform Explorer',
            description: 'Ready to discover what our community has to offer!',
            category: 'journey',
            rarity_level: 1,
            color_scheme: '#10B981',
            badge_icon: '🔍'
          }
        }

        const mockType = mockAchievementTypes[achievementType] || mockAchievementTypes['welcome']

        achievement = {
          id: achievementId,
          user_id: user.id,
          achievement_type_id: mockType.id,
          achieved_at: new Date().toISOString(),
          metric_value: 1,
          metadata: {},
          is_nft_minted: false,
          nft_achievement_types: mockType
        }

        console.log('Created mock achievement:', achievement)
      } else {
        console.error('Achievement query error:', dbResult.error)
        console.error('Achievement ID:', achievementId)
        console.error('User ID:', user.id)
        return NextResponse.json(
          { error: 'Achievement not found or not owned by user' },
          { status: 404 }
        )
      }
    }

    // Check if already minted
    if (achievement.is_nft_minted) {
      return NextResponse.json(
        { error: 'NFT already minted for this achievement' },
        { status: 400 }
      )
    }

    const achievementType = achievement.nft_achievement_types

    // Create metadata
    const metadata = {
      name: achievementType.display_name,
      description: achievementType.description,
      image: `https://gateway.pinata.cloud/ipfs/achievement-${achievementType.id}`, // Placeholder
      attributes: [
        { trait_type: 'Category', value: achievementType.category },
        { trait_type: 'Rarity', value: achievementType.rarity_level },
        { trait_type: 'Achievement Date', value: achievement.achieved_at },
      ],
      external_url: `${process.env.NEXT_PUBLIC_APP_URL}/achievements/${achievementId}`,
    }

    // Upload metadata to IPFS (mock for now)
    const metadataURI = `https://ipfs.io/ipfs/mock-${achievementId}-${Date.now()}`

    // Map category to enum values
    const categoryMap: { [key: string]: number } = {
      'journey': 0,
      'creator': 1,
      'social': 2,
      'loyalty': 3,
      'gaming': 4,
      'special': 5
    }

    const response = {
      contractAddress: CONTRACT_ADDRESS,
      achievementName: achievementType.display_name,
      description: achievementType.description,
      category: categoryMap[achievementType.category] || 0,
      rarity: achievementType.rarity_level - 1, // Convert to 0-based
      metadataURI,
      isLimitedEdition: achievementType.rarity_level >= 4, // Epic and Legendary are limited
      metadata
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error preparing NFT mint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}