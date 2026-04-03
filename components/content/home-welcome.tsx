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
      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-lg dark:shadow-2xl sm:p-8 lg:p-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] xl:gap-10">
          {/* Left — greeting + links */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-8 bg-primary/60" />
              <span>Tu espacio</span>
            </div>

            <div className="space-y-3">
              <h2 className="font-display text-3xl font-semibold leading-tight text-foreground text-balance md:text-[2.6rem]">
                Hola, {firstName}.
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                Retoma tus lecturas, videos y audios con accesos rápidos a los temas que más te importan.
              </p>
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap gap-2.5">
              {quickLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground/[0.05] px-3.5 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-foreground/[0.1] hover:text-foreground"
                >
                  <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
                  {label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/profile"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-2 rounded-full px-6 text-sm font-semibold"
                )}
              >
                Mi Perfil
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              {!isSubscribed && (
                <Link
                  href="/subscribe"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "lg" }),
                    "rounded-full px-6 text-sm text-foreground/70 hover:text-foreground"
                  )}
                >
                  Activar Acceso Completo
                </Link>
              )}
            </div>
          </div>

          {/* Right — status + stats */}
          <div className="space-y-4">
            {/* Status card */}
            <div className="rounded-xl bg-muted/50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Estado</p>
                  <p className="text-xl font-semibold text-foreground">
                    {isSubscribed ? "Miembro Activo" : "Modo Preview"}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {isSubscribed
                      ? "Tu contenido premium está disponible."
                      : "Explora el catálogo y activa acceso completo cuando quieras."}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/12">
                  <StatusIcon aria-hidden="true" className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>

            {/* Stats — simple row */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Areas" value={categoryCount} icon={BookOpen} />
              <StatCard label="Titulos" value={libraryCount} icon={ArrowRight} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: typeof Crown
}) {
  return (
    <div className="rounded-xl bg-muted/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
      </div>
      <p className="text-2xl font-semibold text-foreground tabular-nums">{String(value).padStart(2, "0")}</p>
    </div>
  )
}
