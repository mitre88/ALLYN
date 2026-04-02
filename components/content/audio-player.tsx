'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, RotateCcw } from 'lucide-react'

interface AudioPlayerProps {
  text: string
  title?: string
  autoplay?: boolean
}

// Estimate reading time: ~150 words per minute at 1x speed
function estimateTime(wordCount: number, speed: number): string {
  const totalSeconds = Math.round((wordCount / 150) * 60 / speed)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function AudioPlayer({ text, title, autoplay = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [supported, setSupported] = useState(true)
  const [muted, setMuted] = useState(false)

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const wordsRef = useRef<string[]>([])
  const resumeFromRef = useRef(0)

  const speeds = [0.75, 1, 1.25, 1.5, 2]

  useEffect(() => {
    wordsRef.current = text.split(/\s+/).filter(Boolean)
  }, [text])

  const loadVoices = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const allVoices = window.speechSynthesis.getVoices()
    const spanishVoices = allVoices.filter(v => v.lang.startsWith('es'))
    setVoices(spanishVoices)
    if (spanishVoices.length > 0 && !selectedVoice) {
      const preferred =
        spanishVoices.find(v => v.lang === 'es-MX' && v.name.toLowerCase().includes('female')) ||
        spanishVoices.find(v => v.lang === 'es-419') ||
        spanishVoices.find(v => v.lang === 'es-MX') ||
        spanishVoices.find(v => v.lang.startsWith('es-')) ||
        spanishVoices[0]
      setSelectedVoice(preferred ?? null)
    }
  }, [selectedVoice])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.speechSynthesis) { setSupported(false); return }
    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
      window.speechSynthesis.cancel()
    }
  }, [loadVoices])

  const autoplayTriggered = useRef(false)

  useEffect(() => {
    if (autoplay && !autoplayTriggered.current && supported && selectedVoice && text) {
      autoplayTriggered.current = true
      const timer = setTimeout(() => speakFromIndex(0), 300)
      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, supported, selectedVoice, text])

  const speakFromIndex = useCallback((fromWordIndex: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()

    const words = wordsRef.current
    const safeIndex = Math.max(0, Math.min(fromWordIndex, words.length - 1))
    const remainingText = words.slice(safeIndex).join(' ')

    if (!remainingText.trim()) {
      setIsPlaying(false)
      setProgress(100)
      return
    }

    const utterance = new SpeechSynthesisUtterance(remainingText)
    utterance.lang = selectedVoice?.lang || 'es-MX'
    utterance.rate = speed
    utterance.volume = muted ? 0 : 1
    if (selectedVoice) utterance.voice = selectedVoice

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const spoken = remainingText.slice(0, event.charIndex)
        const localIdx = spoken.split(/\s+/).filter(Boolean).length
        const globalIdx = safeIndex + localIdx
        setCurrentWordIndex(globalIdx)
        resumeFromRef.current = globalIdx
        const total = words.length
        setProgress(total > 0 ? Math.min((globalIdx / total) * 100, 100) : 0)
      }
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setProgress(100)
      setCurrentWordIndex(0)
      resumeFromRef.current = 0
    }

    utterance.onerror = () => setIsPlaying(false)

    utteranceRef.current = utterance
    resumeFromRef.current = safeIndex
    setCurrentWordIndex(safeIndex)
    setProgress(words.length > 0 ? (safeIndex / words.length) * 100 : 0)
    window.speechSynthesis.speak(utterance)
    setIsPlaying(true)
  }, [selectedVoice, speed, muted])

  const handlePlayPause = () => {
    if (!supported || typeof window === 'undefined') return

    if (isPlaying) {
      window.speechSynthesis.pause()
      setIsPlaying(false)
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
        setIsPlaying(true)
      } else {
        speakFromIndex(resumeFromRef.current)
      }
    }
  }

  // Skip back ~30s worth of words at current speed
  const handleSkipBack = () => {
    if (!supported || typeof window === 'undefined') return
    const skipWords = Math.round(150 * speed * 0.5) // ~30s of words
    const newIndex = Math.max(0, resumeFromRef.current - skipWords)
    speakFromIndex(newIndex)
  }

  // Skip forward ~30s worth of words at current speed
  const handleSkipForward = () => {
    if (!supported || typeof window === 'undefined') return
    const skipWords = Math.round(150 * speed * 0.5) // ~30s of words
    const newIndex = Math.min(resumeFromRef.current + skipWords, wordsRef.current.length - 1)
    speakFromIndex(newIndex)
  }

  const handleRestart = () => {
    if (!supported || typeof window === 'undefined') return
    speakFromIndex(0)
  }

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed)
    if (isPlaying && typeof window !== 'undefined') {
      window.speechSynthesis.cancel()
      // Small delay then restart from current position with new speed
      setIsPlaying(false)
      setTimeout(() => speakFromIndex(resumeFromRef.current), 100)
    }
  }

  const handleMuteToggle = () => {
    setMuted(prev => !prev)
    if (isPlaying && typeof window !== 'undefined') {
      // Restart from current position to apply volume change
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      setTimeout(() => speakFromIndex(resumeFromRef.current), 100)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const newIndex = Math.round(ratio * wordsRef.current.length)
    speakFromIndex(newIndex)
  }

  const words = wordsRef.current
  const totalWords = words.length
  const displayedWords = words.slice(Math.max(0, currentWordIndex - 6), currentWordIndex + 12)
  const relativeHighlight = Math.min(currentWordIndex, 6)

  const elapsed = estimateTime(currentWordIndex, speed)
  const remaining = estimateTime(Math.max(0, totalWords - currentWordIndex), speed)

  if (!supported) {
    return (
      <div className="rounded-2xl border border-white/8 bg-black/30 p-4 text-center">
        <p className="text-sm text-white/50">Tu navegador no soporta síntesis de voz. Intenta con Chrome o Edge.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Word display — karaoke-style */}
      {isPlaying && currentWordIndex >= 0 && displayedWords.length > 0 && (
        <div className="rounded-2xl border border-white/8 bg-black/30 px-4 py-3 text-sm leading-relaxed min-h-[3rem] flex flex-wrap gap-1 items-center">
          {displayedWords.map((word, i) => (
            <span
              key={`${currentWordIndex}-${i}`}
              className={
                i === relativeHighlight
                  ? 'text-purple-300 font-semibold bg-purple-500/20 px-1 rounded'
                  : i < relativeHighlight
                    ? 'text-white/40'
                    : 'text-white/60'
              }
            >
              {word}
            </span>
          ))}
        </div>
      )}

      {/* Main player card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/20">
            <Volume2 className="h-4.5 w-4.5 text-purple-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/35">Audio TTS</p>
            {title && <p className="text-sm font-medium text-white/80 truncate">{title}</p>}
          </div>
        </div>

        {/* Progress bar — clickable */}
        <div className="space-y-1.5 mb-4">
          <div
            className="h-2 rounded-full bg-white/8 cursor-pointer group relative overflow-hidden"
            onClick={handleProgressClick}
            role="slider"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso de audio"
            tabIndex={0}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progress}% - 7px)` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-medium text-white/35 tabular-nums">
            <span>{elapsed}</span>
            <span>-{remaining}</span>
          </div>
        </div>

        {/* Transport controls */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            aria-label="Reiniciar audio"
            onClick={handleRestart}
            title="Reiniciar"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/45 hover:text-white/80 hover:bg-white/8 transition-colors"
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            aria-label="Retroceder audio 30 segundos"
            onClick={handleSkipBack}
            title="Retroceder 30s"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/55 hover:text-white hover:border-white/25 hover:bg-white/[0.06] transition-colors"
            type="button"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          <button
            aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
            onClick={handlePlayPause}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-[0_8px_24px_rgba(147,51,234,0.35)]"
            type="button"
          >
            {isPlaying
              ? <Pause className="h-6 w-6 fill-white" />
              : <Play className="h-6 w-6 fill-white ml-0.5" />
            }
          </button>

          <button
            aria-label="Adelantar audio 30 segundos"
            onClick={handleSkipForward}
            title="Adelantar 30s"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/55 hover:text-white hover:border-white/25 hover:bg-white/[0.06] transition-colors"
            type="button"
          >
            <SkipForward className="h-4 w-4" />
          </button>

          <button
            aria-label={muted ? "Activar sonido" : "Silenciar audio"}
            onClick={handleMuteToggle}
            title={muted ? 'Activar sonido' : 'Silenciar'}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/45 hover:text-white/80 hover:bg-white/8 transition-colors"
            type="button"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Speed + Voice controls */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.15em] text-white/35 w-16 shrink-0">Velocidad</span>
            <div className="flex gap-1">
              {speeds.map(s => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    speed === s
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/[0.06] text-white/50 hover:bg-white/[0.1] hover:text-white/75'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {voices.length > 1 && (
            <div className="flex items-center gap-2">
              <label className="text-[11px] uppercase tracking-[0.15em] text-white/35 w-16 shrink-0" htmlFor="audio-voice-select">
                Voz
              </label>
              <select
                id="audio-voice-select"
                value={selectedVoice?.name || ''}
                onChange={e => {
                  const v = voices.find(v => v.name === e.target.value) || null
                  setSelectedVoice(v)
                  if (isPlaying && typeof window !== 'undefined') {
                    window.speechSynthesis.cancel()
                    setIsPlaying(false)
                  }
                }}
                className="flex-1 min-w-0 rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1.5 text-xs text-white/65 focus:outline-none focus:border-purple-500/50"
              >
                {voices.map(v => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
