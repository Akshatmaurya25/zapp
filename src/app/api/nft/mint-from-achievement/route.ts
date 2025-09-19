import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { mintAchievementNFT, uploadToIPFS } from '@/lib/web3-nft'

// Force load environment variables
if (typeof window === 'undefined') {
  // Load environment variables for server-side execution
  import('dotenv').then(dotenv => dotenv.config({ path: '.env.local' }));
}

// Get default metadata for achievement types
function getDefaultMetadata(achievementType: string) {
  const defaultMetadata = {
    gaming_explorer: {
      name: 'Gaming Explorer',
      description: 'Welcome to the gaming community! You\'ve joined and are ready to explore.',
      badge_icon: '🎮',
      category: 'journey',
      rarity: 'common'
    },
    community_member: {
      name: 'Community Member',
      description: 'You are now part of the Somnia gaming community!',
      badge_icon: '👥',
      category: 'social',
      rarity: 'common'
    },
    early_adopter: {
      name: 'Early Adopter',
      description: 'You\'re one of the first to join our platform!',
      badge_icon: '⭐',
      category: 'special',
      rarity: 'uncommon'
    },
    welcome: {
      name: 'Welcome to Somnia',
      description: 'You\'ve successfully connected to our gaming platform!',
      badge_icon: '🎮',
      category: 'journey',
      rarity: 'common'
    },
    explorer: {
      name: 'Platform Explorer',
      description: 'Ready to discover what our community has to offer!',
      badge_icon: '🔍',
      category: 'journey',
      rarity: 'common'
    },
    default: {
      name: 'Achievement Unlocked',
      description: 'You\'ve earned a special achievement!',
      badge_icon: '🏆',
      category: 'general',
      rarity: 'common'
    }
  }

  return defaultMetadata[achievementType as keyof typeof defaultMetadata] || defaultMetadata.default
}

