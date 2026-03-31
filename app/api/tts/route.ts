import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const maxDuration = 60

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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

    // Find a sentence boundary within the limit
    const slice = remaining.slice(0, MAX_CHUNK_CHARS)
    const lastPeriod = Math.max(
      slice.lastIndexOf('. '),
      slice.lastIndexOf('.\n'),
      slice.lastIndexOf('! '),
      slice.lastIndexOf('? ')
    )

    const cutAt = lastPeriod > MAX_CHUNK_CHARS / 2 ? lastPeriod + 1 : MAX_CHUNK_CHARS
    chunks.push(remaining.slice(0, cutAt).trim())
    remaining = remaining.slice(cutAt).trim()
  }

  return chunks
}

export async function POST(request: NextRequest) {
  try {
    const { text, chunkIndex } = await request.json() as { text: string; chunkIndex?: number }

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'TTS not configured' }, { status: 503 })
    }

    const chunks = splitIntoChunks(text.trim())
    const totalChunks = chunks.length

    // If chunkIndex is provided, return just that chunk as audio
    if (typeof chunkIndex === 'number') {
      if (chunkIndex < 0 || chunkIndex >= chunks.length) {
        return NextResponse.json({ error: 'Invalid chunk index' }, { status: 400 })
      }

      const mp3 = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'nova',
        input: chunks[chunkIndex],
        response_format: 'mp3',
      })

      const buffer = Buffer.from(await mp3.arrayBuffer())

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': String(buffer.length),
          'X-Chunk-Index': String(chunkIndex),
          'X-Total-Chunks': String(totalChunks),
          'Cache-Control': 'private, max-age=3600',
        },
      })
    }

    // No chunkIndex: return metadata about chunks
    return NextResponse.json({ totalChunks, chunkLengths: chunks.map(c => c.length) })
  } catch (error) {
    console.error('[tts] Error:', error)
    return NextResponse.json({ error: 'TTS generation failed' }, { status: 500 })
  }
}
