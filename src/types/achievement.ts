export interface Achievement {
  id: string
  user_id: string
  achievement_type: AchievementType
  nft_token_id: string | null
  tx_hash: string | null
  metadata: AchievementMetadata
  created_at: string
  user?: {
    id: string
    username: string | null
    display_name: string | null
    avatar_ipfs: string | null
  }
}

export enum AchievementType {
  FIRST_LOGIN = 'first_login',
  FIRST_POST = 'first_post',
  FIRST_FOLLOW = 'first_follow',
  FIRST_FOLLOWER = 'first_follower',
  FIRST_DONATION_RECEIVED = 'first_donation_received',
  FIRST_DONATION_GIVEN = 'first_donation_given',
  TEN_FOLLOWERS = 'ten_followers',
  HUNDRED_LIKES = 'hundred_likes',
  CONTENT_CREATOR = 'content_creator',
  SOCIAL_BUTTERFLY = 'social_butterfly',
  GENEROUS_SOUL = 'generous_soul',
  POPULAR_POST = 'popular_post'
}

export interface AchievementMetadata {
  name: string
  description: string
  image_ipfs: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  category: 'social' | 'content' | 'engagement' | 'milestone'
  requirements?: {
    threshold?: number
    condition?: string
  }
}

export interface AchievementConfig {
  type: AchievementType
  metadata: AchievementMetadata
  contract_address?: string
  check_condition: (userId: string) => Promise<boolean>
  mint_trigger: (userId: string) => Promise<void>
}

export interface CreateAchievementData {
  user_id: string
  achievement_type: AchievementType
  nft_token_id?: string
  tx_hash?: string
  metadata: AchievementMetadata
}

export interface UserAchievements {
  earned: Achievement[]
  available: AchievementConfig[]
  progress: {
    [key in AchievementType]?: {
      current: number
      required: number
      percentage: number
    }
  }
}