import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, ...updateData } = body

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Check if user exists
    const { data: existingUsers, error: existenceError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user_id)

    if (existenceError) {
      console.error('Error checking user existence:', existenceError)
      return NextResponse.json(
        { error: `Failed to verify user exists: ${existenceError.message}` },
        { status: 500 }
      )
    }

    if (!existingUsers || existingUsers.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const finalUpdateData: any = {
      updated_at: new Date().toISOString(),
    }

    // Only include fields that are provided
    if (updateData.username !== undefined) {
      finalUpdateData.username = updateData.username.toLowerCase()
    }
    if (updateData.display_name !== undefined) {
      finalUpdateData.display_name = updateData.display_name
    }
    if (updateData.bio !== undefined) {
      finalUpdateData.bio = updateData.bio
    }
    if (updateData.avatar_ipfs !== undefined) {
      finalUpdateData.avatar_ipfs = updateData.avatar_ipfs
    }
    if (updateData.website_url !== undefined) {
      finalUpdateData.website_url = updateData.website_url
    }
    if (updateData.twitter_handle !== undefined) {
      finalUpdateData.twitter_handle = updateData.twitter_handle
    }
    if (updateData.discord_handle !== undefined) {
      finalUpdateData.discord_handle = updateData.discord_handle
    }

    console.log('Updating user profile:', { user_id, updateData: finalUpdateData })

    // Perform the update
    const { data, error } = await supabase
      .from('users')
      .update(finalUpdateData)
      .eq('id', user_id)
      .select('*')

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json(
        { error: `Failed to update user: ${error.message}` },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No data returned from update operation' },
        { status: 500 }
      )
    }

    const updatedUser = data[0]
    console.log('Successfully updated user:', updatedUser)

    return NextResponse.json({
      success: true,
      user: updatedUser
    }, { status: 200 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}