'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import {
  Play,
  Pause,
  Loader2,
  AlertCircle,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Settings,
} from 'lucide-react'

interface VideoPlayerProps {
  contentId: string
  isSubscribed: boolean
  isFree: boolean
  autoPlay?: boolean
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

export function VideoPlayer({ contentId, isSubscribed, isFree, autoPlay = false }: VideoPlayerProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Player state
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isSeeking, setIsSeeking] = useState(false)
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverX, setHoverX] = useState(0)

  useEffect(() => {
    async function fetchVideoUrl() {
      try {
        const endpoint = isSubscribed
          ? `/api/content/${contentId}/stream`
          : `/api/content/${contentId}/preview`
        const res = await fetch(endpoint)
        if (!res.ok) {
          setError('No se pudo cargar el video')
          return
        }
        const data = await res.json()
        if (data.url) {
          setVideoUrl(data.url)
        } else {
          setError('URL de video no disponible')
        }
      } catch {
        setError('Error al cargar el video')
      } finally {
        setLoading(false)
      }
    }
    fetchVideoUrl()
  }, [contentId, isSubscribed, isFree])

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => {
        setShowControls(false)
        setShowSpeedMenu(false)
      }, 3000)
    }
  }, [isPlaying])

  useEffect(() => {
    resetHideTimer()
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current) }
  }, [isPlaying, resetHideTimer])

  // Keyboard shortcuts
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          video.paused ? video.play() : video.pause()
          break
        case 'ArrowLeft':
        case 'j':
          e.preventDefault()
          video.currentTime = Math.max(0, video.currentTime - 10)
          resetHideTimer()
          break
        case 'ArrowRight':
        case 'l':
          e.preventDefault()
          video.currentTime = Math.min(video.duration, video.currentTime + 10)
          resetHideTimer()
          break
        case 'ArrowUp':
          e.preventDefault()
          video.volume = Math.min(1, video.volume + 0.1)
          setVolume(video.volume)
          break
        case 'ArrowDown':
          e.preventDefault()
          video.volume = Math.max(0, video.volume - 0.1)
          setVolume(video.volume)
          break
        case 'm':
          e.preventDefault()
          video.muted = !video.muted
          setIsMuted(video.muted)
          break
        case 'f':
          e.preventDefault()
          toggleFullscreen()
          break
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetHideTimer])

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    video.paused ? video.play() : video.pause()
  }

  const skip = (seconds: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds))
    resetHideTimer()
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    const val = parseFloat(e.target.value)
    video.volume = val
    video.muted = val === 0
    setVolume(val)
    setIsMuted(val === 0)
  }

  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      container.requestFullscreen()
    }
  }

  const changeSpeed = (speed: number) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = speed
    setPlaybackRate(speed)
    setShowSpeedMenu(false)
  }

  // Progress bar interaction
  const seekFromEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    const bar = progressRef.current
    if (!video || !bar) return
    const rect = bar.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    video.currentTime = ratio * video.duration
  }

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current
    if (!bar || !duration) return
    const rect = bar.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setHoverTime(ratio * duration)
    setHoverX(e.clientX - rect.left)
  }

  // Video event handlers
  const onTimeUpdate = () => {
    const video = videoRef.current
    if (!video || isSeeking) return
    setCurrentTime(video.currentTime)
  }

  const onLoadedMetadata = () => {
    const video = videoRef.current
    if (!video) return
    setDuration(video.duration)
  }

  const onProgress = () => {
    const video = videoRef.current
    if (!video || video.buffered.length === 0) return
    setBuffered(video.buffered.end(video.buffered.length - 1))
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0

  if (loading) {
    return (
      <div className="aspect-video w-full rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-foreground/40">Cargando video...</p>
        </div>
      </div>
    )
  }

  if (error || !videoUrl) {
    return (
      <div className="aspect-video w-full rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="h-8 w-8 text-foreground/30" />
          <p className="text-sm text-foreground/40">{error || 'Video no disponible'}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black select-none"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => { if (isPlaying) setShowControls(false) }}
    >
      <video
        ref={videoRef}
        key={videoUrl}
        className="h-full w-full cursor-pointer"
        autoPlay={autoPlay}
        playsInline
        onContextMenu={e => e.preventDefault()}
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onProgress={onProgress}
        onEnded={() => setIsPlaying(false)}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Big center play button (when paused) */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 transition-opacity"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 backdrop-blur-xl border border-white/20 shadow-[0_16px_48px_rgba(0,0,0,0.5)] transition-transform hover:scale-105">
            <Play className="h-9 w-9 fill-white text-white ml-1" />
          </div>
        </button>
      )}

      {/* Controls overlay */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 transition-opacity duration-300"
        style={{ opacity: showControls ? 1 : 0, pointerEvents: showControls ? 'auto' : 'none' }}
      >
        {/* Gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

        <div className="relative px-4 pb-4 pt-12">
          {/* Progress bar */}
          <div
            ref={progressRef}
            className="group/progress relative mb-3 h-1.5 cursor-pointer rounded-full bg-white/15 transition-all hover:h-2.5"
            onClick={seekFromEvent}
            onMouseDown={(e) => {
              setIsSeeking(true)
              seekFromEvent(e)
              const handleMove = (ev: MouseEvent) => {
                const bar = progressRef.current
                const video = videoRef.current
                if (!bar || !video) return
                const rect = bar.getBoundingClientRect()
                const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
                video.currentTime = ratio * video.duration
                setCurrentTime(ratio * video.duration)
              }
              const handleUp = () => {
                setIsSeeking(false)
                document.removeEventListener('mousemove', handleMove)
                document.removeEventListener('mouseup', handleUp)
              }
              document.addEventListener('mousemove', handleMove)
              document.addEventListener('mouseup', handleUp)
            }}
            onMouseMove={handleProgressHover}
            onMouseLeave={() => setHoverTime(null)}
          >
            {/* Buffered */}
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-white/20"
              style={{ width: `${bufferedPercent}%` }}
            />
            {/* Played */}
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Seek handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-primary shadow-[0_2px_8px_rgba(0,0,0,0.4)] opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ left: `calc(${progressPercent}% - 8px)` }}
            />
            {/* Hover tooltip */}
            {hoverTime !== null && (
              <div
                className="absolute -top-10 -translate-x-1/2 rounded-md bg-black/90 px-2.5 py-1 text-xs font-medium text-white shadow-lg border border-white/10"
                style={{ left: `${hoverX}px` }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 hover:text-white"
              title={isPlaying ? 'Pausar (K)' : 'Reproducir (K)'}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-white" />
              ) : (
                <Play className="h-5 w-5 fill-white ml-0.5" />
              )}
            </button>

            {/* Skip back 10s */}
            <button
              onClick={() => skip(-10)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              title="Retroceder 10s (J)"
            >
              <RotateCcw className="h-4.5 w-4.5" />
            </button>

            {/* Skip forward 10s */}
            <button
              onClick={() => skip(10)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              title="Adelantar 10s (L)"
            >
              <RotateCw className="h-4.5 w-4.5" />
            </button>

            {/* Volume */}
            <div className="group/vol flex items-center gap-1">
              <button
                onClick={toggleMute}
                className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                title={isMuted ? 'Activar sonido (M)' : 'Silenciar (M)'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4.5 w-4.5" />
                ) : (
                  <Volume2 className="h-4.5 w-4.5" />
                )}
              </button>
              <div className="w-0 overflow-hidden transition-all duration-200 group-hover/vol:w-20">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full accent-primary h-1 cursor-pointer"
                />
              </div>
            </div>

            {/* Time display */}
            <div className="ml-1 text-xs font-medium text-white/60 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            <div className="flex-1" />

            {/* Speed control */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(prev => !prev)}
                className="flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                title="Velocidad"
              >
                <Settings className="h-3.5 w-3.5" />
                {playbackRate}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 rounded-xl border border-white/10 bg-black/95 p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
                  {SPEEDS.map(s => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`block w-full rounded-lg px-4 py-2 text-left text-sm transition-colors ${
                        s === playbackRate
                          ? 'bg-primary/20 font-semibold text-primary'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              title={isFullscreen ? 'Salir de pantalla completa (F)' : 'Pantalla completa (F)'}
            >
              {isFullscreen ? (
                <Minimize className="h-4.5 w-4.5" />
              ) : (
                <Maximize className="h-4.5 w-4.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
