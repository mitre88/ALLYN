"use client"

import { useEffect, useRef, useState } from "react"
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
  eyebrow = "Coleccion",
  title,
  description,
  content,
  color,
  isSubscribed = false,
}: ContentCarouselProps) {
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
      {/* Header */}
      <div className="container mx-auto px-4 mb-5 md:mb-6">
        <div className="flex items-end justify-between gap-5">
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <span
                className="h-px w-6 flex-shrink-0"
                style={{ background: color || "hsl(var(--primary) / 0.6)" }}
              />
              <span>{eyebrow}</span>
            </div>
            <h2 className="text-xl font-semibold text-foreground text-balance md:text-2xl leading-tight">
              {title}
            </h2>
            {description && (
              <p className="max-w-lg text-sm leading-relaxed text-muted-foreground text-pretty">
                {description}
              </p>
            )}
          </div>
          <div className="hidden shrink-0 text-xs tabular-nums text-muted-foreground md:block">
            {content.length.toString().padStart(2, "0")} titulos
          </div>
        </div>
      </div>

      {/* Carousel — no container, cards directly on page */}
      <div className="container mx-auto px-4 md:px-8">
        <div className="group relative">
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              aria-label={`Desplazar ${title} a la izquierda`}
              className="absolute inset-y-0 left-0 z-10 hidden w-16 items-center justify-center bg-gradient-to-r from-background to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:flex"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background shadow-sm">
                <ChevronLeft className="h-4 w-4 text-foreground/60" />
              </div>
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              aria-label={`Desplazar ${title} a la derecha`}
              className="absolute inset-y-0 right-0 z-10 hidden w-16 items-center justify-center bg-gradient-to-l from-background to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:flex"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background shadow-sm">
                <ChevronRight className="h-4 w-4 text-foreground/60" />
              </div>
            </button>
          )}

          <div
            ref={scrollRef}
            onScroll={checkScrollability}
            className="flex gap-4 overflow-x-auto pb-2 scroll-smooth hide-scrollbar snap-x snap-proximity sm:gap-5 lg:gap-6"
          >
            {content.map((item) => (
              <ContentCard key={item.id} content={item} isSubscribed={isSubscribed} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
