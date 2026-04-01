'use client'

import { useEffect, useState } from 'react'
import { Play, Loader2, AlertCircle } from 'lucide-react'

interface VideoPlayerProps {
  contentId: string
  isSubscribed: boolean
  isFree: boolean
}

export function VideoPlayer({ contentId, isSubscribed, isFree }: VideoPlayerProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchVideoUrl() {
      try {
        const hasFullAccess = isSubscribed || isFree
        const endpoint = hasFullAccess
          ? `/api/content/${contentId}/stream`
          : `/api/content/${contentId}/preview`

        const res = await fetch(endpoint)
        if (!res.ok) {
          setError('No se pudo cargar el video')
          return
        }

        const data = await res.json()
        if (data.url) {
          setVideoUrl(data.url)
        } else {
          setError('URL de video no disponible')
        }
      } catch {
        setError('Error al cargar el video')
      } finally {
        setLoading(false)
      }
    }

    fetchVideoUrl()
  }, [contentId, isSubscribed, isFree])

  if (loading) {
    return (
      <div className="aspect-video w-full rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-foreground/40">Cargando video...</p>
        </div>
      </div>
    )
  }

  if (error || !videoUrl) {
    return (
      <div className="aspect-video w-full rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="h-8 w-8 text-foreground/30" />
          <p className="text-sm text-foreground/40">{error || 'Video no disponible'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
      <video
        key={videoUrl}
        className="h-full w-full"
        controls
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        onContextMenu={e => e.preventDefault()}
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
        Tu navegador no soporta la reproduccion de video.
      </video>
    </div>
  )
}
