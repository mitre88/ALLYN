import sharp from "sharp"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const outputDir = path.join(root, "public", "assets", "course")

fs.mkdirSync(outputDir, { recursive: true })

const WIDTH = 1280
const HEIGHT = 720

const pillarColors = ["#10b981", "#f59e0b", "#ec4899"]
const brandColor = "#c8951a"

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#09090b"/>
      <stop offset="40%" stop-color="#0c0a15"/>
      <stop offset="100%" stop-color="#120a1a"/>
    </linearGradient>
    <linearGradient id="topBar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${pillarColors[0]}"/>
      <stop offset="50%" stop-color="${pillarColors[1]}"/>
      <stop offset="100%" stop-color="${pillarColors[2]}"/>
    </linearGradient>
    <radialGradient id="glow1" cx="0%" cy="0%" r="50%">
      <stop offset="0%" stop-color="${hexToRgba(pillarColors[0], 0.2)}"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <radialGradient id="glow2" cx="100%" cy="100%" r="50%">
      <stop offset="0%" stop-color="${hexToRgba(pillarColors[2], 0.2)}"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <radialGradient id="glow3" cx="60%" cy="40%" r="40%">
      <stop offset="0%" stop-color="${hexToRgba(pillarColors[1], 0.12)}"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <style>
      @font-face {
        font-family: 'SF';
        src: local('system-ui'), local('-apple-system'), local('Helvetica Neue');
      }
    </style>
  </defs>

  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>

  <!-- Ambient glows -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow1)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow2)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow3)"/>

  <!-- Grid pattern -->
  <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
    <line x1="60" y1="0" x2="60" y2="60" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
    <line x1="0" y1="60" x2="60" y2="60" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
  </pattern>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)"/>

  <!-- Top accent gradient bar -->
  <rect x="0" y="0" width="${WIDTH}" height="4" fill="url(#topBar)"/>

  <!-- Brand badge -->
  <circle cx="88" cy="88" r="5" fill="${brandColor}"/>
  <text x="102" y="93" font-family="system-ui, -apple-system, Helvetica Neue, sans-serif" font-size="16" font-weight="600" fill="${hexToRgba(brandColor, 0.9)}" letter-spacing="3">ALLYN</text>

  <!-- Title -->
  <text x="80" y="240" font-family="system-ui, -apple-system, Helvetica Neue, sans-serif" font-size="72" font-weight="800" fill="white" letter-spacing="-2">Salud, Dinero</text>
  <text x="80" y="320" font-family="system-ui, -apple-system, Helvetica Neue, sans-serif" font-size="72" font-weight="800" fill="white" letter-spacing="-2">y Amor</text>

  <!-- Subtitle -->
  <text x="80" y="375" font-family="system-ui, -apple-system, Helvetica Neue, sans-serif" font-size="24" fill="rgba(255,255,255,0.55)">Minicurso completo</text>

  <!-- Pillar pills -->
  <!-- Salud -->
  <rect x="80" y="420" width="130" height="46" rx="23" fill="${hexToRgba(pillarColors[0], 0.12)}" stroke="${hexToRgba(pillarColors[0], 0.3)}" stroke-width="1"/>
  <circle cx="105" cy="443" r="6" fill="${pillarColors[0]}"/>
  <text x="120" y="449" font-family="system-ui, -apple-system, Helvetica Neue, sans-serif" font-size="18" font-weight="600" fill="rgba(255,255,255,0.88)">Salud</text>

  <!-- Dinero -->
  <rect x="226" y="420" width="140" height="46" rx="23" fill="${hexToRgba(pillarColors[1], 0.12)}" stroke="${hexToRgba(pillarColors[1], 0.3)}" stroke-width="1"/>
  <circle cx="251" cy="443" r="6" fill="${pillarColors[1]}"/>
  <text x="266" y="449" font-family="system-ui, -apple-system, Helvetica Neue, sans-serif" font-size="18" font-weight="600" fill="rgba(255,255,255,0.88)">Dinero</text>

  <!-- Amor -->
  <rect x="382" y="420" width="130" height="46" rx="23" fill="${hexToRgba(pillarColors[2], 0.12)}" stroke="${hexToRgba(pillarColors[2], 0.3)}" stroke-width="1"/>
  <circle cx="407" cy="443" r="6" fill="${pillarColors[2]}"/>
  <text x="422" y="449" font-family="system-ui, -apple-system, Helvetica Neue, sans-serif" font-size="18" font-weight="600" fill="rgba(255,255,255,0.88)">Amor</text>

  <!-- Right decorative circles -->
  <circle cx="${WIDTH - 120}" cy="280" r="50" fill="none" stroke="${hexToRgba(pillarColors[0], 0.25)}" stroke-width="2"/>
  <circle cx="${WIDTH - 120}" cy="280" r="30" fill="${hexToRgba(pillarColors[0], 0.1)}"/>

  <circle cx="${WIDTH - 100}" cy="380" r="42" fill="none" stroke="${hexToRgba(pillarColors[1], 0.25)}" stroke-width="2"/>
  <circle cx="${WIDTH - 100}" cy="380" r="24" fill="${hexToRgba(pillarColors[1], 0.1)}"/>

  <circle cx="${WIDTH - 130}" cy="470" r="36" fill="none" stroke="${hexToRgba(pillarColors[2], 0.25)}" stroke-width="2"/>
  <circle cx="${WIDTH - 130}" cy="470" r="20" fill="${hexToRgba(pillarColors[2], 0.1)}"/>

  <!-- MINICURSO badge bottom right -->
  <rect x="${WIDTH - 220}" y="${HEIGHT - 65}" width="180" height="38" rx="19" fill="${hexToRgba(brandColor, 0.15)}" stroke="${hexToRgba(brandColor, 0.3)}" stroke-width="1"/>
  <text x="${WIDTH - 175}" y="${HEIGHT - 40}" font-family="system-ui, -apple-system, Helvetica Neue, sans-serif" font-size="14" font-weight="700" fill="${hexToRgba(brandColor, 0.9)}" letter-spacing="2.5">MINICURSO</text>
</svg>
`

async function main() {
  console.log("Generating thumbnail...")

  const outputPath = path.join(outputDir, "thumbnail.png")

  await sharp(Buffer.from(svg))
    .png({ quality: 95 })
    .toFile(outputPath)

  const stats = fs.statSync(outputPath)
  console.log(`Thumbnail saved: ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`)
}

main().catch(console.error)
