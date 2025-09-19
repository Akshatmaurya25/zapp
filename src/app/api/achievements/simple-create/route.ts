import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    console.log('Creating simple achievements for user:', userId)

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, created_at, username')
      .eq('id', userId)
      .single()

    console.log('User lookup:', { user, userError })

    if (!user) {
      return NextResponse.json({
        error: 'User not found',
        details: userError?.message,
        userId
      }, { status: 404 })
    }

    // Create achievements using the simpler achievements table (not the NFT system)
    const achievements = []

    // Gaming Explorer Achievement
    try {
      const { data: gamingExplorer, error } = await supabase
        .from('achievements')
        .upsert({
          id: `${userId}-gaming-explorer`,
          user_id: userId,
          achievement_type: 'gaming_explorer',
          metadata: {
            name: 'Gaming Explorer',
            description: 'Account created and wallet connected',
            image_ipfs: '',
            rarity: 'common',
            category: 'journey',
            badge_icon: '🎮'
          },
          earned_at: user.created_at
        }, { onConflict: 'id' })

      if (!error) {
        achievements.push('Gaming Explorer')
      }
      console.log('Gaming Explorer:', { data: gamingExplorer, error })
    } catch (err) {
      console.error('Gaming Explorer error:', err)
    }

    // Check for posts and create First Post achievement
    const { data: posts } = await supabase
      .from('posts')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .limit(1)

    if (posts && posts.length > 0) {
      try {
        const { data: firstPost, error } = await supabase
          .from('achievements')
          .upsert({
            id: `${userId}-first-post`,
            user_id: userId,
            achievement_type: 'first_post',
            metadata: {
              name: 'First Post',
              description: 'Share your first gaming moment, screenshot, or story',
              image_ipfs: '',
              rarity: 'common',
              category: 'creator',
              badge_icon: '📝'
            },
            earned_at: posts[0].created_at
          }, { onConflict: 'id' })

        if (!error) {
          achievements.push('First Post')
        }
        console.log('First Post:', { data: firstPost, error })
      } catch (err) {
        console.error('First Post error:', err)
      }
    }

    // Check for likes and create First Liker achievement
    const { data: likes } = await supabase
      .from('likes')
      .select('id, created_at')
      .eq('user_id', userId)
      .limit(1)

    if (likes && likes.length > 0) {
      try {
        const { data: firstLiker, error } = await supabase
          .from('achievements')
          .upsert({
            id: `${userId}-first-liker`,
            user_id: userId,
            achievement_type: 'first_liker',
            metadata: {
              name: 'First Liker',
              description: 'Give your first like to another post',
              image_ipfs: '',
              rarity: 'common',
              category: 'social',
              badge_icon: '❤️'
            },
            earned_at: likes[0].created_at
          }, { onConflict: 'id' })

        if (!error) {
          achievements.push('First Liker')
        }
        console.log('First Liker:', { data: firstLiker, error })
      } catch (err) {
        console.error('First Liker error:', err)
      }
    }

    // Get all created achievements
    const { data: createdAchievements } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)

    console.log('All achievements for user:', createdAchievements)

    return NextResponse.json({
      message: 'Achievements created successfully',
      created: true,
      achievementsCreated: achievements,
      totalAchievements: createdAchievements?.length || 0,
      achievements: createdAchievements
    }, { status: 200 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}