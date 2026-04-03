import Image from "next/image"
import Link from "next/link"
import { BookOpen, ChevronLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { ContentCarousel } from "@/components/content/content-carousel"
import { notFound } from "next/navigation"
import type { Category, Content } from "@/types/database"

const CATEGORY_HEROES: Record<string, string> = {
  salud: "/assets/categories/salud.svg",
  dinero: "/assets/categories/dinero.svg",
  amor: "/assets/categories/amor.svg",
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>
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

async function getBooksByCategory(categoryId: string): Promise<Content[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("content")
    .select("*, category:categories(*)")
    .eq("category_id", categoryId)
    .in("type", ["book", "audiobook"])
    .eq("status", "published")
    .order("sort_order", { ascending: true })
  return data || []
}

async function getCoursesByCategory(categoryId: string): Promise<Content[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("content")
    .select("*, category:categories(*)")
    .eq("category_id", categoryId)
    .eq("type", "course")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
  return data || []
}

async function getVideosByCategory(categoryId: string): Promise<Content[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("content")
    .select("*, category:categories(*)")
    .eq("category_id", categoryId)
    .eq("type", "video")
    .eq("status", "published")
    .order("published_at", { ascending: false })
  return data || []
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = await getCategory(slug)
  if (!category) return { title: "Categoría no encontrada - ALLYN" }
  return {
    title: `${category.name} - ALLYN`,
    description: category.description,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = await getCategory(slug)
  if (!category) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let isSubscribed = false
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_subscribed, role")
      .eq("id", user.id)
      .single()
    isSubscribed = (profile?.is_subscribed || profile?.role === 'admin') ?? false
  }

  const [books, courses, videos] = await Promise.all([
    getBooksByCategory(category.id),
    getCoursesByCategory(category.id),
    getVideosByCategory(category.id),
  ])

  const totalContent = books.length + courses.length + videos.length

  const heroSrc = CATEGORY_HEROES[slug]

  return (
    <div className="pb-20">
      {/* Hero — cinematic banner (always dark) with text overlay */}
      {heroSrc ? (
        <section className="relative w-full overflow-hidden bg-[#0a0a0a]" style={{ height: "clamp(300px, 40vw, 500px)" }}>
          <Image
            src={heroSrc}
            alt={`${category.name} — ALLYN`}
            fill
            priority
            className="object-cover object-center"
          />
          {/* Multi-layer gradient: dark image → page background */}
          <div className="absolute inset-x-0 bottom-0 h-3/4" style={{
            background: "linear-gradient(to top, var(--category-fade-to) 0%, color-mix(in srgb, var(--category-fade-to) 70%, transparent) 40%, transparent 100%)"
          }} />

          {/* Text overlay */}
          <div className="absolute inset-x-0 bottom-0 pb-8 md:pb-12">
            <div className="container mx-auto px-4 md:px-8">
              <Link
                href="/"
                className="mb-5 inline-flex items-center gap-1.5 text-sm text-foreground/50 transition-colors hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                Volver al inicio
              </Link>

              <div className="max-w-3xl">
                <div className="mb-4 flex items-center gap-2.5 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                  <span
                    className="h-px w-8 rounded-full"
                    style={{ backgroundColor: category.color || "hsl(var(--primary) / 0.65)" }}
                  />
                  <span>Colección</span>
                </div>

                <h1 className="mb-4 font-display text-5xl font-semibold leading-[0.96] text-foreground text-balance md:text-6xl">
                  {category.name}
                </h1>

                {category.description && (
                  <p className="mb-5 max-w-xl text-base leading-relaxed text-foreground/56 md:text-lg">
                    {category.description}
                  </p>
                )}

                <div className="flex items-center gap-3">
                  <span
                    className="rounded-full border px-3 py-1.5 text-xs font-semibold tabular-nums"
                    style={{
                      borderColor: `${category.color}30`,
                      color: category.color,
                      backgroundColor: `${category.color}12`,
                    }}
                  >
                    {totalContent.toString().padStart(2, "0")} títulos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 50% 0%, ${category.color}22 0%, transparent 60%), radial-gradient(ellipse at 80% 10%, ${category.color}12 0%, transparent 40%)`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          </div>

          <div className="relative container mx-auto px-4 pt-28 pb-8 md:px-8 md:pt-32 md:pb-12">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-foreground/50 transition-colors hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver al inicio
            </Link>

            <div className="max-w-3xl">
              <div className="mb-6 flex items-center gap-2.5 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                <span
                  className="h-px w-8 rounded-full"
                  style={{ backgroundColor: category.color || "hsl(var(--primary) / 0.65)" }}
                />
                <span>Colección</span>
              </div>

              <h1 className="mb-4 font-display text-5xl font-semibold leading-[0.96] text-foreground text-balance md:text-6xl">
                {category.name}
              </h1>

              {category.description && (
                <p className="mb-6 max-w-xl text-base leading-relaxed text-foreground/52 md:text-lg">
                  {category.description}
                </p>
              )}

              <div className="flex items-center gap-3">
                <span
                  className="rounded-full border px-3 py-1.5 text-xs font-semibold tabular-nums"
                  style={{
                    borderColor: `${category.color}30`,
                    color: category.color,
                    backgroundColor: `${category.color}12`,
                  }}
                >
                  {totalContent.toString().padStart(2, "0")} títulos
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {courses.length > 0 && (
        <ContentCarousel
          eyebrow="Curso"
          title="Cursos"
          content={courses}
          color={category.color}
          isSubscribed={isSubscribed}
        />
      )}

      {books.length > 0 && (
        <ContentCarousel
          eyebrow="Biblioteca"
          title="Libros y Audiolibros"
          description="Acceso completo a lectura y escucha."
          content={books}
          color={category.color}
          isSubscribed={isSubscribed}
        />
      )}

      {videos.length > 0 && (
        <ContentCarousel
          eyebrow="Video"
          title="Videos"
          description={isSubscribed ? "Contenido premium desbloqueado." : undefined}
          content={videos}
          color={category.color}
          isSubscribed={isSubscribed}
        />
      )}

      {totalContent === 0 && (
        <div className="container mx-auto px-4 py-20 text-center max-w-md mx-auto">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/40 mb-4" />
          <p className="text-lg font-semibold text-foreground mb-2">
            Sin contenido todavía
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Estamos preparando material para esta categoría. Vuelve pronto.
          </p>
          <Link href="/" className="text-sm font-medium text-primary hover:text-primary/80">
            Explorar otras categorías
          </Link>
        </div>
      )}
    </div>
  )
}
