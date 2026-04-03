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
  const lines = splitTitle(content.title, 16, 3)
  const monogram = getMonogram(content.title)
  const typeLabel = getContentTypeLabel(content.type)
  const categoryLabel = content.category?.name || "Colección"
  const authorLabel = content.author || "Edición curada"
  const accentSoft = lightenHex(accent, 0.18)
  const accentGlow = hexAlpha(accent, 0.3)
  const ink = "#f5f7fb"

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <svg
        viewBox="0 0 240 300"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={darkenHex(accent, 0.52)} />
            <stop offset="45%" stopColor="#0b0f18" />
            <stop offset="100%" stopColor="#040507" />
          </linearGradient>
          <radialGradient id={`${uid}-glow`} cx="0.1" cy="0.12" r="1">
            <stop offset="0%" stopColor={accentGlow} />
            <stop offset="60%" stopColor="transparent" />
          </radialGradient>
          <pattern id={`${uid}-lines`} width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M0 12L12 0" stroke="rgba(255,255,255,0.045)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="240" height="300" fill={`url(#${uid}-bg)`} />
        <rect width="240" height="300" fill={`url(#${uid}-glow)`} />
        <rect width="240" height="300" fill={`url(#${uid}-lines)`} />

        <rect x="0" y="0" width="240" height="6" fill={accentSoft} />
        <rect x="18" y="18" width="204" height="264" rx="26" fill="rgba(8,11,18,0.38)" stroke="rgba(255,255,255,0.08)" />

        <text
          x="28"
          y="44"
          fontFamily={COVER_FONT}
          fontSize="10"
          fontWeight="600"
          fill="rgba(255,255,255,0.54)"
          style={{ letterSpacing: "0.22em", textTransform: "uppercase" }}
        >
          ALLYN EDITION
        </text>
        <text
          x="28"
          y="64"
          fontFamily={COVER_FONT}
          fontSize="9"
          fontWeight="700"
          fill={accentSoft}
          style={{ letterSpacing: "0.28em", textTransform: "uppercase" }}
        >
          {truncate(categoryLabel, 16)}
        </text>

        <text
          x="176"
          y="116"
          textAnchor="middle"
          fontFamily={COVER_FONT}
          fontSize="88"
          fontWeight="800"
          fill={hexAlpha(accent, 0.16)}
          style={{ letterSpacing: "-0.05em" }}
        >
          {monogram}
        </text>

        <rect x="28" y="100" width="58" height="2" rx="1" fill={accentSoft} />
        {content.type === "audiobook" ? (
          <g transform="translate(28 114)">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <rect
                key={index}
                x={index * 10}
                y={index % 2 === 0 ? 8 : 0}
                width="4"
                height={index % 2 === 0 ? 18 : 34}
                rx="2"
                fill={hexAlpha(accentSoft, 0.8)}
              />
            ))}
          </g>
        ) : (
          <g transform="translate(28 114)">
            {[0, 1, 2, 3].map((index) => (
              <rect
                key={index}
                x={index * 12}
                y={index * 4}
                width="42"
                height="2"
                rx="1"
                fill="rgba(255,255,255,0.16)"
              />
            ))}
          </g>
        )}

        <g transform="translate(28 182)">
          {lines.map((line, index) => (
            <text
              key={`${line}-${index}`}
              x="0"
              y={index * 28}
              fontFamily={COVER_FONT}
              fontSize="24"
              fontWeight="780"
              fill={ink}
              style={{ letterSpacing: "-0.04em" }}
            >
              {line}
            </text>
          ))}
        </g>

        <rect x="28" y="246" width="184" height="1" fill="rgba(255,255,255,0.14)" />
        <text
          x="28"
          y="266"
          fontFamily={COVER_FONT}
          fontSize="11"
          fontWeight="500"
          fill="rgba(255,255,255,0.62)"
          style={{ letterSpacing: "0.04em" }}
        >
          {truncate(authorLabel, 30)}
        </text>

        <rect x="28" y="276" width="74" height="18" rx="9" fill={hexAlpha(accent, 0.18)} stroke={hexAlpha(accentSoft, 0.32)} />
        <text
          x="65"
          y="288.5"
          textAnchor="middle"
          fontFamily={COVER_FONT}
          fontSize="9"
          fontWeight="700"
          fill={accentSoft}
          style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}
        >
          {typeLabel}
        </text>
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
  const lines = splitTitle(content.title, 18, 2)
  const monogram = getMonogram(content.title)
  const typeLabel = getContentTypeLabel(content.type)
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
            <stop offset="0%" stopColor="#091018" />
            <stop offset="55%" stopColor="#05070d" />
            <stop offset="100%" stopColor={darkenHex(accent, 0.58)} />
          </linearGradient>
          <radialGradient id={`${uid}-glow`} cx="0.82" cy="0.38" r="0.72">
            <stop offset="0%" stopColor={hexAlpha(accent, 0.52)} />
            <stop offset="48%" stopColor={hexAlpha(accent, 0.12)} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <pattern id={`${uid}-grid`} width="18" height="18" patternUnits="userSpaceOnUse">
            <path d="M18 0H0V18" fill="none" stroke="rgba(255,255,255,0.045)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="480" height="300" fill={`url(#${uid}-bg)`} />
        <rect width="480" height="300" fill={`url(#${uid}-glow)`} />
        <rect width="480" height="300" fill={`url(#${uid}-grid)`} />
        <rect x="0" y="0" width="480" height="4" fill={accentSoft} />

        <circle cx="412" cy="84" r="86" fill={hexAlpha(accent, 0.16)} />
        <circle cx="412" cy="84" r="46" fill={hexAlpha(accentLight, 0.18)} />
        <circle cx="60" cy="260" r="72" fill={hexAlpha(accent, 0.08)} />

        <text
          x="34"
          y="38"
          fontFamily={COVER_FONT}
          fontSize="10"
          fontWeight="700"
          fill={accentSoft}
          style={{ letterSpacing: "0.26em", textTransform: "uppercase" }}
        >
          {truncate(categoryLabel, 18)}
        </text>
        <text
          x="34"
          y="58"
          fontFamily={COVER_FONT}
          fontSize="10"
          fontWeight="600"
          fill="rgba(255,255,255,0.52)"
          style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}
        >
          ALLYN PREMIERE
        </text>

        <g transform="translate(34 94)">
          {lines.map((line, index) => (
            <text
              key={`${line}-${index}`}
              x="0"
              y={index * 44}
              fontFamily={COVER_FONT}
              fontSize="38"
              fontWeight="820"
              fill="#f6f7fb"
              style={{ letterSpacing: "-0.045em" }}
            >
              {line}
            </text>
          ))}
        </g>

        <rect x="34" y="200" width="110" height="24" rx="12" fill={hexAlpha(accent, 0.18)} stroke={hexAlpha(accentSoft, 0.35)} />
        <text
          x="89"
          y="216"
          textAnchor="middle"
          fontFamily={COVER_FONT}
          fontSize="10"
          fontWeight="700"
          fill={accentSoft}
          style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}
        >
          {typeLabel}
        </text>

        <rect x="154" y="200" width="118" height="24" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" />
        <text
          x="213"
          y="216"
          textAnchor="middle"
          fontFamily={COVER_FONT}
          fontSize="10"
          fontWeight="600"
          fill="rgba(255,255,255,0.64)"
          style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}
        >
          ACCESO DIGITAL
        </text>

        <text
          x="34"
          y="254"
          fontFamily={COVER_FONT}
          fontSize="12"
          fontWeight="500"
          fill="rgba(255,255,255,0.68)"
          style={{ letterSpacing: "0.03em" }}
        >
          {truncate(content.author || "Curado para sesiones enfocadas", 34)}
        </text>

        <g transform="translate(314 34)">
          <rect
            x="0"
            y="0"
            width="132"
            height="230"
            rx="26"
            fill="rgba(255,255,255,0.055)"
            stroke="rgba(255,255,255,0.12)"
          />
          <rect
            x="16"
            y="16"
            width="100"
            height="122"
            rx="20"
            fill="rgba(5,7,13,0.38)"
            stroke={hexAlpha(accentSoft, 0.24)}
          />
          <text
            x="66"
            y="92"
            textAnchor="middle"
            fontFamily={COVER_FONT}
            fontSize="78"
            fontWeight="820"
            fill={hexAlpha(accentLight, 0.18)}
            style={{ letterSpacing: "-0.06em" }}
          >
            {monogram}
          </text>
          {content.type === "course" ? (
            <g transform="translate(24 156)">
              {[0, 1, 2].map((index) => (
                <rect
                  key={index}
                  x={index * 22}
                  y={index * 10}
                  width="58"
                  height="8"
                  rx="4"
                  fill={index === 0 ? accentSoft : "rgba(255,255,255,0.18)"}
                />
              ))}
            </g>
          ) : (
            <g transform="translate(34 154)">
              <circle cx="32" cy="32" r="30" fill="none" stroke={hexAlpha(accentSoft, 0.6)} strokeWidth="1.5" />
              <circle cx="32" cy="32" r="18" fill={hexAlpha(accent, 0.22)} />
              <path d="M26 21L45 32L26 43V21Z" fill={accentLight} />
            </g>
          )}
          <rect x="16" y="190" width="100" height="1" fill="rgba(255,255,255,0.1)" />
          <text
            x="16"
            y="210"
            fontFamily={COVER_FONT}
            fontSize="9"
            fontWeight="700"
            fill="rgba(255,255,255,0.52)"
            style={{ letterSpacing: "0.22em", textTransform: "uppercase" }}
          >
            EXPERIENCIA
          </text>
          <text
            x="16"
            y="228"
            fontFamily={COVER_FONT}
            fontSize="14"
            fontWeight="620"
            fill="#f4f6fa"
          >
            {content.type === "course" ? "Video guiado" : "Playback curado"}
          </text>
        </g>
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
  const accent = getContentAccentColor(content)

  if (content.thumbnail_url && !imgError) {
    if (variant === "mini") {
      return (
        <div className={cn("relative h-full w-full overflow-hidden", className)}>
          <Image
            alt={content.title}
            className={cn("object-cover", imageClassName)}
            decoding="async"
            draggable={false}
            fill
            loading="lazy"
            onError={() => setImgError(true)}
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
        <Image
          alt={content.title}
          className={cn("object-cover", imageClassName)}
          decoding="async"
          draggable={false}
          fill
          loading="lazy"
          onError={() => setImgError(true)}
          sizes={getPanelSizes(content.type)}
          src={content.thumbnail_url}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,12,0.04)_0%,rgba(5,7,12,0.08)_38%,rgba(5,7,12,0.32)_100%)]" />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/8" />
        {showTypeLabel && (
          <div className="absolute inset-x-0 top-0 flex items-start p-2">
            <span className="inline-flex w-fit items-center rounded-full border border-white/12 bg-black/35 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm">
              {getContentTypeLabel(content.type)}
            </span>
          </div>
        )}
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
      {showTypeLabel && (
        <div className="absolute inset-x-0 top-0 flex items-start p-2">
          <span className="inline-flex w-fit items-center rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/82 backdrop-blur-sm">
            {getContentTypeLabel(content.type)}
          </span>
        </div>
      )}
    </div>
  )
}
