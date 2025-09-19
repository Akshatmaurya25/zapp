import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/types/database'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const {
      achievementId,
      userWalletAddress,
      userId,
      txHash,
      tokenId,
      contractAddress,
      achievementName,
      description,
      category,
      rarity
    } = await request.json()

    console.log('Recording NFT mint:', {
      achievementId,
      userWalletAddress: userWalletAddress?.slice(0, 10) + '...',
      userId,
      txHash: txHash?.slice(0, 10) + '...',
      tokenId,
      contractAddress: contractAddress?.slice(0, 10) + '...'
    })

    // Try to update existing achievement record if it exists
    if (achievementId && userId) {
      try {
        const { error: updateError } = await supabase
          .from('user_achievements')
          .update({ is_nft_minted: true })
          .eq('id', achievementId)
          .eq('user_id', userId)

        if (updateError) {
          console.warn('Could not update existing achievement:', updateError)
        } else {
          console.log('Updated existing achievement record')
        }
      } catch (updateErr) {
        console.warn('Failed to update achievement:', updateErr)
      }
    }

    // Create NFT record
    try {
      const { data: nftRecord, error: nftError } = await supabase
        .from('user_nfts')
        .insert({
          user_achievement_id: achievementId,
          user_id: userId,
          token_id: tokenId,
          contract_address: contractAddress,
          metadata_uri: `https://ipfs.io/ipfs/achievement-${achievementId}`,
          metadata: {
            name: achievementName,
            description: description,
            category: category,
            rarity: rarity,
            minted_at: new Date().toISOString()
          },
          tx_hash: txHash,
          minted_at: new Date().toISOString()
        })
        .select()
        .single()

      if (nftError) {
        console.warn('Could not create NFT record:', nftError)
      } else {
        console.log('Created NFT record successfully:', nftRecord)
      }
    } catch (nftErr) {
      console.warn('Failed to create NFT record:', nftErr)
    }

    // Always return success since the NFT was minted successfully on chain
    return NextResponse.json({
      success: true,
      message: 'NFT mint recorded',
      data: {
        achievementId,
        tokenId,
        txHash,
        contractAddress
      }
    })

  } catch (error) {
    console.error('Error recording NFT mint:', error)
    // Don't fail the whole process if database recording fails
    return NextResponse.json({
      success: true,
      message: 'NFT minted successfully (database recording failed)',
      warning: 'Database update failed but NFT was minted on blockchain'
    })
  }
}