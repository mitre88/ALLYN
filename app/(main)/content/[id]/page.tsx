import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Play, Plus, Share2, Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContentCarousel } from "@/components/content/content-carousel"
import type { Content } from "@/types/database"
import { formatDuration } from "@/lib/utils"

interface ContentPageProps {
  params: { id: string }
}

async function getContent(id: string): Promise<Content | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from("content")
    .select("*, category:categories(*), creator:creators(*)")
    .eq("id", id)
    .eq("status", "published")
    .single()
  
  return data
}

async function getRelatedContent(categoryId: string, excludeId: string): Promise<Content[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from("content")
    .select("*, category:categories(*), creator:creators(*)")
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .eq("status", "published")
    .limit(6)
  
  return data || []
}

export async function generateMetadata({ params }: ContentPageProps) {
  const content = await getContent(params.id)
  
  if (!content) {
    return {
      title: "Contenido no encontrado - ALLYN",
    }
  }
  
  return {
    title: `${content.title} - ALLYN`,
    description: content.description,
  }
}

export default async function ContentPage({ params }: ContentPageProps) {
  const content = await getContent(params.id)
  
  if (!content) {
    notFound()
  }
  
  const relatedContent = content.category_id 
    ? await getRelatedContent(content.category_id, content.id)
    : []
  
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Image */}
      <div className="relative h-[50vh] md:h-[60vh]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${content.thumbnail_url})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            {/* Category Badge */}
            <span 
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ 
                backgroundColor: content.category?.color || '#6B21A8',
                color: '#fff'
              }}
            >
              {content.category?.name}
            </span>
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {content.title}
            </h1>
            
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-white/70 mb-6">
              <span className="text-green-400 font-semibold">98% Match</span>
              <span>{new Date(content.published_at).getFullYear()}</span>
              {content.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(content.duration)}
                </span>
              )}
              <span className="border border-white/30 px-1.5 py-0.5 rounded text-xs">
                HD
              </span>
            </div>
            
            {/* Actions */}
            <div className="flex flex-wrap gap-4 mb-8">
              <Link href={`/watch/${content.id}`}>
                <Button size="lg" className="bg-white text-black hover:bg-white/90 font-semibold">
                  <Play className="w-5 h-5 mr-2 fill-black" />
                  Reproducir
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
            
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-2">Descripción</h2>
              <p className="text-white/70 leading-relaxed">
                {content.description}
              </p>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card/50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
                Detalles
              </h3>
              
              {content.creator && (
                <div className="mb-4">
                  <span className="text-white/50 text-sm">Creador</span>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-white/70" />
                    <span className="text-white">{content.creator.name}</span>
                  </div>
                </div>
              )}
              
              <div className="mb-4">
                <span className="text-white/50 text-sm">Tipo de contenido</span>
                <p className="text-white capitalize mt-1">{content.type}</p>
              </div>
              
              <div className="mb-4">
                <span className="text-white/50 text-sm">Publicado</span>
                <p className="text-white mt-1">
                  {new Date(content.published_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              {content.creator?.bio && (
                <div className="pt-4 border-t border-border">
                  <span className="text-white/50 text-sm">Sobre el creador</span>
                  <p className="text-white/70 text-sm mt-1">{content.creator.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Related Content */}
        {relatedContent.length > 0 && (
          <div className="mt-12">
            <ContentCarousel
              title="Contenido relacionado"
              content={relatedContent}
            />
          </div>
        )}
      </div>
    </div>
  )
}
