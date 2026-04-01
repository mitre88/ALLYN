"use client"

import { motion } from "framer-motion"
import { Heart, TrendingUp, Sparkles, Star, ArrowRight } from "lucide-react"

const pillars = [
  {
    icon: Heart,
    label: "Salud",
    sub: "Hábitos, nutrición y bienestar",
    color: "text-rose-400",
    bg: "bg-rose-500/6 border-rose-500/12",
    glow: "from-rose-500/12",
  },
  {
    icon: TrendingUp,
    label: "Dinero",
    sub: "Finanzas personales e inversión",
    color: "text-primary",
    bg: "bg-primary/6 border-primary/12",
    glow: "from-primary/12",
  },
  {
    icon: Sparkles,
    label: "Amor",
    sub: "Relaciones y conexión profunda",
    color: "text-pink-400",
    bg: "bg-pink-500/6 border-pink-500/12",
    glow: "from-pink-500/12",
  },
]

const stagger = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.35 } },
  },
  item: {
    hidden: { opacity: 0, x: -14 },
    show: { opacity: 1, x: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
  },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* LEFT — brand panel */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col relative overflow-hidden">
        {/* Background — richer layered depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#180f06] via-[#0c0803] to-[#080603]" />
        <div className="absolute inset-0">
          {/* Primary amber orb — top left */}
          <div className="absolute -top-16 -left-24 w-[520px] h-[520px] bg-amber-600/12 rounded-full blur-[120px]" />
          {/* Secondary orb — bottom right */}
          <div className="absolute bottom-0 right-0 w-[480px] h-[480px] bg-rose-600/7 rounded-full blur-[110px] translate-x-1/4 translate-y-1/4" />
          {/* Mid accent */}
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[90px] -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Refined grid — tighter, higher contrast */}
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 80% 80% at 30% 40%, black, transparent)",
          }}
        />

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-12 xl:px-16 py-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-2xl border border-white/10 bg-[linear-gradient(155deg,hsl(var(--primary)/0.9)_0%,rgba(18,13,8,0.9)_100%)] flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
              <span className="font-display text-base font-bold text-white">A</span>
            </div>
            <span className="font-display text-xl font-semibold text-white tracking-[0.01em]">ALLYN</span>
          </motion.div>

          {/* Main copy */}
          <div className="flex-1 flex flex-col justify-center gap-8 mt-14">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
              className="space-y-5"
            >
              <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/14 rounded-full px-4 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] font-semibold text-primary/80 tracking-[0.22em] uppercase">
                  Plataforma de transformación
                </span>
              </div>

              <h1 className="font-display text-4xl xl:text-[2.75rem] font-semibold leading-[1.08] text-white">
                Transforma tu vida{" "}
                <span className="text-primary">en las 3 áreas</span>{" "}
                que importan
              </h1>

              <p className="text-[15px] text-white/46 leading-relaxed max-w-sm">
                Cursos, libros, videos y guías de expertos sobre salud, dinero y relaciones.
              </p>
            </motion.div>

            {/* Pillars — staggered entrance */}
            <motion.div
              variants={stagger.container}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-2"
            >
              {pillars.map(({ icon: Icon, label, sub, color, bg }) => (
                <motion.div
                  key={label}
                  variants={stagger.item}
                  className={`group flex items-center gap-3.5 ${bg} rounded-2xl px-4 py-3.5 border cursor-default transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]`}
                >
                  <div className="w-8 h-8 rounded-xl bg-black/20 border border-white/8 flex items-center justify-center flex-shrink-0">
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white/82">{label}</p>
                    <p className="text-[11px] text-white/36 mt-0.5">{sub}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-white/18 ml-auto opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 duration-200" />
                </motion.div>
              ))}
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
              className="flex items-center gap-4"
            >
              <div className="flex -space-x-2">
                {["A", "M", "R", "S"].map((letter, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#0c0803] bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-xs font-bold text-white shadow-sm"
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
                <p className="text-xs text-white/36 mt-0.5">+2,400 personas transformando su vida</p>
              </div>
            </motion.div>
          </div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-auto pt-8 border-t border-white/7"
          >
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 fill-primary/60 text-primary/60" />
              ))}
            </div>
            <blockquote className="text-sm text-white/46 leading-relaxed italic">
              "En 3 meses mejoré mi salud, dupliqué mis ingresos y encontré el amor. ALLYN cambió mi perspectiva por completo."
            </blockquote>
            <div className="mt-4 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center text-xs font-bold text-black shadow-sm">
                K
              </div>
              <div>
                <p className="text-xs font-semibold text-white/55">Karla M.</p>
                <p className="text-[11px] text-white/28">Ciudad de México</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-6 py-12 sm:px-10 relative">
        {/* Subtle right-panel background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/4 rounded-full blur-[80px] pointer-events-none" />

        {/* Mobile logo */}
        <div className="flex items-center gap-2.5 mb-10 lg:hidden">
          <div className="w-8 h-8 rounded-xl border border-white/10 bg-[linear-gradient(155deg,hsl(var(--primary)/0.85)_0%,rgba(18,13,8,0.85)_100%)] flex items-center justify-center">
            <span className="font-display text-sm font-bold text-white">A</span>
          </div>
          <span className="font-display text-xl font-semibold tracking-[0.01em] text-foreground">ALLYN</span>
        </div>

        <div className="w-full max-w-[400px] relative z-10">
          {children}
        </div>
      </div>
    </div>
  )
}
