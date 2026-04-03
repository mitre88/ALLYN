/**
 * Extracts cover (page 1 as JPEG) and preview (first N pages as PDF)
 * from a book in Supabase storage, then uploads and updates the record.
 *
 * Usage: node scripts/extract-cover-and-preview.mjs <content-id> [preview-pages]
 * Example: node scripts/extract-cover-and-preview.mjs d633b613-6c61-4c58-b689-4dd7e63b4005 5
 */

import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import { createClient } from "@supabase/supabase-js"
import { PDFDocument } from "pdf-lib"

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

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const contentId = process.argv[2]
const previewPages = parseInt(process.argv[3] || "5", 10)

if (!contentId) {
  console.error("Usage: node scripts/extract-cover-and-preview.mjs <content-id> [preview-pages]")
  process.exit(1)
}

async function main() {
  console.log(`\n📖 Processing content: ${contentId}`)
  console.log(`   Preview pages: ${previewPages}`)

  // 1. Get content record
  const { data: content, error: contentError } = await supabase
    .from("content")
    .select("id, title, file_url, thumbnail_url, preview_url")
    .eq("id", contentId)
    .single()

  if (contentError || !content) {
    console.error("Content not found:", contentError?.message)
    process.exit(1)
  }

  console.log(`   Title: ${content.title}`)
  console.log(`   File URL: ${content.file_url}`)

  if (!content.file_url) {
    console.error("No file_url set for this content")
    process.exit(1)
  }

  // 2. Download the full PDF
  console.log("\n⬇️  Downloading PDF...")

  // Extract bucket and path from the URL
  const urlObj = new URL(content.file_url)
  const storageMatch = urlObj.pathname.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/(.+)/)
  if (!storageMatch) {
    console.error("Cannot parse storage URL:", content.file_url)
    process.exit(1)
  }

  const fullPath = decodeURIComponent(storageMatch[1])
  const slashIdx = fullPath.indexOf("/")
  const bucket = fullPath.substring(0, slashIdx)
  const filePath = fullPath.substring(slashIdx + 1)

  console.log(`   Bucket: ${bucket}, Path: ${filePath}`)

  const { data: fileData, error: downloadError } = await supabase.storage
    .from(bucket)
    .download(filePath)

  if (downloadError || !fileData) {
    console.error("Download failed:", downloadError?.message)
    process.exit(1)
  }

  const pdfBytes = new Uint8Array(await fileData.arrayBuffer())
  console.log(`   Downloaded: ${(pdfBytes.length / 1024 / 1024).toFixed(2)} MB`)

  // 3. Load PDF with pdf-lib
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const totalPages = pdfDoc.getPageCount()
  console.log(`   Total pages: ${totalPages}`)

  if (totalPages < previewPages) {
    console.warn(`   Warning: PDF has only ${totalPages} pages, using all pages for preview`)
  }

  // 4. Extract cover (page 1) as image using canvas + pdfjs-dist
  console.log("\n🎨 Extracting cover image (page 1)...")

  const { createCanvas } = await import("canvas")
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs")

  const loadingTask = pdfjsLib.getDocument({ data: pdfBytes.slice() })
  const pdfJsDoc = await loadingTask.promise
  const page = await pdfJsDoc.getPage(1)

  // Render at 2x scale for good quality thumbnail
  const scale = 2.0
  const viewport = page.getViewport({ scale })
  const canvas = createCanvas(viewport.width, viewport.height)
  const ctx = canvas.getContext("2d")

  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise

  const jpegBuffer = canvas.toBuffer("image/jpeg", { quality: 0.88 })
  console.log(`   Cover image: ${(jpegBuffer.length / 1024).toFixed(1)} KB`)

  // 5. Extract preview PDF (first N pages)
  console.log(`\n📄 Extracting preview PDF (pages 1-${Math.min(previewPages, totalPages)})...`)

  const previewDoc = await PDFDocument.create()
  const pagesToCopy = Math.min(previewPages, totalPages)
  const copiedPages = await previewDoc.copyPages(
    pdfDoc,
    Array.from({ length: pagesToCopy }, (_, i) => i)
  )
  for (const p of copiedPages) {
    previewDoc.addPage(p)
  }

  const previewPdfBytes = await previewDoc.save()
  console.log(`   Preview PDF: ${(previewPdfBytes.length / 1024).toFixed(1)} KB, ${pagesToCopy} pages`)

  // 6. Upload cover thumbnail
  console.log("\n⬆️  Uploading cover thumbnail...")
  const thumbPath = `${contentId}.jpg`

  const { error: thumbUploadError } = await supabase.storage
    .from("thumbnails")
    .upload(thumbPath, jpegBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    })

  if (thumbUploadError) {
    console.error("Thumbnail upload failed:", thumbUploadError.message)
    process.exit(1)
  }

  const { data: thumbUrl } = supabase.storage
    .from("thumbnails")
    .getPublicUrl(thumbPath)

  console.log(`   Thumbnail URL: ${thumbUrl.publicUrl}`)

  // 7. Upload preview PDF
  console.log("\n⬆️  Uploading preview PDF...")
  const previewPath = `PREVIEWS/${contentId}_preview.pdf`

  const { error: previewUploadError } = await supabase.storage
    .from("books")
    .upload(previewPath, previewPdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    })

  if (previewUploadError) {
    console.error("Preview upload failed:", previewUploadError.message)
    // Try books-xl bucket instead
    console.log("   Trying books-xl bucket...")
    const { error: xlError } = await supabase.storage
      .from("books-xl")
      .upload(previewPath, previewPdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      })

    if (xlError) {
      console.error("Preview upload to books-xl also failed:", xlError.message)
      process.exit(1)
    }

    // Build authenticated URL for books-xl
    const previewStorageUrl = `${SUPABASE_URL}/storage/v1/object/authenticated/books-xl/${previewPath}`

    // 8. Update content record
    console.log("\n💾 Updating content record...")
    const { error: updateError } = await supabase
      .from("content")
      .update({
        thumbnail_url: thumbUrl.publicUrl,
        preview_url: previewStorageUrl,
      })
      .eq("id", contentId)

    if (updateError) {
      console.error("Update failed:", updateError.message)
      process.exit(1)
    }

    console.log("\n✅ Done!")
    console.log(`   Thumbnail: ${thumbUrl.publicUrl}`)
    console.log(`   Preview: ${previewStorageUrl}`)
    return
  }

  // Build authenticated URL for books bucket
  const previewStorageUrl = `${SUPABASE_URL}/storage/v1/object/authenticated/books/${previewPath}`

  // 8. Update content record
  console.log("\n💾 Updating content record...")
  const { error: updateError } = await supabase
    .from("content")
    .update({
      thumbnail_url: thumbUrl.publicUrl,
      preview_url: previewStorageUrl,
    })
    .eq("id", contentId)

  if (updateError) {
    console.error("Update failed:", updateError.message)
    process.exit(1)
  }

  console.log("\n✅ Done!")
  console.log(`   Thumbnail: ${thumbUrl.publicUrl}`)
  console.log(`   Preview: ${previewStorageUrl}`)
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
