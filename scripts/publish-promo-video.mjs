import { config } from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing env vars')
  process.exit(1)
}

async function run() {
  // 1. Publish the video_promocional
  const { data: promoVideo, error: findError } = await fetch(
    `${SUPABASE_URL}/rest/v1/content?title=eq.Video%20Promocional&select=*`,
    {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    }
  ).then(r => r.json())

  if (findError || !promoVideo?.length) {
    console.error('Could not find video_promocional:', findError, promoVideo)
    process.exit(1)
  }

  const video = promoVideo[0]
  console.log(`Found: "${video.title}" (id: ${video.id}, status: ${video.status})`)

  // Update to published and make free
  const updateRes = await fetch(
    `${SUPABASE_URL}/rest/v1/content?id=eq.${video.id}`,
    {
      method: 'PATCH',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        status: 'published',
        title: 'Promocional — Cómo Hacer Ultra Negocios en Pandemia',
        description: 'Mira este fragmento promocional gratuito del libro. Si te gusta, el libro completo está disponible para todos.',
        is_free: true,
        featured: false,
        sort_order: 0,
      }),
    }
  )

  const updated = await updateRes.json()
  if (!updateRes.ok) {
    console.error('Error updating:', updated)
    process.exit(1)
  }

  console.log(`✅ Published: "${updated[0].title}" (status: ${updated[0].status}, is_free: ${updated[0].is_free})`)
}

run().catch(console.error)
