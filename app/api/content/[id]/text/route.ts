import { NextResponse } from "next/server"
import { extractPdfText } from "@/lib/pdf-text"
import { createClient } from "@/lib/supabase/server"
import { isReadingContent } from "@/lib/content"
import { resolveStorageAssetUrl } from "@/lib/storage"

export const runtime = "nodejs"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: content, error } = await supabase
      .from("content")
      .select("id, type, file_url, preview_url, status")
      .eq("id", id)
      .eq("status", "published")
      .single()

    if (error || !content || !isReadingContent(content)) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    const assetUrl = content.file_url || content.preview_url
    if (!assetUrl) {
      return NextResponse.json({ error: "No file available" }, { status: 404 })
    }

    const resolvedUrl = await resolveStorageAssetUrl(assetUrl)
    const parsed = await extractPdfText(resolvedUrl)

    return NextResponse.json({
      pageCount: parsed.pageCount || 0,
      text: parsed.text || "",
    })
  } catch (error) {
    console.error("[content-text] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
