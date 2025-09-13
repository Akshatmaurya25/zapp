export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
  follower?: {
    id: string
    username: string | null
    display_name: string | null
    avatar_ipfs: string | null
  }
  following?: {
    id: string
    username: string | null
    display_name: string | null
    avatar_ipfs: string | null
  }
}

export interface Like {
  id: string
  user_id: string
  post_id: string
  created_at: string
  user?: {
    id: string
    username: string | null
    display_name: string | null
    avatar_ipfs: string | null
  }
}

export interface Donation {
  id: string
  from_user_id: string
  to_user_id: string
  post_id: string | null
  amount: string
  message: string | null
  tx_hash: string
  created_at: string
  from_user?: {
    id: string
    username: string | null
    display_name: string | null
    avatar_ipfs: string | null
  }
  to_user?: {
    id: string
    username: string | null
    display_name: string | null
    avatar_ipfs: string | null
  }
  post?: {
    id: string
    content: string
    media_ipfs: string[] | null
  }
}

export interface CreateDonationData {
  to_user_id: string
  post_id?: string
  amount: string
  message?: string
  tx_hash: string
}

export interface SocialStats {
  followers: Follow[]
  following: Follow[]
  recent_likes: Like[]
  received_donations: Donation[]
  sent_donations: Donation[]
}