import { NextRequest, NextResponse } from 'next/server'
import { AchievementTracker } from '@/lib/achievement-tracker'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const progress = await AchievementTracker.getUserAchievementProgress(userId)

    if (!progress) {
      return NextResponse.json(
        { error: 'Failed to fetch achievement progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({ progress }, { status: 200 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}