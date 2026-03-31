import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 60

// Max chars OpenAI TTS accepts per request
const MAX_CHUNK_CHARS = 4000

function splitIntoChunks(text: string): string[] {
  if (text.length <= MAX_CHUNK_CHARS) return [text]

  const chunks: string[] = []
  let remaining = text

  while (remaining.length > 0) {
    if (remaining.length <= MAX_CHUNK_CHARS) {
      chunks.push(remaining)
      break
    }

    // Try to split at a sentence boundary within the limit
    let splitAt = remaining.lastIndexOf('. ', MAX_CHUNK_CHARS)
    if (splitAt === -1) splitAt = remaining.lastIndexOf(' ', MAX_CHUNK_CHARS)
    if (splitAt === -1) splitAt = MAX_CHUNK_CHARS

    chunks.push(remaining.slice(0, splitAt + 1))
    remaining = remaining.slice(splitAt + 1).trimStart()
  }

  return chunks
}

export async function POST(req: NextRequest) {
  try {
    // Auth check — only subscribed users or admins can use TTS
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_subscribed, role')
      .eq('id', user.id)
      .single()

    const canAccess = profile?.is_subscribed || profile?.role === 'admin'
    if (!canAccess) {
      return NextResponse.json({ error: 'Se requiere suscripción activa' }, { status: 403 })
    }

    const { text, voice = 'nova', chunkIndex = 0 } = await req.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Texto requerido' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey || apiKey.startsWith('sk-your')) {
      return NextResponse.json({ error: 'TTS no configurado' }, { status: 503 })
    }

    const openai = new OpenAI({ apiKey })
    const chunks = splitIntoChunks(text)

    if (chunkIndex >= chunks.length) {
      return NextResponse.json({ error: 'chunkIndex fuera de rango' }, { status: 400 })
    }

    const chunk = chunks[chunkIndex]

    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice as 'nova' | 'alloy' | 'echo' | 'fable' | 'onyx' | 'shimmer',
      input: chunk,
    })

    const audioBuffer = Buffer.from(await mp3.arrayBuffer())

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audioBuffer.byteLength),
        'X-Chunk-Index': String(chunkIndex),
        'X-Chunk-Total': String(chunks.length),
        'X-Has-More': String(chunkIndex + 1 < chunks.length),
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    console.error('[tts] Error:', error)
    return NextResponse.json({ error: 'Error generando audio' }, { status: 500 })
  }
}
