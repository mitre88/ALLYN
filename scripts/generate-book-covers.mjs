#!/usr/bin/env node
/**
 * Generates proper 4:5 portrait book cover thumbnails for all books/audiobooks.
 * Uses SVG templates matching the programmatic covers in ContentArtwork.
 * Run: node scripts/generate-book-covers.mjs
 */
import sharp from "sharp"
import path from "path"
import { readFileSync } from "fs"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")

// Load .env.local manually (avoid dotenv version issues)
const envContent = readFileSync(path.join(root, ".env.local"), "utf-8")
for (const line of envContent.split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (m) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "")
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

// Lightweight REST helpers (avoids supabase-js compat issues with Node 25)
const headers = {
  "apikey": SERVICE_KEY,
  "Authorization": `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
}

async function dbSelect(table, params = "") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, { headers })
  if (!res.ok) throw new Error(`DB select failed: ${await res.text()}`)
  return res.json()
}

async function dbUpdate(table, id, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`DB update failed: ${await res.text()}`)
}

async function storageUpload(bucket, filePath, buffer, contentType) {
  const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "apikey": SERVICE_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: buffer,
    duplex: "half",
  })
  if (!res.ok) throw new Error(`Storage upload failed: ${await res.text()}`)
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`
}

const W = 480
const H = 600
const FONT = "system-ui, -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif"

function hexAlpha(hex, a) {
  const c = hex.replace("#", "")
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${a})`
}

function darken(hex, f) {
  const c = hex.replace("#", "")
  const r = Math.round(parseInt(c.slice(0, 2), 16) * (1 - f))
  const g = Math.round(parseInt(c.slice(2, 4), 16) * (1 - f))
  const b = Math.round(parseInt(c.slice(4, 6), 16) * (1 - f))
  return `rgb(${r},${g},${b})`
}

function trunc(s, max) {
  return s.length > max ? s.slice(0, max - 1) + "…" : s
}

function getIdx(id) {
  let sum = 0
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i)
  return sum % 6
}

// Template 0 — Diagonal Split
function svgDiagonal(title, author, accent) {
  const lines = splitTitle(title, 18)
  const titleY = H - 170
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="#09090b"/>
    <polygon points="-10,0 ${W * 0.75},0 ${W * 0.33},${H} -10,${H}" fill="${hexAlpha(accent, 0.18)}"/>
    <polygon points="-10,0 ${W * 0.58},0 ${W * 0.16},${H} -10,${H}" fill="${hexAlpha(accent, 0.12)}"/>
    <rect x="0" y="0" width="5" height="${H}" fill="${accent}"/>
    <rect x="0" y="0" width="120" height="5" fill="${accent}"/>
    <line x1="0" y1="${H * 0.6}" x2="${W}" y2="${H * 0.2}" stroke="${hexAlpha(accent, 0.55)}" stroke-width="1.5"/>
    <line x1="0" y1="${H * 0.63}" x2="${W}" y2="${H * 0.23}" stroke="${hexAlpha(accent, 0.22)}" stroke-width="0.75"/>
    <!-- ALLYN badge -->
    <circle cx="28" cy="38" r="7" fill="${accent}"/>
    <text x="44" y="44" font-family="${FONT}" font-size="14" font-weight="700" fill="${hexAlpha(accent, 0.85)}" letter-spacing="3">ALLYN</text>
    <!-- Title -->
    ${lines.map((l, i) => `<text x="28" y="${titleY + i * 44}" font-family="${FONT}" font-size="36" font-weight="800" fill="white" letter-spacing="-0.5">${escXml(l)}</text>`).join("\n    ")}
    <!-- Separator -->
    <rect x="28" y="${titleY + lines.length * 44 + 10}" width="${W - 56}" height="1" fill="${hexAlpha(accent, 0.5)}"/>
    <!-- Author -->
    ${author ? `<text x="28" y="${titleY + lines.length * 44 + 38}" font-family="${FONT}" font-size="18" font-weight="400" fill="rgba(255,255,255,0.5)" letter-spacing="0.5">${escXml(trunc(author, 32))}</text>` : ""}
  </svg>`
}

