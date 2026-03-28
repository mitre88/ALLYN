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
    .in("type", ["book", "audiobook"])
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

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const profile = user ? await getProfile(user.id) : null
  const isSubscribed = (profile?.is_subscribed || profile?.role === 'admin') ?? false
  const displayName = profile?.full_name || profile?.username || user?.email?.split("@")[0] || "Bienvenido"

  const [featuredContent, categories, courses, videos] = await Promise.all([
    getFeaturedContent(),
    getCategories(),
    getCourseContent(),
    getVideoContent(),
  ])

  const categoryContent = await Promise.all(
    categories.map(async (category) => ({
      category,
      content: await getContentByCategory(category.id),
    }))
  )

  const libraryCount =
    courses.length +
    categoryContent.reduce((total, collection) => total + collection.content.length, 0) +
    (isSubscribed ? videos.length : 0)

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

        {courses.length > 0 && (
          <ContentCarousel
            eyebrow="Curso"
            title="Curso Principal"
            description="El curso vive en su propio apartado para no mezclarse con libros ni piezas promocionales."
            content={courses}
            isSubscribed={isSubscribed}
          />
        )}

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

        {isSubscribed && videos.length > 0 && (
          <ContentCarousel
            eyebrow="Video"
            title="Videos"
            description="Piezas de video separadas del curso para mantener la biblioteca mejor organizada."
            content={videos}
            isSubscribed={isSubscribed}
          />
        )}
      </div>
    </div>
  )
}
