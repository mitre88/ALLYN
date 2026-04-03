"use client"

import Image from "next/image"
import { useState } from "react"
import { BookOpen, GraduationCap, Headphones, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { getContentAccentColor, getContentTypeLabel, isReadingContentType } from "@/lib/content"
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
  audiobook: Headphones,
  video: Video,
  course: GraduationCap,
} as const

const COVER_FONT = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

function mixHex(hex: string, withHex: string, weight: number): string {
  const cleanA = hex.replace("#", "")
  const cleanB = withHex.replace("#", "")

  const aR = parseInt(cleanA.slice(0, 2), 16)
  const aG = parseInt(cleanA.slice(2, 4), 16)
  const aB = parseInt(cleanA.slice(4, 6), 16)
  const bR = parseInt(cleanB.slice(0, 2), 16)
  const bG = parseInt(cleanB.slice(2, 4), 16)
  const bB = parseInt(cleanB.slice(4, 6), 16)

  const r = Math.round(aR + (bR - aR) * weight)
  const g = Math.round(aG + (bG - aG) * weight)
  const b = Math.round(aB + (bB - aB) * weight)

  return `rgb(${r},${g},${b})`
}

function darkenHex(hex: string, factor: number): string {
  return mixHex(hex, "#05070c", factor)
}

function lightenHex(hex: string, factor: number): string {
  return mixHex(hex, "#ffffff", factor)
}

function hexAlpha(hex: string, alpha: number): string {
  if (hex.startsWith("rgb")) {
    const channels = hex.match(/\d+/g)
    if (channels && channels.length >= 3) {
      const [r, g, b] = channels
      return `rgba(${r},${g},${b},${alpha})`
    }
  }

  const clean = hex.replace("#", "")
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-z0-9]/gi, "").slice(0, 12) || "content"
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function splitTitle(title: string, maxChars: number, maxLines: number): string[] {
  const clean = title.replace(/\s+/g, " ").trim()
  if (!clean) return []

  const words = clean.split(" ")
  const lines: string[] = []
  let current = ""

  for (const word of words) {
    const next = current ? `${current} ${word}` : word

    if (next.length <= maxChars) {
      current = next
      continue
    }

    if (current) {
      lines.push(current)
      current = word
    } else {
      lines.push(truncate(word, maxChars))
      current = ""
    }

    if (lines.length === maxLines) break
  }

  if (lines.length < maxLines && current) {
    lines.push(current)
  }

  if (lines.length > maxLines) {
    return lines.slice(0, maxLines)
  }

  if (words.join(" ").length > lines.join(" ").length && lines.length > 0) {
    lines[lines.length - 1] = truncate(lines[lines.length - 1], maxChars)
  }

  return lines.slice(0, maxLines)
}

function getMonogram(title: string): string {
  const letter = title.trim().match(/[A-Za-z0-9ÁÉÍÓÚÑ]/u)?.[0]
  return (letter || "A").toUpperCase()
}

function getPanelSizes(type: Content["type"]): string {
  if (isReadingContentType(type)) {
    return "(max-width: 640px) 46vw, (max-width: 1024px) 228px, 256px"
  }

  return "(max-width: 640px) 78vw, (max-width: 1024px) 340px, 388px"
}