// Template 1 — Circle Abstract
function svgCircle(title, author, accent) {
  const lines = splitTitle(title, 18)
  const titleY = H - 170
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#07070a" stop-opacity="0"/>
        <stop offset="100%" stop-color="#07070a" stop-opacity="0.93"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="#07070a"/>
    <circle cx="${W * 0.7}" cy="${H * 0.27}" r="220" fill="${hexAlpha(accent, 0.12)}"/>
    <circle cx="${W * 0.25}" cy="${H * 0.65}" r="170" fill="${hexAlpha(accent, 0.09)}"/>
    <circle cx="${W * 0.72}" cy="${H * 0.25}" r="140" fill="none" stroke="${hexAlpha(accent, 0.28)}" stroke-width="1.5"/>
    <circle cx="${W * 0.72}" cy="${H * 0.25}" r="180" fill="none" stroke="${hexAlpha(accent, 0.1)}" stroke-width="1"/>
    <circle cx="50" cy="80" r="5" fill="${hexAlpha(accent, 0.6)}"/>
    <circle cx="22" cy="130" r="3" fill="${hexAlpha(accent, 0.4)}"/>
    <rect x="0" y="${H * 0.45}" width="${W}" height="${H}" fill="url(#g1)"/>
    <text x="28" y="46" font-family="${FONT}" font-size="14" font-weight="700" fill="${hexAlpha(accent, 0.8)}" letter-spacing="3">ALLYN</text>
    ${lines.map((l, i) => `<text x="${W / 2}" y="${titleY + i * 44}" text-anchor="middle" font-family="${FONT}" font-size="36" font-weight="800" fill="white" letter-spacing="-0.5">${escXml(l)}</text>`).join("\n    ")}
    ${author ? `<text x="${W / 2}" y="${titleY + lines.length * 44 + 36}" text-anchor="middle" font-family="${FONT}" font-size="17" font-weight="400" fill="${hexAlpha(accent, 0.72)}" letter-spacing="0.5">${escXml(trunc(author, 32))}</text>` : ""}
  </svg>`
}

// Template 2 — Grid Minimal
function svgGrid(title, author, accent) {
  const bg = darken(accent, 0.82)
  const dots = []
  for (let row = 0; row < 18; row++) {
    for (let col = 0; col < 12; col++) {
      dots.push(`<circle cx="${24 + col * 38}" cy="${20 + row * 32}" r="2.5" fill="rgba(255,255,255,0.07)"/>`)
    }
  }
  const lines = splitTitle(title, 20)
  const titleY = H - 170
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${bg}"/>
    ${dots.join("\n    ")}
    <rect x="0" y="0" width="${W}" height="5" fill="${accent}"/>
    <rect x="0" y="${H - 170}" width="${W}" height="170" fill="rgba(0,0,0,0.5)"/>
    <text x="28" y="40" font-family="${FONT}" font-size="13" font-weight="700" fill="${hexAlpha(accent, 0.8)}" letter-spacing="3">ALLYN</text>
    ${lines.map((l, i) => `<text x="28" y="${titleY + 38 + i * 40}" font-family="${FONT}" font-size="32" font-weight="700" fill="white" letter-spacing="-0.3">${escXml(l)}</text>`).join("\n    ")}
    ${author ? `<text x="28" y="${H - 20}" font-family="${FONT}" font-size="16" font-weight="400" fill="rgba(255,255,255,0.5)" letter-spacing="1">${escXml(trunc(author.toUpperCase(), 32))}</text>` : ""}
  </svg>`
}

