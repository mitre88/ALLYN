"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowUpRight, Play, Lock, BookOpen, GraduationCap, Video, Headphones } from "lucide-react"
import Link from "next/link"
import { ContentArtwork } from "@/components/content/content-artwork"
import { canOpenContent, getContentAccessLabel, getPrimaryContentHref, isContentLocked, isReadingContent } from "@/lib/content"
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
  const canOpenReader = canOpenContent(content, isSubscribed)
  const audioHref = canOpenReader ? `/read/${content.id}?autoplay=true` : "/subscribe"

  return (
    <motion.div
      className={cn("relative flex-shrink-0 cursor-pointer snap-start group", cardWidthClass)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4, zIndex: 10 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link
        href={primaryHref}
        aria-label={primaryHref === "/subscribe" ? `Desbloquear ${content.title}` : `Abrir ${content.title}`}
        className="block rounded-[20px] press-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-[20px] bg-muted/60 shadow-sm transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-black/12 dark:group-hover:shadow-black/30",
            mediaAspectClass
          )}
        >
          <div className="card-artwork absolute inset-0">
            <ContentArtwork content={content} showTypeLabel={false} />
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 group-hover:opacity-0" />

          <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-black/50 px-2 py-1 backdrop-blur-md">
            <TypeIcon className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/82">
              {typeConfig.label}
            </span>
          </div>

          {content.is_free ? (
            <div className="absolute right-2.5 top-2.5 rounded-full bg-primary/20 px-2 py-0.5 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Gratis</span>
            </div>
          ) : isPremiumLocked ? (
            <div className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur-md">
              <Lock className="h-3 w-3 text-white/70" />
            </div>
          ) : null}

          <AnimateOverlay visible={isHovered}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5" />

            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={isHovered ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                className="pointer-events-none flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-lg"
              >
                {primaryHref === "/subscribe" ? (
                  <Lock className="h-[18px] w-[18px] text-black" />
                ) : readingContent ? (
                  <BookOpen className="h-[18px] w-[18px] text-black" />
                ) : (
                  <Play className="ml-0.5 h-[18px] w-[18px] fill-black text-black" />
                )}
              </motion.span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
                {availabilityLabel}
              </p>
              <p className="mt-1 line-clamp-1 text-[13px] font-medium text-white/90">{subtitle}</p>
              {content.duration > 0 && (
                <p className="mt-1 text-[11px] text-white/50">{formatDuration(content.duration)}</p>
              )}
            </div>
          </AnimateOverlay>

          {content.duration > 0 && (
            <div className={cn(
              "absolute bottom-2.5 right-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium tabular-nums text-white/80 backdrop-blur-sm transition-opacity duration-300",
              isHovered ? "opacity-0" : "opacity-100"
            )}>
              {formatDuration(content.duration)}
            </div>
          )}
        </div>
      </Link>

      <div className="mt-2.5 flex items-start justify-between gap-2 px-0.5">
        <div className="min-w-0">
          <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-foreground/90 transition-colors duration-200 group-hover:text-foreground md:text-sm">
            {content.title}
          </p>
          <p className="mt-0.5 line-clamp-1 text-xs text-foreground/50 md:text-[13px]">
            {subtitle}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {readingContent && (
            <Link
              href={audioHref}
              aria-label={canOpenReader ? `Escuchar ${content.title}` : `Desbloquear audio de ${content.title}`}
              className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-purple-500/20 bg-purple-500/8 text-purple-400 transition-colors hover:bg-purple-500/15 hover:text-purple-300"
              title="Escuchar"
            >
              {!canOpenReader ? (
                <Lock className="h-3 w-3" />
              ) : (
                <Headphones className="h-3.5 w-3.5" />
              )}
            </Link>
          )}
          <Link
            href={`/content/${content.id}`}
            aria-label={`Ver detalles de ${content.title}`}
            className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-foreground/[0.04] text-foreground/50 transition-colors hover:bg-foreground/[0.08] hover:text-foreground/80"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
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
