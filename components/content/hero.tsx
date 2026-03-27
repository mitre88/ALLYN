"use client"

import { motion } from "framer-motion"
import { Play, Info, Volume2, VolumeX, BookOpen, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContentArtwork } from "@/components/content/content-artwork"
import { getPrimaryContentHref, getPrimaryContentLabel } from "@/lib/content"
import Link from "next/link"
import { useState } from "react"
import type { Content } from "@/types/database"
import { formatDuration } from "@/lib/utils"

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

  return (
    <div className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat">
        <ContentArtwork content={content} variant="background" />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 hero-gradient" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-end pb-20 md:pb-32">
        <div className="max-w-2xl">
          {/* Category Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span 
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ 
                backgroundColor: content.category?.color || '#6B21A8',
                color: '#fff'
              }}
            >
              {content.category?.name}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight"
          >
            {content.title}
          </motion.h1>

          {/* Meta */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center gap-4 text-white/80 mb-4 text-sm"
          >
            <span className="text-green-400 font-semibold">98% Match</span>
            {content.published_at && <span>{new Date(content.published_at).getFullYear()}</span>}
            <span className="border border-white/30 px-1.5 py-0.5 rounded text-xs">
              {content.type === 'video' ? 'HD' : content.type}
            </span>
            {content.duration && (
              <span>{formatDuration(content.duration)}</span>
            )}
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-white/80 text-base md:text-lg mb-8 line-clamp-3"
          >
            {content.description}
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Link href={primaryHref}>
              <Button size="lg" className="bg-white text-black hover:bg-white/90 font-semibold text-base px-8">
                {primaryHref === "/subscribe" ? (
                  <Lock className="w-5 h-5 mr-2" />
                ) : isReadingContent ? (
                  <BookOpen className="w-5 h-5 mr-2" />
                ) : (
                  <Play className="w-5 h-5 mr-2 fill-black" />
                )}
                {primaryLabel}
              </Button>
            </Link>
            <Link href={`/content/${content.id}`}>
              <Button size="lg" variant="secondary" className="bg-white/20 text-white hover:bg-white/30 font-semibold text-base px-8">
                <Info className="w-5 h-5 mr-2" />
                Más información
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Mute Button (if video) */}
        {content.file_url && content.type === 'video' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            onClick={() => setMuted(!muted)}
            className="absolute bottom-20 right-4 md:bottom-32 md:right-8 p-3 rounded-full border-2 border-white/30 text-white hover:border-white hover:bg-white/10 transition-all"
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </motion.button>
        )}
      </div>
    </div>
  )
}