function EditorialBookCover({
  content,
  accent,
  className,
}: {
  content: ContentArtworkProps["content"]
  accent: string
  className?: string
}) {
  const uid = `book-${sanitizeId(content.id)}`
  const lines = splitTitle(content.title, 14, 3)
  const monogram = getMonogram(content.title)
  const categoryLabel = content.category?.name || "Colección"
  const authorLabel = content.author || "Edición curada"
  const accentSoft = lightenHex(accent, 0.22)

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <svg
        viewBox="0 0 240 300"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor={darkenHex(accent, 0.42)} />
            <stop offset="100%" stopColor="#060709" />
          </linearGradient>
          <radialGradient id={`${uid}-glow`} cx="0.85" cy="0.15" r="0.7">
            <stop offset="0%" stopColor={hexAlpha(accent, 0.18)} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        <rect width="240" height="300" fill={`url(#${uid}-bg)`} />
        <rect width="240" height="300" fill={`url(#${uid}-glow)`} />

        {/* Top accent bar */}
        <rect x="0" y="0" width="240" height="3" fill={accentSoft} />

        {/* Large background monogram */}
        <text
          x="200"
          y="140"
          textAnchor="middle"
          fontFamily={COVER_FONT}
          fontSize="120"
          fontWeight="900"
          fill={hexAlpha(accent, 0.07)}
          style={{ letterSpacing: "-0.06em" }}
        >
          {monogram}
        </text>

        {/* Category label */}
        <text
          x="24"
          y="36"
          fontFamily={COVER_FONT}
          fontSize="9"
          fontWeight="700"
          fill={accentSoft}
          style={{ letterSpacing: "0.2em", textTransform: "uppercase" }}
        >
          {truncate(categoryLabel, 18)}
        </text>

        {/* Accent divider */}
        <rect x="24" y="48" width="36" height="2" rx="1" fill={accentSoft} />

        {/* Title — pushed lower for vertical rhythm */}
        <g transform="translate(24 180)">
          {lines.map((line, index) => (
            <text
              key={`${line}-${index}`}
              x="0"
              y={index * 30}
              fontFamily={COVER_FONT}
              fontSize="26"
              fontWeight="800"
              fill="#f2f4f8"
              style={{ letterSpacing: "-0.03em" }}
            >
              {line}
            </text>
          ))}
        </g>

        {/* Bottom area — author + audiobook indicator */}
        <rect x="24" y="264" width="192" height="1" fill="rgba(255,255,255,0.1)" />
        <text
          x="24"
          y="282"
          fontFamily={COVER_FONT}
          fontSize="11"
          fontWeight="500"
          fill="rgba(255,255,255,0.55)"
          style={{ letterSpacing: "0.02em" }}
        >
          {truncate(authorLabel, 28)}
        </text>
        {content.type === "audiobook" && (
          <g transform="translate(24 290)">
            {[0, 1, 2, 3, 4].map((i) => (
              <rect
                key={i}
                x={i * 7}
                y={i % 2 === 0 ? 2 : 0}
                width="3"
                height={i % 2 === 0 ? 6 : 10}
                rx="1.5"
                fill={hexAlpha(accentSoft, 0.7)}
              />
            ))}
          </g>
        )}
      </svg>
    </div>
  )
}

