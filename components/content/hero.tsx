"use client"

import { motion } from "framer-motion"
import { Play, Info, Volume2, VolumeX, BookOpen, Lock, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContentArtwork } from "@/components/content/content-artwork"
import { getPrimaryContentHref, getPrimaryContentLabel } from "@/lib/content"
import Link from "next/link"
import { useState } from "react"
import type { Content } from "@/types/database"
import { formatDuration } from "@/lib/utils"

const TYPE_LABELS: Record<string, string> = {
  book: "Libro",
  audiobook: "Audiolibro",
  video: "Video",
  course: "Curso",
}

interface HeroProps {
  content: Content
  isSubscribed?: boolean
}

export function Hero({ content, isSubscribed = false }: HeroProps) {
  const [muted, setMuted] = useState(true)
  const primaryHref = getPrimaryContentHref(content, isSubscribed)
  const primaryLabel = getPrimaryContentLabel(content, isSubscribed)
  const isReadingContent = content.type === "book" || content.type === "audiobook"

  if (!content) return null

  const PrimaryIcon =
    primaryHref === "/subscribe"
      ? Lock
      : content.type === "audiobook"
      ? Headphones
      : isReadingContent
      ? BookOpen
      : Play

  return (
    <div className="relative w-full h-[72vh] md:h-[88vh] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <ContentArtwork content={content} variant="background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/55 to-transparent" />
        <div className="absolute inset-0 hero-gradient" />
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-background/20" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 md:px-8 flex items-end pb-16 md:pb-28">
        <div className="max-w-xl">

          {/* Category + type pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            className="flex items-center gap-2 mb-5"
          >
            {content.category && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white/90 border border-white/10 backdrop-blur-sm"
                style={{ backgroundColor: `${content.category.color}33` }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: content.category.color || "#C8951A" }}
                />
                {content.category.name}
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-xs font-medium text-white/60 bg-white/8 border border-white/8 backdrop-blur-sm">
              {TYPE_LABELS[content.type] ?? content.type}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
            className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-4"
          >
            {content.title}
          </motion.h1>

          {/* Meta row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
            className="flex items-center gap-3 text-white/50 text-sm mb-5"
          >
            {content.published_at && (
              <span>{new Date(content.published_at).getFullYear()}</span>
            )}
            {content.duration > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-white/25" />
                <span>{formatDuration(content.duration)}</span>
              </>
            )}
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
            className="text-white/70 text-base md:text-lg leading-relaxed mb-8 line-clamp-3"
          >
            {content.description}
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55, ease: "easeOut" }}
            className="flex flex-wrap items-center gap-3"
          >
            <Link href={primaryHref}>
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/92 font-semibold text-sm px-7 gap-2 h-11"
              >
                <PrimaryIcon className={`w-4 h-4 ${content.type === "video" && primaryHref !== "/subscribe" ? "fill-black" : ""}`} />
                {primaryLabel}
              </Button>
            </Link>
            <Link href={`/content/${content.id}`}>
              <Button
                size="lg"
                variant="outline"
                className="border-white/25 text-white bg-white/8 hover:bg-white/15 hover:border-white/40 font-medium text-sm px-7 gap-2 h-11 backdrop-blur-sm"
              >
                <Info className="w-4 h-4" />
                Más info
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Mute button */}
      {content.file_url && content.type === "video" && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          onClick={() => setMuted(!muted)}
          className="absolute bottom-16 right-4 md:bottom-28 md:right-8 w-10 h-10 rounded-full border border-white/25 bg-black/30 backdrop-blur-sm text-white hover:border-white/50 hover:bg-black/50 transition-all flex items-center justify-center"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </motion.button>
      )}
    </div>
  )
}
