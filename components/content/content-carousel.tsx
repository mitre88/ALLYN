"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ContentCard } from "./content-card"
import type { Content } from "@/types/database"

interface ContentCarouselProps {
  eyebrow?: string
  title: string
  description?: string
  content: Content[]
  color?: string
  isSubscribed?: boolean
}

export function ContentCarousel({
  eyebrow = "Colección",
  title,
  description,
  content,
  color,
  isSubscribed = false,
}: ContentCarouselProps) {
  const reduceMotion = useReducedMotion()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.82
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
      setTimeout(checkScrollability, 300)
    }
  }

  useEffect(() => {
    const handleResize = () => checkScrollability()

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [content.length])

  if (!content || content.length === 0) return null

  return (
    <section className="py-8 md:py-10 xl:py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reduceMotion ? 0 : 0.45, ease: "easeOut" }}
          className="mb-6 flex items-end justify-between gap-5 md:mb-7"
        >
          <div className="min-w-0 space-y-2.5">
            {/* Eyebrow with accent line */}
            <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.3em] text-foreground/38">
              <span
                className="h-px w-6 rounded-full flex-shrink-0"
                style={{
                  background: color
                    ? color
                    : "hsl(var(--primary) / 0.65)",
                }}
              />
              <span>{eyebrow}</span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-foreground text-balance md:text-[1.7rem] leading-tight">
              {title}
            </h2>

            {/* Description — only render when present and not too noisy */}
            {description && (
              <p className="max-w-xl text-sm leading-relaxed text-foreground/46 text-pretty">
                {description}
              </p>
            )}
          </div>

          {/* Count pill */}
          <div className="hidden shrink-0 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs tabular-nums text-foreground/35 md:block">
            {content.length.toString().padStart(2, "0")} títulos
          </div>
        </motion.div>
      </div>

      {/* Carousel Container */}
      <div className="container mx-auto px-4 md:px-8">
        <div className="group relative overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:p-5 md:p-6">
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              aria-label={`Desplazar ${title} a la izquierda`}
              className="absolute inset-y-0 left-0 z-10 hidden w-20 items-center justify-center bg-gradient-to-r from-background via-background/72 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:flex"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm transition-all hover:border-border hover:bg-background">
                <ChevronLeft className="h-4 w-4 text-foreground/70" />
              </div>
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              aria-label={`Desplazar ${title} a la derecha`}
              className="absolute inset-y-0 right-0 z-10 hidden w-20 items-center justify-center bg-gradient-to-l from-background via-background/72 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:flex"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm transition-all hover:border-border hover:bg-background">
                <ChevronRight className="h-4 w-4 text-foreground/70" />
              </div>
            </button>
          )}

          <div
            ref={scrollRef}
            onScroll={checkScrollability}
            className="flex gap-4 overflow-x-auto pb-1 scroll-smooth hide-scrollbar snap-x snap-proximity sm:gap-5 lg:gap-6"
          >
            {content.map((item, index) => (
              <motion.div
                key={item.id}
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reduceMotion ? 0 : index * 0.05 }}
              >
                <ContentCard content={item} isSubscribed={isSubscribed} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
