import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { mintAchievementNFT, uploadToIPFS } from '@/lib/web3-nft'

// Force load environment variables
if (typeof window === 'undefined') {
  // Load environment variables for server-side execution
  import('dotenv').then(dotenv => dotenv.config({ path: '.env.local' }));
}

// NFT Metadata generation helper
async function generateNFTMetadata(achievement: Record<string, unknown>, user: Record<string, unknown>) {
  const achievementType = achievement.nft_achievement_types

  return {
    name: achievementType.display_name,
    description: achievementType.description,
    image: `https://api.somnia-nft.example.com/achievement-images/${achievementType.name}.png`,
    external_url: `https://somnia-dapp.example.com/achievements/${achievement.id}`,
    attributes: [
      {
        trait_type: "Category",
        value: achievementType.category
      },
      {
        trait_type: "Rarity",
        value: getRarityName(achievementType.rarity_level)
      },
      {
        trait_type: "Achieved Date",
        value: new Date(achievement.achieved_at).toISOString().split('T')[0]
      },
      {
        trait_type: "Platform",
        value: "Somnia Gaming Social DeFi"
      },
      {
        trait_type: "Achievement ID",
        value: achievement.id
      },
      {
        trait_type: "User",
        value: user.username || user.display_name || "Anonymous"
      }
    ],
    background_color: achievementType.color_scheme?.replace('#', '') || "808080",
    animation_url: null,
    youtube_url: null
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { achievementId, userWalletAddress } = body

    if (!achievementId || !userWalletAddress) {
      return NextResponse.json(
        { error: 'Achievement ID and wallet address are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get achievement details with user info
    const { data: achievement, error: achievementError } = await supabase
      .from('user_achievements')
      .select(`
        *,
        nft_achievement_types (*),
        users!user_achievements_user_id_fkey (
          id,
          username,
          display_name,
          wallet_address
        )
      `)
      .eq('id', achievementId)
      .single()

    if (achievementError || !achievement) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      )
    }

    // Verify wallet address matches user
    if (achievement.users.wallet_address.toLowerCase() !== userWalletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Wallet address does not match achievement owner' },
        { status: 403 }
      )
    }

    // Check if already minted
    if (achievement.is_nft_minted) {
      return NextResponse.json(
        { error: 'Achievement has already been minted as NFT' },
        { status: 400 }
      )
    }

    // Generate NFT metadata
    const metadata = await generateNFTMetadata(achievement, achievement.users)

    // Upload metadata to IPFS/hosting
    const metadataURI = await uploadToIPFS(metadata)

    // Mint NFT on blockchain
    const mintResult = await mintAchievementNFT({
      userWalletAddress,
      achievementName: achievement.metadata.display_name,
      description: achievement.metadata.description,
      category: achievement.metadata.category,
      rarity: achievement.metadata.rarity_level,
      metadataURI,
      isLimitedEdition: false
    })

    if (!mintResult.success) {
      return NextResponse.json(
        { error: mintResult.error || 'Failed to mint NFT on blockchain' },
        { status: 500 }
      )
    }

    // Record NFT in database
    const { error: nftError } = await supabase
      .from('platform_nfts')
      .insert({
        user_id: achievement.user_id,
        achievement_id: achievementId,
        token_id: mintResult.tokenId!,
        contract_address: mintResult.contractAddress!,
        metadata_uri: metadataURI,
        metadata: metadata,
        tx_hash: mintResult.txHash!,
        blockchain_network: 'somnia'
      })
      .select()
      .single()

    if (nftError) {
      console.error('Failed to record NFT:', nftError)
      return NextResponse.json(
        { error: 'Failed to record NFT in database' },
        { status: 500 }
      )
    }

    // Mark achievement as minted
    const { error: updateError } = await supabase
      .from('user_achievements')
      .update({
        is_nft_minted: true,
        nft_mint_requested_at: new Date().toISOString()
      })
      .eq('id', achievementId)

    if (updateError) {
      console.error('Failed to update achievement:', updateError)
      // NFT was minted but we couldn't update the record - log this for manual fix
    }

    return NextResponse.json({
      success: true,
      nft: {
        tokenId: mintResult.tokenId!,
        txHash: mintResult.txHash!,
        contractAddress: mintResult.contractAddress!,
        metadataURI,
        explorerUrl: `https://shannon-explorer.somnia.network/tx/${mintResult.txHash!}`
      }
    }, { status: 200 })

  } catch (error) {
    console.error('NFT minting error:', error)
    return NextResponse.json(
      { error: 'Internal server error during NFT minting' },
      { status: 500 }
    )
  }
}