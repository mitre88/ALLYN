"use client"

import Link from "next/link"
import { ArrowUpRight, Crown, Heart } from "lucide-react"
import { useSubscription } from "@/lib/hooks/use-subscription"

const exploreLinks = [
  { href: "/category/salud", label: "Salud" },
  { href: "/category/dinero", label: "Dinero" },
  { href: "/category/amor", label: "Amor" },
]

const legalLinks = [
  { href: "/terms", label: "Terminos de uso" },
  { href: "/privacy", label: "Privacidad" },
  { href: "mailto:contacto@allyn.mx", label: "Contacto" },
]

export function Footer() {
  const { isSubscribed } = useSubscription()

  const accountLinks = [
    { href: "/", label: "Inicio" },
    { href: "/profile", label: "Perfil" },
    { href: "/subscribe", label: isSubscribed ? "Mi suscripcion" : "Suscribirse" },
  ]

  return (
    <footer className="relative z-10 mt-24 pb-8 pt-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="rounded-2xl border border-border/50 bg-card px-6 py-8 shadow-lg dark:shadow-2xl md:px-8 md:py-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_0.8fr_0.8fr_0.8fr]">
            {/* Brand */}
            <div className="space-y-4">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                ALLYN
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                Una biblioteca digital para volver a Salud, Dinero y Amor con
                menos ruido visual, mejor foco y una experiencia cuidada.
              </p>
              <div className="flex flex-wrap gap-2">
                {exploreLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.05] px-3 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/[0.1] hover:text-foreground"
                  >
                    {link.label}
                    <ArrowUpRight aria-hidden="true" className="h-3 w-3 text-primary" />
                  </Link>
                ))}
              </div>
            </div>

            <FooterColumn title="Explorar" links={exploreLinks} />
            <FooterColumn title="Cuenta" links={accountLinks} />
            <FooterColumn title="Legal" links={legalLinks} />
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-border/40 pt-6 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ALLYN
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Crown className="h-3.5 w-3.5 text-primary" />
              Hecho con criterio editorial
              <Heart className="h-3.5 w-3.5 text-rose-400" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: Array<{ href: string; label: string }>
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="mt-4 flex flex-col gap-2.5">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-sm text-foreground/65 transition-colors hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