// Template 3 — Vertical Split
function svgVerticalSplit(title, author, accent) {
  const lines = splitTitle(title, 14)
  const titleY = H / 2 - 20
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="${W * 0.4}" height="${H}" fill="${hexAlpha(accent, 0.22)}"/>
    <rect x="${W * 0.4}" y="0" width="${W * 0.6}" height="${H}" fill="#0a0a0e"/>
    <rect x="${W * 0.4 - 2}" y="0" width="3" height="${H}" fill="${accent}"/>
    <!-- Left decoration -->
    <circle cx="${W * 0.2}" cy="${H * 0.28}" r="60" fill="${hexAlpha(accent, 0.25)}"/>
    <circle cx="${W * 0.2}" cy="${H * 0.28}" r="38" fill="${hexAlpha(accent, 0.15)}"/>
    <circle cx="${W * 0.2}" cy="${H * 0.28}" r="16" fill="${hexAlpha(accent, 0.5)}"/>
    <line x1="${W * 0.06}" y1="${H * 0.48}" x2="${W * 0.34}" y2="${H * 0.48}" stroke="${hexAlpha(accent, 0.4)}" stroke-width="1.5"/>
    <text x="${W * 0.08}" y="${H * 0.7}" font-family="${FONT}" font-size="12" font-weight="700" fill="${hexAlpha(accent, 0.6)}" letter-spacing="2" writing-mode="tb">ALLYN</text>
    <!-- Right title -->
    ${lines.map((l, i) => `<text x="${W * 0.44}" y="${titleY + i * 42}" font-family="${FONT}" font-size="30" font-weight="800" fill="white" letter-spacing="-0.3">${escXml(l)}</text>`).join("\n    ")}
    <rect x="${W * 0.4}" y="${H * 0.86}" width="${W * 0.6}" height="1.5" fill="${hexAlpha(accent, 0.4)}"/>
    ${author ? `<text x="${W * 0.44}" y="${H * 0.92}" font-family="${FONT}" font-size="16" font-weight="400" fill="rgba(255,255,255,0.5)">${escXml(trunc(author, 20))}</text>` : ""}
  </svg>`
}

// Template 4 — Concentric Arcs
function svgConcentric(title, author, accent) {
  const radii = [60, 110, 160, 210, 260, 310, 360]
  const lines = splitTitle(title, 18)
  const titleY = H - 170
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g4" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#080810" stop-opacity="0"/>
        <stop offset="60%" stop-color="#080810" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#080810" stop-opacity="1"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="#080810"/>
    ${radii.map((r, i) => `<circle cx="${W}" cy="0" r="${r}" fill="none" stroke="${hexAlpha(accent, Math.max(0.03, 0.22 - i * 0.03))}" stroke-width="${i === 0 ? 2 : 1}"/>`).join("\n    ")}
    <circle cx="${W * 0.5}" cy="${H * 0.6}" r="100" fill="none" stroke="${hexAlpha(accent, 0.06)}" stroke-width="1"/>
    <circle cx="${W}" cy="0" r="28" fill="${hexAlpha(accent, 0.3)}"/>
    <circle cx="${W}" cy="0" r="12" fill="${hexAlpha(accent, 0.6)}"/>
    <rect x="0" y="${H * 0.35}" width="${W}" height="${H}" fill="url(#g4)"/>
    <text x="28" y="46" font-family="${FONT}" font-size="14" font-weight="700" fill="${hexAlpha(accent, 0.8)}" letter-spacing="3">ALLYN</text>
    ${lines.map((l, i) => `<text x="${W / 2}" y="${titleY + i * 44}" text-anchor="middle" font-family="${FONT}" font-size="36" font-weight="700" fill="white" letter-spacing="-0.5">${escXml(l)}</text>`).join("\n    ")}
    <rect x="${W / 2 - 70}" y="${titleY + lines.length * 44 + 14}" width="140" height="1.5" fill="${hexAlpha(accent, 0.5)}" rx="1"/>
    ${author ? `<text x="${W / 2}" y="${titleY + lines.length * 44 + 46}" text-anchor="middle" font-family="${FONT}" font-size="17" font-weight="400" fill="rgba(255,255,255,0.55)">${escXml(trunc(author, 32))}</text>` : ""}
  </svg>`
}

