import { isReadingContent } from "@/lib/content"
import { resolveStorageAssetUrl } from "@/lib/storage"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  // Get content
  const { data: content } = await supabase
    .from("content")
    .select("id, type, file_url, preview_url, status")
    .eq("id", id)
    .eq("status", "published")
    .single()

  if (!content || !isReadingContent(content)) {
    return new Response("Not found", { status: 404 })
  }

  // Check subscription
  let isSubscribed = false
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_subscribed, role")
      .eq("id", user.id)
      .single()
    isSubscribed = (profile?.is_subscribed || profile?.role === "admin") ?? false
  }

  // Determine asset: subscribers get full file, non-subscribers only get preview
  const assetUrl = isSubscribed
    ? content.file_url || content.preview_url
    : content.preview_url

  if (!assetUrl) {
    return new Response("No preview available", { status: 403 })
  }

  // Resolve the signed URL server-side — never expose to client
  const resolvedUrl = await resolveStorageAssetUrl(assetUrl)

  const pdfResponse = await fetch(resolvedUrl)
  if (!pdfResponse.ok) {
    return new Response("Failed to fetch PDF", { status: 502 })
  }

  return new Response(pdfResponse.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
