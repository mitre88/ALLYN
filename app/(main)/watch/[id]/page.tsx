'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Crown, Lock, Play } from 'lucide-react'
import { ContentArtwork } from '@/components/content/content-artwork'
import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/types/database'

const FALLBACK_PREVIEW_SECONDS = 90

export default function WatchPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [content, setContent] = useState<Content | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [previewSource, setPreviewSource] = useState<'preview' | 'file' | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [previewEnded, setPreviewEnded] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const fetchContent = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)

      let subscribed = false
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_subscribed, role')
          .eq('id', user.id)
          .single()
        subscribed = (profile?.is_subscribed || profile?.role === 'admin') ?? false
        setIsSubscribed(subscribed)
      }

      const { data: contentData, error: contentError } = await supabase
        .from('content')
        .select('*, category:categories(*)')
        .eq('id', id)
        .eq('status', 'published')
        .single()

      if (contentError || !contentData) {
        router.push('/')
        return
      }

      setContent(contentData)

      const isFree = contentData.is_free

      if (subscribed || isFree) {
        // Full access: use stream API (auth required) or preview for free content
        const endpoint = isFree && !subscribed
          ? `/api/content/${id}/preview`
          : `/api/content/${id}/stream`
        const res = await fetch(endpoint)
        if (res.ok) {
          const { url } = await res.json()
          setVideoUrl(url)
        }
      } else {
        // Non-subscribers: try preview URL (90s fragment)
        const res = await fetch(`/api/content/${id}/preview`)
        if (res.ok) {
          const { url, source } = await res.json()
          setVideoUrl(url)
          setPreviewSource(source ?? 'preview')
        }
      }
    } catch (err) {
      console.error('[WatchPage] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [id, router, supabase])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Play className="w-10 h-10 text-primary animate-pulse" />
          <p className="text-zinc-400 text-sm">Cargando video...</p>
        </div>
      </div>
    )
  }

  if (!content) return null

  const isFree = content.is_free
  const hasFullAccess = isSubscribed || isFree

  // Preview time limit only for non-subscribers on non-free content using file fallback
  const previewLimitSeconds =
    !hasFullAccess && previewSource === 'file'
      ? Math.min(content.duration || FALLBACK_PREVIEW_SECONDS, FALLBACK_PREVIEW_SECONDS)
      : null

  const showLockOverlay = !hasFullAccess && (previewEnded || !videoUrl)

  const handlePreviewBoundary = (video: HTMLVideoElement) => {
    if (!previewLimitSeconds || previewEnded) return
    if (video.currentTime >= previewLimitSeconds) {
      video.currentTime = previewLimitSeconds
      video.pause()
      setPreviewEnded(true)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top nav */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent px-4 py-4 flex items-center gap-3">
        <Link href={`/content/${content.id}`}>
          <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
            <span className="font-medium text-sm hidden sm:block">{content.title}</span>
          </button>
        </Link>
        <div className="flex-1" />
        {isFree && (
          <span className="bg-primary/15 border border-primary/25 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
            Gratis
          </span>
        )}
        {!hasFullAccess && (
          <Link href="/subscribe">
            <button className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full transition-colors">
              <Crown className="w-3 h-3" />
              $499/mes
            </button>
          </Link>
        )}
      </div>

      {/* Video container — proper aspect ratio, centered */}
      <div className="relative flex-1 flex items-center justify-center px-0 pt-14">
        {videoUrl && !showLockOverlay ? (
          <div className="relative w-full max-w-6xl mx-auto" style={{ aspectRatio: '16/9', maxHeight: '80vh' }}>
            <video
              key={videoUrl}
              className="absolute inset-0 w-full h-full rounded-none sm:rounded-lg"
              controls
              autoPlay
              controlsList="nodownload noremoteplayback"
              disablePictureInPicture
              onContextMenu={e => e.preventDefault()}
              onTimeUpdate={e => !hasFullAccess && handlePreviewBoundary(e.currentTarget)}
              onSeeking={e => !hasFullAccess && handlePreviewBoundary(e.currentTarget)}
              onEnded={() => { if (!hasFullAccess) setPreviewEnded(true) }}
            >
              <source src={videoUrl} />
              Tu navegador no soporta la reproducción de video.
            </video>
          </div>
        ) : (
          <div className="absolute inset-0 bg-cover bg-center">
            <ContentArtwork content={content} variant="background" />
            <div className="absolute inset-0 bg-black/60" />
          </div>
        )}

        {/* Lock overlay for non-subscribers */}
        {showLockOverlay && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 z-20">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 rounded-full bg-black/70 border border-primary/30 flex items-center justify-center mx-auto mb-5">
                <Lock className="w-9 h-9 text-primary" />
              </div>
              <h2 className="text-white font-bold text-2xl mb-2">
                {previewEnded ? 'Fragmento finalizado' : 'Contenido Premium'}
              </h2>
              <p className="text-zinc-400 text-sm mb-6">
                {previewEnded
                  ? 'Ya viste un fragmento. Suscríbete para ver el video completo.'
                  : 'Este video está disponible solo para suscriptores.'}
              </p>
              <Link href="/subscribe">
                <button className="flex items-center gap-2 mx-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10 py-3 rounded-full transition-colors shadow-lg shadow-primary/25 text-base">
                  <Crown className="w-4 h-4" />
                  Suscribirse — $499/mes
                </button>
              </Link>
              {!isLoggedIn && (
                <p className="mt-4 text-xs text-zinc-500">
                  ¿Ya tienes cuenta?{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    Inicia sesión
                  </Link>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Bottom gradient while preview plays */}
        {!hasFullAccess && !previewEnded && videoUrl && (
          <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
            style={{ height: '25%', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))' }}
          />
        )}

        {/* Preview badge */}
        {!hasFullAccess && videoUrl && !previewEnded && (
          <div className="absolute top-16 right-4 z-20 bg-black/70 border border-primary/30 rounded-full px-3 py-1.5 flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-primary" />
            <span className="text-xs text-primary font-medium">
              {previewLimitSeconds ? `Fragmento ${previewLimitSeconds}s` : 'Vista previa'}
            </span>
          </div>
        )}
      </div>

      {/* Below video: metadata */}
      <div className="bg-zinc-950 px-6 py-6 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-white text-xl font-bold mb-1">{content.title}</h1>
          {content.author && (
            <p className="text-zinc-400 text-sm mb-3">{content.author}</p>
          )}
          {content.description && (
            <p className="text-zinc-500 text-sm leading-relaxed">{content.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
