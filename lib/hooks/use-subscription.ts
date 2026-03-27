'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface SubscriptionProfile {
  id: string
  email: string
  full_name: string | null
  username: string | null
  role: string
  is_subscribed: boolean
  referral_code: string | null
  referred_by: string | null
  stripe_customer_id: string | null
  created_at?: string
}

export function useSubscription() {
  const [profile, setProfile] = useState<SubscriptionProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setIsLoading(false)
          return
        }

        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setProfile(data)
      } catch {
        // silently handle
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  return {
    isSubscribed: profile?.is_subscribed ?? false,
    isLoading,
    profile,
    refetch: async () => {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(data)
      setIsLoading(false)
    },
  }
}
