import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { achievementVerificationService } from '@/lib/achievement-verification'

export async function POST(request: NextRequest) {
  try {
    const { platform, platformUserId, accessToken } = await request.json()

    if (!platform || !platformUserId) {
      return NextResponse.json(
        { error: 'Platform and platform user ID are required' },
        { status: 400 }
      )
    }

    // Get user from session
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Check if platform is supported
    const supportedPlatforms = achievementVerificationService.getSupportedPlatforms()
    if (!supportedPlatforms.includes(platform.toLowerCase())) {
      return NextResponse.json(
        { error: `Platform ${platform} is not supported. Supported platforms: ${supportedPlatforms.join(', ')}` },
        { status: 400 }
      )
    }

    // Link the gaming account
    await achievementVerificationService.linkGamingAccount(
      user.id,
      platform.toLowerCase(),
      platformUserId,
      accessToken
    )

    return NextResponse.json({
      success: true,
      message: `${platform} account linked successfully`,
      platform: platform.toLowerCase(),
      platformUserId
    })
  } catch (error) {
    console.error('Link account error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to link account' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Get linked accounts
    const linkedAccounts = await achievementVerificationService.getLinkedAccounts(user.id)
    const supportedPlatforms = achievementVerificationService.getSupportedPlatforms()

    return NextResponse.json({
      linkedAccounts,
      supportedPlatforms,
      availablePlatforms: supportedPlatforms.filter(
        platform => !linkedAccounts.some(account => account.platform === platform)
      )
    })
  } catch (error) {
    console.error('Get linked accounts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch linked accounts' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform parameter is required' },
        { status: 400 }
      )
    }

    // Get user from session
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Remove the linked account
    const { error } = await supabase
      .from('game_integrations')
      .delete()
      .eq('user_id', user.id)
      .eq('platform', platform.toLowerCase())

    if (error) {
      throw new Error(`Failed to unlink account: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      message: `${platform} account unlinked successfully`
    })
  } catch (error) {
    console.error('Unlink account error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to unlink account' },
      { status: 500 }
    )
  }
}