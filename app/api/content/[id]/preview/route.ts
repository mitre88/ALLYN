import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // No auth required for previews
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('preview_url, status')
      .eq('id', id)
      .eq('status', 'published')
      .single()

    if (contentError || !content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    if (!content.preview_url) {
      return NextResponse.json({ error: 'No preview available' }, { status: 404 })
    }

    // Extract storage path from preview_url
    // preview_url format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const url = new URL(content.preview_url)
    const pathParts = url.pathname.split('/storage/v1/object/public/')
    if (pathParts.length < 2) {
      return NextResponse.json({ error: 'Invalid preview URL' }, { status: 500 })
    }

    const [bucket, ...rest] = pathParts[1].split('/')
    const filePath = rest.join('/')

    // Create signed URL for preview (30 min expiry)
    const { data: signedData, error: signedError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 1800)

    if (signedError || !signedData?.signedUrl) {
      return NextResponse.json({ error: 'Could not generate preview URL' }, { status: 500 })
    }

    return NextResponse.json({ url: signedData.signedUrl })
  } catch (error) {
    console.error('[preview] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
