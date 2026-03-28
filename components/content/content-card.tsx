"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowUpRight, Play, Lock, BookOpen, GraduationCap, Video, Headphones } from "lucide-react"
import Link from "next/link"
import { ContentArtwork } from "@/components/content/content-artwork"
import { getContentAccessLabel, getPrimaryContentHref, isContentLocked, isReadingContent } from "@/lib/content"
import type { Content } from "@/types/database"
import { cn, formatDuration } from "@/lib/utils"

interface ContentCardProps {
  content: Content
  isSubscribed?: boolean
}

const TYPE_CONFIG = {
  book: { label: "Libro", icon: BookOpen },
  audiobook: { label: "Audiolibro", icon: Headphones },
  video: { label: "Video", icon: Video },
  course: { label: "Curso", icon: GraduationCap },
}

export function ContentCard({ content, isSubscribed = false }: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const typeConfig = TYPE_CONFIG[content.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.video
  const isPremiumLocked = isContentLocked(content, isSubscribed)
  const primaryHref = getPrimaryContentHref(content, isSubscribed)
  const TypeIcon = typeConfig.icon
  const readingContent = isReadingContent(content)
  const cardWidthClass = readingContent
    ? "w-[46vw] min-w-[176px] max-w-[214px] sm:w-[210px] md:w-[228px] lg:w-[244px] xl:w-[256px]"
    : "w-[78vw] min-w-[264px] max-w-[336px] sm:w-[310px] md:w-[340px] lg:w-[364px] xl:w-[388px]"
  const mediaAspectClass = readingContent ? "aspect-[4/5]" : "aspect-[16/10]"
  const availabilityLabel = getContentAccessLabel(content, isSubscribed)
  const subtitle = content.author || typeConfig.label

  return (
    <motion.div
      className={cn("relative flex-shrink-0 cursor-pointer snap-start group", cardWidthClass)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -6, scale: 1.02, zIndex: 10 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <Link
        href={primaryHref}
        aria-label={primaryHref === "/subscribe" ? `Desbloquear ${content.title}` : `Abrir ${content.title}`}
        className="block rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-[24px] border border-white/8 bg-muted/80 ring-1 ring-white/6 shadow-[0_12px_36px_rgba(0,0,0,0.18)] transition-all duration-300 group-hover:border-white/16 group-hover:shadow-[0_22px_56px_rgba(0,0,0,0.26)]",
            mediaAspectClass
          )}
        >
          <div className="card-artwork absolute inset-0">
            <ContentArtwork content={content} showTypeLabel={false} />
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 px-2.5 py-1.5 backdrop-blur-md">
            <TypeIcon className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/78">
              {typeConfig.label}
            </span>
          </div>

          {content.is_free ? (
            <div className="absolute right-3 top-3 rounded-full border border-primary/25 bg-primary/20 px-2.5 py-1 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Gratis</span>
            </div>
          ) : isPremiumLocked ? (
            <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/55 backdrop-blur-md">
              <Lock className="h-3.5 w-3.5 text-primary" />
            </div>
          ) : null}

          <AnimateOverlay visible={isHovered}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/40 to-black/10" />

            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                initial={{ scale: 0.75, opacity: 0 }}
                animate={isHovered ? { scale: 1, opacity: 1 } : { scale: 0.75, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
                className="pointer-events-none flex h-[54px] w-[54px] items-center justify-center rounded-full bg-white shadow-[0_12px_36px_rgba(0,0,0,0.35)]"
              >
                {primaryHref === "/subscribe" ? (
                  <Lock className="h-5 w-5 text-black" />
                ) : readingContent ? (
                  <BookOpen className="h-5 w-5 text-black" />
                ) : (
                  <Play className="ml-0.5 h-5 w-5 fill-black text-black" />
                )}
              </motion.span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="rounded-[18px] border border-white/10 bg-black/20 px-3 py-3 backdrop-blur-md">
                <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-white/42">
                  {availabilityLabel}
                </p>
                <p className="mt-1 line-clamp-1 text-sm font-medium text-white/86">{subtitle}</p>
                {content.duration > 0 && (
                  <p className="mt-2 text-[11px] text-white/54">{formatDuration(content.duration)}</p>
                )}
              </div>
            </div>
          </AnimateOverlay>

          {content.duration > 0 && !isHovered && (
            <div className="absolute bottom-3 right-3 rounded-full border border-white/10 bg-black/70 px-2 py-1 text-[10px] font-semibold text-white/78 backdrop-blur-sm">
              {formatDuration(content.duration)}
            </div>
          )}
        </div>
      </Link>

      <div className="mt-3 flex items-start justify-between gap-3 px-1">
        <div className="min-w-0 space-y-1">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground/84 transition-colors duration-200 group-hover:text-foreground md:text-[15px]">
            {content.title}
          </p>
          <p className="line-clamp-1 text-[11px] text-foreground/44 md:text-[13px]">
            {subtitle}
          </p>
        </div>

        <Link
          href={`/content/${content.id}`}
          aria-label={`Ver detalles de ${content.title}`}
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-foreground/70 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-foreground"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  )
}

function AnimateOverlay({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
