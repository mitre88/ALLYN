#!/usr/bin/env node
/**
 * Generates thumbnails for all content items and uploads to Supabase.
 * PDFs → renders first page via pdfjs-dist + canvas → JPEG
 * Videos → extracts frame at 2s via ffmpeg → JPEG
 * Run: node scripts/generate-thumbnails.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync, readdirSync } from 'fs'
import { join, basename, extname, dirname as pathDirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import { createCanvas, Image as CanvasImage } from 'canvas'

// pdfjs needs Image in global scope for drawImage with inline images
globalThis.Image = CanvasImage
import sharp from 'sharp'

const __dirname = pathDirname(fileURLToPath(import.meta.url))
loadLocalEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const STORAGE_URL = SUPABASE_URL.replace('.supabase.co', '.storage.supabase.co')

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
const MULTIMEDIA_PATH = join(__dirname, '..', 'MULTIMEDIA')
const TMP_DIR = join(__dirname, '..', '.thumbnails-tmp')

// Thumbnail dimensions (16:9 aspect ratio, Netflix-style)
const THUMB_W = 480
const THUMB_H = 270

function loadLocalEnv() {
  const envPath = join(__dirname, '..', '.env.local')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const sep = trimmed.indexOf('=')
    if (sep === -1) continue
    const key = trimmed.slice(0, sep).trim()
    const val = trimmed.slice(sep + 1).trim().replace(/^['"]|['"]$/g, '')
    if (key && !(key in process.env)) process.env[key] = val
  }
}

async function ensureThumbnailsBucket() {
  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = buckets?.some(b => b.name === 'thumbnails')
  if (!exists) {
    const { error } = await supabase.storage.createBucket('thumbnails', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    })
    if (error) throw error
    console.log('  ✓ Bucket "thumbnails" creado (público)')
  }
}

// Fallback: generate a branded thumbnail with canvas when PDF rendering fails
async function generateFallbackThumbnail(title, author, categoryColor = '#c8951a') {
  const canvas = createCanvas(THUMB_W, THUMB_H)
  const ctx = canvas.getContext('2d')

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, THUMB_W, THUMB_H)
  const hex = categoryColor.replace('#', '')
  const r = parseInt(hex.slice(0,2), 16), g = parseInt(hex.slice(2,4), 16), b = parseInt(hex.slice(4,6), 16)
  grad.addColorStop(0, `rgba(${r},${g},${b},0.85)`)
  grad.addColorStop(1, `rgba(${Math.max(0,r-40)},${Math.max(0,g-40)},${Math.max(0,b-40)},1)`)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, THUMB_W, THUMB_H)

  // Overlay dark vignette bottom
  const vignette = ctx.createLinearGradient(0, THUMB_H * 0.4, 0, THUMB_H)
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.7)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, THUMB_W, THUMB_H)

  // Decorative circle pattern
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1
  for (let i = 1; i <= 4; i++) {
    ctx.beginPath()
    ctx.arc(THUMB_W * 0.75, THUMB_H * 0.3, 30 * i, 0, Math.PI * 2)
    ctx.stroke()
  }

  // ALLYN brand top-left
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = 'bold 11px sans-serif'
  ctx.fillText('ALLYN', 16, 22)

  // Title text (word-wrap)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 22px sans-serif'
  const words = title.split(' ')
  const lines = []
  let current = ''
  for (const w of words) {
    const test = current ? `${current} ${w}` : w
    if (ctx.measureText(test).width > THUMB_W - 32) { lines.push(current); current = w }
    else current = test
  }
  if (current) lines.push(current)

  const lineH = 28
  const totalH = lines.length * lineH
  const startY = THUMB_H - totalH - (author ? 36 : 20)
  lines.forEach((line, i) => ctx.fillText(line, 16, startY + i * lineH))

  // Author
  if (author) {
    ctx.fillStyle = 'rgba(255,255,255,0.65)'
    ctx.font = '13px sans-serif'
    ctx.fillText(author, 16, THUMB_H - 16)
  }

  const pngBuffer = canvas.toBuffer('image/png')
  return await sharp(pngBuffer).resize(THUMB_W, THUMB_H).jpeg({ quality: 88 }).toBuffer()
}

async function generatePdfThumbnailViaGhostscript(pdfPath) {
  const tmpPng = join(TMP_DIR, `gs_${Date.now()}.png`)
  const tmpJpg = join(TMP_DIR, `gs_${Date.now()}.jpg`)
  try {
    execSync(
      `gs -dNOPAUSE -dBATCH -sDEVICE=png16m -dFirstPage=1 -dLastPage=1 -dPDFFitPage -dFIXEDMEDIA -sPAPERSIZE=letter -r150 -o "${tmpPng}" "${pdfPath}"`,
      { stdio: 'pipe', timeout: 30000 }
    )
    const buf = await sharp(readFileSync(tmpPng))
      .resize(THUMB_W, THUMB_H, { fit: 'cover', position: 'top' })
      .jpeg({ quality: 88 })
      .toBuffer()
    return buf
  } finally {
    try { unlinkSync(tmpPng) } catch {}
    try { unlinkSync(tmpJpg) } catch {}
  }
}

async function generatePdfThumbnail(pdfPath, title, author, categoryColor) {
  const stat = await import('fs').then(m => m.statSync(pdfPath))
  const fileSizeMB = stat.size / (1024 * 1024)

  if (fileSizeMB > 30) {
    return generatePdfThumbnailViaGhostscript(pdfPath)
  }

  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs').catch(
    () => import('pdfjs-dist')
  )
  const pdfjs = pdfjsLib.default ?? pdfjsLib

  const data = new Uint8Array(readFileSync(pdfPath))
  const doc = await pdfjs.getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise

  const page = await doc.getPage(1)
  const viewport = page.getViewport({ scale: 1.0 })

  const scale = Math.max(THUMB_W / viewport.width, THUMB_H / viewport.height)
  const scaledViewport = page.getViewport({ scale })

  const canvas = createCanvas(Math.ceil(scaledViewport.width), Math.ceil(scaledViewport.height))
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise

  const pngBuffer = canvas.toBuffer('image/png')
  const thumbBuffer = await sharp(pngBuffer)
    .resize(THUMB_W, THUMB_H, { fit: 'cover', position: 'top' })
    .jpeg({ quality: 88 })
    .toBuffer()

  return thumbBuffer
}

async function generateVideoThumbnail(videoPath) {
  const tmpFile = join(TMP_DIR, `thumb_${Date.now()}.jpg`)
  execSync(
    `ffmpeg -y -ss 00:00:02 -i "${videoPath}" -vframes 1 -vf "scale=${THUMB_W}:${THUMB_H}:force_original_aspect_ratio=increase,crop=${THUMB_W}:${THUMB_H}" -q:v 3 "${tmpFile}" 2>/dev/null`,
    { stdio: 'pipe' }
  )
  const buf = readFileSync(tmpFile)
  unlinkSync(tmpFile)
  return buf
}

function localPathForContent(fileUrl) {
  // Extract storage path from URL, map to local MULTIMEDIA path
  // URL format: https://*.supabase.co/storage/v1/object/authenticated/books-xl/LIBROS/xxx.pdf
  const match = fileUrl.match(/\/(LIBROS|VIDEOS)\/(.+)$/)
  if (!match) return null
  const folder = match[1]
  const filename = decodeURIComponent(match[2].replace(/_/g, ' ').replace(/%27/g, "'"))
  // Try exact match first
  const exactPath = join(MULTIMEDIA_PATH, folder, match[2].replace(/_/g, ' '))
  // Fallback: find file by normalized name
  const folder2 = folder === 'LIBROS' ? 'LIBROS' : 'VIDEOS'
  // Use the sanitized filename approach
  const sanitized = match[2]
  const candidates = [
    join(MULTIMEDIA_PATH, folder, sanitized.replace(/_/g, ' ')),
    join(MULTIMEDIA_PATH, folder, sanitized),
  ]
  for (const c of candidates) {
    if (existsSync(c)) return c
  }
  return null
}

// Normalize: strip accents, lowercase, keep only alphanumeric
function norm(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function findLocalFile(fileUrl) {
  const match = fileUrl.match(/\/(LIBROS|VIDEOS)\/([^?]+)$/)
  if (!match) return null
  const folder = match[1]
  const folderPath = join(MULTIMEDIA_PATH, folder)
  if (!existsSync(folderPath)) return null

  const files = readdirSync(folderPath)
  const storedNorm = norm(match[2])

  for (const f of files) {
    if (f.startsWith('.')) continue
    if (norm(f) === storedNorm) return join(folderPath, f)
  }
  return null
}

async function uploadThumbnail(contentId, buffer, title) {
  const filename = `${contentId}.jpg`
  const uploadUrl = `${STORAGE_URL}/storage/v1/object/thumbnails/${filename}`

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'image/jpeg',
      'x-upsert': 'true',
    },
    body: buffer,
    duplex: 'half',
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Upload failed (${res.status}): ${err}`)
  }

  // Public URL (bucket is public)
  return `${SUPABASE_URL}/storage/v1/object/public/thumbnails/${filename}`
}

async function main() {
  console.log('\n🎨 Generando miniaturas para todos los contenidos...\n')

  mkdirSync(TMP_DIR, { recursive: true })
  await ensureThumbnailsBucket()

  const { data: items, error } = await supabase
    .from('content')
    .select('id, title, type, file_url, thumbnail_url, author, category_id')

  if (error) throw error

  let success = 0, skipped = 0, failed = 0

  // Fetch category colors
  const { data: cats } = await supabase.from('categories').select('id, color')
  const catColorMap = Object.fromEntries((cats || []).map(c => [c.id, c.color]))

  for (const item of items) {
    if (!item.file_url) { skipped++; continue }

    const localPath = findLocalFile(item.file_url)
    const ext = extname(item.file_url.split('?')[0]).toLowerCase()
    const isPdf = ext === '.pdf'
    const isVideo = ['.mp4', '.mov', '.webm'].includes(ext)
    const catColor = catColorMap[item.category_id] || '#c8951a'

    console.log(`  🖼  "${item.title}"...`)

    try {
      let buffer
      if (isPdf && localPath) {
        try {
          buffer = await generatePdfThumbnail(localPath, item.title, item.author, catColor)
        } catch {
          // Fallback to styled gradient thumbnail
          console.log(`     ↳ PDF render falló, usando miniatura de marca`)
          buffer = await generateFallbackThumbnail(item.title, item.author, catColor)
        }
      } else if (isVideo && localPath) {
        buffer = await generateVideoThumbnail(localPath)
      } else {
        // No local file → styled fallback
        buffer = await generateFallbackThumbnail(item.title, item.author, catColor)
      }

      const thumbnailUrl = await uploadThumbnail(item.id, buffer, item.title)
      await supabase.from('content').update({ thumbnail_url: thumbnailUrl }).eq('id', item.id)
      console.log(`  ✓  "${item.title}"`)
      success++
    } catch (err) {
      console.error(`  ✗  "${item.title}": ${err.message}`)
      failed++
    }
  }

  // Cleanup
  try { require('fs').rmdirSync(TMP_DIR) } catch {}

  console.log(`\n✅ Completado: ${success} generadas, ${skipped} saltadas, ${failed} errores\n`)
}

main().catch(err => {
  console.error('Error fatal:', err)
  process.exit(1)
})
