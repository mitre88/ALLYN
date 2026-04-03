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
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border border-border/50 bg-card p-6 shadow-lg dark:shadow-2xl sm:p-8 lg:p-10"
      >
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            <span className="h-px w-8 bg-primary/60" />
            <span>Bienvenido(a) a ALLYN</span>
          </div>

          <h2 className="font-display text-3xl font-semibold leading-tight text-foreground text-balance md:text-[2.6rem]">
            Libros, cursos y audiolibros sobre lo que realmente importa.
          </h2>

          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Contenido curado en tres pilares fundamentales. Crea tu cuenta gratis para explorar la biblioteca con vistas previas de todo el catálogo.
          </p>

          {/* Pillar pills */}
          <div className="flex flex-wrap gap-2.5">
            {pillars.map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 rounded-full bg-foreground/[0.05] px-3.5 py-2 text-sm font-medium text-foreground/75"
              >
                <Icon aria-hidden="true" className="h-4 w-4" style={{ color }} />
                {label}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 pt-1">
            <Link href="/register">
              <Button
                size="lg"
                className="gap-2 rounded-full px-7 text-sm font-semibold"
              >
                Crear cuenta gratis
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="ghost"
                className="rounded-full px-7 text-sm text-foreground/70 hover:text-foreground"
              >
                Ya tengo cuenta
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature grid — minimal, no nested glass cards */}
        <div className="mt-10 grid gap-6 border-t border-border/40 pt-8 sm:grid-cols-3">
          {[
            { icon: BookOpen, title: "6 Libros", desc: "Vista previa gratuita de toda la biblioteca" },
            { icon: GraduationCap, title: "Cursos en video", desc: "Fragmentos de 90s para probar antes de decidir" },
            { icon: Sparkles, title: "Contenido nuevo", desc: "Actualizado continuamente con material fresco" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title}>
              <Icon aria-hidden="true" className="mb-3 h-5 w-5 text-primary" />
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
