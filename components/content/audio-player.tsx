'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, Loader2 } from 'lucide-react'

interface AudioPlayerProps {
  text: string
  title?: string
}

export function AudioPlayer({ text, title }: AudioPlayerProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'paused' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [currentChunk, setCurrentChunk] = useState(0)
  const [totalChunks, setTotalChunks] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [errorMsg, setErrorMsg] = useState('')

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const blobUrlsRef = useRef<Map<number, string>>(new Map())
  const speeds = [0.75, 1, 1.25, 1.5]

  // Fetch audio for a given chunk index, cache the blob URL
  const fetchChunk = useCallback(async (chunkIndex: number): Promise<string> => {
    const cached = blobUrlsRef.current.get(chunkIndex)
    if (cached) return cached

    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, chunkIndex }),
    })

    if (!res.ok) throw new Error('Error generando audio')

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    blobUrlsRef.current.set(chunkIndex, url)
    return url
  }, [text])

  // Initialize: get total chunk count from server
  const initChunks = useCallback(async () => {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) throw new Error('Error iniciando audio')
    const data = await res.json() as { totalChunks: number }
    return data.totalChunks
  }, [text])

  // Play from a specific chunk
  const playFromChunk = useCallback(async (chunkIndex: number) => {
    if (!audioRef.current) return

    setStatus('loading')
    setCurrentChunk(chunkIndex)

    try {
      const url = await fetchChunk(chunkIndex)

      // Prefetch next chunk in background
      if (chunkIndex + 1 < totalChunks) {
        fetchChunk(chunkIndex + 1).catch(() => null)
      }

      const audio = audioRef.current
      audio.src = url
      audio.playbackRate = speed
      await audio.play()
      setStatus('playing')
    } catch {
      setStatus('error')
      setErrorMsg('No se pudo generar el audio. Verifica tu API key de OpenAI.')
    }
  }, [fetchChunk, speed, totalChunks])

  // Handle audio element events
  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio

    audio.onended = () => {
      const next = currentChunk + 1
      if (next < totalChunks) {
        setCurrentChunk(next)
        playFromChunk(next)
      } else {
        setStatus('idle')
        setProgress(100)
      }
    }

    audio.ontimeupdate = () => {
      if (audio.duration > 0) {
        const chunkProgress = audio.currentTime / audio.duration
        const overall = ((currentChunk + chunkProgress) / Math.max(totalChunks, 1)) * 100
        setProgress(Math.min(overall, 100))
      }
    }

    audio.onerror = () => {
      setStatus('error')
      setErrorMsg('Error de reproducción')
    }

    return () => {
      audio.pause()
      audio.src = ''
      blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url))
      blobUrlsRef.current.clear()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update playback rate when speed changes
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed
  }, [speed])

  const handlePlay = async () => {
    if (status === 'playing') {
      audioRef.current?.pause()
      setStatus('paused')
      return
    }

    if (status === 'paused') {
      await audioRef.current?.play()
      setStatus('playing')
      return
    }

    // First play — initialize
    try {
      setStatus('loading')
      const chunks = await initChunks()
      setTotalChunks(chunks)
      await playFromChunk(0)
    } catch {
      setStatus('error')
      setErrorMsg('No se pudo iniciar el audio')
    }
  }

  const handleRestart = () => {
    audioRef.current?.pause()
    if (audioRef.current) audioRef.current.src = ''
    setStatus('idle')
    setProgress(0)
    setCurrentChunk(0)
    blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url))
    blobUrlsRef.current.clear()
  }

  const handleSkipForward = () => {
    const next = currentChunk + 1
    if (next < totalChunks) {
      playFromChunk(next)
    }
  }

  const isLoading = status === 'loading'
  const isPlaying = status === 'playing'

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
          <Volume2 className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Audiolibro · IA</p>
          {title && <p className="text-sm text-white font-medium line-clamp-1">{title}</p>}
        </div>
        {totalChunks > 0 && (
          <span className="ml-auto text-xs text-zinc-600">
            {currentChunk + 1}/{totalChunks}
          </span>
        )}
      </div>

      {/* Error */}
      {status === 'error' && (
        <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
          {errorMsg}
        </p>
      )}

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-zinc-600">
          <span>{Math.round(progress)}%</span>
          <span>Voz IA · OpenAI</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleRestart}
          disabled={isLoading}
          title="Reiniciar"
          className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors disabled:opacity-40"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={handlePlay}
          disabled={isLoading}
          className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center text-white transition-colors shadow-lg shadow-purple-900/40 disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-6 h-6 fill-white" />
          ) : (
            <Play className="w-6 h-6 fill-white ml-0.5" />
          )}
        </button>

        <button
          onClick={handleSkipForward}
          disabled={isLoading || currentChunk + 1 >= totalChunks}
          title="Siguiente fragmento"
          className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors disabled:opacity-40"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Speed selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500 w-14 shrink-0">Velocidad</span>
        <div className="flex gap-1">
          {speeds.map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                speed === s
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
