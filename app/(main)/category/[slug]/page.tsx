import { createClient } from "@/lib/supabase/server"
import { ContentCarousel } from "@/components/content/content-carousel"
import { notFound } from "next/navigation"
import type { Category, Content } from "@/types/database"

interface CategoryPageProps {
  params: { slug: string }
}

async function getCategory(slug: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single()
  
  return data
}

async function getContentByCategory(categoryId: string): Promise<Content[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("content")
    .select("*, category:categories(*), creator:creators(*)")
    .eq("category_id", categoryId)
    .eq("status", "published")
    .order("published_at", { ascending: false })
  
  return data || []
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const category = await getCategory(params.slug)
  
  if (!category) {
    return {
      title: "Categoría no encontrada - ALLYN",
    }
  }
  
  return {
    title: `${category.name} - ALLYN`,
    description: category.description,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategory(params.slug)
  
  if (!category) {
    notFound()
  }
  
  const content = await getContentByCategory(category.id)
  
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Category Header */}
        <div className="mb-8">
          <div 
            className="w-16 h-1 rounded-full mb-4"
            style={{ backgroundColor: category.color }}
          />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {category.name}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl">
            {category.description}
          </p>
        </div>
        
        {/* Content Grid */}
        {content.length > 0 ? (
          <ContentCarousel 
            title={`Todo en ${category.name}`}
            content={content}
            color={category.color}
          />
        ) : (
          <div className="text-center py-20">
            <p className="text-white/50 text-lg">
              No hay contenido disponible en esta categoría aún.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
