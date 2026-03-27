import { createClient } from "@/lib/supabase/server"
import { Hero } from "@/components/content/hero"
import { ContentCarousel } from "@/components/content/content-carousel"
import { HomeWelcome } from "@/components/content/home-welcome"
import type { Content, Category } from "@/types/database"

async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("profiles")
    .select("is_subscribed, full_name, username")
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
  const displayName = profile?.full_name || profile?.username || user?.email?.split("@")[0] || "Bienvenido"

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
      {featuredContent && <Hero content={featuredContent} isSubscribed={isSubscribed} />}

      {/* Content Sections */}
      <div className="relative z-10 -mt-10 space-y-8 pb-16 md:-mt-12 md:space-y-10 md:pb-20">
        {user && (
          <div className="pt-10 md:pt-16">
            <HomeWelcome
              name={displayName}
              isSubscribed={isSubscribed}
              latestCount={latestContent.length}
              categoryCount={categories.length}
            />
          </div>
        )}

        {/* Latest */}
        <ContentCarousel
          eyebrow="Ahora En ALLYN"
          title="Nuevos Lanzamientos"
          description="Una selección reciente para entrar directo al contenido sin sentir el home saturado."
          content={latestContent}
          isSubscribed={isSubscribed}
        />

        {/* Subscriber-only sections */}
        {isSubscribed && books.length > 0 && (
          <ContentCarousel
            eyebrow="Lectura & Audio"
            title="Mis Libros"
            description="Tus lecturas y audiolibros con una entrada más limpia y una navegación más clara."
            content={books}
            isSubscribed={isSubscribed}
          />
        )}

        {isSubscribed && videos.length > 0 && (
          <ContentCarousel
            eyebrow="Video Learning"
            title="Mis Videos"
            description="Cursos y piezas en video reunidos con más jerarquía visual y mejor separación."
            content={videos}
            isSubscribed={isSubscribed}
          />
        )}

        {/* Category Sections */}
        {categoryContent.map(({ category, content }) =>
          content.length > 0 ? (
            <ContentCarousel
              key={category.id}
              eyebrow="Colección"
              title={category.name}
              description={category.description || undefined}
              content={content}
              color={category.color}
              isSubscribed={isSubscribed}
            />
          ) : null
        )}

        {/* Featured Section */}
        {featuredContent && (
          <ContentCarousel
            eyebrow="Selección Editorial"
            title="Destacados"
            description="Una pieza central elegida para abrir el catálogo con más intención."
            content={[featuredContent]}
            isSubscribed={isSubscribed}
          />
        )}
      </div>
    </div>
  )
}
