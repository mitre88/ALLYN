"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  Crown,
  FileText,
  Headphones,
  LoaderCircle,
  Lock,
  Sparkles,
  Waves,
} from "lucide-react"
import { AudioPlayer } from "@/components/content/audio-player"
import { ContentArtwork } from "@/components/content/content-artwork"
import type { Content } from "@/types/database"

interface BookReaderShellProps {
  backHref: string
  backLabel: string
  content: Content
  pdfUrl: string
  isSubscribed?: boolean
}

export function BookReaderShell({
  backHref,
  backLabel,
  content,
  pdfUrl,
  isSubscribed = false,
}: BookReaderShellProps) {
  const [audioText, setAudioText] = useState("")
  const [audioStatus, setAudioStatus] = useState<"idle" | "loading" | "ready" | "error">("loading")
  const [pageCount, setPageCount] = useState(0)
  const [pagesProcessed, setPagesProcessed] = useState(0)

  useEffect(() => {
    let cancelled = false

    const extractText = async () => {
      setAudioStatus("loading")
      setAudioText("")
      setPageCount(0)
      setPagesProcessed(0)

      try {
        const response = await fetch(`/api/content/${content.id}/text`, {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`No se pudo extraer el texto (${response.status})`)
        }

        const data = (await response.json()) as {
          pageCount?: number
          text?: string
        }

        if (cancelled) return

        const fullText = data.text?.trim() || ""
        const resolvedPageCount = data.pageCount || 0

        setPageCount(resolvedPageCount)
        setPagesProcessed(resolvedPageCount)
        setAudioText(fullText)
        setAudioStatus(fullText ? "ready" : "error")
      } catch (error) {
        console.error("[BookReaderShell] Error extrayendo texto:", error)
        if (!cancelled) {
          setAudioStatus("error")
        }
      }
    }

    void extractText()

    return () => {
      cancelled = true
    }
  }, [content.id])

  const wordCount = useMemo(() => {
    return audioText.split(/\s+/).filter(Boolean).length
  }, [audioText])

  const audioPreview = useMemo(() => {
    if (!audioText) return null
    return `${audioText.slice(0, 280).trim()}${audioText.length > 280 ? "..." : ""}`
  }, [audioText])

  const progressPercent = pageCount > 0 ? Math.round((pagesProcessed / pageCount) * 100) : 0
  const accentColor = content.category?.color || "#c8951a"

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
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
                    {isSubscribed ? "Libro completo" : "Prólogo · Vista previa"}
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
                    {pageCount > 0 && <span>{pageCount} páginas detectadas</span>}
                    {wordCount > 0 && <span>{wordCount.toLocaleString("es-MX")} palabras</span>}
                  </div>
                </div>
              </div>

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
            </div>
          </div>

          <div className="grid xl:grid-cols-[minmax(0,1.42fr)_400px]">
            <div className="border-b border-white/10 bg-white/[0.02] xl:border-b-0 xl:border-r xl:border-white/10">
              <div className="relative h-[68vh] min-h-[560px] bg-white sm:h-[74vh] xl:h-[calc(100vh-11rem)]">
                <iframe
                  src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH&page=1`}
                  title={content.title}
                  className="h-full w-full border-0"
                  style={{ pointerEvents: isSubscribed ? "auto" : "none" }}
                />

                {/* Non-subscriber blur + lock overlay */}
                {!isSubscribed && (
                  <>
                    <div
                      className="pointer-events-none absolute bottom-0 left-0 right-0"
                      style={{
                        height: "45%",
                        background:
                          "linear-gradient(to bottom, transparent 0%, rgba(9,9,11,0.65) 50%, rgba(9,9,11,0.97) 100%)",
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center justify-end px-6 pb-10">
                      <div className="w-14 h-14 rounded-full bg-black/60 border border-primary/30 flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-white font-bold text-lg text-center mb-1">
                        Estás leyendo el prólogo
                      </h3>
                      <p className="text-white/50 text-sm text-center max-w-xs mb-5">
                        Suscríbete para leer el libro completo y acceder a toda la biblioteca.
                      </p>
                      <Link href="/subscribe">
                        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-full transition-colors shadow-lg shadow-primary/25">
                          <Crown className="w-4 h-4" />
                          Suscribirse — $499/mes
                        </button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>

            <aside className="flex flex-col gap-4 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] p-4 sm:p-6">
              <div
                className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl"
                data-audio-status={audioStatus}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                    <BookOpen className="h-5 w-5 text-white/78" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-white/38">
                      Experiencia
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-white/74">
                      El libro abre completo dentro de la app y cada título conserva su sección original.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                    <Headphones className="h-5 w-5 text-white/78" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.28em] text-white/38">
                          Escuchar completo
                        </p>
                        <p className="mt-1 text-sm text-white/72">
                          Escucha el libro completo con voz del navegador.
                        </p>
                      </div>
                      {audioStatus === "ready" && (
                        <span className="rounded-full border border-emerald-400/18 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                          Audio listo
                        </span>
                      )}
                    </div>

                    {audioStatus === "loading" && (
                      <div className="mt-4 rounded-2xl border border-white/8 bg-black/18 p-4">
                        <div className="flex items-center gap-2 text-sm text-white/76">
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                          Preparando audio completo
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-300 via-orange-300 to-pink-400 transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-white/48">
                          {pageCount > 0
                            ? `${pagesProcessed} de ${pageCount} páginas analizadas`
                            : "Analizando el documento"}
                        </p>
                      </div>
                    )}

                    {audioStatus === "ready" && (
                      <div className="mt-4 space-y-4">
                        {audioPreview && (
                          <div className="rounded-2xl border border-white/8 bg-black/18 p-4">
                            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-white/34">
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Texto detectado</span>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-white/62">
                              {audioPreview}
                            </p>
                          </div>
                        )}

                        <AudioPlayer text={audioText} title={content.title} />
                      </div>
                    )}

                    {audioStatus === "error" && (
                      <div className="mt-4 rounded-2xl border border-amber-400/18 bg-amber-400/10 p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-amber-200">
                          <Waves className="h-4 w-4" />
                          El audio automático no se pudo preparar
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-amber-100/78">
                          La lectura completa sí está disponible. Si este archivo viene muy pesado o el navegador bloquea el análisis, abre el PDF aparte y vuelve a intentar.
                        </p>
                      </div>
                    )}
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
