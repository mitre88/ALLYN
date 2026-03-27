import { createHash } from 'crypto'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createAdminClient, hasValidServiceRoleKey } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

function deriveUsername(user: User) {
  const metadataUsername = user.user_metadata?.username
  if (typeof metadataUsername === 'string' && metadataUsername.trim() !== '') {
    return metadataUsername.trim()
  }

  return user.email?.split('@')[0] ?? `user_${user.id.slice(0, 8)}`
}

function deriveFullName(user: User) {
  const metadataFullName = user.user_metadata?.full_name
  if (typeof metadataFullName === 'string' && metadataFullName.trim() !== '') {
    return metadataFullName.trim()
  }

  return deriveUsername(user)
}

function deriveReferralCode(userId: string) {
  return createHash('md5').update(userId).digest('hex').slice(0, 8)
}

function getProfilePayload(user: User) {
  const referredBy = user.user_metadata?.referred_by

  return {
    id: user.id,
    email: user.email ?? '',
    full_name: deriveFullName(user),
    username: deriveUsername(user),
    role: 'user',
    is_subscribed: false,
    referral_code: deriveReferralCode(user.id),
    referred_by:
      typeof referredBy === 'string' && referredBy.trim() !== '' ? referredBy.trim() : null,
  }
}

async function profileExists(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return Boolean(data)
}

async function insertProfile(client: SupabaseClient, user: User) {
  const payload = getProfilePayload(user)
  const { error } = await client.from('profiles').insert(payload)
  return error
}

export async function ensureProfileForUser(user: User, serverClient?: SupabaseClient) {
  const clients: SupabaseClient[] = []

  if (serverClient) {
    clients.push(serverClient)
  } else {
    clients.push(await createServerClient())
  }

  if (hasValidServiceRoleKey()) {
    clients.unshift(createAdminClient())
  }

  let lastError: unknown = null

  for (const client of clients) {
    try {
      if (await profileExists(client, user.id)) {
        return { created: false }
      }

      const insertError = await insertProfile(client, user)
      if (!insertError) {
        return { created: true }
      }

      if (String(insertError.message || '').toLowerCase().includes('duplicate')) {
        return { created: false }
      }

      lastError = insertError
    } catch (error) {
      lastError = error
    }
  }

  return { created: false, error: lastError }
}
