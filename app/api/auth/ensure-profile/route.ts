import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ensureProfileForUser } from '@/lib/auth/ensure-profile'

export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

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