// Template 5 — Bold Publisher (light)
function svgBoldPublisher(title, author, accent) {
  const lines = splitTitle(title, 18)
  const titleY = H * 0.28
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="#f5f0e8"/>
    <!-- Top accent bar 22% height -->
    <rect x="0" y="0" width="${W}" height="${H * 0.22}" fill="${accent}"/>
    <rect x="0" y="${H * 0.22}" width="${W}" height="4" fill="${darken(accent, 0.2)}"/>
    <!-- Publisher badge in header -->
    <rect x="24" y="20" width="46" height="46" rx="4" fill="rgba(255,255,255,0.2)"/>
    <text x="47" y="52" text-anchor="middle" font-family="${FONT}" font-size="26" font-weight="800" fill="rgba(255,255,255,0.9)">A</text>
    <!-- ALLYN label -->
    <text x="${W - 28}" y="52" text-anchor="end" font-family="${FONT}" font-size="13" font-weight="700" fill="rgba(255,255,255,0.75)" letter-spacing="3">ALLYN</text>
    <!-- Title on cream -->
    ${lines.map((l, i) => `<text x="28" y="${titleY + i * 48}" font-family="${FONT}" font-size="36" font-weight="800" fill="#111111" letter-spacing="-0.5">${escXml(l)}</text>`).join("\n    ")}
    <!-- Rule -->
    <rect x="28" y="${titleY + lines.length * 48 + 20}" width="${W - 56}" height="1.5" fill="#cccccc"/>
    <rect x="28" y="${titleY + lines.length * 48 + 20}" width="90" height="2.5" fill="${accent}"/>
    <!-- Author -->
    ${author ? `<text x="28" y="${titleY + lines.length * 48 + 54}" font-family="${FONT}" font-size="19" font-weight="500" fill="#555555">${escXml(trunc(author, 28))}</text>` : ""}
    <!-- Bottom footer -->
    <rect x="0" y="${H - 48}" width="${W}" height="48" fill="rgba(0,0,0,0.06)"/>
    <text x="28" y="${H - 18}" font-family="${FONT}" font-size="11" font-weight="700" fill="${accent}" letter-spacing="3">ALLYN PREMIUM</text>
  </svg>`
}

function escXml(s) {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function splitTitle(title, charsPerLine) {
  const words = title.split(" ")
  const lines = []
  let cur = ""
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (test.length > charsPerLine && cur) {
      lines.push(cur)
      cur = w
    } else {
      cur = test
    }
  }
  if (cur) lines.push(cur)
  return lines.slice(0, 3).map((l, i, arr) => i === arr.length - 1 ? l : trunc(l, charsPerLine))
}

const TEMPLATES = [
  svgDiagonal,
  svgCircle,
  svgGrid,
  svgVerticalSplit,
  svgConcentric,
  svgBoldPublisher,
]

// Category colors from the app
const CATEGORY_COLORS = {
  salud: "#10b981",
  dinero: "#f59e0b",
  amor: "#ec4899",
  default: "#c8951a",
}

function getAccent(categoryName, categoryColor) {
  if (categoryColor) return categoryColor
  if (!categoryName) return CATEGORY_COLORS.default
  const n = categoryName.toLowerCase()
  if (n.includes("salud")) return CATEGORY_COLORS.salud
  if (n.includes("diner") || n.includes("finanz")) return CATEGORY_COLORS.dinero
  if (n.includes("amor") || n.includes("pareja")) return CATEGORY_COLORS.amor
  return CATEGORY_COLORS.default
}

async function generateCover(content, categoryName, categoryColor) {
  const idx = getIdx(content.id)
  const accent = getAccent(categoryName, categoryColor)
  const fn = TEMPLATES[idx]
  const svgStr = fn(content.title, content.author, accent)
  const buffer = await sharp(Buffer.from(svgStr))
    .png({ quality: 95 })
    .toBuffer()
  return buffer
}

async function main() {
  console.log("\nGenerando portadas para libros y audiolibros...\n")

  // Fetch categories
  const cats = await dbSelect("categories", "?select=id,name,color")
  const catMap = Object.fromEntries((cats || []).map(c => [c.id, c]))

  // Fetch all books and audiobooks
  const items = await dbSelect(
    "content",
    "?select=id,title,author,type,category_id&type=in.(book,audiobook)&order=title"
  )

  console.log(`Encontrados: ${items.length} libros/audiolibros\n`)

  let ok = 0, fail = 0

  for (const item of items) {
    const cat = catMap[item.category_id]
    const catName = cat?.name || ""
    const catColor = cat?.color || null

    process.stdout.write(`  "${item.title}" (${item.type})... `)

    try {
      const buffer = await generateCover(item, catName, catColor)

      const storagePath = `${item.id}.png`
      const publicUrl = await storageUpload("thumbnails", storagePath, buffer, "image/png")

      await dbUpdate("content", item.id, { thumbnail_url: publicUrl })

      console.log("OK")
      ok++
    } catch (err) {
      console.log(`ERROR: ${err.message}`)
      fail++
    }
  }

  console.log(`\nCompletado: ${ok} generadas, ${fail} errores\n`)
}

main().catch(err => {
  console.error("Fatal:", err)
  process.exit(1)
})
