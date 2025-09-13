export interface User {
  id: string
  wallet_address: string
  username: string | null
  display_name: string | null
  bio: string | null
  avatar_ipfs: string | null
  followers_count: number
  following_count: number
  posts_count: number
  achievements_count: number
  created_at: string
  updated_at: string
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
}

export interface UpdateUserData {
  username?: string
  display_name?: string
  bio?: string
  avatar_ipfs?: string
}

export interface UserStats {
  posts_count: number
  followers_count: number
  following_count: number
  likes_received: number
  achievements_count: number
  total_donations_received: number
}