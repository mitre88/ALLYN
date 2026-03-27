"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play, Plus, Bookmark, ChevronDown, Lock, BookOpen, GraduationCap, Video, Headphones } from "lucide-react"
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
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted ring-1 ring-border/50 group-hover:ring-border transition-all duration-300">
        {/* Thumbnail */}
        <ContentArtwork content={content} showTypeLabel={false} />

        {/* Type badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1">
          <TypeIcon className="w-2.5 h-2.5 text-primary/80" />
          <span className="text-[9px] font-semibold text-white/80 uppercase tracking-wide">
            {typeConfig.label}
          </span>
        </div>

        {/* Lock badge */}
        {isPremiumLocked && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-md bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <Lock className="w-3 h-3 text-primary/80" />
          </div>
        )}

        {/* Hover overlay */}
        <AnimateOverlay visible={isHovered}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Center play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Link href={primaryHref}>
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={isHovered ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
              >
                {primaryHref === "/subscribe" ? (
                  <Lock className="w-5 h-5 text-black" />
                ) : isReadingContent ? (
                  <BookOpen className="w-5 h-5 text-black" />
                ) : (
                  <Play className="w-5 h-5 text-black fill-black" />
                )}
              </motion.button>
            </Link>
          </div>

          {/* Bottom action bar */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors">
                  <Plus className="w-3.5 h-3.5 text-white" />
                </button>
                <button className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors">
                  <Bookmark className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <Link href={`/content/${content.id}`}>
                <button className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors">
                  <ChevronDown className="w-3.5 h-3.5 text-white" />
                </button>
              </Link>
            </div>

            {content.duration > 0 && (
              <p className="text-[10px] text-white/50 mt-2">{formatDuration(content.duration)}</p>
            )}
          </div>
        </AnimateOverlay>

        {/* Duration badge when not hovered */}
        {content.duration > 0 && !isHovered && (
          <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white/80 font-medium">
            {formatDuration(content.duration)}
          </div>
        )}
      </div>

      {/* Title */}
      <p className="mt-2.5 text-sm font-medium text-foreground/80 group-hover:text-foreground line-clamp-1 transition-colors px-0.5">
        {content.title}
      </p>
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
