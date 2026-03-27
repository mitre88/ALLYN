"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
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
      const scrollAmount = window.innerWidth * 0.8
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
      setTimeout(checkScrollability, 300)
    }
  }

  if (!content || content.length === 0) return null

  return (
    <section className="py-7 md:py-9">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="mb-5 flex items-end justify-between gap-4 md:mb-6"
        >
          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-white/40">
              <span
                className="h-px w-8 rounded-full bg-white/18"
                style={color ? { backgroundColor: color } : undefined}
              />
              <span>{eyebrow}</span>
            </div>
            <h2 className="text-xl font-semibold text-white text-balance md:text-[1.65rem]">
              {title}
            </h2>
            {description && (
              <p className="max-w-2xl text-sm leading-relaxed text-white/55 text-pretty">
                {description}
              </p>
            )}
          </div>

          <div className="hidden shrink-0 rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs tabular-nums text-white/35 md:block">
            {content.length.toString().padStart(2, "0")} títulos
          </div>
        </motion.div>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            aria-label={`Desplazar ${title} a la izquierda`}
            className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-background to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <ChevronLeft className="w-10 h-10 text-white" />
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            aria-label={`Desplazar ${title} a la derecha`}
            className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-background to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <ChevronRight className="w-10 h-10 text-white" />
          </button>
        )}

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          onScroll={checkScrollability}
          className="flex gap-4 overflow-x-auto hide-scrollbar px-4 md:px-12 scroll-smooth"
        >
          {content.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <ContentCard content={item} isSubscribed={isSubscribed} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
