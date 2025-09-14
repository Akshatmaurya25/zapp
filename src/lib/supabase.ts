import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

// Client-side Supabase client
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (for API routes)
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server operations')
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database types (these will be generated automatically by Supabase later)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
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
        Insert: {
          id?: string
          wallet_address: string
          username?: string | null
          display_name?: string | null
          bio?: string | null
          avatar_ipfs?: string | null
          banner_ipfs?: string | null
          website_url?: string | null
          twitter_handle?: string | null
          discord_handle?: string | null
          followers_count?: number
          following_count?: number
          posts_count?: number
          achievements_count?: number
          total_likes_received?: number
          total_donations_received?: string
          is_verified?: boolean
          is_private?: boolean
          email_notifications?: boolean
          created_at?: string
          updated_at?: string
          last_active_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          username?: string | null
          display_name?: string | null
          bio?: string | null
          avatar_ipfs?: string | null
          banner_ipfs?: string | null
          website_url?: string | null
          twitter_handle?: string | null
          discord_handle?: string | null
          followers_count?: number
          following_count?: number
          posts_count?: number
          achievements_count?: number
          total_likes_received?: number
          total_donations_received?: string
          is_verified?: boolean
          is_private?: boolean
          email_notifications?: boolean
          created_at?: string
          updated_at?: string
          last_active_at?: string
        }
      }
      // Add other table types as needed
    }
  }
}