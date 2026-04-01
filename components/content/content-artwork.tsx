"use client"

import { useState } from "react"
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

const COVER_FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"

// Derives a deterministic integer 0-5 from content.id
function getTemplateIndex(id: string): number {
  let sum = 0
  for (let i = 0; i < id.length; i++) {
    sum += id.charCodeAt(i)
  }
  return sum % 6
}

// Darkens a hex color by a given factor (0-1)
function darkenHex(hex: string, factor: number): string {
  const clean = hex.replace("#", "")
  const r = Math.round(parseInt(clean.slice(0, 2), 16) * (1 - factor))
  const g = Math.round(parseInt(clean.slice(2, 4), 16) * (1 - factor))
  const b = Math.round(parseInt(clean.slice(4, 6), 16) * (1 - factor))
  return `rgb(${r},${g},${b})`
}

// Adds alpha to a hex color
function hexAlpha(hex: string, alpha: number): string {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// Truncates text to fit within a max character limit
function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + "…" : text
}

interface TemplateProps {
  title: string
  author: string | null
  accent: string
  typeLabel: string
}

// Template 0 — Diagonal Split
function TemplateDiagonal({ title, author, accent }: TemplateProps) {
  return (
    <svg
      viewBox="0 0 240 300"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      {/* Dark background */}
      <rect width="240" height="300" fill="#09090b" />

      {/* Diagonal accent band */}
      <polygon
        points="-10,0 180,0 80,300 -10,300"
        fill={hexAlpha(accent, 0.18)}
      />
      <polygon
        points="-10,0 140,0 40,300 -10,300"
        fill={hexAlpha(accent, 0.12)}
      />

      {/* Accent top-left corner block */}
      <rect x="0" y="0" width="4" height="300" fill={accent} />
      <rect x="0" y="0" width="80" height="4" fill={accent} />

      {/* Diagonal accent stripe */}
      <line
        x1="0" y1="180"
        x2="240" y2="60"
        stroke={hexAlpha(accent, 0.6)}
        strokeWidth="1"
      />
      <line
        x1="0" y1="190"
        x2="240" y2="70"
        stroke={hexAlpha(accent, 0.25)}
        strokeWidth="0.5"
      />

      {/* Title */}
      <text
        x="20"
        y="228"
        fontFamily={COVER_FONT}
        fontWeight="800"
        fontSize="22"
        fill="white"
        style={{ letterSpacing: "-0.02em" }}
      >
        {truncate(title, 24)}
      </text>
      {title.length > 24 && (
        <text
          x="20"
          y="250"
          fontFamily={COVER_FONT}
          fontWeight="800"
          fontSize="22"
          fill="white"
          style={{ letterSpacing: "-0.02em" }}
        >
          {truncate(title.slice(24), 22)}
        </text>
      )}

      {/* Thin separator line */}
      <line x1="20" y1="268" x2="220" y2="268" stroke={hexAlpha(accent, 0.5)} strokeWidth="0.75" />

      {/* Author */}
      {author && (
        <text
          x="20"
          y="284"
          fontFamily={COVER_FONT}
          fontWeight="400"
          fontSize="11"
          fill="rgba(255,255,255,0.55)"
          style={{ letterSpacing: "0.04em" }}
        >
          {truncate(author, 28)}
        </text>
      )}
    </svg>
  )
}

