import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify subscription — admins always have full access
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_subscribed, role')
      .eq('id', user.id)
      .single()

    const hasAccess = profile?.is_subscribed || profile?.role === 'admin'
    if (profileError || !hasAccess) {
      return NextResponse.json({ error: 'Subscription required' }, { status: 403 })
    }

    // Get content record
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single()

    if (contentError || !content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    if (!content.file_url) {
      return NextResponse.json({ error: 'No file available' }, { status: 404 })
    }

    // Extract the storage path from the file_url
    const url = new URL(content.file_url)
    const storageMatch = url.pathname.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/(.+)/)

    const headers: Record<string, string> = {}
    if (content.type === 'book' || content.type === 'audiobook') {
      headers['Content-Disposition'] = 'inline'
      headers['X-Content-Type-Options'] = 'nosniff'
    }

    // If the file is already in a public bucket, return the URL directly —
    // no service role key needed and no risk of signed URL generation failing.
    const isPublicBucket = url.pathname.includes('/object/public/')
    if (isPublicBucket || !storageMatch) {
      return NextResponse.json({ url: content.file_url }, { headers })
    }

    // Private bucket: create a time-limited signed URL (60 min) via admin client
    const [bucket, ...rest] = storageMatch[1].split('/')
    const filePath = rest.join('/')

    try {
      const admin = createAdminClient()
      const { data: signedData, error: signedError } = await admin.storage
        .from(bucket)
        .createSignedUrl(filePath, 3600)

      if (signedError || !signedData?.signedUrl) {
        // Fall back to direct URL if signed URL creation fails
        return NextResponse.json({ url: content.file_url }, { headers })
      }

      return NextResponse.json({ url: signedData.signedUrl }, { headers })
    } catch {
      // Service role key not configured — fall back to direct URL
      return NextResponse.json({ url: content.file_url }, { headers })
    }
  } catch (error) {
    console.error('[stream] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
