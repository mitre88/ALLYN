import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ensureProfileForUser } from '@/lib/auth/ensure-profile'

export const dynamic = 'force-dynamic'

async function getAuthenticatedClient(request: Request) {
  const authHeader = request.headers.get('authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null

  if (bearerToken) {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
    )

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(bearerToken)

    return { supabase, user, error }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  return { supabase, user, error }
}

export async function POST(request: Request) {
  const { supabase, user, error: authError } = await getAuthenticatedClient(request)

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await ensureProfileForUser(user, supabase)
  if (result.error) {
    return NextResponse.json(
      {
        error: 'Could not ensure user profile',
        details: result.error instanceof Error ? result.error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, created: result.created })
}
