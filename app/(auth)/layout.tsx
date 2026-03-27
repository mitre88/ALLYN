"use client"

import { Heart, TrendingUp, Sparkles, Star } from "lucide-react"

const pillars = [
  { icon: Heart, label: "Salud", color: "text-rose-400", bg: "bg-rose-400/8 border-rose-400/10" },
  { icon: TrendingUp, label: "Dinero", color: "text-primary", bg: "bg-primary/8 border-primary/10" },
  { icon: Sparkles, label: "Amor", color: "text-pink-400", bg: "bg-pink-400/8 border-pink-400/10" },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* LEFT — brand panel */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1105] via-[#0e0a05] to-[#0a0703]" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[130px] -translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-rose-600/8 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4" />
        </div>

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-12 xl:px-16 py-12">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="font-sf text-2xl font-bold text-foreground tracking-tight">ALLYN</span>
          </div>

          {/* Main copy */}
          <div className="flex-1 flex flex-col justify-center gap-8 mt-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/15 rounded-full px-4 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="font-sf text-xs font-medium text-primary/80 tracking-wide uppercase">Plataforma de transformación</span>
              </div>

              <h1 className="font-sf text-4xl xl:text-5xl font-bold leading-[1.1] text-foreground">
                Transforma tu vida{" "}
                <span className="text-primary">en las 3 áreas</span>{" "}
                que importan
              </h1>

              <p className="text-base text-foreground/50 leading-relaxed max-w-md">
                Cursos, libros, videos y guías de expertos sobre salud, dinero y relaciones. Todo en un solo lugar.
              </p>
            </div>

            {/* Pillars */}
            <div className="flex flex-col gap-2.5">
              {pillars.map(({ icon: Icon, label, color, bg }) => (
                <div key={label} className={`flex items-center gap-3 ${bg} rounded-xl px-4 py-3 border`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-sm font-medium text-foreground/75">{label}</span>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {["A", "M", "R", "S"].map((letter, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#0e0a05] bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-xs font-bold text-white"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-xs text-foreground/40 mt-0.5">+2,400 personas transformando su vida</p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-auto pt-8 border-t border-white/8">
            <blockquote className="text-sm text-foreground/50 italic leading-relaxed">
              "En 3 meses mejoré mi salud, dupliqué mis ingresos y encontré el amor. ALLYN cambió mi perspectiva por completo."
            </blockquote>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center text-xs font-bold text-black">
                K
              </div>
              <span className="text-xs text-foreground/35">Karla M. — Ciudad de México</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-6 py-12 sm:px-10">
        {/* Mobile logo */}
        <div className="flex items-center mb-10 lg:hidden">
          <span className="font-sf text-2xl font-bold tracking-tight text-foreground">ALLYN</span>
        </div>

        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>
    </div>
  )
}
