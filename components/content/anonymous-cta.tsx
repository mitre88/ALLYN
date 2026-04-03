"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, BookOpen, GraduationCap, Heart, Banknote, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const pillars = [
  { icon: Heart, label: "Salud", color: "#ef4444" },
  { icon: Banknote, label: "Dinero", color: "#eab308" },
  { icon: Sparkles, label: "Amor", color: "#ec4899" },
]

export function AnonymousCta() {
  return (
    <section className="container mx-auto px-4 pt-12 md:px-8 md:pt-16 xl:pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative overflow-hidden rounded-[36px] border border-border/50 bg-card/95 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.10)] dark:shadow-[0_30px_120px_rgba(0,0,0,0.36)] sm:p-7 md:p-8 lg:p-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.22),transparent_34%),radial-gradient(circle_at_80%_18%,hsl(var(--foreground)/0.04),transparent_20%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute -left-12 top-0 h-36 w-36 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-rose-500/10 blur-3xl" />

        <div className="relative space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-[var(--glass-bg)] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Plataforma de desarrollo personal
          </div>

          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-foreground/36">
              <span className="h-px w-10 rounded-full bg-primary/70" />
              <span>Bienvenido a ALLYN</span>
            </div>
            <h2 className="font-display text-3xl font-semibold leading-tight text-foreground text-balance md:text-[2.8rem]">
              Libros, cursos y audiolibros sobre lo que realmente importa.
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-foreground/68 text-pretty md:text-base">
              Contenido curado en tres pilares fundamentales. Crea tu cuenta gratis para explorar la biblioteca con vistas previas de todo el catálogo.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {pillars.map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-[var(--glass-bg)] px-3.5 py-2 text-sm font-medium text-foreground/78"
              >
                <Icon aria-hidden="true" className="h-4 w-4" style={{ color }} />
                {label}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap gap-3">
              <Link href="/register">
                <Button
                  size="lg"
                  className="gap-2 rounded-full px-7 text-sm font-semibold shadow-[0_18px_34px_hsl(var(--primary)/0.24)]"
                >
                  Crear cuenta gratis
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-border/50 bg-[var(--glass-bg)] px-7 text-sm text-foreground backdrop-blur-sm hover:bg-[var(--glass-bg-strong)] hover:text-foreground"
                >
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: BookOpen, title: "6 Libros", desc: "Vista previa gratuita de toda la biblioteca" },
              { icon: GraduationCap, title: "Cursos en video", desc: "Fragmentos de 90s para que pruebes antes de decidir" },
              { icon: Sparkles, title: "Contenido nuevo", desc: "Actualizado continuamente con material fresco" },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-[20px] border border-border/40 bg-[var(--glass-bg)] p-4 backdrop-blur-sm"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-border/40 bg-[var(--glass-bg)]">
                  <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-foreground/55">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
