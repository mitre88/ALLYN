"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ChevronLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Content } from "@/types/database"

interface WatchPageProps {
  params: { id: string }
}

export default function WatchPage({ params }: WatchPageProps) {
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchContent() {
      const { data, error } = await supabase
        .from("content")
        .select("*, category:categories(*), creator:creators(*)")
        .eq("id", params.id)
        .eq("status", "published")
        .single()

      if (error || !data) {
        router.push("/")
        return
      }

      setContent(data)
      setLoading(false)

      // Track view
      await supabase.from("content_views").upsert({
        content_id: params.id,
        profile_id: (await supabase.auth.getUser()).data.user?.id,
        total_seconds: data.duration || 0,
        watched_at: new Date().toISOString(),
      })
    }

    fetchContent()
  }, [params.id, router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-white">Cargando...</div>
      </div>
    )
  }

  if (!content) return null

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 flex items-center gap-4">
        <Link href={`/content/${content.id}`}>
          <button className="flex items-center gap-2 text-white hover:text-white/80 transition-colors">
            <ChevronLeft className="w-6 h-6" />
            <span className="font-medium">{content.title}</span>
          </button>
        </Link>
      </div>

      {/* Video Player */}
      <div className="w-full h-screen flex items-center justify-center">
        {content.video_url ? (
          <iframe
            src={content.video_url}
            title={content.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="text-center text-white">
            <p className="text-xl mb-4">Video no disponible</p>
            <Link href={`/content/${content.id}`}>
              <button className="flex items-center gap-2 mx-auto px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Volver al contenido
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
