"use client"

import Image from "next/image"
import { Heart, TrendingUp, Sparkles, Star } from "lucide-react"

const pillars = [
  { icon: Heart, label: "Salud", color: "text-rose-400", bg: "bg-rose-400/10" },
  { icon: TrendingUp, label: "Dinero", color: "text-amber-400", bg: "bg-amber-400/10" },
  { icon: Sparkles, label: "Amor", color: "text-violet-400", bg: "bg-violet-400/10" },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* LEFT — brand panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-[#0d0918] to-[#0d0918]" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] -translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-600/15 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-12 xl:px-16 py-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">ALLYN</span>
          </div>

          {/* Main copy */}
          <div className="flex-1 flex flex-col justify-center gap-8 mt-16">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/20 rounded-full px-4 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-xs font-medium text-violet-300 tracking-wide uppercase">Plataforma de transformación</span>
              </div>

              <h1 className="text-4xl xl:text-5xl font-bold leading-[1.1] text-white">
                Transforma tu vida{" "}
                <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                  en las 3 áreas
                </span>{" "}
                que importan
              </h1>

              <p className="text-base xl:text-lg text-white/60 leading-relaxed max-w-md">
                Cursos, libros, videos y guías de expertos sobre salud, dinero y relaciones. Todo en un solo lugar.
              </p>
            </div>

            {/* Pillars */}
            <div className="flex flex-col gap-3">
              {pillars.map(({ icon: Icon, label, color, bg }) => (
                <div key={label} className={`flex items-center gap-3 ${bg} rounded-xl px-4 py-3 border border-white/5`}>
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <span className="text-sm font-medium text-white/80">{label}</span>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {["A", "M", "R", "S"].map((letter, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#0d0918] bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-white/50 mt-0.5">+2,400 personas transformando su vida</p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-auto pt-8 border-t border-white/10">
            <blockquote className="text-sm text-white/60 italic leading-relaxed">
              "En 3 meses mejoré mi salud, dupliqué mis ingresos y encontré el amor. ALLYN cambió mi perspectiva por completo."
            </blockquote>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-xs font-bold text-white">
                K
              </div>
              <span className="text-xs font-medium text-white/40">Karla M. — Ciudad de México</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-6 py-12 sm:px-10 relative overflow-hidden">
        {/* Subtle bg for mobile */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-background to-background lg:hidden" />

        {/* Mobile logo */}
        <div className="relative z-10 flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">ALLYN</span>
        </div>

        <div className="relative z-10 w-full max-w-[400px]">
          {children}
        </div>
      </div>
    </div>
  )
}
