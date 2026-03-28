export interface Profile {
  id: string
  email: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  is_subscribed: boolean
  subscription_date: string | null
  referral_code: string | null
  referred_by: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
  icon: string
  sort_order: number
  created_at: string
}

export interface Content {
  id: string
  category_id: string | null
  title: string
  description: string | null
  type: 'book' | 'video' | 'course' | 'audiobook'
  file_url: string | null
  preview_url: string | null
  audio_url: string | null
  thumbnail_url: string | null
  duration: number
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  is_free: boolean
  sort_order: number
  author: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  category?: Category
}

export interface Subscription {
  id: string
  user_id: string
  stripe_session_id: string | null
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  affiliate_code: string | null
  created_at: string
}

export interface Affiliate {
  id: string
  referrer_id: string
  referred_user_id: string | null
  commission_amount: number
  status: 'pending' | 'earned' | 'paid'
  created_at: string
}
