/**
 * Extracts a thumbnail frame from a video in Supabase storage and uploads it.
 *
 * Usage: node scripts/extract-video-thumb.mjs <content-id> [timestamp]
 * Example: node scripts/extract-video-thumb.mjs 9292e167-... 00:00:10
 */

import { readFileSync, writeFileSync, unlinkSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import { execSync } from "child_process"
import { createClient } from "@supabase/supabase-js"

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load env
const envPath = resolve(__dirname, "..", ".env.local")
const envContent = readFileSync(envPath, "utf-8")
const env = {}
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim()
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const contentId = process.argv[2]
const timestamp = process.argv[3] || "00:00:05"

if (!contentId) {
  console.error("Usage: node scripts/extract-video-thumb.mjs <content-id> [timestamp]")
  process.exit(1)
}

async function main() {
  console.log(`\n🎬 Processing content: ${contentId}`)
  console.log(`   Timestamp: ${timestamp}`)

  // 1. Get content record
  const { data: content, error } = await supabase
    .from("content")
    .select("id, title, file_url, thumbnail_url")
    .eq("id", contentId)
    .single()

  if (error || !content) {
    console.error("Content not found:", error?.message)
    process.exit(1)
  }

  console.log(`   Title: ${content.title}`)

  // 2. Get signed URL for the video
  const urlObj = new URL(content.file_url)
  const storageMatch = urlObj.pathname.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/(.+)/)
  if (!storageMatch) {
    console.error("Cannot parse storage URL")
    process.exit(1)
  }

  const fullPath = decodeURIComponent(storageMatch[1])
  const slashIdx = fullPath.indexOf("/")
  const bucket = fullPath.substring(0, slashIdx)
  const filePath = fullPath.substring(slashIdx + 1)

  const { data: signedData, error: signError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, 300)

  if (signError || !signedData?.signedUrl) {
    console.error("Failed to create signed URL:", signError?.message)
    process.exit(1)
  }

  console.log(`   Signed URL obtained`)

  // 3. Extract frame with ffmpeg
  const tmpPath = `/tmp/thumb_${contentId}.jpg`
  console.log(`\n🎨 Extracting frame at ${timestamp}...`)

  execSync(
    `ffmpeg -y -ss ${timestamp} -i "${signedData.signedUrl}" -frames:v 1 -q:v 2 -vf "scale=1280:-1" "${tmpPath}"`,
    { stdio: "pipe" }
  )

  const thumbBuffer = readFileSync(tmpPath)
  console.log(`   Frame extracted: ${(thumbBuffer.length / 1024).toFixed(1)} KB`)

  // 4. Upload to thumbnails bucket
  console.log("\n⬆️  Uploading thumbnail...")
  const thumbStoragePath = `${contentId}.jpg`

  const { error: uploadError } = await supabase.storage
    .from("thumbnails")
    .upload(thumbStoragePath, thumbBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    })

  if (uploadError) {
    console.error("Upload failed:", uploadError.message)
    process.exit(1)
  }

  const { data: publicUrl } = supabase.storage
    .from("thumbnails")
    .getPublicUrl(thumbStoragePath)

  // 5. Update content record
  console.log("\n💾 Updating content record...")
  const { error: updateError } = await supabase
    .from("content")
    .update({ thumbnail_url: publicUrl.publicUrl })
    .eq("id", contentId)

  if (updateError) {
    console.error("Update failed:", updateError.message)
    process.exit(1)
  }

  // Cleanup
  unlinkSync(tmpPath)

  console.log(`\n✅ Done!`)
  console.log(`   New thumbnail: ${publicUrl.publicUrl}`)
}

main().catch(err => {
  console.error("Fatal error:", err)
  process.exit(1)
})
