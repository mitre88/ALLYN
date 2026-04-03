"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Play, Info, BookOpen, Lock, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContentArtwork } from "@/components/content/content-artwork"
import { getContentAccessLabel, getPrimaryContentHref, getPrimaryContentLabel, isReadingContent } from "@/lib/content"
import Link from "next/link"
import type { Content } from "@/types/database"
import { formatDuration } from "@/lib/utils"
import { BorderBeam } from "@/components/magicui/border-beam"
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"

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

  const heroNote = readingContent
    ? "Una lectura seleccionada para entrar al catálogo con foco y menos fricción."
    : "Una pieza elegida para abrir tu sesión con energía, contexto y una acción clara."

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <ContentArtwork content={content} variant="background" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--background))_0%,hsl(var(--background)/0.90)_34%,hsl(var(--background)/0.58)_58%,hsl(var(--background)/0.22)_100%)]" />
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--foreground)/0.06),transparent_24%),linear-gradient(180deg,hsl(var(--background)/0.06)_0%,hsl(var(--background)/0.3)_55%,hsl(var(--background))_100%)]" />
        <div className="absolute left-8 top-20 h-44 w-44 rounded-full bg-primary/20 blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-glow-pulse" />
      </div>

      <div className="relative container mx-auto px-4 pb-16 pt-12 md:px-8 md:pb-24 md:pt-16 lg:pt-20">
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1.1fr)_360px] lg:gap-12">
          <div className="max-w-2xl">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.12, ease: "easeOut" }}
              className="mb-5 flex flex-wrap items-center gap-2.5"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-[var(--glass-bg)] px-3.5 py-1.5 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <AnimatedShinyText className="text-[11px] font-medium uppercase tracking-[0.28em]">
                  Portada Curada
                </AnimatedShinyText>
              </span>
              {content.category && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/40 px-3 py-1.5 text-xs font-semibold text-foreground/88 backdrop-blur-sm"
                  style={{ backgroundColor: `${content.category.color}26` }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: content.category.color || "#C8951A" }}
                  />
                  {content.category.name}
                </span>
              )}
              <span className="rounded-full border border-border/40 bg-[var(--glass-bg)] px-3 py-1.5 text-xs font-medium text-foreground/62">
                {TYPE_LABELS[content.type] ?? content.type}
              </span>
              <span className="rounded-full border border-border/40 bg-[var(--glass-bg)] px-3 py-1.5 text-xs font-medium text-foreground/52">
                {accessLabel}
              </span>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
              className="mb-5 space-y-4"
            >
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-foreground/38">
                <span className="h-px w-10 rounded-full bg-primary/70" />
                <span>Selección editorial</span>
              </div>
              <h1 className="font-display text-5xl font-semibold leading-[0.96] text-foreground text-balance md:text-7xl">
                {content.title}
              </h1>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.32, ease: "easeOut" }}
              className="mb-6 flex flex-wrap items-center gap-3 text-sm text-foreground/54"
            >
              {content.author && <span>{content.author}</span>}
              {content.published_at && (
                <>
                  <span className="h-1 w-1 rounded-full bg-foreground/24" />
                  <span>{new Date(content.published_at).getFullYear()}</span>
                </>
              )}
              {content.duration > 0 && (
                <>
                  <span className="h-1 w-1 rounded-full bg-foreground/24" />
                  <span>{formatDuration(content.duration)}</span>
                </>
              )}
            </motion.div>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.42, ease: "easeOut" }}
              className="mb-8 max-w-2xl text-base leading-relaxed text-foreground/72 md:text-lg"
            >
              {content.description}
            </motion.p>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.52, ease: "easeOut" }}
              className="flex flex-wrap items-center gap-3"
            >
              <Link href={primaryHref}>
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-foreground px-7 text-sm font-semibold text-background shadow-[0_16px_36px_hsl(var(--foreground)/0.18)] hover:bg-foreground/92"
                >
                  <PrimaryIcon className={`mr-2 h-4 w-4 ${content.type === "video" && primaryHref !== "/subscribe" ? "fill-background" : ""}`} />
                  {primaryLabel}
                </Button>
              </Link>
              <Link href={`/content/${content.id}`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-border/40 bg-[var(--glass-bg)] px-7 text-sm font-medium text-foreground hover:border-border/60 hover:bg-[var(--glass-bg-strong)]"
                >
                  <Info className="mr-2 h-4 w-4" />
                  Más info
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.aside
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : 0.4, ease: "easeOut" }}
            className="hidden lg:flex lg:flex-col lg:gap-4"
          >
            <div className="relative overflow-hidden rounded-[30px] border border-border/40 bg-card/80 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.10)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
              <BorderBeam size={180} duration={14} colorFrom="hsl(var(--primary))" colorTo="hsl(var(--primary) / 0.15)" />
              <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/38">
                Pieza de hoy
              </p>
              <div className="mt-4 overflow-hidden rounded-[24px] border border-border/30 bg-muted/50">
                <div className={readingContent ? "aspect-[4/5]" : "aspect-[16/10]"}>
                  <ContentArtwork content={content} showTypeLabel={false} />
                </div>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-foreground/62">
                <InfoRow label="Formato" value={TYPE_LABELS[content.type] ?? content.type} />
                <InfoRow label="Acceso" value={accessLabel} />
                <InfoRow label="Enfoque" value={content.category?.name || "Colección"} />
              </div>
            </div>

            <div className="rounded-[24px] border border-border/40 bg-[var(--glass-bg)] p-4 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/38">
                Por qué empezar aquí
              </p>
              <p className="mt-3 text-sm leading-relaxed text-foreground/68">
                {heroNote}
              </p>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/30 bg-[var(--glass-bg)] px-3 py-2.5">
      <span className="text-[11px] uppercase tracking-[0.24em] text-foreground/34">
        {label}
      </span>
      <span className="text-right text-sm font-medium text-foreground/82">{value}</span>
    </div>
  )
}
