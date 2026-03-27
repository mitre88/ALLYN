'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Lock, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AudioPlayer } from '@/components/content/audio-player'
import { ContentArtwork } from '@/components/content/content-artwork'
import type { Content } from '@/types/database'

export default function ReadPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [content, setContent] = useState<Content | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const fetchContent = useCallback(async () => {
    try {
      // Get user session
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)

      let subscribed = false
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_subscribed')
          .eq('id', user.id)
          .single()
        subscribed = profile?.is_subscribed ?? false
        setIsSubscribed(subscribed)
      }

      // Get content metadata
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

      // Fetch appropriate signed URL
      if (subscribed) {
        const res = await fetch(`/api/content/${id}/stream`)
        if (res.ok) {
          const { url } = await res.json()
          setPdfUrl(url)
        } else {
          setError('No se pudo cargar el archivo.')
        }
      } else {
        const res = await fetch(`/api/content/${id}/preview`)
        if (res.ok) {
          const { url } = await res.json()
          setPdfUrl(url)
        }
        // If no preview, pdfUrl stays null — we'll show the lock overlay
      }
    } catch (err) {
      console.error('[ReadPage] Error:', err)
      setError('Ocurrió un error al cargar el contenido.')
    } finally {
      setLoading(false)
    }
  }, [id, router, supabase])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <BookOpen className="w-10 h-10 text-purple-400 animate-pulse" />
          <p className="text-zinc-400 text-sm">Cargando libro...</p>
        </div>
      </div>
    )
  }

  if (!content) return null

  const audioText = [content.title, content.author ? `por ${content.author}` : '', content.description]
    .filter(Boolean)
    .join('. ')

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Top nav */}
      <div className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
        <Link href={`/content/${content.id}`}>
          <button className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:block">{content.title}</span>
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{content.title}</p>
          {content.author && (
            <p className="text-xs text-zinc-500 truncate">{content.author}</p>
          )}
        </div>
        {!isSubscribed && (
          <Link href="/subscribe">
            <button className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors">
              <Lock className="w-3 h-3" />
              Suscribirse
            </button>
          </Link>
        )}
      </div>

      {/* PDF viewer */}
      <div className="relative w-full" style={{ height: 'calc(100vh - 57px - 220px)' }}>
        {pdfUrl ? (
          <div
            className="relative w-full h-full select-none"
            onContextMenu={e => e.preventDefault()}
          >
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              title={content.title}
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts"
              style={{ pointerEvents: isSubscribed ? 'auto' : 'none' }}
            />

            {/* Preview blur overlay for non-subscribers */}
            {!isSubscribed && (
              <div className="absolute bottom-0 left-0 right-0 h-2/3 pointer-events-none"
                style={{
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(9,9,11,0.85) 50%, rgba(9,9,11,1) 100%)',
                }}
              />
            )}
          </div>
        ) : (
          <div className="relative w-full h-full overflow-hidden bg-zinc-900">
            <ContentArtwork content={content} className="absolute inset-0" />
            <div className="absolute inset-0 bg-black/45" />
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <div className="text-center text-white/80">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-70" />
                <p className="text-sm font-medium">Vista previa no disponible</p>
                <p className="mt-2 text-xs text-white/55">
                  Este contenido necesita un archivo de preview para mostrarse aquí.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lock overlay for non-subscribers */}
        {!isSubscribed && (
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-8 px-4 pointer-events-none">
            <div className="pointer-events-auto text-center max-w-sm">
              <div className="w-14 h-14 rounded-full bg-zinc-900 border border-purple-500/40 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">
                {pdfUrl ? 'Solo estás viendo una vista previa' : 'Contenido Premium'}
              </h3>
              <p className="text-zinc-400 text-sm mb-4">
                Suscríbete para leer el libro completo y acceder a todo el contenido.
              </p>
              <Link href="/subscribe">
                <button className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-3 rounded-full transition-colors shadow-lg shadow-purple-900/40">
                  Suscribirse para leer completo
                </button>
              </Link>
              {!isLoggedIn && (
                <p className="mt-3 text-xs text-zinc-500">
                  ¿Ya tienes cuenta?{' '}
                  <Link href="/login" className="text-purple-400 hover:underline">
                    Inicia sesión
                  </Link>
                </p>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Audio player section */}
      <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-5">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs text-zinc-600 uppercase tracking-wider mb-3 font-medium">
            Escuchar resumen
          </p>
          <AudioPlayer text={audioText} title={content.title} />
        </div>
      </div>
    </div>
  )
}
