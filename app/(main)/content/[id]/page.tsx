import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Play, Plus, Share2, Clock, User, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContentArtwork } from "@/components/content/content-artwork"
import { ContentCarousel } from "@/components/content/content-carousel"
import { getPrimaryContentHref, getPrimaryContentLabel } from "@/lib/content"
import type { Content } from "@/types/database"
import { formatDuration } from "@/lib/utils"

interface ContentPageProps {
  params: Promise<{ id: string }>
}

async function getContent(id: string): Promise<Content | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("content")
    .select("*, category:categories(*)")
    .eq("id", id)
    .eq("status", "published")
    .single()
  return data
}

async function getRelatedContent(categoryId: string, excludeId: string): Promise<Content[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("content")
    .select("*, category:categories(*)")
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .eq("status", "published")
    .limit(6)
  return data || []
}

export async function generateMetadata({ params }: ContentPageProps) {
  const { id } = await params
  const content = await getContent(id)
  if (!content) return { title: "Contenido no encontrado - ALLYN" }
  return {
    title: `${content.title} - ALLYN`,
    description: content.description,
  }
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { id } = await params
  const content = await getContent(id)

  if (!content) notFound()

  // Get subscription status
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let isSubscribed = false
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_subscribed")
      .eq("id", user.id)
      .single()
    isSubscribed = profile?.is_subscribed ?? false
  }

  const relatedContent = content.category_id
    ? await getRelatedContent(content.category_id, content.id)
    : []

  const isBook = content.type === 'book' || content.type === 'audiobook'
  const primaryHref = getPrimaryContentHref(content, isSubscribed)
  const primaryLabel = getPrimaryContentLabel(content, isSubscribed)

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Image */}
      <div className="relative h-[50vh] md:h-[60vh]">
        <div className="absolute inset-0">
          <ContentArtwork content={content} variant="background" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            {content.category && (
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
                style={{
                  backgroundColor: content.category.color || '#6B21A8',
                  color: '#fff',
                }}
              >
                {content.category.name}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {content.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-white/70 mb-6">
              <span className="text-green-400 font-semibold">98% Match</span>
              {content.published_at && (
                <span>{new Date(content.published_at).getFullYear()}</span>
              )}
              {content.duration > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(content.duration)}
                </span>
              )}
              <span className="border border-white/30 px-1.5 py-0.5 rounded text-xs">HD</span>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              <Link href={primaryHref}>
                <Button size="lg" className="bg-white text-black hover:bg-white/90 font-semibold">
                  {isBook ? (
                    <>
                      <BookOpen className="w-5 h-5 mr-2" />
                      {primaryLabel}
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2 fill-black" />
                      {primaryLabel}
                    </>
                  )}
                </Button>
              </Link>
              <Button size="lg" variant="secondary" className="bg-white/20 text-white hover:bg-white/30 font-semibold">
                <Plus className="w-5 h-5 mr-2" />
                Mi Lista
              </Button>
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/10">
                <Share2 className="w-5 h-5 mr-2" />
                Compartir
              </Button>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-2">Descripción</h2>
              <p className="text-white/70 leading-relaxed">{content.description}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card/50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
                Detalles
              </h3>

              {content.author && (
                <div className="mb-4">
                  <span className="text-white/50 text-sm">Autor</span>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-white/70" />
                    <span className="text-white">{content.author}</span>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <span className="text-white/50 text-sm">Tipo de contenido</span>
                <p className="text-white capitalize mt-1">{content.type}</p>
              </div>

              {content.published_at && (
                <div className="mb-4">
                  <span className="text-white/50 text-sm">Publicado</span>
                  <p className="text-white mt-1">
                    {new Date(content.published_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {relatedContent.length > 0 && (
          <div className="mt-12">
            <ContentCarousel
              title="Contenido relacionado"
              content={relatedContent}
              isSubscribed={isSubscribed}
            />
          </div>
        )}
      </div>
    </div>
  )
}
