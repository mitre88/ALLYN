import { config } from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
}

const encoded = encodeURIComponent('Video Promocional')
const searchUrl = `${SUPABASE_URL}/rest/v1/content?title=eq.${encoded}&select=id,title,status,type,is_free`

const searchRes = await fetch(searchUrl, { headers })
const rows = await searchRes.json()

if (!rows?.length) {
  console.error('No video_promocional found. Existing:', JSON.stringify(rows))
  process.exit(1)
}

const video = rows[0]
console.log(`Found: "${video.title}" (id: ${video.id}, status: ${video.status})`)

const patchUrl = `${SUPABASE_URL}/rest/v1/content?id=eq.${video.id}`
const patchRes = await fetch(patchUrl, {
  method: 'PATCH',
  headers: { ...headers, Prefer: 'return=representation' },
  body: JSON.stringify({
    status: 'published',
    title: 'Promocional — Ultra Negocios en Pandemia',
    description: 'Mira este fragmento promocional gratuito. El libro completo también está disponible para todos.',
    is_free: true,
    sort_order: 0,
  }),
})

const updated = await patchRes.json()
if (!patchRes.ok) {
  console.error('Error:', updated)
  process.exit(1)
}

console.log(`✅ Published: "${updated[0].title}" (is_free: ${updated[0].is_free})`)
