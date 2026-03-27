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

    // No auth required for previews
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('preview_url, file_url, status')
      .eq('id', id)
      .eq('status', 'published')
      .single()

    if (contentError || !content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    const assetUrl = content.preview_url || content.file_url
    const source =
      content.preview_url && content.preview_url !== content.file_url
        ? 'preview'
        : 'file'

    if (!assetUrl) {
      return NextResponse.json({ error: 'No preview available' }, { status: 404 })
    }

    // Extract storage path from preview_url or file_url fallback
    const url = new URL(assetUrl)
    const publicMatch = url.pathname.match(/\/storage\/v1\/object\/(?:public|sign)\/(.+)/)
    if (!publicMatch) {
      return NextResponse.json({ error: 'Invalid preview URL' }, { status: 500 })
    }

    const [bucket, ...rest] = publicMatch[1].split('/')
    const filePath = rest.join('/')

    // Use admin client to create signed URL for private buckets (30 min expiry)
    const admin = createAdminClient()
    const { data: signedData, error: signedError } = await admin.storage
      .from(bucket)
      .createSignedUrl(filePath, 1800)

    if (signedError || !signedData?.signedUrl) {
      return NextResponse.json({ error: 'Could not generate preview URL' }, { status: 500 })
    }

    return NextResponse.json({ url: signedData.signedUrl, source })
  } catch (error) {
    console.error('[preview] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
