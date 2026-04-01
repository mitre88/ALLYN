import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Play, Share2, Clock, User, BookOpen, Plus, Lock, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContentArtwork } from "@/components/content/content-artwork"
import { ContentCarousel } from "@/components/content/content-carousel"
import { VideoPlayer } from "@/components/content/video-player"
import { getPrimaryContentHref, getPrimaryContentLabel, getContentTypeLabel, getContentAccessLabel, getContentAccentColor, isContentLocked, isReadingContent } from "@/lib/content"
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

  const relatedContent = content.category_id
    ? await getRelatedContent(content.category_id, content.id)
    : []

  const isBook = isReadingContent(content)
  const isVideo = content.type === 'video' || content.type === 'course'
  const locked = isContentLocked(content, isSubscribed)
  const primaryHref = getPrimaryContentHref(content, isSubscribed)
  const primaryLabel = getPrimaryContentLabel(content, isSubscribed)
  const accent = getContentAccentColor(content)

  const PrimaryIcon = primaryHref === "/subscribe"
    ? Lock
    : content.type === "audiobook"
    ? Headphones
    : isBook
    ? BookOpen
    : Play

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <ContentArtwork content={content} variant="background" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--background))_0%,hsl(var(--background)/0.88)_32%,hsl(var(--background)/0.52)_56%,rgba(0,0,0,0.24)_100%)]" />
          <div className="absolute inset-0 hero-gradient" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.10),transparent_22%),linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.28)_52%,hsl(var(--background))_100%)]" />
          <div className="absolute left-8 top-20 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 pb-8 pt-28 md:px-8 md:pb-12 md:pt-32 lg:pt-36">
          <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1.15fr)_340px] lg:gap-12">
            <div className="max-w-2xl">
              <div className="mb-5 flex flex-wrap items-center gap-2.5">
                {content.category && (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/88 backdrop-blur-sm"
                    style={{ backgroundColor: `${content.category.color}26` }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: content.category.color || accent }}
                    />
                    {content.category.name}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-white/55 backdrop-blur-sm">
                  {getContentTypeLabel(content.type)}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/62 backdrop-blur-sm">
                  {getContentAccessLabel(content, isSubscribed)}
                </span>
                {content.is_free && (
                  <span className="rounded-full border border-primary/25 bg-primary/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary backdrop-blur-sm">
                    Gratis
                  </span>
                )}
              </div>

              <h1 className="mb-4 font-display text-4xl font-semibold leading-[0.96] text-foreground text-balance md:text-5xl lg:text-6xl">
                {content.title}
              </h1>

              <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-foreground/54">
                {content.author && (
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {content.author}
                  </span>
                )}
                {content.published_at && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-foreground/24" />
                    <span>{new Date(content.published_at).getFullYear()}</span>
                  </>
                )}
                {content.duration > 0 && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-foreground/24" />
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDuration(content.duration)}
                    </span>
                  </>
                )}
              </div>

              {content.description && (
                <p className="mb-8 max-w-2xl text-base leading-relaxed text-foreground/68 md:text-lg">
                  {content.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Link href={primaryHref}>
                  <Button
                    size="lg"
                    className="h-12 rounded-full bg-white px-7 text-sm font-semibold text-black shadow-[0_16px_36px_rgba(255,255,255,0.18)] hover:bg-white/92"
                  >
                    <PrimaryIcon className={`mr-2 h-4 w-4 ${content.type === "video" && primaryHref !== "/subscribe" ? "fill-black" : ""}`} />
                    {primaryLabel}
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/18 bg-white/[0.06] px-7 text-sm font-medium text-foreground hover:border-white/36 hover:bg-white/[0.12]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Mi Lista
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-12 rounded-full px-7 text-foreground/60 hover:bg-white/[0.08] hover:text-foreground"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartir
                </Button>
              </div>
            </div>

            <aside className="hidden lg:flex lg:flex-col lg:gap-4">
              <div className="overflow-hidden rounded-[30px] border border-white/10 bg-black/24 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
                <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/38">
                  Portada
                </p>
                <div className="mt-4 overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
                  <div className="aspect-[4/5]">
                    <ContentArtwork content={content} showTypeLabel={false} />
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-foreground/62">
                  <InfoRow label="Formato" value={getContentTypeLabel(content.type)} />
                  <InfoRow label="Acceso" value={getContentAccessLabel(content, isSubscribed)} />
                  {content.author && <InfoRow label="Autor" value={content.author} />}
                  {content.published_at && (
                    <InfoRow
                      label="Publicado"
                      value={new Date(content.published_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    />
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {isVideo && content.file_url && (
        <section className="container mx-auto px-4 pb-4 pt-2 md:px-8">
          <VideoPlayer
            contentId={content.id}
            isSubscribed={isSubscribed}
            isFree={content.is_free}
          />
        </section>
      )}

      {locked && (
        <section className="container mx-auto px-4 py-8 md:px-8">
          <div className="flex items-start gap-4 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(148deg,rgba(24,17,10,0.96)_0%,rgba(11,11,11,0.96)_44%,rgba(7,8,10,0.98)_100%)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl md:p-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="mb-1 text-lg font-semibold text-foreground">Contenido exclusivo para miembros</p>
              <p className="mb-4 text-sm leading-relaxed text-foreground/56">
                Accede a este y todo el contenido de ALLYN por{" "}
                <span className="font-semibold text-primary">$499 el primer año</span>, luego $99/año con renovación automática.
              </p>
              <Link href="/subscribe">
                <Button className="h-11 rounded-full bg-primary px-6 font-semibold text-primary-foreground shadow-[0_12px_28px_hsl(var(--primary)/0.3)] hover:bg-primary/90">
                  Ver planes
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {relatedContent.length > 0 && (
        <section className="pb-20">
          <ContentCarousel
            eyebrow="Biblioteca"
            title="Contenido relacionado"
            content={relatedContent}
            isSubscribed={isSubscribed}
          />
        </section>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
      <span className="text-[11px] uppercase tracking-[0.24em] text-foreground/34">
        {label}
      </span>
      <span className="text-right text-sm font-medium text-foreground/82">{value}</span>
    </div>
  )
}
