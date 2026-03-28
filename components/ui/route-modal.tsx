"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

interface RouteModalProps {
  children: React.ReactNode
  title: string
}

export function RouteModal({ children, title }: RouteModalProps) {
  const router = useRouter()

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        router.back()
      }
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [router])

  return (
    <div
      aria-label={title}
      aria-modal="true"
      className="fixed inset-0 z-[90]"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/72 backdrop-blur-md" />

      <button
        aria-label="Cerrar lector"
        className="absolute right-4 top-4 z-[95] flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-black/40 text-white/78 transition-colors hover:bg-black/60 hover:text-white"
        onClick={() => router.back()}
        type="button"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative h-full overflow-y-auto">{children}</div>
    </div>
  )
}
