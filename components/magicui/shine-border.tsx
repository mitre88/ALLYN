"use client"

import { cn } from "@/lib/utils"

interface ShineBorderProps {
  borderRadius?: number
  borderWidth?: number
  duration?: number
  shineColor?: string
  className?: string
  children: React.ReactNode
}

export function ShineBorder({
  borderRadius = 8,
  borderWidth = 1,
  duration = 14,
  shineColor = "#000000",
  className,
  children,
}: ShineBorderProps) {
  return (
    <div
      style={
        {
          "--border-radius": `${borderRadius}px`,
          "--border-width": `${borderWidth}px`,
          "--duration": `${duration}s`,
          "--mask-linear-gradient": `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          "--background-radial-gradient": `radial-gradient(transparent,transparent, ${shineColor instanceof Array ? shineColor.join(",") : shineColor},transparent,transparent)`,
        } as React.CSSProperties
      }
      className={cn(
        "relative rounded-[var(--border-radius)] bg-white p-[var(--border-width)]",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[var(--border-radius)]",
          "bg-[linear-gradient(var(--mask-linear-gradient))]",
          "before:absolute before:inset-0 before:aspect-square before:bg-[var(--background-radial-gradient)]",
          "before:animate-shine before:size-full"
        )}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
