"use client"

import { cn } from "@/lib/utils"
import type { CSSProperties, ReactNode } from "react"

interface AnimatedShinyTextProps {
  children: ReactNode
  className?: string
  shimmerWidth?: number
}

export function AnimatedShinyText({
  children,
  className,
  shimmerWidth = 100,
}: AnimatedShinyTextProps) {
  return (
    <p
      style={
        {
          "--shimmer-width": `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        "mx-auto max-w-md text-foreground/60",
        "animate-shiny-text bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shimmer-width)_100%] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]",
        "bg-gradient-to-r from-transparent via-foreground/80 via-50% to-transparent",
        className
      )}
    >
      {children}
    </p>
  )
}
