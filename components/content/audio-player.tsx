'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'

interface AudioPlayerProps {
  text: string
  title?: string
}

export function AudioPlayer({ text, title }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)
  const [supported, setSupported] = useState(true)

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const wordsRef = useRef<string[]>([])

  const speeds = [0.75, 1, 1.25, 1.5]

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

  const buildUtterance = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = selectedVoice?.lang || 'es-MX'
    utterance.rate = speed
    if (selectedVoice) utterance.voice = selectedVoice

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const spoken = text.slice(0, event.charIndex)
        const wordIdx = spoken.split(/\s+/).filter(Boolean).length
        setCurrentWordIndex(wordIdx)
        const total = wordsRef.current.length
        setProgress(total > 0 ? Math.min((wordIdx / total) * 100, 100) : 0)
      }
    }
    utterance.onend = () => { setIsPlaying(false); setProgress(100); setCurrentWordIndex(-1) }
    utterance.onerror = () => setIsPlaying(false)
    return utterance
  }, [text, selectedVoice, speed])

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
        window.speechSynthesis.cancel()
        const utterance = buildUtterance()
        utteranceRef.current = utterance
        window.speechSynthesis.speak(utterance)
        setIsPlaying(true)
      }
    }
  }

  const handleSkipBack = () => {
    if (!supported || typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    setIsPlaying(false); setProgress(0); setCurrentWordIndex(-1)
  }

  const handleSkipForward = () => {
    if (!supported || typeof window === 'undefined') return
    const skipWords = Math.round(150 * speed * 0.5)
    const newIndex = Math.min(currentWordIndex + skipWords, wordsRef.current.length - 1)
    const remainingText = wordsRef.current.slice(newIndex).join(' ')
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(remainingText)
    utterance.lang = selectedVoice?.lang || 'es-MX'
    utterance.rate = speed
    if (selectedVoice) utterance.voice = selectedVoice
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const spoken = remainingText.slice(0, event.charIndex)
        const wordIdx = newIndex + spoken.split(/\s+/).filter(Boolean).length
        setCurrentWordIndex(wordIdx)
        const total = wordsRef.current.length
        setProgress(total > 0 ? Math.min((wordIdx / total) * 100, 100) : 0)
      }
    }
    utterance.onend = () => { setIsPlaying(false); setProgress(100); setCurrentWordIndex(-1) }
    utterance.onerror = () => setIsPlaying(false)
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
    setProgress(wordsRef.current.length > 0 ? (newIndex / wordsRef.current.length) * 100 : 0)
    setCurrentWordIndex(newIndex)
    setIsPlaying(true)
  }

  const handleSpeedChange = (newSpeed: number) => {
    if (isPlaying && typeof window !== 'undefined') window.speechSynthesis.cancel()
    setSpeed(newSpeed); setIsPlaying(false)
  }

  const words = wordsRef.current
  const displayedWords = words.slice(Math.max(0, currentWordIndex - 5), currentWordIndex + 10)
  const relativeHighlight = Math.min(currentWordIndex, 5)

  if (!supported) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
        <p className="text-zinc-400 text-sm">Tu navegador no soporta síntesis de voz. Intenta con Chrome o Edge.</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
          <Volume2 className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Audio del libro</p>
          {title && <p className="text-sm text-white font-medium line-clamp-1">{title}</p>}
        </div>
      </div>

      {currentWordIndex >= 0 && displayedWords.length > 0 && (
        <div className="bg-zinc-800/60 rounded-lg px-4 py-3 text-sm leading-relaxed min-h-[3rem] flex flex-wrap gap-1 items-center">
          {displayedWords.map((word, i) => (
            <span key={i} className={i === relativeHighlight ? 'text-purple-300 font-semibold bg-purple-900/40 px-1 rounded' : 'text-zinc-400'}>
              {word}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-1">
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-zinc-600">
          <span>{Math.round(progress)}%</span>
          <span>{words.length} palabras</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button onClick={handleSkipBack} title="Reiniciar" className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors">
          <SkipBack className="w-4 h-4" />
        </button>
        <button onClick={handlePlayPause} className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center text-white transition-colors shadow-lg shadow-purple-900/40">
          {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
        </button>
        <button onClick={handleSkipForward} title="Adelantar ~30s" className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors">
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 w-14 shrink-0">Velocidad</span>
          <div className="flex gap-1">
            {speeds.map(s => (
              <button key={s} onClick={() => handleSpeedChange(s)} className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${speed === s ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}>
                {s}x
              </button>
            ))}
          </div>
        </div>
        {voices.length > 1 && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs text-zinc-500 w-14 shrink-0">Voz</span>
            <select value={selectedVoice?.name || ''} onChange={e => { const v = voices.find(v => v.name === e.target.value) || null; setSelectedVoice(v); if (isPlaying) { window.speechSynthesis.cancel(); setIsPlaying(false) } }} className="flex-1 min-w-0 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-purple-500">
              {voices.map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
