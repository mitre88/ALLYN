import { isReadingContent } from "@/lib/content"
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

  // Use proxy URL — the proxy validates auth/subscription server-side
  // and streams the correct file. Supabase signed URLs are never sent to the client.
  const pdfUrl = `/api/content/${id}/pdf`
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
