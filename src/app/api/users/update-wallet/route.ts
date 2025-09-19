import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/types/database'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, newWalletAddress } = await request.json()

    if (!userId || !newWalletAddress) {
      return NextResponse.json(
        { error: 'User ID and new wallet address are required' },
        { status: 400 }
      )
    }

    console.log('Updating wallet for user:', userId)
    console.log('New wallet address:', newWalletAddress)

    // Check if the new wallet address is already in use by another user
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, username')
      .eq('wallet_address', newWalletAddress.toLowerCase())
      .neq('id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking existing wallet:', checkError)
      return NextResponse.json(
        { error: 'Error checking wallet availability' },
        { status: 500 }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { error: `This wallet is already associated with another account: ${existingUser.username}` },
        { status: 409 }
      )
    }

    // Update the user's wallet address
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        wallet_address: newWalletAddress.toLowerCase(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, username, wallet_address')
      .single()

    if (updateError) {
      console.error('Error updating wallet:', updateError)
      return NextResponse.json(
        { error: 'Failed to update wallet address' },
        { status: 500 }
      )
    }

    console.log('Successfully updated wallet for user:', updatedUser)

    return NextResponse.json({
      success: true,
      message: 'Wallet address updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating wallet address:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}