function getRarityLevel(rarity: string): number {
  switch (rarity.toLowerCase()) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 3
    case 'epic': return 4
    case 'legendary': return 5
    default: return 1
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { achievementId, userWalletAddress } = body

    console.log('🚀 NFT Minting API Called')
    console.log('   - achievementId:', achievementId)
    console.log('   - userWalletAddress:', userWalletAddress)

    // Debug environment variables
    console.log('🔍 Environment Check:')
    console.log('   - NEXT_PUBLIC_NFT_CONTRACT_ADDRESS:', process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS ? 'SET' : 'MISSING')
    console.log('   - NFT_MINTING_PRIVATE_KEY:', process.env.NFT_MINTING_PRIVATE_KEY ? 'SET' : 'MISSING')
    console.log('   - NEXT_PUBLIC_RPC_URL:', process.env.NEXT_PUBLIC_RPC_URL || 'DEFAULT')

    if (!achievementId || !userWalletAddress) {
      return NextResponse.json(
        { error: 'Achievement ID and wallet address are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Try to get the achievement from multiple sources
    let achievement = null
    const achievementError = null

    // First try the achievements table
    const { data: dbAchievement, error: dbError } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', achievementId)
      .single()

    if (dbAchievement) {
      achievement = dbAchievement
      console.log('Found achievement in database:', achievement)
    } else {
      console.log('Achievement not in database:', dbError)

      // If not found in database, create a default achievement for minting
      // Extract user ID from achievement ID pattern
      const userIdMatch = achievementId.match(/^(.+?)-/)
      if (userIdMatch) {
        const userId = userIdMatch[1]

        // Create a default achievement based on the achievement ID
        const achievementType = achievementId.includes('gaming-explorer') ? 'gaming_explorer' :
                               achievementId.includes('community') ? 'community_member' :
                               achievementId.includes('early-adopter') ? 'early_adopter' :
                               achievementId.includes('welcome') ? 'welcome' :
                               achievementId.includes('explorer') ? 'explorer' : 'default'

        achievement = {
          id: achievementId,
          user_id: userId,
          achievement_type: achievementType,
          metadata: getDefaultMetadata(achievementType),
          earned_at: new Date().toISOString()
        }

        console.log('Created default achievement for minting:', achievement)
      }
    }

    if (!achievement) {
      console.error('Could not find or create achievement:', achievementId)
      return NextResponse.json(
        { error: 'Achievement not found and could not be created' },
        { status: 404 }
      )
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', achievement.user_id)
      .single()

    // If user not found in database, create a default user object for minting
    const userForMinting = user || {
      id: achievement.user_id,
      username: 'Anonymous',
      display_name: 'Gaming User',
      wallet_address: userWalletAddress
    }

    console.log('User for minting:', userForMinting)

    // Create NFT metadata
    const metadata = {
      name: achievement.metadata.name,
      description: achievement.metadata.description,
      image: `https://api.somnia-gaming.com/achievement-images/${achievement.achievement_type}.png`,
      external_url: `https://somnia-gaming.com/achievements/${achievement.id}`,
      attributes: [
        {
          trait_type: "Category",
          value: achievement.metadata.category || 'general'
        },
        {
          trait_type: "Rarity",
          value: achievement.metadata.rarity || 'common'
        },
        {
          trait_type: "Achievement Type",
          value: achievement.achievement_type
        },
        {
          trait_type: "Earned Date",
          value: new Date(achievement.earned_at).toISOString().split('T')[0]
        },
        {
          trait_type: "Platform",
          value: "Somnia Gaming Social DeFi"
        },
        {
          trait_type: "User",
          value: userForMinting.username || userForMinting.display_name || "Anonymous"
        }
      ],
      background_color: "8B5CF6",
      animation_url: null
    }

    // Upload metadata to IPFS
    const metadataURI = await uploadToIPFS(metadata)

    // Mint NFT on blockchain
    const mintResult = await mintAchievementNFT({
      userWalletAddress,
      achievementName: achievement.metadata.name,
      description: achievement.metadata.description,
      category: achievement.metadata.category || 'general',
      rarity: getRarityLevel(achievement.metadata.rarity || 'common'),
      metadataURI,
      isLimitedEdition: false
    })

    if (!mintResult.success) {
      return NextResponse.json(
        { error: mintResult.error || 'Failed to mint NFT on blockchain' },
        { status: 500 }
      )
    }

    // Try to store NFT record in database (optional)
    try {
      const { error: nftError } = await supabase
        .from('nfts')
        .insert({
          user_id: achievement.user_id,
          achievement_id: achievement.id,
          token_id: mintResult.tokenId!,
          contract_address: mintResult.contractAddress!,
          tx_hash: mintResult.txHash!,
          metadata: metadata,
          minted_at: new Date().toISOString()
        })
        .select()
        .single()

      if (nftError) {
        console.error('Error storing NFT record:', nftError)
      } else {
        console.log('NFT record stored successfully')
      }
    } catch (err) {
      console.error('Failed to store NFT record:', err)
      // Don't fail the minting process
    }

    // Try to mark achievement as minted (optional)
    try {
      await supabase
        .from('achievements')
        .update({
          metadata: {
            ...achievement.metadata,
            nft_minted: true,
            nft_token_id: mintResult.tokenId!,
            nft_tx_hash: mintResult.txHash!
          }
        })
        .eq('id', achievementId)
    } catch (err) {
      console.error('Failed to update achievement:', err)
      // Don't fail the minting process
    }

    console.log('NFT minted successfully:', mintResult)

    return NextResponse.json({
      success: true,
      nft: {
        tokenId: mintResult.tokenId!,
        txHash: mintResult.txHash!,
        contractAddress: mintResult.contractAddress!,
        metadata: metadata
      },
      message: 'NFT minted successfully!'
    }, { status: 200 })

  } catch (error) {
    console.error('NFT minting error:', error)
    return NextResponse.json(
      { error: 'Failed to mint NFT', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}