import { createClient } from "@/lib/supabase/server"
import { Hero } from "@/components/content/hero"
import { ContentCarousel } from "@/components/content/content-carousel"
import { HomeWelcome } from "@/components/content/home-welcome"
import type { Content, Category } from "@/types/database"

async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("profiles")
    .select("is_subscribed, role, full_name, username")
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

async function getCourseContent(): Promise<Content[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("content")
    .select("*, category:categories(*)")
    .eq("type", "course")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .limit(10)
  return data || []
}

async function getVideoContent(): Promise<Content[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("content")
    .select("*, category:categories(*)")
    .eq("type", "video")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(10)
  return data || []
}

async function getAllBooks(): Promise<Content[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("content")
    .select("*, category:categories(*)")
    .in("type", ["book", "audiobook"])
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .limit(50)
  return data || []
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const profile = user ? await getProfile(user.id) : null
  const isSubscribed = (profile?.is_subscribed || profile?.role === 'admin') ?? false
  const displayName = profile?.full_name || profile?.username || user?.email?.split("@")[0] || "Bienvenido"

  const [featuredContent, categories, courses, videos, allBooks] = await Promise.all([
    getFeaturedContent(),
    getCategories(),
    getCourseContent(),
    getVideoContent(),
    getAllBooks(),
  ])

  const categoryContent = await Promise.all(
    categories.map(async (category) => ({
      category,
      content: await getContentByCategory(category.id),
    }))
  )

  const libraryCount = courses.length + allBooks.length + (isSubscribed ? videos.length : 0)

  return (
    <div className="bg-background">
      {/* Hero Section */}
      {featuredContent && <Hero content={featuredContent} isSubscribed={isSubscribed} />}

      {/* Content Sections */}
      <div className="relative z-10 -mt-4 space-y-10 pb-20 md:-mt-6 md:space-y-12 md:pb-24 xl:space-y-14">
        {user && (
          <div className="pt-12 md:pt-16 xl:pt-20">
            <HomeWelcome
              name={displayName}
              isSubscribed={isSubscribed}
              libraryCount={libraryCount}
              categoryCount={categories.length}
            />
          </div>
        )}

        {/* ── Curso ── */}
        {courses.length > 0 && (
          <ContentCarousel
            eyebrow="Formación"
            title="Curso"
            description="Aprende paso a paso con el material formativo de la plataforma."
            content={courses}
            isSubscribed={isSubscribed}
          />
        )}

        {/* ── Todos los libros ── */}
        {allBooks.length > 0 && (
          <ContentCarousel
            eyebrow="Biblioteca"
            title="Todos los Libros"
            description="La colección completa de libros y audiolibros disponibles en la plataforma."
            content={allBooks}
            isSubscribed={isSubscribed}
          />
        )}

        {/* ── Libros por categoría (Salud · Dinero · Amor) ── */}
        {categoryContent.map(({ category, content }) => {
          const books = content.filter(c => c.type === 'book' || c.type === 'audiobook')
          return books.length > 0 ? (
            <ContentCarousel
              key={category.id}
              eyebrow="Libros"
              title={category.name}
              description={category.description || undefined}
              content={books}
              color={category.color}
              isSubscribed={isSubscribed}
            />
          ) : null
        })}

        {/* ── Videos (suscriptores) ── */}
        {isSubscribed && videos.length > 0 && (
          <ContentCarousel
            eyebrow="Video"
            title="Videos"
            description="Contenido en video exclusivo para miembros."
            content={videos}
            isSubscribed={isSubscribed}
          />
        )}
      </div>
    </div>
  )
}
