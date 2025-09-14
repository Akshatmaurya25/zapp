export interface Post {
  id: string
  user_id: string
  content: string
  media_ipfs: string[] | null
  game_category: string
  likes_count: number
  donations_count: number
  comments_count: number
  created_at: string
  updated_at: string
  user?: {
    id: string
    username: string | null
    display_name: string | null
    avatar_ipfs: string | null
    is_verified?: boolean
  }
  is_liked_by_user?: boolean
  user_has_liked?: boolean
}

export interface CreatePostData {
  content: string
  media_ipfs?: string[]
  game_category: string
}

export interface UpdatePostData {
  content?: string
  game_category?: string
}

export interface PostWithDetails extends Post {
  user: {
    id: string
    username: string | null
    display_name: string | null
    avatar_ipfs: string | null
    followers_count: number
  }
  recent_donations?: any[]
  recent_likes?: any[]
}

export enum GameCategory {
  VALORANT = 'valorant',
  PUBG = 'pubg',
  FORTNITE = 'fortnite',
  LEAGUE_OF_LEGENDS = 'league_of_legends',
  METAVERSE = 'metaverse',
  GENERAL_GAMING = 'general_gaming',
  OTHER = 'other'
}

export interface MediaUpload {
  file: File
  preview: string
  type: string
  ipfs_hash?: string
  upload_status: 'pending' | 'uploading' | 'success' | 'error'
  uploading?: boolean
}

export interface FeedPost extends Post {
  interaction_type?: 'like' | 'follow' | 'donation'
  interaction_timestamp?: string
}