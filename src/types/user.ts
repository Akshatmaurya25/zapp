export interface User {
  id: string
  wallet_address: string
  username: string | null
  display_name: string | null
  bio: string | null
  avatar_ipfs: string | null
  banner_ipfs: string | null
  website_url: string | null
  twitter_handle: string | null
  discord_handle: string | null
  followers_count: number
  following_count: number
  posts_count: number
  achievements_count: number
  total_likes_received: number
  total_donations_received: string
  is_verified: boolean
  is_private: boolean
  email_notifications: boolean
  created_at: string
  updated_at: string
  last_active_at: string
}

export interface UserProfile extends User {
  is_following: boolean
  is_followed_by: boolean
}

export interface CreateUserData {
  wallet_address: string
  username?: string
  display_name?: string
  bio?: string
  avatar_ipfs?: string
  banner_ipfs?: string
  website_url?: string
  twitter_handle?: string
  discord_handle?: string
}

export interface UpdateUserData {
  username?: string
  display_name?: string
  bio?: string
  avatar_ipfs?: string
  banner_ipfs?: string
  website_url?: string
  twitter_handle?: string
  discord_handle?: string
}

export interface UserStats {
  posts_count: number
  followers_count: number
  following_count: number
  likes_received: number
  achievements_count: number
  total_donations_received: number
}