// Template 1 — Circle Abstract
function TemplateCircle({ title, author, accent }: TemplateProps) {
  return (
    <svg
      viewBox="0 0 240 300"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      {/* Very dark background */}
      <rect width="240" height="300" fill="#07070a" />

      {/* Large background circles */}
      <circle cx="170" cy="80" r="110" fill={hexAlpha(accent, 0.12)} />
      <circle cx="60" cy="200" r="85" fill={hexAlpha(accent, 0.10)} />
      <circle cx="190" cy="240" r="55" fill={hexAlpha(accent, 0.08)} />

      {/* Inner glowing circle */}
      <circle cx="165" cy="85" r="70" fill="none" stroke={hexAlpha(accent, 0.3)} strokeWidth="1" />
      <circle cx="165" cy="85" r="90" fill="none" stroke={hexAlpha(accent, 0.12)} strokeWidth="0.75" />

      {/* Subtle dot accent */}
      <circle cx="50" cy="50" r="3" fill={hexAlpha(accent, 0.6)} />
      <circle cx="30" cy="80" r="1.5" fill={hexAlpha(accent, 0.4)} />
      <circle cx="200" cy="270" r="4" fill={hexAlpha(accent, 0.5)} />

      {/* Bottom gradient overlay */}
      <defs>
        <linearGradient id="cg0" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#07070a" stopOpacity="0" />
          <stop offset="100%" stopColor="#07070a" stopOpacity="0.92" />
        </linearGradient>
      </defs>
      <rect x="0" y="140" width="240" height="160" fill="url(#cg0)" />

      {/* Title — centered bold */}
      <text
        x="120"
        y="238"
        textAnchor="middle"
        fontFamily={COVER_FONT}
        fontWeight="800"
        fontSize="20"
        fill="white"
        style={{ letterSpacing: "-0.02em" }}
      >
        {truncate(title, 24)}
      </text>
      {title.length > 24 && (
        <text
          x="120"
          y="259"
          textAnchor="middle"
          fontFamily={COVER_FONT}
          fontWeight="800"
          fontSize="20"
          fill="white"
          style={{ letterSpacing: "-0.02em" }}
        >
          {truncate(title.slice(24), 24)}
        </text>
      )}

      {/* Author */}
      {author && (
        <text
          x="120"
          y="284"
          textAnchor="middle"
          fontFamily={COVER_FONT}
          fontWeight="400"
          fontSize="11"
          fill={hexAlpha(accent, 0.75)}
          style={{ letterSpacing: "0.05em" }}
        >
          {truncate(author, 30)}
        </text>
      )}
    </svg>
  )
}

// Template 2 — Grid Minimal (dot pattern)
function TemplateGrid({ title, author, accent }: TemplateProps) {
  const bgColor = darkenHex(accent, 0.82)

  // Build dot grid
  const dots: { x: number; y: number }[] = []
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 8; col++) {
      dots.push({ x: 20 + col * 28, y: 16 + row * 22 })
    }
  }

  return (
    <svg
      viewBox="0 0 240 300"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <rect width="240" height="300" fill={bgColor} />

      {/* Dot grid */}
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.x}
          cy={d.y}
          r="1.5"
          fill="rgba(255,255,255,0.08)"
        />
      ))}

      {/* Accent horizontal stripe */}
      <rect x="0" y="0" width="240" height="3" fill={accent} />

      {/* Bottom content area */}
      <rect
        x="0"
        y="218"
        width="240"
        height="82"
        fill="rgba(0,0,0,0.45)"
      />

      {/* Title */}
      <text
        x="20"
        y="246"
        fontFamily={COVER_FONT}
        fontWeight="700"
        fontSize="18"
        fill="white"
        style={{ letterSpacing: "-0.01em" }}
      >
        {truncate(title, 26)}
      </text>
      {title.length > 26 && (
        <text
          x="20"
          y="264"
          fontFamily={COVER_FONT}
          fontWeight="700"
          fontSize="18"
          fill="white"
          style={{ letterSpacing: "-0.01em" }}
        >
          {truncate(title.slice(26), 26)}
        </text>
      )}

      {/* Author */}
      {author && (
        <text
          x="20"
          y="285"
          fontFamily={COVER_FONT}
          fontWeight="400"
          fontSize="11"
          fill="rgba(255,255,255,0.5)"
          style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}
        >
          {truncate(author.toUpperCase(), 28)}
        </text>
      )}
    </svg>
  )
}

