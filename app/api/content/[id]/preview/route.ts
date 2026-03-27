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
      .select('preview_url, file_url, type, status')
      .eq('id', id)
      .eq('status', 'published')
      .single()

    if (contentError || !content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Books and audiobooks must have an explicit preview_url — never expose the full file
    const isReadingContent = content.type === 'book' || content.type === 'audiobook'
    const assetUrl = isReadingContent
      ? content.preview_url
      : (content.preview_url || content.file_url)

    const source =
      content.preview_url && content.preview_url !== content.file_url
        ? 'preview'
        : 'file'

    if (!assetUrl) {
      return NextResponse.json({ error: 'No preview available' }, { status: 404 })
    }

    // Extract storage path from preview_url or file_url fallback
    const url = new URL(assetUrl)
    const publicMatch = url.pathname.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/(.+)/)

    // If it's a public bucket, return the URL directly — no signed URL needed
    const isPublicBucket = url.pathname.includes('/object/public/')
    if (isPublicBucket || !publicMatch) {
      return NextResponse.json({ url: assetUrl, source })
    }

    const [bucket, ...rest] = publicMatch[1].split('/')
    const filePath = rest.join('/')

    // Use admin client to create signed URL for private buckets (30 min expiry)
    try {
      const admin = createAdminClient()
      const { data: signedData, error: signedError } = await admin.storage
        .from(bucket)
        .createSignedUrl(filePath, 1800)

      if (signedError || !signedData?.signedUrl) {
        // Fall back to direct URL
        return NextResponse.json({ url: assetUrl, source })
      }

      return NextResponse.json({ url: signedData.signedUrl, source })
    } catch {
      // Service role key not configured — fall back to direct URL
      return NextResponse.json({ url: assetUrl, source })
    }
  } catch (error) {
    console.error('[preview] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
