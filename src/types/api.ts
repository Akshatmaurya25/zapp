export interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
  message?: string
  metadata?: {
    page?: number
    limit?: number
    total?: number
    hasMore?: boolean
  }
}

export interface ApiError {
  code: string
  message: string
  details?: any
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface QueryParams {
  page?: number
  limit?: number
  sort?: 'newest' | 'oldest' | 'popular' | 'trending'
  filter?: {
    game_category?: string
    user_id?: string
    following_only?: boolean
    has_media?: boolean
  }
  search?: string
}

export interface FeedParams extends QueryParams {
  feed_type: 'latest' | 'following' | 'trending'
}

export interface UploadResponse {
  success: boolean
  ipfs_hash?: string
  url?: string
  error?: string
}

export interface IPFSUploadProgress {
  loaded: number
  total: number
  percentage: number
}

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T> {
  data: T | null
  status: RequestStatus
  error: string | null
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
}