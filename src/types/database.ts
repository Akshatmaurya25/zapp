// Database type definitions
export interface Database {
  public: {
    Tables: {
      users: { Row: DatabaseUser }
      posts: { Row: DatabasePost }
      comments: { Row: DatabaseComment }
      donations: { Row: DatabaseDonation }
      achievements: { Row: DatabaseAchievement }
      live_streams: { Row: DatabaseLiveStream }
      stream_tips: { Row: DatabaseStreamTip }
    }
  }
}
export interface DatabaseUser {
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

export interface DatabasePost {
  id: string
  user_id: string
  content: string
  media_ipfs: string[] | null
  game_category: string
  mentions: string[] | null
  hashtags: string[] | null
  external_links: string[] | null
  likes_count: number
  comments_count: number
  donations_count: number
  total_donations_amount: string
  views_count: number
  is_pinned: boolean
  is_featured: boolean
  is_nsfw: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface DatabaseComment {
  id: string
  user_id: string
  post_id: string
  parent_comment_id: string | null
  content: string
  likes_count: number
  replies_count: number
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface DatabaseDonation {
  id: string
  from_user_id: string
  to_user_id: string
  post_id: string | null
  amount: string
  token_symbol: string
  token_address: string | null
  tx_hash: string
  block_number: number | null
  message: string | null
  status: string
  created_at: string
  confirmed_at: string | null
}

export interface DatabaseAchievement {
  id: string
  user_id: string
  achievement_type: string
  nft_token_id: string | null
  nft_contract_address: string | null
  tx_hash: string | null
  metadata: Record<string, unknown>
  is_claimed: boolean
  is_minted: boolean
  created_at: string
  minted_at: string | null
}

export interface DatabaseLiveStream {
  id: string
  streamer_id: string
  stream_key: string
  title: string
  game_name: string | null
  rtmp_url: string | null
  hls_url: string | null
  is_active: boolean
  viewer_count: number
  total_tips: string
  started_at: string | null
  ended_at: string | null
  created_at: string
  updated_at: string
}

export interface DatabaseStreamTip {
  id: string
  stream_id: string
  from_user_id: string
  to_user_id: string
  amount: string
  token_symbol: string
  token_address: string | null
  tx_hash: string
  message: string | null
  status: string
  created_at: string
  confirmed_at: string | null
}