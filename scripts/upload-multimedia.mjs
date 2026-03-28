#!/usr/bin/env node
/**
 * Uploads MULTIMEDIA/ files to Supabase Storage and upserts content records.
 * Run: node scripts/upload-multimedia.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { join, extname, basename, dirname as pathDirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = pathDirname(fileURLToPath(import.meta.url))

loadLocalEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno')
}

const STORAGE_UPLOAD_URL = SUPABASE_URL.replace('.supabase.co', '.storage.supabase.co')
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const MULTIMEDIA_PATH = process.env.MULTIMEDIA_PATH || join(__dirname, '..', 'MULTIMEDIA')

const CATEGORY_SEEDS = [
  { name: 'Salud', slug: 'salud', description: 'Transforma tu bienestar físico y mental', color: '#10b981', sort_order: 1 },
  { name: 'Dinero', slug: 'dinero', description: 'Construye tu libertad financiera', color: '#f59e0b', sort_order: 2 },
  { name: 'Amor', slug: 'amor', description: 'Relaciones y conexiones que te elevan', color: '#ec4899', sort_order: 3 },
]

const CONTENT_TYPE_MAP = {
  '.pdf': 'book',
  '.mp4': 'video',
  '.mp3': 'audiobook',
}

const BUCKET_MAP = {
  '.pdf': 'books-xl',
  '.mp4': 'videos',
  '.mp3': 'books',
}

const CONTENT_LIBRARY = {
  [normalizeKey('1% EL MAS GRANDE SUENO')]: {
    title: '1% El Más Grande Sueño',
    type: 'book',
    categorySlug: 'salud',
    description:
      'Una reflexión sobre la salud del planeta, la agricultura y el equilibrio ecológico desde una mirada de conciencia y futuro.',
    sortOrder: 1,
  },
  [normalizeKey("ANNIE'S STORIES VOLUMEN II")]: {
    title: "Annie's Stories Volumen II",
    type: 'book',
    categorySlug: 'amor',
    description:
      'Segunda colección de relatos infantiles que amplía el universo de Annie con nuevas aventuras y valores.',
    sortOrder: 2,
  },
  [normalizeKey("ANNIIE'S STORIES VOLUMEN I")]: {
    title: "Annie's Stories Volumen I",
    type: 'book',
    categorySlug: 'amor',
    description:
      'Primer volumen de historias infantiles centradas en la imaginación, la ternura y el aprendizaje emocional.',
    sortOrder: 1,
  },
  [normalizeKey('COLECCION DE CUENTOS INFANTILES TOMO 1')]: {
    title: 'Colección de Cuentos Infantiles Tomo 1',
    type: 'book',
    categorySlug: 'amor',
    description:
      'Selección de cuentos para niños con mensajes afectivos, cercanos y fáciles de compartir en familia.',
    sortOrder: 3,
  },
  [normalizeKey('COLECCION DE CUENTOS INFANTILES TOMO 2')]: {
    title: 'Colección de Cuentos Infantiles Tomo 2',
    type: 'book',
    categorySlug: 'amor',
    description:
      'Segunda entrega de cuentos infantiles para acompañar hábitos de lectura, imaginación y vínculo emocional.',
    sortOrder: 4,
  },
  [normalizeKey('Libro sin contra portada')]: {
    title: 'Cómo Hacer Ultra Negocios en Pandemia',
    type: 'book',
    categorySlug: 'dinero',
    author: 'Ricardo Pacheco',
    description:
      'Guía práctica sobre oportunidades de negocio y mentalidad emprendedora en contextos de cambio.',
    sortOrder: 1,
  },
  [normalizeKey('curso_1_ia')]: {
    title: 'Curso 1: IA',
    type: 'course',
    categorySlug: null,
    description:
      'Curso en video de introducción a inteligencia artificial aplicado a aprendizaje, herramientas y nuevas oportunidades.',
    featured: true,
    sortOrder: 1,
  },
  [normalizeKey('video_promocional')]: {
    title: 'Video Promocional',
    type: 'video',
    categorySlug: null,
    description: 'Pieza promocional de apoyo para comunicación y marketing del proyecto.',
    status: 'draft',
    featured: false,
    sortOrder: 999,
  },
}

function loadLocalEnv() {
  const envPath = join(__dirname, '..', '.env.local')
  if (!existsSync(envPath)) return

  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    const rawValue = trimmed.slice(separatorIndex + 1).trim()
    const value = rawValue.replace(/^['"]|['"]$/g, '')

    if (key && !(key in process.env)) {
      process.env[key] = value
    }
  }
}

async function ensureBucket(name) {
  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = buckets?.some(b => b.name === name)
  if (!exists) {
    const bucketOptions =
      name === 'books-xl'
        ? { public: false, allowedMimeTypes: ['application/pdf'] }
        : name === 'videos'
        ? { public: false, allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'] }
        : { public: false }

    const { error } = await supabase.storage.createBucket(name, bucketOptions)
    if (error) throw new Error(`Error creating bucket "${name}": ${error.message}`)
    console.log(`  ✓ Bucket "${name}" creado`)
  }
}


function sanitizePath(filePath) {
  return filePath
    .normalize('NFD')                          // decompose accented chars
    .replace(/[\u0300-\u036f]/g, '')           // strip diacritics
    .replace(/[^a-zA-Z0-9._\-/]/g, '_')       // replace special chars with _
    .replace(/_+/g, '_')                       // collapse consecutive _
}

function normalizeKey(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase()
}

function toDisplayTitle(value) {
  return value
    .normalize('NFC')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase())
}

function getDefaultDescription(type, title) {
  if (type === 'course') {
    return `Curso en video sobre ${title.toLowerCase()} dentro de la biblioteca ALLYN.`
  }

  if (type === 'video') {
    return `Video disponible en la biblioteca ALLYN: ${title}.`
  }

  if (type === 'audiobook') {
    return `Audiolibro disponible en la biblioteca ALLYN: ${title}.`
  }

  return `Libro disponible en la biblioteca ALLYN: ${title}.`
}

function getCatalogMetadata(fileName, ext) {
  const baseName = basename(fileName, ext)
  const key = normalizeKey(baseName)
  const mapped = CONTENT_LIBRARY[key]

  if (mapped) {
    return mapped
  }

  const type = CONTENT_TYPE_MAP[ext]
  const title = toDisplayTitle(baseName)

  return {
    title,
    type,
    categorySlug: null,
    status: 'draft',
    featured: false,
    sortOrder: 999,
    description: getDefaultDescription(type, title),
  }
}

async function ensureCategories() {
  const { data, error } = await supabase
    .from('categories')
    .upsert(CATEGORY_SEEDS, { onConflict: 'slug' })
    .select('id, slug')

  if (error) throw error

  return Object.fromEntries((data || []).map(category => [category.slug, category.id]))
}

async function getExistingContentRows() {
  const { data, error } = await supabase
    .from('content')
    .select('id, title, file_url')

  if (error) throw error

  return data || []
}

async function uploadFile(bucket, storagePath, localPath) {
  const ext = extname(localPath).toLowerCase()
  const mimeTypes = { '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg' }
  const contentType = mimeTypes[ext] || 'application/octet-stream'
  const safePath = sanitizePath(storagePath)

  // Leer el archivo como buffer
  const fileBuffer = readFileSync(localPath)

  // Usar fetch directo para saltarse el límite del cliente JS de Supabase
  const uploadUrl = `${STORAGE_UPLOAD_URL}/storage/v1/object/${bucket}/${safePath}`
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: fileBuffer,
    // @ts-ignore - necesario para Node.js 18+ con body grande
    duplex: 'half',
  })

  if (!response.ok) {
    const errorBody = await response.text()
    // Si sigue siendo problema de tamaño, dar instrucciones claras
    if (response.status === 413 || errorBody.includes('size')) {
      throw new Error(
        `Archivo demasiado grande (${(fileBuffer.length / 1024 / 1024).toFixed(1)} MB).\n` +
        `  → Ve a: Supabase Dashboard → Storage → Settings → "File size limit"\n` +
        `  → Cambia el límite a 500 MB y vuelve a ejecutar el script.`
      )
    }
    throw new Error(`Upload HTTP ${response.status}: ${errorBody}`)
  }

  // URL en formato "authenticated" para que stream API genere signed URLs
  return `${SUPABASE_URL}/storage/v1/object/authenticated/${bucket}/${safePath}`
}

function findExistingContent(existingRows, title, storagePath) {
  const normalizedTitle = normalizeKey(title)
  const normalizedPath = sanitizePath(storagePath).toLowerCase()

  return existingRows.find((row) => {
    const matchesTitle = normalizeKey(row.title || '') === normalizedTitle
    const matchesPath = String(row.file_url || '').toLowerCase().includes(normalizedPath)
    return matchesTitle || matchesPath
  })
}

async function upsertContent({ metadata, fileUrl, storagePath, categoryMap, existingRows }) {
  const existing = findExistingContent(existingRows, metadata.title, storagePath)
  const now = new Date().toISOString()
  const status = metadata.status ?? 'published'

  const payload = {
    title: metadata.title,
    type: metadata.type,
    category_id: metadata.categorySlug ? (categoryMap[metadata.categorySlug] ?? null) : null,
    description: metadata.description ?? null,
    author: metadata.author ?? null,
    file_url: fileUrl,
    preview_url: null,
    status,
    featured: Boolean(metadata.featured),
    sort_order: metadata.sortOrder ?? 0,
    duration: 0,
    published_at: status === 'published' ? now : null,
    updated_at: now,
  }

  if (existing) {
    const { data, error } = await supabase
      .from('content')
      .update(payload)
      .eq('id', existing.id)
      .select('id, title, file_url')
      .single()
    if (error) throw error
    const index = existingRows.findIndex(row => row.id === existing.id)
    if (index >= 0) existingRows[index] = data
    console.log(`  ↺  Actualizado: "${metadata.title}"`)
  } else {
    const { data, error } = await supabase
      .from('content')
      .insert({ ...payload, created_at: now })
      .select('id, title, file_url')
      .single()
    if (error) throw error
    existingRows.push(data)
    console.log(`  ✓  Creado: "${metadata.title}"`)
  }
}

async function main() {
  console.log('\n📦 Subiendo archivos MULTIMEDIA a Supabase Storage...\n')

  // Ensure buckets exist
  await ensureBucket('books')
  await ensureBucket('books-xl')
  await ensureBucket('videos')
  await ensureBucket('audios')
  const categoryMap = await ensureCategories()
  const existingRows = await getExistingContentRows()

  const folders = readdirSync(MULTIMEDIA_PATH).filter(f =>
    statSync(join(MULTIMEDIA_PATH, f)).isDirectory()
  ).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))

  for (const folder of folders) {
    const folderPath = join(MULTIMEDIA_PATH, folder)
    const files = readdirSync(folderPath)
      .filter(f => !f.startsWith('.'))
      .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base', numeric: true }))

    console.log(`\n📂 ${folder}`)

    for (const file of files) {
      const localPath = join(folderPath, file)
      const ext = extname(file).toLowerCase()
      const bucket = BUCKET_MAP[ext]
      const defaultType = CONTENT_TYPE_MAP[ext]

      if (!bucket || !defaultType) {
        console.log(`  ⚠  Saltando "${file}" (formato no soportado)`)
        continue
      }

      const storagePath = `${folder}/${file}`
      const fileSize = statSync(localPath).size
      const metadata = getCatalogMetadata(file, ext)

      console.log(`  ⬆  Subiendo "${file}" (${(fileSize / 1024 / 1024).toFixed(1)} MB)...`)

      try {
        const fileUrl = await uploadFile(bucket, storagePath, localPath)
        await upsertContent({ metadata, fileUrl, storagePath, categoryMap, existingRows })
      } catch (err) {
        console.error(`  ✗  Error con "${file}": ${err.message}`)
      }
    }
  }

  console.log('\n✅ Listo. Todos los archivos procesados.\n')
}

main().catch(err => {
  console.error('Error fatal:', err)
  process.exit(1)
})