// Template 3 — Vertical Split
function TemplateVerticalSplit({ title, author, accent }: TemplateProps) {
  return (
    <svg
      viewBox="0 0 240 300"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      {/* Left accent column (40%) */}
      <rect x="0" y="0" width="96" height="300" fill={hexAlpha(accent, 0.22)} />

      {/* Right dark column (60%) */}
      <rect x="96" y="0" width="144" height="300" fill="#0a0a0e" />

      {/* Vertical divider line */}
      <rect x="94" y="0" width="2" height="300" fill={accent} />

      {/* Left side decorative elements */}
      <circle cx="48" cy="80" r="32" fill={hexAlpha(accent, 0.25)} />
      <circle cx="48" cy="80" r="20" fill={hexAlpha(accent, 0.15)} />
      <circle cx="48" cy="80" r="8" fill={hexAlpha(accent, 0.5)} />

      {/* Left geometric lines */}
      <line x1="16" y1="140" x2="80" y2="140" stroke={hexAlpha(accent, 0.4)} strokeWidth="0.75" />
      <line x1="24" y1="148" x2="72" y2="148" stroke={hexAlpha(accent, 0.25)} strokeWidth="0.5" />

      {/* Right side content */}
      <text
        x="114"
        y="190"
        fontFamily={COVER_FONT}
        fontWeight="800"
        fontSize="17"
        fill="white"
        style={{ letterSpacing: "-0.02em" }}
      >
        {truncate(title, 14)}
      </text>
      {title.length > 14 && (
        <text
          x="114"
          y="210"
          fontFamily={COVER_FONT}
          fontWeight="800"
          fontSize="17"
          fill="white"
          style={{ letterSpacing: "-0.02em" }}
        >
          {truncate(title.slice(14), 14)}
        </text>
      )}
      {title.length > 28 && (
        <text
          x="114"
          y="230"
          fontFamily={COVER_FONT}
          fontWeight="800"
          fontSize="17"
          fill="white"
          style={{ letterSpacing: "-0.02em" }}
        >
          {truncate(title.slice(28), 14)}
        </text>
      )}

      {/* Accent bottom bar */}
      <rect x="96" y="260" width="144" height="1" fill={hexAlpha(accent, 0.4)} />

      {/* Author on right */}
      {author && (
        <text
          x="114"
          y="278"
          fontFamily={COVER_FONT}
          fontWeight="400"
          fontSize="10"
          fill="rgba(255,255,255,0.5)"
          style={{ letterSpacing: "0.08em" }}
        >
          {truncate(author, 18)}
        </text>
      )}
    </svg>
  )
}

// Template 4 — Concentric Arcs
function TemplateConcentric({ title, author, accent }: TemplateProps) {
  return (
    <svg
      viewBox="0 0 240 300"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      {/* Dark base */}
      <rect width="240" height="300" fill="#080810" />

      {/* Concentric arcs emanating from top-right */}
      {[40, 70, 100, 130, 160, 190, 220].map((r, i) => (
        <circle
          key={i}
          cx="220"
          cy="50"
          r={r}
          fill="none"
          stroke={hexAlpha(accent, Math.max(0.04, 0.22 - i * 0.03))}
          strokeWidth={i === 0 ? 1.5 : 0.75}
        />
      ))}

      {/* Secondary arcs from bottom-left */}
      {[60, 100, 140].map((r, i) => (
        <circle
          key={i}
          cx="20"
          cy="280"
          r={r}
          fill="none"
          stroke={hexAlpha(accent, 0.06 - i * 0.015)}
          strokeWidth="0.5"
        />
      ))}

      {/* Glow core at top-right */}
      <circle cx="220" cy="50" r="18" fill={hexAlpha(accent, 0.3)} />
      <circle cx="220" cy="50" r="8" fill={hexAlpha(accent, 0.6)} />

      {/* Bottom gradient */}
      <defs>
        <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#080810" stopOpacity="0" />
          <stop offset="70%" stopColor="#080810" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#080810" stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect x="0" y="120" width="240" height="180" fill="url(#cg1)" />

      {/* Title centered */}
      <text
        x="120"
        y="228"
        textAnchor="middle"
        fontFamily={COVER_FONT}
        fontWeight="700"
        fontSize="21"
        fill="white"
        style={{ letterSpacing: "-0.02em" }}
      >
        {truncate(title, 22)}
      </text>
      {title.length > 22 && (
        <text
          x="120"
          y="251"
          textAnchor="middle"
          fontFamily={COVER_FONT}
          fontWeight="700"
          fontSize="21"
          fill="white"
          style={{ letterSpacing: "-0.02em" }}
        >
          {truncate(title.slice(22), 22)}
        </text>
      )}

      {/* Thin accent line above author */}
      <rect x="80" y="266" width="80" height="1" fill={hexAlpha(accent, 0.5)} rx="0.5" />

      {/* Author */}
      {author && (
        <text
          x="120"
          y="284"
          textAnchor="middle"
          fontFamily={COVER_FONT}
          fontWeight="400"
          fontSize="11"
          fill="rgba(255,255,255,0.55)"
          style={{ letterSpacing: "0.04em" }}
        >
          {truncate(author, 28)}
        </text>
      )}
    </svg>
  )
}

