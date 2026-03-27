import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // Verify subscription
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_subscribed')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_subscribed) {
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
    // file_url format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const url = new URL(content.file_url)
    const pathParts = url.pathname.split('/storage/v1/object/public/')
    if (pathParts.length < 2) {
      return NextResponse.json({ error: 'Invalid file URL' }, { status: 500 })
    }

    const [bucket, ...rest] = pathParts[1].split('/')
    const filePath = rest.join('/')

    // Create signed URL (60 min expiry)
    const { data: signedData, error: signedError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 3600)

    if (signedError || !signedData?.signedUrl) {
      return NextResponse.json({ error: 'Could not generate signed URL' }, { status: 500 })
    }

    const headers: Record<string, string> = {}

    // For books/PDFs: add headers to prevent download
    if (content.type === 'book' || content.type === 'audiobook') {
      headers['Content-Disposition'] = 'inline'
      headers['X-Content-Type-Options'] = 'nosniff'
    }

    return NextResponse.json(
      { url: signedData.signedUrl },
      { headers }
    )
  } catch (error) {
    console.error('[stream] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
