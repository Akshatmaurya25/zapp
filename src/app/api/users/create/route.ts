import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.wallet_address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Create server-side Supabase client with service role key to bypass RLS
    const supabase = createServerClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', body.wallet_address.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this wallet address already exists' },
        { status: 409 }
      )
    }

    // Check if username is taken (if provided)
    if (body.username) {
      const { data: existingUsername } = await supabase
        .from('users')
        .select('id')
        .eq('username', body.username.toLowerCase())
        .single()

      if (existingUsername) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 409 }
        )
      }
    }

    // Create new user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          wallet_address: body.wallet_address.toLowerCase(),
          username: body.username?.toLowerCase() || null,
          display_name: body.display_name || null,
          bio: body.bio || null,
          avatar_ipfs: body.avatar_ipfs || null,
          website_url: body.website_url || null,
          twitter_handle: body.twitter_handle || null,
          discord_handle: body.discord_handle || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_active_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: `Failed to create user: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ user: data }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}