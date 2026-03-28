import { isReadingContent } from "@/lib/content"
import { resolveStorageAssetUrl } from "@/lib/storage"
import { createClient } from "@/lib/supabase/server"
import type { Content } from "@/types/database"

export interface ReaderContentPayload {
  backHref: string
  backLabel: string
  content: Content
  pdfUrl: string
  isSubscribed: boolean
}

export async function getReaderContent(
  id: string
): Promise<ReaderContentPayload | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("content")
    .select("*, category:categories(*)")
    .eq("id", id)
    .eq("status", "published")
    .single()

  const content = data as Content | null

  if (!content || !isReadingContent(content)) {
    return null
  }

  // Check subscription status
  const { data: { user } } = await supabase.auth.getUser()
  let isSubscribed = false
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_subscribed, role")
      .eq("id", user.id)
      .single()
    isSubscribed = (profile?.is_subscribed || profile?.role === "admin") ?? false
  }

  // Subscribers get the full file; non-subscribers get preview_url or fall back to file_url
  // (the book-reader-shell handles the blur/lock overlay for non-subscribers)
  const assetUrl = isSubscribed
    ? (content.file_url || content.preview_url)
    : (content.preview_url || content.file_url)

  if (!assetUrl) {
    return null
  }

  const pdfUrl = await resolveStorageAssetUrl(assetUrl)
  const backHref = content.category?.slug ? `/category/${content.category.slug}` : "/"
  const backLabel = content.category?.name
    ? `Volver a ${content.category.name}`
    : "Volver al inicio"

  return {
    backHref,
    backLabel,
    content,
    pdfUrl,
    isSubscribed,
  }
}
