import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/types/database'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { achievementId, txHash, tokenId, contractAddress } = await request.json()

    if (!achievementId || !txHash || !tokenId || !contractAddress) {
      return NextResponse.json(
        { error: 'All fields are required: achievementId, txHash, tokenId, contractAddress' },
        { status: 400 }
      )
    }

    // Update the achievement to mark as minted
    const { error: updateError } = await supabase
      .from('user_achievements')
      .update({ is_nft_minted: true })
      .eq('id', achievementId)

    if (updateError) {
      console.error('Error updating achievement:', updateError)
      return NextResponse.json(
        { error: 'Failed to update achievement status' },
        { status: 500 }
      )
    }

    // Create NFT record
    const { error: insertError } = await supabase
      .from('user_nfts')
      .insert({
        user_achievement_id: achievementId,
        token_id: tokenId,
        contract_address: contractAddress,
        metadata_uri: `https://ipfs.io/ipfs/achievement-${achievementId}`,
        metadata: {},
        tx_hash: txHash,
        minted_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Error creating NFT record:', insertError)
      // Try to rollback the achievement update
      await supabase
        .from('user_achievements')
        .update({ is_nft_minted: false })
        .eq('id', achievementId)

      return NextResponse.json(
        { error: 'Failed to create NFT record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'NFT mint confirmed and recorded'
    })

  } catch (error) {
    console.error('Error confirming NFT mint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}