"use client"

import { useEffect, useState } from "react"
import { BookOpen, GraduationCap, Sparkles, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { getContentAccentColor, getContentTypeLabel } from "@/lib/content"
import type { Content } from "@/types/database"

interface ContentArtworkProps {
  content: Pick<Content, "title" | "author" | "type" | "thumbnail_url"> & {
    category?: { color: string | null; name?: string } | null
  }
  variant?: "panel" | "background" | "mini"
  className?: string
  imageClassName?: string
  showTypeLabel?: boolean
}

const TYPE_ICONS = {
  book: BookOpen,
  audiobook: Sparkles,
  video: Video,
  course: GraduationCap,
} as const

export function ContentArtwork({
  content,
  variant = "panel",
  className,
  imageClassName,
  showTypeLabel = true,
}: ContentArtworkProps) {
  const [hasError, setHasError] = useState(!content.thumbnail_url)
  const accent = getContentAccentColor(content)
  const TypeIcon = TYPE_ICONS[content.type]

  useEffect(() => {
    setHasError(!content.thumbnail_url)
  }, [content.thumbnail_url])

  if (content.thumbnail_url && !hasError) {
    return (
      <img
        src={content.thumbnail_url}
        alt={content.title}
        className={cn("h-full w-full object-cover", imageClassName, className)}
        draggable={false}
        onError={() => setHasError(true)}
      />
    )
  }

  if (variant === "mini") {
    return (
      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center overflow-hidden rounded-md",
          className
        )}
        style={{
          background: `linear-gradient(135deg, ${accent}55 0%, rgba(17, 24, 39, 0.96) 55%, rgba(2, 6, 23, 0.96) 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: `radial-gradient(circle at top left, ${accent}66 0%, transparent 44%)`,
          }}
        />
        <TypeIcon className="relative z-10 h-4 w-4 text-white/80" />
      </div>
    )
  }

  if (variant === "background") {
    return (
      <div
        className={cn("relative h-full w-full overflow-hidden", className)}
        style={{
          background: `linear-gradient(135deg, ${accent}30 0%, rgba(9, 9, 11, 0.85) 35%, rgba(2, 6, 23, 0.98) 100%)`,
        }}
      >
        <div
          className="absolute -left-16 top-0 h-52 w-52 rounded-full blur-3xl"
          style={{ backgroundColor: `${accent}66` }}
        />
        <div
          className="absolute bottom-0 right-0 h-64 w-64 rounded-full blur-3xl"
          style={{ backgroundColor: `${accent}33` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.06)_45%,transparent_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
    )
  }

  return (
    <div
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={{
        background: `linear-gradient(145deg, ${accent}40 0%, rgba(24, 24, 27, 0.96) 48%, rgba(9, 9, 11, 0.98) 100%)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `radial-gradient(circle at top left, ${accent}66 0%, transparent 40%), radial-gradient(circle at bottom right, rgba(255,255,255,0.08) 0%, transparent 30%)`,
        }}
      />
      <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/25 backdrop-blur-sm">
        <TypeIcon className="h-4 w-4 text-white/90" />
      </div>
      <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: accent }} />

      <div className="relative flex h-full flex-col justify-between p-3">
        {showTypeLabel ? (
          <span className="inline-flex w-fit items-center rounded-full border border-white/12 bg-black/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
            {getContentTypeLabel(content.type)}
          </span>
        ) : (
          <div />
        )}

        <div className="space-y-1">
          <p className="line-clamp-2 text-sm font-semibold leading-tight text-white drop-shadow-sm">
            {content.title}
          </p>
          {content.author && (
            <p className="line-clamp-1 text-[11px] text-white/65">{content.author}</p>
          )}
        </div>
      </div>
    </div>
  )
}