// Template 5 — Bold Publisher
function TemplateBoldPublisher({ title, author, accent }: TemplateProps) {
  return (
    <svg
      viewBox="0 0 240 300"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      {/* Creamy off-white background */}
      <rect width="240" height="300" fill="#f5f0e8" />

      {/* Top accent bar — 20% height */}
      <rect x="0" y="0" width="240" height="60" fill={accent} />

      {/* Subtle texture lines in header */}
      <line x1="0" y1="52" x2="240" y2="52" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
      <line x1="0" y1="56" x2="240" y2="56" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" />

      {/* Publisher monogram / decorative element in header */}
      <rect x="16" y="14" width="28" height="28" rx="2" fill="rgba(255,255,255,0.2)" />
      <text
        x="30"
        y="33"
        textAnchor="middle"
        fontFamily={COVER_FONT}
        fontWeight="800"
        fontSize="16"
        fill="rgba(255,255,255,0.9)"
      >
        A
      </text>

      {/* Horizontal accent line below header */}
      <rect x="0" y="60" width="240" height="3" fill={darkenHex(accent, 0.2)} />

      {/* Title — large and bold, black on cream */}
      <text
        x="20"
        y="108"
        fontFamily={COVER_FONT}
        fontWeight="800"
        fontSize="21"
        fill="#111111"
        style={{ letterSpacing: "-0.03em" }}
      >
        {truncate(title, 18)}
      </text>
      {title.length > 18 && (
        <text
          x="20"
          y="133"
          fontFamily={COVER_FONT}
          fontWeight="800"
          fontSize="21"
          fill="#111111"
          style={{ letterSpacing: "-0.03em" }}
        >
          {truncate(title.slice(18), 18)}
        </text>
      )}
      {title.length > 36 && (
        <text
          x="20"
          y="158"
          fontFamily={COVER_FONT}
          fontWeight="800"
          fontSize="21"
          fill="#111111"
          style={{ letterSpacing: "-0.03em" }}
        >
          {truncate(title.slice(36), 18)}
        </text>
      )}

      {/* Divider rule */}
      <rect x="20" y="192" width="200" height="1" fill="#cccccc" />
      <rect x="20" y="194" width="60" height="1.5" fill={accent} />

      {/* Author */}
      {author && (
        <text
          x="20"
          y="216"
          fontFamily={COVER_FONT}
          fontWeight="500"
          fontSize="12"
          fill="#555555"
          style={{ letterSpacing: "0.02em" }}
        >
          {truncate(author, 26)}
        </text>
      )}

      {/* Bottom publisher info */}
      <rect x="0" y="270" width="240" height="30" fill="rgba(0,0,0,0.06)" />
      <text
        x="20"
        y="289"
        fontFamily={COVER_FONT}
        fontWeight="600"
        fontSize="9"
        fill={accent}
        style={{ letterSpacing: "0.14em" }}
      >
        ALLYN PREMIUM
      </text>
    </svg>
  )
}

const TEMPLATES = [
  TemplateDiagonal,
  TemplateCircle,
  TemplateGrid,
  TemplateVerticalSplit,
  TemplateConcentric,
  TemplateBoldPublisher,
] as const

interface ProgrammaticCoverProps {
  content: ContentArtworkProps["content"]
  accent: string
  className?: string
}

function ProgrammaticCover({ content, accent, className }: ProgrammaticCoverProps) {
  const idx = getTemplateIndex(content.id)
  const Template = TEMPLATES[idx]
  const typeLabel = getContentTypeLabel(content.type)

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <Template
        title={content.title}
        author={content.author}
        accent={accent}
        typeLabel={typeLabel}
      />
    </div>
  )
}

