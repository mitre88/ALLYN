import Link from "next/link"
import { ArrowRight, Banknote, BookOpen, Crown, Heart, Sparkles } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HomeWelcomeProps {
  name: string
  isSubscribed: boolean
  latestCount: number
  categoryCount: number
}

const quickLinks = [
  { href: "/category/salud", label: "Salud", icon: Heart },
  { href: "/category/dinero", label: "Dinero", icon: Banknote },
  { href: "/category/amor", label: "Amor", icon: Sparkles },
]

export function HomeWelcome({
  name,
  isSubscribed,
  latestCount,
  categoryCount,
}: HomeWelcomeProps) {
  const firstName = name.trim().split(/\s+/)[0] || "Bienvenido"

  return (
    <section className="container mx-auto px-4 md:px-8">
      <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(24,17,10,0.96)_0%,rgba(12,11,10,0.96)_42%,rgba(9,9,11,0.98)_100%)] p-6 md:p-8 shadow-[0_30px_120px_rgba(0,0,0,0.38)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(200,149,26,0.22),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_28%)]" />
        <div className="absolute -left-12 top-0 h-36 w-36 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-rose-500/10 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] lg:gap-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-white/55 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Espacio Curado
            </div>

            <div className="space-y-3">
              <h2 className="font-display text-3xl font-bold leading-tight text-white text-balance md:text-[2.6rem]">
                Hola, {firstName}. Tu espacio está listo para seguir avanzando.
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-white/68 text-pretty md:text-base">
                Retoma tus lecturas, videos y audios desde una portada más clara,
                con accesos rápidos a los temas que más te importan.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {quickLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3.5 py-2 text-sm font-medium text-white/78 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/profile"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-2 rounded-full px-6 text-sm font-semibold shadow-lg shadow-primary/20"
                )}
              >
                Mi Perfil
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              {!isSubscribed && (
                <Link
                  href="/subscribe"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "rounded-full border-white/15 bg-white/6 px-6 text-sm text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
                  )}
                >
                  Activar Acceso Completo
                </Link>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <InfoCard
              eyebrow="Estado"
              title={isSubscribed ? "Acceso Vitalicio" : "Modo Preview"}
              detail={
                isSubscribed
                  ? "Tu contenido premium está disponible sin interrupciones."
                  : "Explora el catálogo y activa acceso completo cuando quieras."
              }
              icon={isSubscribed ? Crown : Sparkles}
            />
            <InfoCard
              eyebrow="Catálogo"
              title={`${categoryCount.toString().padStart(2, "0")} Áreas`}
              detail="Temas organizados para encontrar contenido con menos fricción."
              icon={BookOpen}
            />
            <InfoCard
              eyebrow="Novedades"
              title={`${latestCount.toString().padStart(2, "0")} Lanzamientos`}
              detail="Lo más nuevo queda a la vista para seguir hoy mismo."
              icon={ArrowRight}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function InfoCard({
  eyebrow,
  title,
  detail,
  icon: Icon,
}: {
  eyebrow: string
  title: string
  detail: string
  icon: typeof Crown
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">{eyebrow}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/20">
          <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
        </div>
      </div>
      <p className="text-lg font-semibold text-white tabular-nums">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-white/58 text-pretty">{detail}</p>
    </div>
  )
}
