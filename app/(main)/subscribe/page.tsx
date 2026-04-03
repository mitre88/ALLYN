'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import {
  BookOpen,
  GraduationCap,
  Headphones,
  RefreshCw,
  CheckCircle,
  Crown,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sileo as toast } from 'sileo'
import { useSubscription } from '@/lib/hooks/use-subscription'
import Link from 'next/link'
import { Particles } from '@/components/magicui/particles'
import { BorderBeam } from '@/components/magicui/border-beam'
import { BlurFade } from '@/components/magicui/blur-fade'

const features = [
  {
    icon: GraduationCap,
    title: 'Todos los Cursos en Video',
    description: 'Cursos completos sobre salud, finanzas personales y relaciones de pareja.',
  },
  {
    icon: Headphones,
    title: 'Audiolibros Premium',
    description: 'Aprende en movimiento con la colección de audiolibros exclusivos.',
  },
  {
    icon: BookOpen,
    title: 'Libros y Resúmenes',
    description: 'Biblioteca completa de libros — gratis para todos, con contenido premium adicional para miembros.',
  },
  {
    icon: RefreshCw,
    title: 'Nuevo Contenido Continuamente',
    description: 'Todo el material nuevo que agreguemos está incluido durante tu año de acceso.',
  },
]

function SubscribeContent() {
  const searchParams = useSearchParams()
  const affiliateCode = searchParams.get('ref') || ''
  const [loading, setLoading] = useState(false)
  const { isSubscribed, isLoading } = useSubscription()
  const reduceMotion = useReducedMotion()

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliate_code: affiliateCode }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          toast.error({ title: 'Inicia sesión para continuar' })
          window.location.href = '/login?redirect=/subscribe'
          return
        }
        toast.error({ title: data.error || 'Error al procesar el pago' })
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      toast.error({ title: 'Error de conexión. Intenta de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isSubscribed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-6">
            <Crown className="w-9 h-9 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Tu membresía está activa</h1>
          <p className="text-foreground/55 mb-8">
            Tienes acceso completo a todos los libros, cursos y audiolibros durante tu año de membresía.
          </p>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 rounded-full font-semibold gap-2 shadow-[0_12px_28px_hsl(var(--primary)/0.3)]">
              Ir al inicio
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      </div>
      <Particles className="absolute inset-0" quantity={50} size={0.3} color="hsl(38, 76%, 58%)" staticity={60} />

      <div className="relative z-10 container mx-auto px-4 py-24 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.55 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-semibold">Membresía Anual · $499 primer año</span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
            Acceso completo a{' '}
            <span className="text-primary">ALLYN</span>
          </h1>
          <p className="text-lg text-foreground/55 max-w-2xl mx-auto">
            Todos los libros, cursos y audiolibros sobre salud, dinero y amor —
            $499 el primer año, luego $99/año de renovación automática.
          </p>
        </motion.div>

        {/* Layout: features + pricing card */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Features */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : 0.15 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">¿Qué incluye?</h2>
            {features.map((feature, index) => (
              <BlurFade key={feature.title} delay={0.25 + index * 0.1} inView>
              <div className="flex gap-4 p-4 rounded-2xl bg-foreground/[0.04] border border-foreground/[0.07] hover:border-primary/25 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/12 border border-primary/15 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{feature.title}</h3>
                  <p className="text-foreground/50 text-xs mt-1 leading-relaxed">{feature.description}</p>
                </div>
              </div>
              </BlurFade>
            ))}
          </motion.div>

          {/* Pricing card */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : 0.15 }}
            className="sticky top-24"
          >
            <div className="relative rounded-3xl border border-primary/25 bg-[linear-gradient(160deg,hsl(var(--primary)/0.08)_0%,hsl(var(--background))_50%)] p-8 overflow-hidden shadow-[0_24px_80px_hsl(var(--primary)/0.12)]">
              <BorderBeam size={200} duration={10} colorFrom="hsl(var(--primary))" colorTo="hsl(var(--primary) / 0.2)" />
              {/* Glow */}
              <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 bg-primary/15 rounded-full blur-[60px]" />

              <div className="relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-primary/12 border border-primary/20 rounded-full px-3 py-1.5 mb-5">
                  <Crown className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">Acceso Anual</span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-foreground">$499</span>
                    <div className="mb-2 leading-tight">
                      <p className="text-foreground/70 text-sm font-medium">MXN</p>
                      <p className="text-muted-foreground text-xs">primer año</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2">
                    Luego $99/año · Renovación automática anual
                  </p>
                </div>

                {/* Checklist */}
                <ul className="space-y-3 mb-8">
                  {[
                    'Todos los cursos en video',
                    'Colección de audiolibros premium',
                    'Contenido exclusivo para miembros',
                    'Acceso completo por un año',
                    'Contenido nuevo incluido',
                    'Renovación automática anual $99',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-foreground/80">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                {affiliateCode && (
                  <div className="mb-4 p-3 rounded-xl bg-primary/8 border border-primary/15 text-sm text-foreground/80">
                    Referido por código: <span className="font-bold text-primary">{affiliateCode}</span>
                  </div>
                )}

                <Button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl transition-all duration-200 disabled:opacity-70 gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Pagar $499 MXN — Primer año
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <p className="text-center text-muted-foreground text-xs mt-4">
                  Pago seguro con Stripe · Sin guardar datos de tarjeta
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function SubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <SubscribeContent />
    </Suspense>
  )
}
