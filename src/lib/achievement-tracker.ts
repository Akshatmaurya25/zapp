import { createServerClient } from '@/lib/supabase'

export interface UserMetrics {
  user_id: string
  total_posts: number
  gaming_posts: number
  screenshot_posts: number
  guide_posts: number
  review_posts: number
  total_likes_given: number
  total_comments_made: number
  total_likes_received: number
  total_comments_received: number
  helpful_reactions_received: number
  followers_count: number
  following_count: number
  unique_users_interacted: number
  conversations_started: number
  consecutive_active_days: number
  total_active_days: number
  longest_streak_days: number
  last_activity_date: string | null
  gaming_genres_posted: string[]
  gaming_platforms_mentioned: string[]
  games_discussed: number
  average_post_engagement: number
  featured_posts: number
  created_at: string
  last_updated: string
}

export interface ActionData {
  postId?: string
  postType?: 'gaming' | 'screenshot' | 'guide' | 'review' | 'general'
  gameGenre?: string
  gamePlatform?: string
  engagementScore?: number
  targetUserId?: string
  isNewUser?: boolean
  [key: string]: any
}

export class AchievementTracker {
  private static supabase = createServerClient()

  // Ensure user metrics record exists
  private static async ensureUserMetricsExist(userId: string) {
    const { data: existing } = await this.supabase
      .from('user_platform_metrics')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!existing) {
      await this.supabase
        .from('user_platform_metrics')
        .insert({
          user_id: userId,
          last_updated: new Date().toISOString()
        })
    }
  }

  // Main entry point for tracking user actions
  static async onUserAction(userId: string, actionType: string, actionData: ActionData = {}) {
    try {
      console.log(`[AchievementTracker] Tracking action: ${actionType} for user: ${userId}`)

      await this.ensureUserMetricsExist(userId)
      await this.updateUserMetrics(userId, actionType, actionData)

      // Check achievements manually instead of relying on triggers
      // await this.checkAchievements(userId, actionType)

      console.log(`[AchievementTracker] Successfully tracked action: ${actionType}`)
    } catch (error) {
      console.error(`[AchievementTracker] Error tracking action ${actionType}:`, error)
      // Don't let achievement tracking errors break the main flow
    }
  }

  // Update user metrics based on the action
  static async updateUserMetrics(userId: string, actionType: string, actionData: ActionData) {
    const updates: Partial<UserMetrics> = {}
    const incrementFields: Record<string, number> = {}

    switch (actionType) {
      case 'POST_CREATED':
        incrementFields.total_posts = 1
        if (actionData.postType === 'gaming') incrementFields.gaming_posts = 1
        if (actionData.postType === 'screenshot') incrementFields.screenshot_posts = 1
        if (actionData.postType === 'guide') incrementFields.guide_posts = 1
        if (actionData.postType === 'review') incrementFields.review_posts = 1
        if (actionData.gameGenre) {
          // Will handle genre tracking separately
        }
        break

      case 'LIKE_GIVEN':
        incrementFields.total_likes_given = 1
        if (actionData.targetUserId && actionData.targetUserId !== userId) {
          // Track unique user interaction
          incrementFields.unique_users_interacted = 1
        }
        break

      case 'LIKE_RECEIVED':
        incrementFields.total_likes_received = 1
        break

      case 'COMMENT_MADE':
        incrementFields.total_comments_made = 1
        if (actionData.targetUserId && actionData.targetUserId !== userId) {
          incrementFields.unique_users_interacted = 1
        }
        break

      case 'COMMENT_RECEIVED':
        incrementFields.total_comments_received = 1
        break

      case 'FOLLOWER_GAINED':
        incrementFields.followers_count = 1
        break

      case 'FOLLOWING_ADDED':
        incrementFields.following_count = 1
        break

      case 'USER_LOGIN':
        // Handle streak calculation
        await this.updateActivityStreak(userId)
        return // Exit early as streak update is handled separately

      case 'POST_FEATURED':
        incrementFields.featured_posts = 1
        break

      case 'HELPFUL_REACTION':
        incrementFields.helpful_reactions_received = 1
        break
    }

    // Update last activity date
    updates.last_activity_date = new Date().toISOString().split('T')[0]

    if (Object.keys(incrementFields).length > 0 || Object.keys(updates).length > 0) {
      await this.incrementUserMetrics(userId, incrementFields, updates)
    }

    // Handle special data updates
    if (actionData.gameGenre) {
      await this.updateGameGenres(userId, actionData.gameGenre)
    }
    if (actionData.gamePlatform) {
      await this.updateGamePlatforms(userId, actionData.gamePlatform)
    }
  }

  // Increment metrics with atomic operations
  private static async incrementUserMetrics(
    userId: string,
    incrementFields: Record<string, number>,
    updates: Partial<UserMetrics>
  ) {
    // First, get current metrics or create if doesn't exist
    const { data: currentMetrics, error } = await this.supabase
      .from('user_platform_metrics')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code === 'PGRST116') {
      // Record doesn't exist, create it
      const { data, error: insertError } = await this.supabase
        .from('user_platform_metrics')
        .insert({ user_id: userId, ...updates })
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting user metrics:', insertError)
        return // Exit early if we can't create the record
      }
      currentMetrics = data
    } else if (error) {
      console.error('Error fetching user metrics:', error)
      return // Exit early if we can't fetch the record
    }

    // Calculate new values
    const newValues: Partial<UserMetrics> = { ...updates }
    for (const [field, increment] of Object.entries(incrementFields)) {
      newValues[field as keyof UserMetrics] = (currentMetrics?.[field as keyof UserMetrics] || 0) + increment
    }

    newValues.last_updated = new Date().toISOString()

    // Update the record
    const { error: updateError } = await this.supabase
      .from('user_platform_metrics')
      .update(newValues)
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating user metrics:', updateError)
      // Don't throw to avoid breaking post creation
    }
  }

  // Update activity streak
  private static async updateActivityStreak(userId: string) {
    await this.ensureUserMetricsExist(userId)

    const { data: metrics, error } = await this.supabase
      .from('user_platform_metrics')
      .select('consecutive_active_days, last_activity_date, longest_streak_days, total_active_days')
      .eq('user_id', userId)
      .single()

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    let consecutiveDays = 1
    const totalDays = (metrics?.total_active_days || 0) + 1

    if (metrics?.last_activity_date) {
      if (metrics.last_activity_date === yesterday) {
        // Continuing streak
        consecutiveDays = (metrics.consecutive_active_days || 0) + 1
      } else if (metrics.last_activity_date === today) {
        // Already logged in today, no change needed
        return
      }
      // If gap > 1 day, streak resets to 1 (already set above)
    }

    const longestStreak = Math.max(consecutiveDays, metrics?.longest_streak_days || 0)

    try {
      await this.supabase
        .from('user_platform_metrics')
        .upsert({
          user_id: userId,
          consecutive_active_days: consecutiveDays,
          longest_streak_days: longestStreak,
          total_active_days: totalDays,
          last_activity_date: today,
          last_updated: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error updating activity streak:', error)
      // Don't throw to avoid breaking the calling function
    }
  }

  // Update game genres array
  private static async updateGameGenres(userId: string, genre: string) {
    await this.ensureUserMetricsExist(userId)

    const { data: metrics } = await this.supabase
      .from('user_platform_metrics')
      .select('gaming_genres_posted')
      .eq('user_id', userId)
      .single()

    const currentGenres = metrics?.gaming_genres_posted || []
    if (!currentGenres.includes(genre)) {
      const newGenres = [...currentGenres, genre]
      try {
        await this.supabase
          .from('user_platform_metrics')
          .update({ gaming_genres_posted: newGenres })
          .eq('user_id', userId)
      } catch (error) {
        console.error('Error updating game genres:', error)
      }
    }
  }

  // Update game platforms array
  private static async updateGamePlatforms(userId: string, platform: string) {
    await this.ensureUserMetricsExist(userId)

    const { data: metrics } = await this.supabase
      .from('user_platform_metrics')
      .select('gaming_platforms_mentioned')
      .eq('user_id', userId)
      .single()

    const currentPlatforms = metrics?.gaming_platforms_mentioned || []
    if (!currentPlatforms.includes(platform)) {
      const newPlatforms = [...currentPlatforms, platform]
      try {
        await this.supabase
          .from('user_platform_metrics')
          .update({ gaming_platforms_mentioned: newPlatforms })
          .eq('user_id', userId)
      } catch (error) {
        console.error('Error updating game platforms:', error)
      }
    }
  }

  // Check if user qualifies for any new achievements
  static async checkAchievements(userId: string, triggerAction?: string) {
    try {
      const userMetrics = await this.getUserMetrics(userId)
      if (!userMetrics) return

      const eligibleAchievements = await this.calculateEligibility(userMetrics)

      for (const achievement of eligibleAchievements) {
        await this.unlockAchievement(userId, achievement, userMetrics)
      }
    } catch (error) {
      console.error('[AchievementTracker] Error checking achievements:', error)
    }
  }

  // Get user metrics
  static async getUserMetrics(userId: string): Promise<UserMetrics | null> {
    await this.ensureUserMetricsExist(userId)

    const { data, error } = await this.supabase
      .from('user_platform_metrics')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Create metrics record if it doesn't exist
        const { data: newMetrics } = await this.supabase
          .from('user_platform_metrics')
          .insert({ user_id: userId })
          .select()
          .single()
        return newMetrics
      }
      throw error
    }

    return data
  }

  // Calculate which achievements the user is eligible for
  private static async calculateEligibility(userMetrics: UserMetrics) {
    // Get all active achievement types
    const { data: achievementTypes, error } = await this.supabase
      .from('nft_achievement_types')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (error) throw error

    const eligible = []

    for (const type of achievementTypes) {
      // Check if user already has this achievement
      const { data: existing } = await this.supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userMetrics.user_id)
        .eq('achievement_type_id', type.id)
        .single()

      if (!existing && this.meetsRequirements(userMetrics, type.requirements)) {
        // Check limited edition constraints
        if (type.is_limited_edition && type.max_recipients) {
          if (type.current_recipients >= type.max_recipients) {
            continue // Skip if limit reached
          }
        }
        eligible.push(type)
      }
    }

    return eligible
  }

  // Check if user meets achievement requirements
  private static meetsRequirements(metrics: UserMetrics, requirements: any): boolean {
    for (const [field, condition] of Object.entries(requirements)) {
      if (!this.evaluateCondition(metrics, field, condition)) {
        return false
      }
    }
    return true
  }

  // Evaluate a single condition
  private static evaluateCondition(metrics: UserMetrics, field: string, condition: any): boolean {
    const userValue = this.getMetricValue(metrics, field)
    const requiredValue = Array.isArray(condition) ? condition[0] : condition

    // Handle special conditions
    switch (field) {
      case 'account_created':
        return true // If we have metrics, account was created

      case 'profile_completed':
        // This would need to check user profile completeness
        // For now, assume it's true if they have any activity
        return userValue > 0

      case 'gaming_genres_count':
        return (metrics.gaming_genres_posted?.length || 0) >= requiredValue

      case 'platforms_active':
        return (metrics.gaming_platforms_mentioned?.length || 0) >= requiredValue

      default:
        return userValue >= requiredValue
    }
  }

  // Get metric value from user metrics
  private static getMetricValue(metrics: UserMetrics, field: string): number {
    switch (field) {
      case 'total_posts': return metrics.total_posts || 0
      case 'gaming_posts': return metrics.gaming_posts || 0
      case 'total_likes_given': return metrics.total_likes_given || 0
      case 'total_comments_made': return metrics.total_comments_made || 0
      case 'followers_count': return metrics.followers_count || 0
      case 'following_count': return metrics.following_count || 0
      case 'consecutive_active_days': return metrics.consecutive_active_days || 0
      case 'total_active_days': return metrics.total_active_days || 0
      case 'screenshot_posts': return metrics.screenshot_posts || 0
      case 'guide_posts': return metrics.guide_posts || 0
      case 'review_posts': return metrics.review_posts || 0
      case 'unique_users_interacted': return metrics.unique_users_interacted || 0
      case 'featured_posts': return metrics.featured_posts || 0
      case 'helpful_reactions_received': return metrics.helpful_reactions_received || 0
      default: return 0
    }
  }

  // Unlock an achievement for the user
  private static async unlockAchievement(userId: string, achievementType: any, userMetrics: UserMetrics) {
    try {
      // Create achievement record
      const { data: achievement, error } = await this.supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_type_id: achievementType.id,
          achieved_at: new Date().toISOString(),
          metric_value: this.getRelevantMetricValue(achievementType.name, userMetrics),
          metadata: {
            achievement_name: achievementType.name,
            awarded_automatically: true,
            metric_snapshot: {
              total_posts: userMetrics.total_posts,
              total_likes_given: userMetrics.total_likes_given,
              followers_count: userMetrics.followers_count,
              consecutive_active_days: userMetrics.consecutive_active_days
            }
          }
        })
        .select()
        .single()

      if (error) throw error

      // Update limited edition counter if applicable
      if (achievementType.is_limited_edition) {
        await this.supabase
          .from('nft_achievement_types')
          .update({ current_recipients: (achievementType.current_recipients || 0) + 1 })
          .eq('id', achievementType.id)
      }

      console.log(`[AchievementTracker] Achievement unlocked: ${achievementType.name} for user: ${userId}`)

      // TODO: Send real-time notification to user
      await this.notifyUser(userId, achievementType)

      return achievement
    } catch (error) {
      console.error('[AchievementTracker] Error unlocking achievement:', error)
    }
  }

  // Get relevant metric value for achievement
  private static getRelevantMetricValue(achievementName: string, metrics: UserMetrics): number {
    switch (achievementName) {
      case 'first_post': return metrics.total_posts
      case 'generous_heart': return metrics.total_likes_given
      case 'social_butterfly': return metrics.unique_users_interacted
      case 'week_warrior': return metrics.consecutive_active_days
      default: return 1
    }
  }

  // Send notification to user about new achievement
  private static async notifyUser(userId: string, achievementType: any) {
    try {
      // This would integrate with your notification system
      console.log(`[AchievementTracker] Sending notification to user ${userId} for achievement: ${achievementType.display_name}`)

      // Example: Create notification record
      // await this.supabase
      //   .from('notifications')
      //   .insert({
      //     user_id: userId,
      //     type: 'achievement_unlocked',
      //     title: `Achievement Unlocked: ${achievementType.display_name}`,
      //     message: achievementType.description,
      //     metadata: { achievement_id: achievementType.id },
      //     created_at: new Date().toISOString()
      //   })
    } catch (error) {
      console.error('[AchievementTracker] Error sending notification:', error)
    }
  }

  // Get user's achievement progress
  static async getUserAchievementProgress(userId: string) {
    const userMetrics = await this.getUserMetrics(userId)
    if (!userMetrics) return null

    const { data: achievementTypes } = await this.supabase
      .from('nft_achievement_types')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    const { data: userAchievements } = await this.supabase
      .from('user_achievements')
      .select('achievement_type_id')
      .eq('user_id', userId)

    const earnedAchievementIds = new Set(userAchievements?.map(a => a.achievement_type_id) || [])

    const progress = achievementTypes?.map(type => {
      const isEarned = earnedAchievementIds.has(type.id)
      const progressPercent = isEarned ? 100 : this.calculateProgressPercent(userMetrics, type.requirements)

      return {
        id: type.id,
        name: type.name,
        display_name: type.display_name,
        description: type.description,
        category: type.category,
        rarity_level: type.rarity_level,
        color_scheme: type.color_scheme,
        badge_icon: type.badge_icon,
        is_earned: isEarned,
        progress_percent: progressPercent,
        requirements: type.requirements
      }
    })

    return progress
  }

  // Calculate progress percentage towards an achievement
  private static calculateProgressPercent(metrics: UserMetrics, requirements: any): number {
    let totalRequirements = 0
    let metRequirements = 0

    for (const [field, condition] of Object.entries(requirements)) {
      totalRequirements++
      if (this.evaluateCondition(metrics, field, condition)) {
        metRequirements++
      }
    }

    return totalRequirements > 0 ? Math.round((metRequirements / totalRequirements) * 100) : 0
  }
}