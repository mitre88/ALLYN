"use client"

import Link from "next/link"
import {
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  Crown,
  FileText,
  Headphones,
  Lock,
} from "lucide-react"
import { ContentArtwork } from "@/components/content/content-artwork"
import { ListenButton } from "@/components/content/listen-button"
import type { Content } from "@/types/database"

interface BookReaderShellProps {
  backHref: string
  backLabel: string
  content: Content
  pdfUrl: string
  isSubscribed?: boolean
  autoplay?: boolean
}

export function BookReaderShell({
  backHref,
  backLabel,
  content,
  pdfUrl,
  isSubscribed = false,
}: BookReaderShellProps) {
  const accentColor = content.category?.color || "#c8951a"

  return (
    <div className="dark relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0">
        <ContentArtwork content={content} variant="background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_24%),linear-gradient(180deg,rgba(9,9,11,0.2)_0%,rgba(9,9,11,0.82)_42%,rgba(9,9,11,0.96)_100%)]" />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="relative mx-auto max-w-[1680px] px-4 pb-5 pt-16 sm:px-6 lg:px-8 lg:pb-8 lg:pt-20">
        <div className="overflow-hidden rounded-[30px] border border-white/10 bg-black/45 shadow-[0_32px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          <div className="border-b border-white/10 px-4 py-4 sm:px-6 lg:px-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <Link
                  href={backHref}
                  className="inline-flex items-center gap-2 text-sm text-white/56 transition-colors hover:text-white/84"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>{backLabel}</span>
                </Link>

                <div className="mt-3 flex flex-wrap items-center gap-2.5 text-[11px] uppercase tracking-[0.28em] text-white/42">
                  <span
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 font-medium text-white/72"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: accentColor }}
                    />
                    {content.category?.name || "Colección"}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 font-medium text-white/68">
                    {isSubscribed || content.is_free ? "Libro completo" : "Prólogo — 5 páginas"}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-medium text-white/54">
                    {content.type === "audiobook" ? "Lectura + audio" : "Lectura inmersiva"}
                  </span>
                </div>

                <div className="mt-4 max-w-3xl">
                  <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl xl:text-[2.8rem]">
                    {content.title}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/55">
                    {content.author && <span>{content.author}</span>}
                    {content.published_at && (
                      <span>{new Date(content.published_at).getFullYear()}</span>
                    )}
                    {content.duration > 0 && <span>{content.duration} min</span>}
                  </div>
                </div>
              </div>

              {(isSubscribed || content.is_free) && (
                <div className="flex flex-wrap items-center gap-2.5">
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white/82 transition-colors hover:border-white/22 hover:bg-white/[0.08]"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    Abrir aparte
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="grid xl:grid-cols-[minmax(0,1.42fr)_400px]">
            <div className="border-b border-white/10 bg-white/[0.02] xl:border-b-0 xl:border-r xl:border-white/10">
              <div className="relative h-[68vh] min-h-[560px] bg-white sm:h-[74vh] xl:h-[calc(100vh-11rem)]">
                <iframe
                  src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH&page=1`}
                  title={content.title}
                  className="h-full w-full border-0"
                />

                {/* Preview overlay for non-subscribers */}
                {!isSubscribed && !content.is_free && (
                  <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center justify-end pb-8"
                    style={{ height: "45%", background: "linear-gradient(to bottom, transparent 0%, rgba(9,9,11,0.85) 50%, rgba(9,9,11,0.98) 100%)" }}
                  >
                    <div className="text-center max-w-sm px-4">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-black/70">
                        <Lock className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Fin del prólogo
                      </h3>
                      <p className="text-sm text-white/60 mb-5">
                        Has leído las primeras 5 páginas. Suscríbete para leer el libro completo, con audio integrado y acceso a toda la biblioteca.
                      </p>
                      <Link
                        href="/subscribe"
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-[0_12px_28px_hsl(var(--primary)/0.3)] transition-colors hover:bg-primary/90"
                      >
                        <Crown className="h-4 w-4" />
                        Suscribirse — $499 primer año
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <aside className="flex flex-col gap-4 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] p-4 sm:p-6">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                    <BookOpen className="h-5 w-5 text-white/78" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-white/38">
                      Experiencia
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-white/74">
                      {isSubscribed || content.is_free
                        ? "El libro abre completo dentro de la app. Usa el botón de audio para escucharlo con voz de alta calidad."
                        : "Estás viendo una vista previa. Suscríbete para desbloquear el libro completo y su audio."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subscribe CTA for non-subscribers */}
              {!isSubscribed && !content.is_free && (
                <div className="rounded-[24px] border border-primary/20 bg-primary/[0.08] p-5 backdrop-blur-xl">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/15">
                      <Crown className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">Acceso completo</p>
                      <p className="mt-1 text-sm leading-relaxed text-white/60">
                        Lectura completa, audio de alta calidad y toda la biblioteca por $499 el primer año.
                      </p>
                      <Link
                        href="/subscribe"
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_12px_28px_hsl(var(--primary)/0.3)] transition-colors hover:bg-primary/90"
                      >
                        <Crown className="h-3.5 w-3.5" />
                        Suscribirse
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Audio section */}
              <div className="rounded-[24px] border border-purple-500/20 bg-purple-500/[0.06] p-5 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/15">
                    <Headphones className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-purple-300/60">
                      Audio del libro
                    </p>
                    <p className="mt-1 text-sm text-white/72">
                      {isSubscribed || content.is_free
                        ? "Escucha este libro con voz natural generada por IA. El audio se genera la primera vez y queda guardado."
                        : "El audio está disponible para suscriptores."}
                    </p>
                    <div className="mt-4">
                      <ListenButton
                        content={content}
                        isSubscribed={isSubscribed}
                        variant="primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                    <FileText className="h-5 w-5 text-white/78" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-white/38">
                      Nota
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-white/68">
                      La experiencia prioriza lectura directa, menos pasos y más espacio visual para que el contenido sea el protagonista.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
