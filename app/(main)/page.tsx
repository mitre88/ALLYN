import { createClient } from "@/lib/supabase/server"
import { Hero } from "@/components/content/hero"
import { ContentCarousel } from "@/components/content/content-carousel"
import type { Content, Category } from "@/types/database"

async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("profiles")
    .select("is_subscribed")
    .eq("id", userId)
    .single()
  return data
}

async function getFeaturedContent(): Promise<Content | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("content")
    .select("*, category:categories(*)")
    .eq("featured", true)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .single()
  return data
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
  return data || []
}

async function getContentByCategory(categoryId: string): Promise<Content[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("content")
    .select("*, category:categories(*)")
    .eq("category_id", categoryId)
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .limit(10)
  return data || []
}

async function getLatestContent(): Promise<Content[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("content")
    .select("*, category:categories(*)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(10)
  return data || []
}

async function getBookContent(): Promise<Content[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("content")
    .select("*, category:categories(*)")
    .in("type", ["book", "audiobook"])
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(10)
  return data || []
}

async function getVideoContent(): Promise<Content[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("content")
    .select("*, category:categories(*)")
    .in("type", ["video", "course"])
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(10)
  return data || []
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const profile = user ? await getProfile(user.id) : null
  const isSubscribed = profile?.is_subscribed ?? false

  const [featuredContent, categories, latestContent, books, videos] = await Promise.all([
    getFeaturedContent(),
    getCategories(),
    getLatestContent(),
    getBookContent(),
    getVideoContent(),
  ])

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
        {/* Latest */}
        <ContentCarousel
          title="Nuevos Lanzamientos"
          content={latestContent}
          isSubscribed={isSubscribed}
        />

        {/* Subscriber-only sections */}
        {isSubscribed && books.length > 0 && (
          <ContentCarousel
            title="Mis Libros"
            content={books}
            isSubscribed={isSubscribed}
          />
        )}

        {isSubscribed && videos.length > 0 && (
          <ContentCarousel
            title="Mis Videos"
            content={videos}
            isSubscribed={isSubscribed}
          />
        )}

        {/* Category Sections */}
        {categoryContent.map(({ category, content }) =>
          content.length > 0 ? (
            <ContentCarousel
              key={category.id}
              title={category.name}
              content={content}
              color={category.color}
              isSubscribed={isSubscribed}
            />
          ) : null
        )}

        {/* Featured Section */}
        {featuredContent && (
          <ContentCarousel
            title="Destacados"
            content={[featuredContent]}
            isSubscribed={isSubscribed}
          />
        )}
      </div>
    </div>
  )
}
