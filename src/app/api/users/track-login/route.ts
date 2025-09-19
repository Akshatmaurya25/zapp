import { NextRequest, NextResponse } from 'next/server'
import { AchievementTracker } from '@/lib/achievement-tracker'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Track user login for achievement purposes
    await AchievementTracker.onUserAction(userId, 'USER_LOGIN')

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Login tracking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}