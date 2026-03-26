import { createClient } from "@/lib/supabase/server"
import { Hero } from "@/components/content/hero"
import { ContentCarousel } from "@/components/content/content-carousel"
import type { Content, Category } from "@/types/database"

async function getFeaturedContent(): Promise<Content | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from("content")
    .select("*, category:categories(*), creator:creators(*)")
    .eq("featured", true)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .single()
  
  return data
}

async function getCategories(): Promise<Category[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
  
  return data || []
}

async function getContentByCategory(categoryId: string): Promise<Content[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from("content")
    .select("*, category:categories(*), creator:creators(*)")
    .eq("category_id", categoryId)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(10)
  
  return data || []
}

async function getLatestContent(): Promise<Content[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from("content")
    .select("*, category:categories(*), creator:creators(*)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(10)
  
  return data || []
}

export default async function HomePage() {
  const featuredContent = await getFeaturedContent()
  const categories = await getCategories()
  const latestContent = await getLatestContent()
  
  // Get content for each category
  const categoryContent = await Promise.all(
    categories.map(async (category) => ({
      category,
      content: await getContentByCategory(category.id),
    }))
  )

  return (
    <div className="bg-background">
      {/* Hero Section */}
      {featuredContent && <Hero content={featuredContent} />}
      
      {/* Content Sections */}
      <div className="relative z-10 -mt-20 space-y-4 pb-12">
        {/* Latest Content */}
        <ContentCarousel 
          title="Nuevos Lanzamientos" 
          content={latestContent}
        />
        
        {/* Category Sections */}
        {categoryContent.map(({ category, content }) => (
          content.length > 0 && (
            <ContentCarousel
              key={category.id}
              title={category.name}
              content={content}
              color={category.color}
            />
          )
        ))}
        
        {/* Featured Section (if different from hero) */}
        {featuredContent && (
          <ContentCarousel
            title="Destacados"
            content={[featuredContent]}
          />
        )}
      </div>
    </div>
  )
}