// Mini variant — icon + color block, no text
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
  const idx = getTemplateIndex(content.id)

  // Use template index to vary the mini color pattern
  const bgStyles: React.CSSProperties[] = [
    { background: `linear-gradient(135deg, ${hexAlpha(accent, 0.55)} 0%, #09090b 60%)` },
    { background: `radial-gradient(circle at 30% 30%, ${hexAlpha(accent, 0.6)} 0%, #07070a 55%)` },
    { background: `linear-gradient(160deg, ${darkenHex(accent, 0.5)} 0%, #09090b 50%)` },
    { background: `linear-gradient(90deg, ${hexAlpha(accent, 0.5)} 0%, #0a0a0e 100%)` },
    { background: `radial-gradient(circle at 70% 70%, ${hexAlpha(accent, 0.55)} 0%, #080810 50%)` },
    { background: `linear-gradient(135deg, #f5f0e8 0%, #f5f0e8 100%)` },
  ]

  const iconColors = [
    "text-white/85",
    "text-white/85",
    "text-white/85",
    "text-white/85",
    "text-white/85",
    "text-zinc-800",
  ]

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden rounded-md",
        className
      )}
      style={bgStyles[idx]}
    >
      {idx === 5 && (
        <div
          className="absolute inset-x-0 top-0 h-1/4"
          style={{ backgroundColor: accent }}
        />
      )}
      <TypeIcon className={cn("relative z-10 h-4 w-4", iconColors[idx])} />
    </div>
  )
}

// Background variant — blurred/extended version for page backdrops
function BackgroundCover({
  content,
  accent,
  className,
}: {
  content: ContentArtworkProps["content"]
  accent: string
  className?: string
}) {
  const idx = getTemplateIndex(content.id)

  const patterns: React.CSSProperties[] = [
    // Diagonal
    {
      background: `linear-gradient(135deg, ${hexAlpha(accent, 0.25)} 0%, rgba(9,9,11,0.88) 40%, rgba(2,6,23,0.98) 100%)`,
    },
    // Circle abstract
    {
      background: `radial-gradient(ellipse at 70% 20%, ${hexAlpha(accent, 0.3)} 0%, rgba(7,7,10,0.92) 50%), radial-gradient(ellipse at 20% 80%, ${hexAlpha(accent, 0.15)} 0%, transparent 45%)`,
    },
    // Grid minimal
    {
      background: `linear-gradient(160deg, ${hexAlpha(accent, 0.22)} 0%, rgba(9,9,11,0.9) 50%)`,
    },
    // Vertical split
    {
      background: `linear-gradient(90deg, ${hexAlpha(accent, 0.28)} 0%, rgba(10,10,14,0.92) 40%, rgba(2,6,23,0.98) 100%)`,
    },
    // Concentric
    {
      background: `radial-gradient(ellipse at 90% 10%, ${hexAlpha(accent, 0.32)} 0%, rgba(8,8,16,0.92) 45%), radial-gradient(ellipse at 10% 90%, ${hexAlpha(accent, 0.12)} 0%, transparent 40%)`,
    },
    // Bold publisher
    {
      background: `linear-gradient(180deg, ${hexAlpha(accent, 0.35)} 0%, rgba(9,9,11,0.95) 35%, rgba(2,6,23,0.98) 100%)`,
    },
  ]

  return (
    <div
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={patterns[idx]}
    >
      <div
        className="absolute -left-16 top-0 h-48 w-48 rounded-full blur-3xl"
        style={{ backgroundColor: hexAlpha(accent, 0.2) }}
      />
      <div
        className="absolute bottom-0 right-0 h-56 w-56 rounded-full blur-3xl"
        style={{ backgroundColor: hexAlpha(accent, 0.1) }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.04)_50%,transparent_100%)]" />
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

  // Thumbnail: show if available and hasn't errored
  if (content.thumbnail_url && !imgError) {
    if (variant === "mini" || variant === "background") {
      return (
        <img
          src={content.thumbnail_url}
          alt={content.title}
          className={cn("h-full w-full object-cover", imageClassName, className)}
          draggable={false}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
        />
      )
    }

    // Panel variant with thumbnail — show image with type label overlay
    return (
      <div className={cn("relative h-full w-full overflow-hidden", className)}>
        <img
          src={content.thumbnail_url}
          alt={content.title}
          className={cn("h-full w-full object-cover", imageClassName)}
          draggable={false}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
        />
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

  // Fallback — programmatic cover
  if (variant === "mini") {
    return <MiniCover content={content} accent={accent} className={className} />
  }

  if (variant === "background") {
    return <BackgroundCover content={content} accent={accent} className={className} />
  }

  // Panel variant — full programmatic cover + optional type label
  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <ProgrammaticCover content={content} accent={accent} />
      {showTypeLabel && (
        <div className="absolute inset-x-0 top-0 flex items-start p-2">
          <span className="inline-flex w-fit items-center rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80 backdrop-blur-sm">
            {getContentTypeLabel(content.type)}
          </span>
        </div>
      )}
    </div>
  )
}
