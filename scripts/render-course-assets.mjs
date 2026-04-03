import { bundle } from "@remotion/bundler"
import { renderStill, renderMedia, selectComposition } from "@remotion/renderer"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")

async function main() {
  console.log("Bundling Remotion project...")
  const bundleLocation = await bundle({
    entryPoint: path.join(root, "remotion", "index.ts"),
    onProgress: (p) => {
      if (p % 25 === 0) console.log(`  Bundle progress: ${p}%`)
    },
  })
  console.log("Bundle complete:", bundleLocation)

  // Render Thumbnail
  console.log("\nRendering thumbnail...")
  const thumbComp = await selectComposition({
    serveUrl: bundleLocation,
    id: "CourseThumbnail",
  })

  const thumbnailPath = path.join(root, "public", "assets", "course", "thumbnail.png")
  await renderStill({
    composition: thumbComp,
    serveUrl: bundleLocation,
    output: thumbnailPath,
  })
  console.log("Thumbnail saved:", thumbnailPath)

  // Render Trailer
  console.log("\nRendering trailer video...")
  const trailerComp = await selectComposition({
    serveUrl: bundleLocation,
    id: "CourseTrailer",
  })

  const trailerPath = path.join(root, "public", "assets", "course", "trailer.mp4")
  await renderMedia({
    composition: trailerComp,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: trailerPath,
    onProgress: ({ progress }) => {
      if (Math.round(progress * 100) % 10 === 0) {
        process.stdout.write(`\r  Trailer progress: ${Math.round(progress * 100)}%`)
      }
    },
  })
  console.log("\nTrailer saved:", trailerPath)

  console.log("\nDone! Assets ready.")
}

main().catch((err) => {
  console.error("Render failed:", err)
  process.exit(1)
})
