import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { randomUUID } from 'crypto'

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

    const supabase = createServerClient()

    // Try to get from achievements table first
    const { data: achievements } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    if (achievements && achievements.length > 0) {
      console.log('Found stored achievements:', achievements.length)
      const unmintedAchievements = achievements.filter(achievement =>
        !achievement.metadata?.nft_minted
      )

      return NextResponse.json({
        achievements: unmintedAchievements,
        total: achievements.length,
        unminted: unmintedAchievements.length,
        source: 'database'
      }, { status: 200 })
    }

    // If no stored achievements, create and store default ones
    console.log('No stored achievements found, creating and storing defaults for user:', userId)

    try {
      // First, ensure we have some basic achievement types in the database
      const welcomeAchievementId = randomUUID()
      const explorerAchievementId = randomUUID()

      // Create achievement type records if they don't exist
      const { error: typeError } = await supabase
        .from('nft_achievement_types')
        .upsert([
          {
            id: 'welcome-journey-type',
            name: 'welcome',
            display_name: 'Welcome to Somnia',
            description: 'You\'ve successfully connected to our gaming platform!',
            category: 'journey',
            rarity_level: 1,
            color_scheme: '#8B5CF6',
            badge_icon: '🎮'
          },
          {
            id: 'explorer-journey-type',
            name: 'explorer',
            display_name: 'Platform Explorer',
            description: 'Ready to discover what our community has to offer!',
            category: 'journey',
            rarity_level: 1,
            color_scheme: '#10B981',
            badge_icon: '🔍'
          }
        ], { onConflict: 'id' })

      if (typeError) {
        console.warn('Could not create achievement types:', typeError)
      }

      // Create user achievement records
      const currentTime = new Date().toISOString()
      const userAchievements = [
        {
          id: welcomeAchievementId,
          user_id: userId,
          achievement_type_id: 'welcome-journey-type',
          achieved_at: currentTime,
          metric_value: 1,
          metadata: {},
          is_nft_minted: false
        },
        {
          id: explorerAchievementId,
          user_id: userId,
          achievement_type_id: 'explorer-journey-type',
          achieved_at: currentTime,
          metric_value: 1,
          metadata: {},
          is_nft_minted: false
        }
      ]

      const { data: insertedAchievements, error: insertError } = await supabase
        .from('user_achievements')
        .insert(userAchievements)
        .select(`
          *,
          nft_achievement_types (
            id,
            name,
            display_name,
            description,
            category,
            rarity_level,
            color_scheme,
            badge_icon
          )
        `)

      if (insertError) {
        console.error('Failed to create user achievements:', insertError)
        // Fall back to in-memory achievements
        const currentTime = new Date().toISOString()
        const defaultAchievements = [
          {
            id: welcomeAchievementId,
            user_id: userId,
            achievement_type: 'welcome',
            metadata: {
              name: 'Welcome to Somnia',
              description: 'You\'ve successfully connected to our gaming platform!',
              badge_icon: '🎮',
              category: 'journey',
              rarity: 'common'
            },
            earned_at: currentTime,
            can_mint: true
          },
          {
            id: explorerAchievementId,
            user_id: userId,
            achievement_type: 'explorer',
            metadata: {
              name: 'Platform Explorer',
              description: 'Ready to discover what our community has to offer!',
              badge_icon: '🔍',
              category: 'journey',
              rarity: 'common'
            },
            earned_at: currentTime,
            can_mint: true
          }
        ]

        return NextResponse.json({
          achievements: defaultAchievements,
          total: defaultAchievements.length,
          unminted: defaultAchievements.length,
          source: 'generated-fallback'
        }, { status: 200 })
      }

      console.log('Successfully created user achievements:', insertedAchievements?.length)

      // Convert to the expected format for the frontend
      const formattedAchievements = insertedAchievements?.map(achievement => ({
        id: achievement.id,
        user_id: achievement.user_id,
        achievement_type: achievement.nft_achievement_types.name,
        metadata: {
          name: achievement.nft_achievement_types.display_name,
          description: achievement.nft_achievement_types.description,
          badge_icon: achievement.nft_achievement_types.badge_icon,
          category: achievement.nft_achievement_types.category,
          rarity: achievement.nft_achievement_types.rarity_level === 1 ? 'common' : 'uncommon'
        },
        earned_at: achievement.achieved_at,
        can_mint: !achievement.is_nft_minted
      })) || []

      return NextResponse.json({
        achievements: formattedAchievements,
        total: formattedAchievements.length,
        unminted: formattedAchievements.length,
        source: 'database-created'
      }, { status: 200 })

    } catch (dbError) {
      console.error('Database error when creating achievements:', dbError)

      // Ultimate fallback - return in-memory achievements
      const currentTime = new Date().toISOString()
      const fallbackAchievements = [
        {
          id: randomUUID(),
          user_id: userId,
          achievement_type: 'welcome',
          metadata: {
            name: 'Welcome to Somnia',
            description: 'You\'ve successfully connected to our gaming platform!',
            badge_icon: '🎮',
            category: 'journey',
            rarity: 'common'
          },
          earned_at: currentTime,
          can_mint: true
        }
      ]

      return NextResponse.json({
        achievements: fallbackAchievements,
        total: fallbackAchievements.length,
        unminted: fallbackAchievements.length,
        source: 'fallback'
      }, { status: 200 })
    }

  } catch (error) {
    console.error('Direct achievement fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}