function CinematicLandscapeCover({
  content,
  accent,
  className,
}: {
  content: ContentArtworkProps["content"]
  accent: string
  className?: string
}) {
  const uid = `screen-${sanitizeId(content.id)}`
  const lines = splitTitle(content.title, 20, 2)
  const monogram = getMonogram(content.title)
  const categoryLabel = content.category?.name || "Colección"
  const accentSoft = lightenHex(accent, 0.22)
  const accentLight = lightenHex(accent, 0.4)

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <svg
        viewBox="0 0 480 300"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#080c14" />
            <stop offset="100%" stopColor={darkenHex(accent, 0.55)} />
          </linearGradient>
          <radialGradient id={`${uid}-glow`} cx="0.75" cy="0.35" r="0.6">
            <stop offset="0%" stopColor={hexAlpha(accent, 0.28)} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        <rect width="480" height="300" fill={`url(#${uid}-bg)`} />
        <rect width="480" height="300" fill={`url(#${uid}-glow)`} />

        {/* Top accent bar */}
        <rect x="0" y="0" width="480" height="3" fill={accentSoft} />

        {/* Background monogram */}
        <text
          x="400"
          y="200"
          textAnchor="middle"
          fontFamily={COVER_FONT}
          fontSize="180"
          fontWeight="900"
          fill={hexAlpha(accent, 0.05)}
          style={{ letterSpacing: "-0.06em" }}
        >
          {monogram}
        </text>

        {/* Category */}
        <text
          x="32"
          y="36"
          fontFamily={COVER_FONT}
          fontSize="10"
          fontWeight="700"
          fill={accentSoft}
          style={{ letterSpacing: "0.2em", textTransform: "uppercase" }}
        >
          {truncate(categoryLabel, 20)}
        </text>

        {/* Accent divider */}
        <rect x="32" y="48" width="40" height="2" rx="1" fill={accentSoft} />

        {/* Title */}
        <g transform="translate(32 100)">
          {lines.map((line, index) => (
            <text
              key={`${line}-${index}`}
              x="0"
              y={index * 46}
              fontFamily={COVER_FONT}
              fontSize="40"
              fontWeight="820"
              fill="#f2f4f8"
              style={{ letterSpacing: "-0.04em" }}
            >
              {line}
            </text>
          ))}
        </g>

        {/* Author */}
        <text
          x="32"
          y="260"
          fontFamily={COVER_FONT}
          fontSize="12"
          fontWeight="500"
          fill="rgba(255,255,255,0.55)"
          style={{ letterSpacing: "0.02em" }}
        >
          {truncate(content.author || "Curado para ti", 36)}
        </text>

        {/* Play indicator for videos */}
        {content.type !== "course" && (
          <g transform="translate(32 272)">
            <circle cx="8" cy="8" r="8" fill={hexAlpha(accent, 0.2)} />
            <path d="M6.5 4.5L12 8L6.5 11.5V4.5Z" fill={accentLight} />
          </g>
        )}
        {content.type === "course" && (
          <g transform="translate(32 272)">
            {[0, 1, 2].map((i) => (
              <rect
                key={i}
                x={i * 18}
                y={2}
                width="12"
                height="12"
                rx="3"
                fill={i === 0 ? hexAlpha(accentSoft, 0.6) : "rgba(255,255,255,0.1)"}
              />
            ))}
          </g>
        )}
      </svg>
    </div>
  )
}

function ProgrammaticCover({
  content,
  accent,
  className,
}: {
  content: ContentArtworkProps["content"]
  accent: string
  className?: string
}) {
  if (isReadingContentType(content.type)) {
    return <EditorialBookCover content={content} accent={accent} className={className} />
  }

  return <CinematicLandscapeCover content={content} accent={accent} className={className} />
}

function MiniCover({
  content,
  accent,
  className,
}: {
  content: ContentArtworkProps["content"]
  accent: string
  className?: string
}) {
  const TypeIcon = TYPE_ICONS[content.type]
  const readingContent = isReadingContentType(content.type)
  const monogram = getMonogram(content.title)
  const accentSoft = lightenHex(accent, 0.18)

  return (
    <div
      className={cn("relative flex h-full w-full items-center overflow-hidden rounded-md", className)}
      style={{
        background: readingContent
          ? `linear-gradient(135deg, ${darkenHex(accent, 0.38)} 0%, #07090d 60%, #040507 100%)`
          : `radial-gradient(circle at 78% 28%, ${hexAlpha(accent, 0.45)} 0%, transparent 36%), linear-gradient(135deg, #09111a 0%, #05070d 100%)`,
      }}
    >
      <div className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: accentSoft }} />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_45%)]" />
      <span className="absolute left-3 top-1.5 text-[8px] font-semibold uppercase tracking-[0.24em] text-white/54">
        {getContentTypeLabel(content.type)}
      </span>
      <span className="absolute right-2 top-1 text-[24px] font-black leading-none text-white/10">
        {monogram}
      </span>
      <div className="relative z-10 flex w-full items-center justify-between px-3">
        <div className="min-w-0">
          <p className="line-clamp-1 text-[10px] font-semibold text-white/82">{truncate(content.title, 22)}</p>
        </div>
        <TypeIcon className="ml-2 h-3.5 w-3.5 shrink-0 text-white/72" />
      </div>
    </div>
  )
}

