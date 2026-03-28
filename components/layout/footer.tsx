import Link from "next/link"
import { ArrowUpRight, Crown, Heart } from "lucide-react"

const exploreLinks = [
  { href: "/category/salud", label: "Salud" },
  { href: "/category/dinero", label: "Dinero" },
  { href: "/category/amor", label: "Amor" },
]

const accountLinks = [
  { href: "/", label: "Inicio" },
  { href: "/profile", label: "Perfil" },
  { href: "/subscribe", label: "Suscribirse" },
]

const legalLinks = [
  { href: "/terms", label: "Términos de uso" },
  { href: "/privacy", label: "Privacidad" },
  { href: "mailto:contacto@allyn.mx", label: "Contacto" },
]

export function Footer() {
  return (
    <footer className="relative z-10 mt-24 pb-8 pt-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(160deg,rgba(22,17,13,0.94)_0%,rgba(10,10,11,0.98)_58%,rgba(8,8,10,0.98)_100%)] px-6 py-8 shadow-[0_30px_120px_rgba(0,0,0,0.28)] md:px-8 md:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(200,149,26,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.07),transparent_24%)]" />
          <div className="absolute -left-16 top-0 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-rose-500/10 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_0.8fr_0.8fr_0.8fr]">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-white/55">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Biblioteca Curada
              </div>

              <div className="space-y-3">
                <h2 className="font-display text-4xl font-semibold tracking-tight text-white md:text-[3.2rem]">
                  ALLYN
                </h2>
                <p className="max-w-xl text-sm leading-relaxed text-white/62 md:text-base">
                  Una biblioteca digital para volver a Salud, Dinero y Amor con
                  menos ruido visual, mejor foco y una experiencia que se siente
                  cuidada de principio a fin.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {exploreLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-sm font-medium text-white/78 transition-colors hover:bg-white/[0.1] hover:text-white"
                  >
                    {link.label}
                    <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 text-primary" />
                  </Link>
                ))}
              </div>
            </div>

            <FooterColumn title="Explorar" links={exploreLinks} />
            <FooterColumn title="Cuenta" links={accountLinks} />
            <FooterColumn title="Legal" links={legalLinks} />
          </div>

          <div className="relative mt-10 flex flex-col gap-4 border-t border-white/8 pt-6 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-white/42">
              © {new Date().getFullYear()} ALLYN. Diseñado para que el contenido respire.
            </p>
            <p className="flex items-center gap-2 text-sm text-white/42">
              <Crown className="h-4 w-4 text-primary" />
              Hecho con criterio editorial y ritmo visual
              <Heart className="h-4 w-4 text-rose-400" />
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
      <p className="text-[11px] uppercase tracking-[0.28em] text-white/38">{title}</p>
      <div className="mt-4 flex flex-col gap-3">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-sm text-white/68 transition-colors hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
