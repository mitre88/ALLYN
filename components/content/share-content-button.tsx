"use client"

import { useState } from "react"
import { Share2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ShareContentButtonProps {
  className?: string
  description?: string
  title: string
}

export function ShareContentButton({
  className,
  description,
  title,
}: ShareContentButtonProps) {
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async () => {
    try {
      setIsSharing(true)

      if (navigator.share) {
        await navigator.share({
          text: description,
          title,
          url: window.location.href,
        })
        return
      }

      await navigator.clipboard.writeText(window.location.href)
      toast.success("Enlace copiado")
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return
      }

      toast.error("No se pudo compartir el contenido")
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Button
      aria-label={`Compartir ${title}`}
      className={cn(className)}
      disabled={isSharing}
      onClick={handleShare}
      size="lg"
      type="button"
      variant="ghost"
    >
      <Share2 className="mr-2 h-4 w-4" />
      {isSharing ? "Compartiendo..." : "Compartir"}
    </Button>
  )
}
