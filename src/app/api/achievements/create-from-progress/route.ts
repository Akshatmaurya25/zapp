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

    console.log('Creating achievements for user:', userId)

    // First, ensure achievement types exist
    const achievementTypes = [
      {
        id: 'gaming-explorer',
        name: 'gaming_explorer',
        display_name: 'Gaming Explorer',
        description: 'Account created and wallet connected',
        category: 'journey',
        rarity_level: 1,
        color_scheme: '#8B5CF6',
        badge_icon: '🎮',
        requirements: { account_created: 1 },
        is_active: true,
        sort_order: 1
      },
      {
        id: 'first-post',
        name: 'first_post',
        display_name: 'First Post',
        description: 'Share your first gaming moment, screenshot, or story',
        category: 'creator',
        rarity_level: 1,
        color_scheme: '#10B981',
        badge_icon: '📝',
        requirements: { total_posts: 1 },
        is_active: true,
        sort_order: 2
      },
      {
        id: 'first-liker',
        name: 'first_liker',
        display_name: 'First Liker',
        description: 'Give your first like to another post',
        category: 'social',
        rarity_level: 1,
        color_scheme: '#F59E0B',
        badge_icon: '❤️',
        requirements: { total_likes_given: 1 },
        is_active: true,
        sort_order: 3
      }
    ]

    // Insert achievement types (ignore duplicates)
    for (const achievementType of achievementTypes) {
      try {
        const { data, error } = await supabase
          .from('nft_achievement_types')
          .upsert(achievementType, { onConflict: 'id' })

        console.log(`Achievement type ${achievementType.id}:`, { data, error })
      } catch (err) {
        console.error(`Error creating achievement type ${achievementType.id}:`, err)
      }
    }

    // Create user achievements based on basic actions
    // This is a simplified approach - check if user has done basic actions and award achievements

    // Check if user exists
    const { data: user } = await supabase
      .from('users')
      .select('id, created_at')
      .eq('id', userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Award Gaming Explorer (account created)
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .upsert({
          id: `${userId}-gaming-explorer`,
          user_id: userId,
          achievement_type_id: 'gaming-explorer',
          achieved_at: user.created_at,
          metric_value: 1,
          metadata: { reason: 'Account created' },
          is_nft_minted: false
        }, { onConflict: 'id' })

      console.log('Gaming Explorer achievement:', { data, error })
    } catch (err) {
      console.error('Error creating Gaming Explorer achievement:', err)
    }

    // Check for posts and award First Post if applicable
    const { data: posts } = await supabase
      .from('posts')
      .select('id, created_at')
      .eq('user_id', userId)
      .limit(1)

    if (posts && posts.length > 0) {
      try {
        const { data, error } = await supabase
          .from('user_achievements')
          .upsert({
            id: `${userId}-first-post`,
            user_id: userId,
            achievement_type_id: 'first-post',
            achieved_at: posts[0].created_at,
            metric_value: 1,
            metadata: { postId: posts[0].id },
            is_nft_minted: false
          }, { onConflict: 'id' })

        console.log('First Post achievement:', { data, error })
      } catch (err) {
        console.error('Error creating First Post achievement:', err)
      }
    }

    // Check for likes and award First Liker if applicable
    const { data: likes } = await supabase
      .from('likes')
      .select('id, created_at')
      .eq('user_id', userId)
      .limit(1)

    if (likes && likes.length > 0) {
      try {
        const { data, error } = await supabase
          .from('user_achievements')
          .upsert({
            id: `${userId}-first-liker`,
            user_id: userId,
            achievement_type_id: 'first-liker',
            achieved_at: likes[0].created_at,
            metric_value: 1,
            metadata: { likeId: likes[0].id },
            is_nft_minted: false
          }, { onConflict: 'id' })

        console.log('First Liker achievement:', { data, error })
      } catch (err) {
        console.error('Error creating First Liker achievement:', err)
      }
    }

    // Check what achievements were actually created
    const { data: createdAchievements } = await supabase
      .from('user_achievements')
      .select('*, nft_achievement_types(*)')
      .eq('user_id', userId)
      .eq('is_nft_minted', false)

    console.log('Created achievements:', createdAchievements)

    return NextResponse.json({
      message: 'Achievements created successfully',
      created: true,
      achievementsFound: createdAchievements?.length || 0,
      achievements: createdAchievements
    }, { status: 200 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}