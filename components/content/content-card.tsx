"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play, Plus, ThumbsUp, ChevronDown, Lock, BookOpen, GraduationCap, Video } from "lucide-react"
import Link from "next/link"
import { BorderBeam } from "@/components/magicui/border-beam"
import type { Content } from "@/types/database"
import { formatDuration } from "@/lib/utils"

interface ContentCardProps {
  content: Content
  isSubscribed?: boolean
}

const TYPE_CONFIG = {
  book: {
    label: "Libro",
    icon: BookOpen,
    href: (id: string) => `/read/${id}`,
  },
  audiobook: {
    label: "Audiolibro",
    icon: BookOpen,
    href: (id: string) => `/read/${id}`,
  },
  video: {
    label: "Video",
    icon: Video,
    href: (id: string) => `/watch/${id}`,
  },
  course: {
    label: "Curso",
    icon: GraduationCap,
    href: (id: string) => `/watch/${id}`,
  },
}

export function ContentCard({ content, isSubscribed = false }: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const typeConfig = TYPE_CONFIG[content.type] ?? TYPE_CONFIG.video
  const isPremiumLocked = !isSubscribed
  const primaryHref = isPremiumLocked ? '/subscribe' : typeConfig.href(content.id)
  const TypeIcon = typeConfig.icon

  return (
    <motion.div
      className="relative flex-shrink-0 w-[160px] sm:w-[200px] md:w-[240px] lg:w-[280px] cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
        {/* Border Beam on hover */}
        {isHovered && (
          <BorderBeam
            size={100}
            duration={4}
            colorFrom={content.category?.color || "#6B21A8"}
            colorTo="#ffffff"
          />
        )}

        {/* Thumbnail */}
        <img
          src={content.thumbnail_url || "/placeholder.svg"}
          alt={content.title}
          className="w-full h-full object-cover"
          draggable={false}
        />

        {/* Type badge (top-left) */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5">
          <TypeIcon className="w-2.5 h-2.5 text-purple-300" />
          <span className="text-[9px] font-semibold text-purple-200 uppercase tracking-wide">
            {typeConfig.label}
          </span>
        </div>

        {/* Lock badge (top-right) for non-subscribers */}
        {isPremiumLocked && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <Lock className="w-3 h-3 text-purple-400" />
          </div>
        )}

        {/* Hover overlay */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 flex flex-col justify-end p-3"
          >
            <div className="flex items-center gap-2 mb-2">
              {/* Primary action button */}
              <Link href={primaryHref}>
                <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-white/90 transition-colors">
                  {isPremiumLocked ? (
                    <Lock className="w-3.5 h-3.5 text-black" />
                  ) : content.type === 'book' || content.type === 'audiobook' ? (
                    <BookOpen className="w-3.5 h-3.5 text-black" />
                  ) : (
                    <Play className="w-4 h-4 text-black fill-black" />
                  )}
                </button>
              </Link>
              <button className="w-8 h-8 rounded-full border-2 border-white/70 flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors">
                <Plus className="w-4 h-4 text-white" />
              </button>
              <button className="w-8 h-8 rounded-full border-2 border-white/70 flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors">
                <ThumbsUp className="w-4 h-4 text-white" />
              </button>
              <Link href={`/content/${content.id}`} className="ml-auto">
                <button className="w-8 h-8 rounded-full border-2 border-white/70 flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors">
                  <ChevronDown className="w-4 h-4 text-white" />
                </button>
              </Link>
            </div>

            <div className="flex items-center gap-2 text-xs text-white/80">
              <span className="text-green-400 font-semibold">98% Match</span>
              {content.duration > 0 && (
                <span>{formatDuration(content.duration)}</span>
              )}
              <span className="border border-white/30 px-1 rounded text-[10px]">HD</span>
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-[10px] text-white/60">Transformador</span>
              <span className="text-[10px] text-white/60">•</span>
              <span className="text-[10px] text-white/60">Inspirador</span>
            </div>
          </motion.div>
        )}

        {/* Duration badge (not hovered) */}
        {content.duration > 0 && !isHovered && (
          <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white font-medium">
            {formatDuration(content.duration)}
          </div>
        )}
      </div>

      {/* Title */}
      {!isHovered && (
        <p className="mt-2 text-sm text-white/80 line-clamp-1 transition-colors">
          {content.title}
        </p>
      )}
    </motion.div>
  )
}
