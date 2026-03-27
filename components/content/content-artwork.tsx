"use client"

import { useEffect, useRef, useState } from "react"
import { BookOpen, GraduationCap, Sparkles, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { getContentAccentColor, getContentTypeLabel } from "@/lib/content"
import type { Content } from "@/types/database"

interface ContentArtworkProps {
  content: Pick<Content, "id" | "title" | "author" | "type" | "thumbnail_url"> &
    Partial<Pick<Content, "preview_url" | "file_url">> & {
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

function getAssetKind(url?: string | null) {
  if (!url) return null

  const cleanUrl = url.split("?")[0].toLowerCase()

  if (/\.(mp4|webm|mov|m4v)$/.test(cleanUrl)) return "video"
  if (/\.pdf$/.test(cleanUrl)) return "pdf"

  return null
}

export function ContentArtwork({
  content,
  variant = "panel",
  className,
  imageClassName,
  showTypeLabel = true,
}: ContentArtworkProps) {
  const [hasError, setHasError] = useState(!content.thumbnail_url)
  const [signedPreviewUrl, setSignedPreviewUrl] = useState<string | null>(null)
  const [previewFailed, setPreviewFailed] = useState(false)
  const accent = getContentAccentColor(content)
  const TypeIcon = TYPE_ICONS[content.type]
  const assetKind = getAssetKind(signedPreviewUrl)

  useEffect(() => {
    setHasError(!content.thumbnail_url)
  }, [content.thumbnail_url])

  useEffect(() => {
    let ignore = false

    setSignedPreviewUrl(null)
    setPreviewFailed(false)

    async function loadSignedPreview() {
      if (content.thumbnail_url || !content.id || (!content.preview_url && !content.file_url)) {
        return
      }

      try {
        const response = await fetch(`/api/content/${content.id}/preview`)
        if (!response.ok) return

        const data = await response.json()
        if (!ignore) {
          setSignedPreviewUrl(data.url ?? null)
        }
      } catch {
        if (!ignore) {
          setPreviewFailed(true)
        }
      }
    }

    void loadSignedPreview()

    return () => {
      ignore = true
    }
  }, [content.file_url, content.id, content.preview_url, content.thumbnail_url])

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

  if (variant === "panel" && signedPreviewUrl && !previewFailed) {
    if (assetKind === "video") {
      return (
        <VideoArtwork
          url={signedPreviewUrl}
          className={className}
          imageClassName={imageClassName}
          onError={() => setPreviewFailed(true)}
        />
      )
    }

    if (assetKind === "pdf") {
      return (
        <PdfArtwork
          url={signedPreviewUrl}
          title={content.title}
          className={className}
          imageClassName={imageClassName}
        />
      )
    }
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

function PdfArtwork({
  url,
  title,
  className,
  imageClassName,
}: {
  url: string
  title: string
  className?: string
  imageClassName?: string
}) {
  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-white", className)}>
      <iframe
        src={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
        title={`Preview de ${title}`}
        className={cn("h-full w-full scale-[1.05] origin-top border-0", imageClassName)}
        sandbox="allow-same-origin allow-scripts"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/12" />
    </div>
  )
}

function VideoArtwork({
  url,
  className,
  imageClassName,
  onError,
}: {
  url: string
  className?: string
  imageClassName?: string
  onError: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [frameReady, setFrameReady] = useState(false)

  useEffect(() => {
    setFrameReady(false)
  }, [url])

  const captureFrame = (video: HTMLVideoElement) => {
    const canvas = canvasRef.current
    if (!canvas || !video.videoWidth || !video.videoHeight) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext("2d")
    if (!context) return

    try {
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      setFrameReady(true)
    } catch {
      onError()
    }
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-black", className)}>
      <video
        ref={videoRef}
        src={url}
        className="hidden"
        muted
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
        onLoadedData={(event) => {
          const video = event.currentTarget
          const previewTime = Number.isFinite(video.duration) && video.duration > 0
            ? Math.min(1, Math.max(0.1, video.duration * 0.08))
            : 0.1

          try {
            video.currentTime = previewTime
          } catch {
            captureFrame(video)
          }
        }}
        onSeeked={(event) => captureFrame(event.currentTarget)}
        onError={onError}
      />
      <canvas
        ref={canvasRef}
        className={cn(
          "h-full w-full object-cover transition-opacity",
          frameReady ? "opacity-100" : "opacity-0",
          imageClassName
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/15" />
    </div>
  )
}
