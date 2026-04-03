import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")

// Load .env.local
dotenv.config({ path: path.join(root, ".env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  // Find the course content
  const { data: courses, error: courseErr } = await supabase
    .from("content")
    .select("id, title, type, thumbnail_url, preview_url")
    .eq("type", "course")
    .eq("status", "published")
    .order("sort_order", { ascending: true })

  if (courseErr) {
    console.error("Error fetching courses:", courseErr.message)
    process.exit(1)
  }

  if (!courses || courses.length === 0) {
    console.log("No published courses found. Looking for any course...")
    const { data: allCourses } = await supabase
      .from("content")
      .select("id, title, type, thumbnail_url, preview_url")
      .eq("type", "course")
      .order("sort_order", { ascending: true })

    if (!allCourses || allCourses.length === 0) {
      console.error("No courses found at all in the database.")
      process.exit(1)
    }
    courses.push(...allCourses)
  }

  const course = courses[0]
  console.log(`Found course: "${course.title}" (${course.id})`)
  console.log(`  Current thumbnail: ${course.thumbnail_url || "NONE"}`)
  console.log(`  Current preview:   ${course.preview_url || "NONE"}`)

  const assetsDir = path.join(root, "public", "assets", "course")

  // Upload thumbnail
  const thumbPath = path.join(assetsDir, "thumbnail.png")
  if (fs.existsSync(thumbPath)) {
    console.log("\nUploading thumbnail...")
    const thumbBuffer = fs.readFileSync(thumbPath)
    const thumbStoragePath = `${course.id}/thumb.png`

    const { error: thumbUpErr } = await supabase.storage
      .from("thumbnails")
      .upload(thumbStoragePath, thumbBuffer, {
        contentType: "image/png",
        upsert: true,
      })

    if (thumbUpErr) {
      console.error("  Thumbnail upload error:", thumbUpErr.message)
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from("thumbnails")
        .getPublicUrl(thumbStoragePath)
      console.log("  Thumbnail uploaded:", publicUrl)

      // Update DB
      await supabase
        .from("content")
        .update({ thumbnail_url: publicUrl })
        .eq("id", course.id)
      console.log("  DB updated with thumbnail_url")
    }
  } else {
    console.log("No thumbnail.png found, skipping")
  }

  // Upload trailer as preview
  const trailerPath = path.join(assetsDir, "trailer.mp4")
  if (fs.existsSync(trailerPath)) {
    console.log("\nUploading trailer as preview...")
    const trailerBuffer = fs.readFileSync(trailerPath)
    const trailerStoragePath = `${course.id}/preview.mp4`

    const { error: trailerUpErr } = await supabase.storage
      .from("previews")
      .upload(trailerStoragePath, trailerBuffer, {
        contentType: "video/mp4",
        upsert: true,
      })

    if (trailerUpErr) {
      console.error("  Trailer upload error:", trailerUpErr.message)
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from("previews")
        .getPublicUrl(trailerStoragePath)
      console.log("  Trailer uploaded:", publicUrl)

      // Update DB
      await supabase
        .from("content")
        .update({ preview_url: publicUrl })
        .eq("id", course.id)
      console.log("  DB updated with preview_url")
    }
  } else {
    console.log("No trailer.mp4 found, skipping")
  }

  console.log("\nDone!")
}

main().catch((err) => {
  console.error("Upload failed:", err)
  process.exit(1)
})
