import { createClient } from '@supabase/supabase-js'

export function hasValidServiceRoleKey() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  return Boolean(
    serviceRoleKey &&
    serviceRoleKey !== 'your_service_role_key_here' &&
    serviceRoleKey !== 'placeholder-service-role-key'
  )
}

// Admin client with service role key - server-side only
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!hasValidServiceRoleKey()) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
