import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// One-time setup route to create the admin user
// Call: POST /api/setup with { secret, email, password, username }
export async function POST(req: NextRequest) {
  const setupSecret = process.env.SETUP_SECRET

  if (!setupSecret) {
    return NextResponse.json({ error: 'Setup not configured' }, { status: 500 })
  }

  const { secret, email, password, username } = await req.json()

  if (secret !== setupSecret) {
    return NextResponse.json({ error: 'Invalid setup secret' }, { status: 403 })
  }

  const supabase = createAdminClient()

  // Check if admin already exists
  const { data: existingAdmin } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single()

  if (existingAdmin) {
    return NextResponse.json({ error: 'Admin already exists' }, { status: 400 })
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: username,
      username,
      role: 'admin',
    },
  })

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message || 'Failed to create user' }, { status: 500 })
  }

  // Update profile to admin role
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'admin', username, full_name: username })
    .eq('id', authData.user.id)

  if (profileError) {
    return NextResponse.json({ error: 'User created but failed to set admin role' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: 'Admin user created successfully',
    userId: authData.user.id
  })
}
