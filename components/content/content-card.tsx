"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowUpRight, Play, Lock, BookOpen, GraduationCap, Video, Headphones } from "lucide-react"
import Link from "next/link"
import { ContentArtwork } from "@/components/content/content-artwork"
import { getPrimaryContentHref } from "@/lib/content"
import type { Content } from "@/types/database"
import { formatDuration } from "@/lib/utils"

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
  const isPremiumLocked = !isSubscribed
  const primaryHref = getPrimaryContentHref(content, isSubscribed)
  const TypeIcon = typeConfig.icon
  const isReadingContent = content.type === "book" || content.type === "audiobook"

  return (
    <motion.div
      className="relative flex-shrink-0 w-[160px] sm:w-[200px] md:w-[240px] lg:w-[272px] cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.03, zIndex: 10 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted ring-1 ring-white/8 group-hover:ring-white/18 shadow-[0_8px_32px_rgba(0,0,0,0.22)] group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.38)] transition-all duration-300">
        {/* Thumbnail — scale on hover via CSS class */}
        <div className="card-artwork absolute inset-0">
          <ContentArtwork content={content} showTypeLabel={false} />
        </div>

        {/* Persistent bottom gradient for readability */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

        {/* Type badge — rounded pill, tighter */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/55 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/8">
          <TypeIcon className="w-2.5 h-2.5 text-primary" />
          <span className="text-[9px] font-semibold text-white/75 uppercase tracking-[0.18em]">
            {typeConfig.label}
          </span>
        </div>

        {/* Lock badge */}
        {isPremiumLocked && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/55 backdrop-blur-md border border-white/8 flex items-center justify-center">
            <Lock className="w-3 h-3 text-primary" />
          </div>
        )}

        {/* Hover overlay */}
        <AnimateOverlay visible={isHovered}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/40 to-black/10" />

          {/* Center play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Link href={primaryHref}>
              <motion.button
                initial={{ scale: 0.75, opacity: 0 }}
                animate={isHovered ? { scale: 1, opacity: 1 } : { scale: 0.75, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
                aria-label={
                  primaryHref === "/subscribe"
                    ? `Desbloquear ${content.title}`
                    : `Abrir ${content.title}`
                }
                className="w-13 h-13 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-[0_12px_36px_rgba(0,0,0,0.35)]"
                style={{ width: "52px", height: "52px" }}
              >
                {primaryHref === "/subscribe" ? (
                  <Lock className="w-5 h-5 text-black" />
                ) : isReadingContent ? (
                  <BookOpen className="w-5 h-5 text-black" />
                ) : (
                  <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                )}
              </motion.button>
            </Link>
          </div>

          {/* Bottom action bar */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-[0.26em] text-white/38 font-medium">
                  {isPremiumLocked ? "Solo Miembros" : "Disponible Ahora"}
                </p>
                <p className="mt-1 line-clamp-1 text-xs font-semibold text-white/88">
                  {content.author || typeConfig.label}
                </p>
              </div>
              <Link href={`/content/${content.id}`}>
                <button
                  aria-label={`Ver detalles de ${content.title}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/22 bg-white/8 hover:border-white/55 hover:bg-white/14 transition-all"
                >
                  <ArrowUpRight className="w-3 h-3 text-white" />
                </button>
              </Link>
            </div>

            {content.duration > 0 && (
              <p className="mt-1.5 text-[9px] text-white/42 font-medium">{formatDuration(content.duration)}</p>
            )}
          </div>
        </AnimateOverlay>

        {/* Duration badge when not hovered */}
        {content.duration > 0 && !isHovered && (
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-[9px] text-white/72 font-semibold border border-white/8">
            {formatDuration(content.duration)}
          </div>
        )}
      </div>

      {/* Title + author */}
      <div className="mt-2.5 px-0.5 space-y-0.5">
        <p className="text-sm font-semibold text-foreground/82 group-hover:text-foreground line-clamp-1 transition-colors duration-200">
          {content.title}
        </p>
        {content.author && (
          <p className="text-[11px] text-foreground/40 line-clamp-1">
            {content.author}
          </p>
        )}
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