function BackgroundCover({
  content,
  accent,
  className,
}: {
  content: ContentArtworkProps["content"]
  accent: string
  className?: string
}) {
  const readingContent = isReadingContentType(content.type)
  const monogram = getMonogram(content.title)

  return (
    <div
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={{
        background: readingContent
          ? `radial-gradient(circle at 14% 18%, ${hexAlpha(accent, 0.34)} 0%, transparent 30%), linear-gradient(145deg, ${darkenHex(accent, 0.38)} 0%, #090b10 44%, #040507 100%)`
          : `radial-gradient(circle at 80% 24%, ${hexAlpha(accent, 0.42)} 0%, transparent 32%), radial-gradient(circle at 12% 78%, ${hexAlpha(accent, 0.12)} 0%, transparent 24%), linear-gradient(145deg, #0a1119 0%, #05070d 54%, ${darkenHex(accent, 0.52)} 100%)`,
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_28%,transparent_72%,rgba(255,255,255,0.04)_100%)]" />
      <div className="absolute inset-0 opacity-[0.18]" style={{ backgroundImage: "repeating-linear-gradient(135deg, transparent 0 14px, rgba(255,255,255,0.05) 14px 15px)" }} />
      <span className="absolute -right-4 bottom-[-2rem] text-[14rem] font-black leading-none text-white/[0.04]">
        {monogram}
      </span>
      <div
        className="absolute left-[-8%] top-[8%] h-52 w-52 rounded-full blur-3xl"
        style={{ backgroundColor: hexAlpha(accent, 0.16) }}
      />
      <div
        className="absolute bottom-[-10%] right-[-2%] h-60 w-60 rounded-full blur-3xl"
        style={{ backgroundColor: hexAlpha(accent, 0.14) }}
      />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/55 to-transparent" />
    </div>
  )
}

export function ContentArtwork({
  content,
  variant = "panel",
  className,
  imageClassName,
  showTypeLabel = true,
}: ContentArtworkProps) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const accent = getContentAccentColor(content)

  if (content.thumbnail_url && !imgError) {
    if (variant === "mini") {
      return (
        <div className={cn("relative h-full w-full overflow-hidden", className)}>
          {!imgLoaded && <div className="absolute inset-0 shimmer" />}
          <Image
            alt={content.title}
            className={cn("object-cover transition-opacity duration-500", imgLoaded ? "opacity-100" : "opacity-0", imageClassName)}
            decoding="async"
            draggable={false}
            fill
            loading="lazy"
            onError={() => setImgError(true)}
            onLoad={() => setImgLoaded(true)}
            sizes="96px"
            src={content.thumbnail_url}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/15" />
          <div className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: lightenHex(accent, 0.16) }} />
        </div>
      )
    }

    if (variant === "background") {
      return (
        <div className={cn("relative h-full w-full overflow-hidden", className)}>
          <Image
            alt=""
            aria-hidden="true"
            className={cn("object-cover scale-[1.08] saturate-[0.82] blur-[2px]", imageClassName)}
            decoding="async"
            draggable={false}
            fill
            loading="lazy"
            onError={() => setImgError(true)}
            sizes="100vw"
            src={content.thumbnail_url}
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_32%,transparent_68%,rgba(0,0,0,0.12)_100%)]" />
        </div>
      )
    }

    return (
      <div className={cn("relative h-full w-full overflow-hidden", className)}>
        {!imgLoaded && <div className="absolute inset-0 shimmer rounded-[inherit]" />}
        <Image
          alt={content.title}
          className={cn("object-cover transition-opacity duration-500", imgLoaded ? "opacity-100" : "opacity-0", imageClassName)}
          decoding="async"
          draggable={false}
          fill
          loading="lazy"
          onError={() => setImgError(true)}
          onLoad={() => setImgLoaded(true)}
          sizes={getPanelSizes(content.type)}
          src={content.thumbnail_url}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-transparent" />
      </div>
    )
  }

  if (variant === "mini") {
    return <MiniCover content={content} accent={accent} className={className} />
  }

  if (variant === "background") {
    return <BackgroundCover content={content} accent={accent} className={className} />
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <ProgrammaticCover content={content} accent={accent} />
    </div>
  )
}
