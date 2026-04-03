"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Play, BookOpen, Lock, Headphones, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContentArtwork } from "@/components/content/content-artwork"
import { getContentAccessLabel, getPrimaryContentHref, getPrimaryContentLabel, isReadingContent } from "@/lib/content"
import Link from "next/link"
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
  const reduceMotion = useReducedMotion()
  const primaryHref = getPrimaryContentHref(content, isSubscribed)
  const primaryLabel = getPrimaryContentLabel(content, isSubscribed)
  const readingContent = isReadingContent(content)
  const accessLabel = getContentAccessLabel(content, isSubscribed)

  if (!content) return null

  const PrimaryIcon =
    primaryHref === "/subscribe"
      ? Lock
      : content.type === "audiobook"
      ? Headphones
      : readingContent
      ? BookOpen
      : Play

  return (
    <section className="relative min-h-[70vh] overflow-hidden flex items-end">
      {/* Background: full-bleed image with cinematic gradient */}
      <div className="absolute inset-0">
        <ContentArtwork content={content} variant="background" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--background))_0%,hsl(var(--background)/0.94)_32%,hsl(var(--background)/0.45)_62%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,hsl(var(--background))_0%,hsl(var(--background)/0.6)_35%,transparent_70%)]" />
      </div>

      <div className="relative w-full container mx-auto px-4 pb-16 pt-24 md:px-8 md:pb-20 md:pt-32 lg:pb-24">
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
          {/* Main content — dramatic typography */}
          <div className="max-w-3xl">
            {/* Category + type pills */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 flex flex-wrap items-center gap-2"
            >
              {content.category && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-foreground/85"
                  style={{ backgroundColor: `${content.category.color}22` }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: content.category.color || "#C8951A" }}
                  />
                  {content.category.name}
                </span>
              )}
              <span className="rounded-full bg-foreground/8 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                {TYPE_LABELS[content.type] ?? content.type}
              </span>
              {!content.is_free && (
                <span className="rounded-full bg-foreground/8 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  {accessLabel}
                </span>
              )}
              {content.is_free && (
                <span className="rounded-full bg-primary/15 px-3 py-1.5 text-xs font-bold text-primary">
                  Gratis
                </span>
              )}
            </motion.div>

            {/* Title — bold, massive, confident */}
            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6 font-display text-5xl font-bold leading-[0.92] tracking-tight text-foreground text-balance sm:text-6xl md:text-7xl lg:text-8xl"
            >
              {content.title}
            </motion.h1>

            {/* Metadata row */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground"
            >
              {content.author && <span className="font-medium">{content.author}</span>}
              {content.published_at && (
                <>
                  <span className="h-1 w-1 rounded-full bg-foreground/20" />
                  <span>{new Date(content.published_at).getFullYear()}</span>
                </>
              )}
              {content.duration > 0 && (
                <>
                  <span className="h-1 w-1 rounded-full bg-foreground/20" />
                  <span>{formatDuration(content.duration)}</span>
                </>
              )}
            </motion.div>

            {/* Description */}
            {content.description && (
              <motion.p
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.45 }}
                className="mb-10 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
              >
                {content.description}
              </motion.p>
            )}

            {/* CTAs — large, confident */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link href={primaryHref}>
                <Button
                  size="lg"
                  className="h-14 rounded-full bg-primary px-8 text-base font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <PrimaryIcon className={`mr-2.5 h-5 w-5 ${content.type === "video" && primaryHref !== "/subscribe" ? "fill-primary-foreground" : ""}`} />
                  {primaryLabel}
                </Button>
              </Link>
              <Link href={`/content/${content.id}`}>
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-14 rounded-full px-8 text-base font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/8 gap-2"
                >
                  Más info
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Sidebar — artwork card with presence */}
          <motion.aside
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-2xl">
              <div className={readingContent ? "aspect-[3/4]" : "aspect-[16/10]"}>
                <ContentArtwork content={content} showTypeLabel={false} />
              </div>
              <div className="p-4 space-y-1">
                <p className="text-sm font-semibold text-foreground">{content.title}</p>
                <p className="text-xs text-muted-foreground">
                  {content.author && `${content.author} · `}{TYPE_LABELS[content.type] ?? content.type}
                </p>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  )
}
