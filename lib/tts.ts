import OpenAI from "openai"

const CHUNK_CHAR_LIMIT = 4000
const TTS_MODEL = "tts-1"
const TTS_VOICE = "nova" // warm, female voice — good for Spanish

// Lazy-init to avoid crashing at build time when OPENAI_API_KEY is not set
let _openai: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _openai
}

/** Split text into chunks of ~CHUNK_CHAR_LIMIT chars at sentence boundaries. */
export function splitTextIntoChunks(text: string): string[] {
  if (!text.trim()) return []
  if (text.length <= CHUNK_CHAR_LIMIT) return [text]

  const chunks: string[] = []
  let remaining = text

  while (remaining.length > 0) {
    if (remaining.length <= CHUNK_CHAR_LIMIT) {
      chunks.push(remaining.trim())
      break
    }

    // Find the last sentence boundary within the limit
    const slice = remaining.slice(0, CHUNK_CHAR_LIMIT)
    let cutPoint = -1

    // Prefer splitting at period, question mark, or exclamation followed by space
    for (let i = slice.length - 1; i >= CHUNK_CHAR_LIMIT * 0.5; i--) {
      if ((slice[i] === "." || slice[i] === "?" || slice[i] === "!") && (i + 1 >= slice.length || slice[i + 1] === " " || slice[i + 1] === "\n")) {
        cutPoint = i + 1
        break
      }
    }

    // Fallback: split at last space
    if (cutPoint === -1) {
      cutPoint = slice.lastIndexOf(" ")
    }

    // Last resort: hard cut
    if (cutPoint <= 0) {
      cutPoint = CHUNK_CHAR_LIMIT
    }

    chunks.push(remaining.slice(0, cutPoint).trim())
    remaining = remaining.slice(cutPoint).trim()
  }

  return chunks.filter(Boolean)
}

/** Generate MP3 audio from text using OpenAI TTS. Returns raw MP3 buffer. */
export async function generateTtsAudio(text: string): Promise<Buffer> {
  const response = await getOpenAI().audio.speech.create({
    model: TTS_MODEL,
    voice: TTS_VOICE,
    input: text,
    response_format: "mp3",
  })

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/** Generate full book audio by chunking text and concatenating MP3 buffers. */
export async function generateFullAudio(
  text: string,
  onProgress?: (done: number, total: number) => void
): Promise<Buffer> {
  const chunks = splitTextIntoChunks(text)
  if (chunks.length === 0) throw new Error("No text to generate audio from")

  const buffers: Buffer[] = []

  for (let i = 0; i < chunks.length; i++) {
    const buf = await generateTtsAudio(chunks[i])
    buffers.push(buf)
    onProgress?.(i + 1, chunks.length)
  }

  // MP3 frames are self-contained — raw concatenation works
  return Buffer.concat(buffers)
}
