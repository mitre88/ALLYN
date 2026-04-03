import Link from "next/link"
import { ArrowRight, Banknote, BookOpen, Crown, Heart, Sparkles } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HomeWelcomeProps {
  name: string
  isSubscribed: boolean
  libraryCount: number
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
  libraryCount,
  categoryCount,
}: HomeWelcomeProps) {
  const firstName = name.trim().split(/\s+/)[0] || "Bienvenido"
  const StatusIcon = isSubscribed ? Crown : Sparkles

  return (
    <section className="container mx-auto px-4 md:px-8">
      <div className="relative overflow-hidden rounded-[36px] border border-border/50 bg-card/95 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.10)] dark:shadow-[0_30px_120px_rgba(0,0,0,0.36)] sm:p-7 md:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.15),transparent_34%),radial-gradient(circle_at_80%_18%,hsl(var(--foreground)/0.04),transparent_20%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute -left-12 top-0 h-36 w-36 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-rose-500/10 blur-3xl" />

        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.18fr)_minmax(350px,0.82fr)] xl:gap-10">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-[var(--glass-bg)] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Espacio Curado
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-foreground/36">
                <span className="h-px w-10 rounded-full bg-primary/70" />
                <span>Tu cabina privada</span>
              </div>
              <h2 className="font-display text-3xl font-semibold leading-tight text-foreground text-balance md:text-[2.8rem]">
                Hola, {firstName}. Tu espacio está listo para seguir avanzando.
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-foreground/68 text-pretty md:text-base">
                Retoma tus lecturas, videos y audios desde una portada más clara,
                con accesos rápidos a los temas que más te importan.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {quickLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-[var(--glass-bg)] px-3.5 py-2 text-sm font-medium text-foreground/78 transition-colors hover:bg-[var(--glass-bg-strong)] hover:text-foreground"
                >
                  <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap gap-3.5 pt-1">
              <Link
                href="/profile"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-2 rounded-full px-6 text-sm font-semibold shadow-[0_18px_34px_hsl(var(--primary)/0.24)]"
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
                    "rounded-full border-border/50 bg-[var(--glass-bg)] px-6 text-sm text-foreground backdrop-blur-sm hover:bg-[var(--glass-bg-strong)] hover:text-foreground"
                  )}
                >
                  Activar Acceso Completo
                </Link>
              )}
            </div>

            <div className="rounded-[26px] border border-border/40 bg-[var(--glass-bg)] p-4 backdrop-blur-sm md:p-5">
              <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/38">
                Enfoque del día
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/68">
                Vuelve al catálogo desde un punto de entrada limpio, con jerarquía clara y menos ruido entre decisiones.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[30px] border border-border/40 bg-[var(--glass-bg-strong)] p-5 backdrop-blur-xl md:p-6">
              <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/38">
                Estado
              </p>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {isSubscribed ? "Miembro Activo" : "Modo Preview"}
                  </p>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-foreground/60">
                    {isSubscribed
                      ? "Tu contenido premium está disponible sin interrupciones."
                      : "Explora el catálogo y activa acceso completo cuando quieras."}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border/30 bg-[var(--glass-bg)]">
                  <StatusIcon aria-hidden="true" className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <InfoCard
                eyebrow="Catálogo"
                title={`${categoryCount.toString().padStart(2, "0")} Áreas`}
                detail="Temas organizados para encontrar contenido con menos fricción."
                icon={BookOpen}
              />
              <InfoCard
                eyebrow="Biblioteca"
                title={`${libraryCount.toString().padStart(2, "0")} Títulos`}
                detail="Curso y colecciones ordenadas para que cada libro viva en su sección."
                icon={ArrowRight}
              />
            </div>
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
    <div className="rounded-[24px] border border-border/40 bg-[var(--glass-bg)] p-4 backdrop-blur-sm md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.24em] text-foreground/42">{eyebrow}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border/30 bg-[var(--glass-bg)]">
          <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
        </div>
      </div>
      <p className="text-lg font-semibold text-foreground tabular-nums">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-foreground/58 text-pretty">{detail}</p>
    </div>
  )
}
