'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
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
import { toast } from 'sonner'
import { useSubscription } from '@/lib/hooks/use-subscription'
import Link from 'next/link'

const features = [
  {
    icon: BookOpen,
    title: 'Todos los Libros',
    description: 'Biblioteca completa de libros y resúmenes — acceso inmediato mientras tu membresía esté activa.',
  },
  {
    icon: GraduationCap,
    title: 'Todos los Cursos',
    description: 'Cursos en video sobre salud, finanzas personales y relaciones de pareja.',
  },
  {
    icon: Headphones,
    title: 'Audiolibros',
    description: 'Aprende en movimiento con la colección de audiolibros premium.',
  },
  {
    icon: RefreshCw,
    title: 'Nuevo Contenido Cada Mes',
    description: 'Todo el material nuevo que agreguemos está incluido en tu suscripción mensual.',
  },
]

function SubscribeContent() {
  const searchParams = useSearchParams()
  const affiliateCode = searchParams.get('ref') || ''
  const [loading, setLoading] = useState(false)
  const { isSubscribed, isLoading } = useSubscription()

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
          toast.error('Inicia sesión para continuar')
          window.location.href = '/login'
          return
        }
        toast.error(data.error || 'Error al procesar el pago')
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      toast.error('Error de conexión. Intenta de nuevo.')
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-6">
            <Crown className="w-9 h-9 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Tu membresía está activa</h1>
          <p className="text-foreground/55 mb-8">
            Tienes acceso completo a todos los libros, cursos y audiolibros mientras tu membresía mensual esté vigente.
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

      <div className="relative z-10 container mx-auto px-4 py-24 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-semibold">Membresía Mensual · $499 MXN/mes</span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
            Acceso completo a{' '}
            <span className="text-primary">ALLYN</span>
          </h1>
          <p className="text-lg text-foreground/55 max-w-2xl mx-auto">
            Todos los libros, cursos y audiolibros sobre salud, dinero y amor —
            cancela cuando quieras, sin compromisos ni pagos adicionales.
          </p>
        </motion.div>

        {/* Layout: features + pricing card */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">¿Qué incluye?</h2>
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + index * 0.08 }}
                className="flex gap-4 p-4 rounded-2xl bg-foreground/[0.04] border border-foreground/[0.07] hover:border-primary/25 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/12 border border-primary/15 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{feature.title}</h3>
                  <p className="text-foreground/50 text-xs mt-1 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pricing card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="sticky top-24"
          >
            <div className="relative rounded-3xl border border-primary/25 bg-[linear-gradient(160deg,hsl(var(--primary)/0.08)_0%,hsl(var(--background))_50%)] p-8 overflow-hidden shadow-[0_24px_80px_hsl(var(--primary)/0.12)]">
              {/* Glow */}
              <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 bg-primary/15 rounded-full blur-[60px]" />

              <div className="relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-primary/12 border border-primary/20 rounded-full px-3 py-1.5 mb-5">
                  <Crown className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">Suscripción Mensual</span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-foreground">$499</span>
                    <div className="mb-2 leading-tight">
                      <p className="text-foreground/70 text-sm font-medium">MXN</p>
                      <p className="text-foreground/45 text-xs">por mes</p>
                    </div>
                  </div>
                  <p className="text-foreground/45 text-sm mt-2">
                    Se renueva cada mes · Cancela cuando quieras
                  </p>
                </div>

                {/* Checklist */}
                <ul className="space-y-3 mb-8">
                  {[
                    'Todos los libros y resúmenes',
                    'Todos los cursos en video',
                    'Colección completa de audiolibros',
                    'Acceso mientras tu membresía esté activa',
                    'Contenido nuevo cada mes incluido',
                    'Sin permanencia ni contratos',
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
                  className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-[0_14px_36px_hsl(var(--primary)/0.35)] transition-all duration-200 hover:shadow-[0_18px_40px_hsl(var(--primary)/0.45)] hover:scale-[1.015] disabled:opacity-70 disabled:scale-100 gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Suscribirme — $499 MXN/mes
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <p className="text-center text-foreground/30 text-xs mt-4">
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
