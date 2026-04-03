"use client"

import { useState } from "react"
import { Headphones, Loader2, Pause } from "lucide-react"
import { useAudioStore } from "@/lib/stores/audio-store"
import { sileo as toast } from "sileo"
import type { Content } from "@/types/database"

interface ListenButtonProps {
  content: Content
  isSubscribed: boolean
  className?: string
  variant?: "primary" | "secondary" | "mini"
}

export function ListenButton({ content, isSubscribed, className = "", variant = "primary" }: ListenButtonProps) {
  const [generating, setGenerating] = useState(false)
  const { track, isPlaying, play, pause, resume } = useAudioStore()

  const isCurrentTrack = track?.contentId === content.id
  const canListen = isSubscribed || content.is_free

  if (!canListen) return null

  const handleClick = async () => {
    // If this track is already playing, toggle play/pause
    if (isCurrentTrack) {
      if (isPlaying) {
        pause()
      } else {
        resume()
      }
      return
    }

    // Start generating / fetching audio
    setGenerating(true)
    try {
      const res = await fetch(`/api/content/${content.id}/tts`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Error" }))
        toast.error({ title: data.error || "No se pudo generar el audio" })
        return
      }

      const data = await res.json()
      if (data.url) {
        play({
          contentId: content.id,
          title: content.title,
          author: content.author,
          thumbnailUrl: content.thumbnail_url,
          audioUrl: data.url,
          categoryColor: content.category?.color || undefined,
        })
      }
    } catch {
      toast.error({ title: "Error de conexión al generar audio" })
    } finally {
      setGenerating(false)
    }
  }

  if (variant === "mini") {
    return (
      <button
        onClick={handleClick}
        disabled={generating}
        className={`flex items-center justify-center rounded-full transition-colors ${
          isCurrentTrack && isPlaying
            ? "bg-purple-600 text-white"
            : "bg-purple-500/15 text-purple-400 hover:bg-purple-500/25"
        } ${className}`}
        aria-label={isCurrentTrack && isPlaying ? "Pausar audio" : "Escuchar"}
        title="Escuchar"
      >
        {generating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isCurrentTrack && isPlaying ? (
          <Pause className="h-3.5 w-3.5 fill-current" />
        ) : (
          <Headphones className="h-3.5 w-3.5" />
        )}
      </button>
    )
  }

  if (variant === "secondary") {
    return (
      <button
        onClick={handleClick}
        disabled={generating}
        className={`inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-5 py-2.5 text-sm font-semibold text-purple-400 transition-colors hover:bg-purple-500/20 disabled:opacity-60 ${className}`}
      >
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generando audio...
          </>
        ) : isCurrentTrack && isPlaying ? (
          <>
            <Pause className="h-4 w-4 fill-current" />
            Pausar audio
          </>
        ) : (
          <>
            <Headphones className="h-4 w-4" />
            {isCurrentTrack ? "Continuar escuchando" : "Escuchar"}
          </>
        )}
      </button>
    )
  }

  // Primary variant
  return (
    <button
      onClick={handleClick}
      disabled={generating}
      className={`inline-flex items-center gap-2 rounded-full bg-purple-600 px-7 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(147,51,234,0.3)] transition-colors hover:bg-purple-500 disabled:opacity-60 ${className}`}
    >
      {generating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generando audio...
        </>
      ) : isCurrentTrack && isPlaying ? (
        <>
          <Pause className="h-4 w-4 fill-current" />
          Pausar audio
        </>
      ) : (
        <>
          <Headphones className="h-4 w-4" />
          {isCurrentTrack ? "Continuar escuchando" : "Escuchar"}
        </>
      )}
    </button>
  )
}
