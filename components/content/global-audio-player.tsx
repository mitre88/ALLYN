"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, X, Headphones, Loader2 } from "lucide-react"
import { useAudioStore } from "@/lib/stores/audio-store"

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${m}:${String(s).padStart(2, "0")}`
}

export function GlobalAudioPlayer() {
  const { track, isPlaying, isLoading, progress, currentTime, duration, error, resume, pause, stop, seekTo } = useAudioStore()
  const progressBarRef = useRef<HTMLDivElement>(null)

  // Handle progress bar clicks
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    seekTo(ratio * duration)
  }

  if (!track) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 md:px-5 md:pb-4"
      >
        <div className="mx-auto max-w-4xl overflow-hidden rounded-[22px] border border-border/50 bg-background/92 shadow-[0_-12px_60px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
          {/* Progress bar */}
          <div
            ref={progressBarRef}
            className="group relative h-1 cursor-pointer bg-foreground/8 transition-all hover:h-2"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center gap-3 px-4 py-3">
            {/* Artwork / Icon */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/40 bg-purple-500/15">
              <Headphones className="h-5 w-5 text-purple-400" />
            </div>

            {/* Track info */}
            <div className="min-w-0 flex-1">
              <Link href={`/content/${track.contentId}`} className="block">
                <p className="truncate text-sm font-semibold text-foreground hover:text-primary transition-colors">
                  {track.title}
                </p>
              </Link>
              {track.author && (
                <p className="truncate text-xs text-foreground/45">{track.author}</p>
              )}
            </div>

            {/* Time */}
            <div className="hidden text-xs tabular-nums text-foreground/40 sm:block">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5">
              {error ? (
                <span className="text-xs text-red-400">{error}</span>
              ) : isLoading ? (
                <div className="flex h-10 w-10 items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                </div>
              ) : (
                <button
                  onClick={isPlaying ? pause : resume}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white shadow-[0_6px_20px_rgba(147,51,234,0.35)] transition-colors hover:bg-purple-500"
                  aria-label={isPlaying ? "Pausar" : "Reproducir"}
                >
                  {isPlaying ? (
                    <Pause className="h-4.5 w-4.5 fill-white" />
                  ) : (
                    <Play className="h-4.5 w-4.5 fill-white ml-0.5" />
                  )}
                </button>
              )}

              <button
                onClick={stop}
                className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/35 transition-colors hover:bg-foreground/8 hover:text-foreground/70"
                aria-label="Cerrar reproductor"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
