import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { extractPdfText } from "@/lib/pdf-text"
import { resolveStorageAssetUrl } from "@/lib/storage"
import { isReadingContent } from "@/lib/content"
import { generateFullAudio } from "@/lib/tts"

export const runtime = "nodejs"
export const maxDuration = 300 // 5 min for long books

const AUDIO_BUCKET = "audio-cache"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Subscription check
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_subscribed, role")
      .eq("id", user.id)
      .single()

    const isSubscribed = (profile?.is_subscribed || profile?.role === "admin") ?? false

    // Get content
    const { data: content, error: contentError } = await supabase
      .from("content")
      .select("id, type, file_url, preview_url, audio_url, is_free, status, title")
      .eq("id", id)
      .eq("status", "published")
      .single()

    if (contentError || !content || !isReadingContent(content)) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    const hasFullAccess = isSubscribed || content.is_free
    if (!hasFullAccess) {
      return NextResponse.json({ error: "Subscription required" }, { status: 403 })
    }

    const admin = createAdminClient()

    // Check if we already have cached audio
    if (content.audio_url) {
      const signedUrl = await resolveStorageAssetUrl(content.audio_url)
      return NextResponse.json({ url: signedUrl, cached: true })
    }

    // Check if cached in storage but not yet linked
    const cachedPath = `${id}/full.mp3`
    const { data: existingFile } = await admin.storage
      .from(AUDIO_BUCKET)
      .createSignedUrl(cachedPath, 3600)

    if (existingFile?.signedUrl) {
      // Link it to the content record
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/authenticated/${AUDIO_BUCKET}/${cachedPath}`
      await admin.from("content").update({ audio_url: publicUrl }).eq("id", id)
      return NextResponse.json({ url: existingFile.signedUrl, cached: true })
    }

    // Generate audio from PDF text
    const assetUrl = content.file_url || content.preview_url
    if (!assetUrl) {
      return NextResponse.json({ error: "No file available" }, { status: 404 })
    }

    const resolvedUrl = await resolveStorageAssetUrl(assetUrl)
    const parsed = await extractPdfText(resolvedUrl)

    if (!parsed.text?.trim()) {
      return NextResponse.json({ error: "No text could be extracted" }, { status: 422 })
    }

    // Generate TTS audio
    const audioBuffer = await generateFullAudio(parsed.text)

    // Upload to Supabase Storage
    const { error: uploadError } = await admin.storage
      .from(AUDIO_BUCKET)
      .upload(cachedPath, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      })

    if (uploadError) {
      console.error("[tts] Upload error:", uploadError)
      // Still serve the audio even if caching fails
      return new NextResponse(new Uint8Array(audioBuffer), {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Disposition": `inline; filename="${content.title}.mp3"`,
        },
      })
    }

    // Save audio_url to content record
    const audioUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/authenticated/${AUDIO_BUCKET}/${cachedPath}`
    await admin.from("content").update({ audio_url: audioUrl }).eq("id", id)

    // Return signed URL
    const { data: signedData } = await admin.storage
      .from(AUDIO_BUCKET)
      .createSignedUrl(cachedPath, 3600)

    if (signedData?.signedUrl) {
      return NextResponse.json({ url: signedData.signedUrl, cached: false })
    }

    // Fallback: return the audio directly
    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `inline; filename="${content.title}.mp3"`,
      },
    })
  } catch (error) {
    console.error("[tts] Error:", error)
    return NextResponse.json(
      { error: "Failed to generate audio" },
      { status: 500 }
    )
  }
}
