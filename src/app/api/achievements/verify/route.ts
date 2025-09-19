import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { achievementVerificationService } from '@/lib/achievement-verification'

export async function POST(request: NextRequest) {
  try {
    const { platform, gameId, achievementId } = await request.json()

    if (!platform || !gameId || !achievementId) {
      return NextResponse.json(
        { error: 'Platform, game ID, and achievement ID are required' },
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

    // Request achievement verification
    const jobId = await achievementVerificationService.requestAchievementVerification(
      user.id,
      platform.toLowerCase(),
      gameId,
      achievementId
    )

    return NextResponse.json({
      success: true,
      message: 'Achievement verification requested',
      jobId,
      status: 'processing'
    })
  } catch (error) {
    console.error('Achievement verification error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify achievement' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'verified' // 'verified', 'available', 'all'

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

    let achievements: unknown[] | Record<string, unknown> = []

    switch (type) {
      case 'verified':
        achievements = await achievementVerificationService.getUserAchievements(user.id)
        break

      case 'available':
        achievements = await achievementVerificationService.checkAvailableAchievements(user.id)
        break

      case 'all':
        const [verified, available] = await Promise.all([
          achievementVerificationService.getUserAchievements(user.id),
          achievementVerificationService.checkAvailableAchievements(user.id)
        ])
        achievements = {
          verified,
          available,
          totalVerified: verified.length,
          totalAvailable: available.length
        }
        break

      default:
        achievements = await achievementVerificationService.getUserAchievements(user.id)
    }

    return NextResponse.json({
      success: true,
      type,
      achievements,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Get achievements error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}