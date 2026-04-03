import { isReadingContent } from "@/lib/content"
import { resolveStorageAssetUrl } from "@/lib/storage"
import { createClient } from "@/lib/supabase/server"
import { PREVIEW_PAGES } from "@/lib/reading-preview"
import { PDFDocument } from "pdf-lib"

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
    .select("id, type, file_url, preview_url, is_free, status")
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

  const hasFullAccess = isSubscribed || content.is_free

  // Always use the full file — we truncate server-side for previews
  const assetUrl = content.file_url || content.preview_url
  if (!assetUrl) {
    return new Response("No file available", { status: 404 })
  }

  // Resolve the signed URL server-side — never expose to client
  const resolvedUrl = await resolveStorageAssetUrl(assetUrl)

  const pdfResponse = await fetch(resolvedUrl)
  if (!pdfResponse.ok) {
    return new Response("Failed to fetch PDF", { status: 502 })
  }

  const headers: HeadersInit = {
    "Content-Type": "application/pdf",
    "Content-Disposition": "inline",
    "Cache-Control": "private, max-age=3600",
    "X-Content-Type-Options": "nosniff",
  }

  // Subscribers get the full PDF
  if (hasFullAccess) {
    return new Response(pdfResponse.body, { headers })
  }

  // Non-subscribers: extract only the first N pages as preview
  try {
    const fullPdfBytes = new Uint8Array(await pdfResponse.arrayBuffer())
    const fullDoc = await PDFDocument.load(fullPdfBytes)
    const totalPages = fullDoc.getPageCount()
    const pagesToCopy = Math.min(PREVIEW_PAGES, totalPages)

    const previewDoc = await PDFDocument.create()
    const copied = await previewDoc.copyPages(
      fullDoc,
      Array.from({ length: pagesToCopy }, (_, i) => i)
    )
    copied.forEach((page) => previewDoc.addPage(page))

    const previewBytes = await previewDoc.save()

    headers["X-Preview-Pages"] = String(pagesToCopy)
    headers["X-Total-Pages"] = String(totalPages)

    return new Response(Buffer.from(previewBytes), { headers })
  } catch (error) {
    console.error("[pdf] Error creating preview:", error)
    // Fallback: stream the full PDF if truncation fails
    return new Response(pdfResponse.body, { headers })
  }
}
