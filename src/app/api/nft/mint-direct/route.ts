import { NextRequest, NextResponse } from 'next/server'

// Mock NFT minting function
async function mintNFTOnChain(userWalletAddress: string, metadata: any) {
  const mockTokenId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const mockTxHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
  const contractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "0x1234567890123456789012345678901234567890"

  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  return {
    tokenId: mockTokenId,
    txHash: mockTxHash,
    contractAddress,
    blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
    gasUsed: Math.floor(Math.random() * 100000) + 50000,
    metadata
  }
}

// Get metadata for achievement types
function getAchievementMetadata(achievementId: string) {
  const achievements = {
    'gaming_explorer': {
      name: 'Gaming Explorer',
      description: 'Welcome to the gaming community! You\'ve joined and are ready to explore.',
      badge_icon: '🎮',
      category: 'journey',
      rarity: 'common'
    },
    'community_member': {
      name: 'Community Member',
      description: 'You are now part of the Somnia gaming community!',
      badge_icon: '👥',
      category: 'social',
      rarity: 'common'
    },
    'early_adopter': {
      name: 'Early Adopter',
      description: 'You\'re one of the first to join our platform!',
      badge_icon: '⭐',
      category: 'special',
      rarity: 'uncommon'
    },
    'welcome': {
      name: 'Welcome to Somnia',
      description: 'You\'ve successfully connected to our gaming platform!',
      badge_icon: '🎮',
      category: 'journey',
      rarity: 'common'
    },
    'explorer': {
      name: 'Platform Explorer',
      description: 'Ready to discover what our community has to offer!',
      badge_icon: '🔍',
      category: 'journey',
      rarity: 'common'
    }
  }

  // Determine achievement type from ID
  for (const [key, value] of Object.entries(achievements)) {
    if (achievementId.includes(key.replace('_', '-'))) {
      return value
    }
  }

  // Default achievement
  return {
    name: 'Achievement Unlocked',
    description: 'You\'ve earned a special achievement on the Somnia platform!',
    badge_icon: '🏆',
    category: 'general',
    rarity: 'common'
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { achievementId, userWalletAddress, userId } = body

    console.log('Direct NFT minting for:', { achievementId, userWalletAddress, userId })

    if (!achievementId || !userWalletAddress) {
      return NextResponse.json(
        { error: 'Achievement ID and wallet address are required' },
        { status: 400 }
      )
    }

    // Get achievement metadata
    const achievementMeta = getAchievementMetadata(achievementId)

    // Create NFT metadata
    const metadata = {
      name: achievementMeta.name,
      description: achievementMeta.description,
      image: `https://api.somnia-gaming.com/achievement-images/${achievementId}.png`,
      external_url: `https://somnia-gaming.com/achievements/${achievementId}`,
      attributes: [
        {
          trait_type: "Category",
          value: achievementMeta.category
        },
        {
          trait_type: "Rarity",
          value: achievementMeta.rarity
        },
        {
          trait_type: "Achievement ID",
          value: achievementId
        },
        {
          trait_type: "Minted Date",
          value: new Date().toISOString().split('T')[0]
        },
        {
          trait_type: "Platform",
          value: "Somnia Gaming Social DeFi"
        },
        {
          trait_type: "User Wallet",
          value: userWalletAddress.slice(0, 10) + '...'
        }
      ],
      background_color: "8B5CF6",
      animation_url: null
    }

    // Mint NFT on blockchain (simulated)
    const mintResult = await mintNFTOnChain(userWalletAddress, metadata)

    console.log('Direct NFT minted successfully:', mintResult)

    return NextResponse.json({
      success: true,
      nft: {
        tokenId: mintResult.tokenId,
        txHash: mintResult.txHash,
        contractAddress: mintResult.contractAddress,
        metadata: metadata
      },
      message: 'NFT minted successfully!',
      method: 'direct'
    }, { status: 200 })

  } catch (error) {
    console.error('Direct NFT minting error:', error)
    return NextResponse.json(
      {
        error: 'Failed to mint NFT',
        details: error instanceof Error ? error.message : 'Unknown error',
        method: 'direct'
      },
      { status: 500 }
    )
  }
}