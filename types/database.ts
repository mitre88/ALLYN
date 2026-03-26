export interface Category {
  id: string
  name: string
  slug: string
  description: string
  color: string
  icon: string
  sort_order: number
  created_at: string
}

export interface Creator {
  id: string
  name: string
  bio: string
  avatar_url: string
  website: string
  created_at: string
}

export interface Content {
  id: string
  category_id: string
  creator_id: string
  title: string
  description: string
  type: 'video' | 'course' | 'audiobook' | 'article' | 'podcast'
  video_url: string
  thumbnail_url: string
  duration: number
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  published_at: string
  created_at: string
  updated_at: string
  category?: Category
  creator?: Creator
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface ContentView {
  id: string
  profile_id: string
  content_id: string
  progress_seconds: number
  total_seconds: number
  completed: boolean
  watched_at: string
}

export interface WatchlistItem {
  id: string
  profile_id: string
  content_id: string
  added_at: string
  content?: Content
}

export interface FavoriteItem {
  id: string
  profile_id: string
  content_id: string
  added_at: string
  content?: Content
}
