'use client'

import { useState, useEffect, Suspense } from 'react'
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
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useSubscription } from '@/lib/hooks/use-subscription'
import Link from 'next/link'

const features = [
  {
    icon: BookOpen,
    title: 'Todos los Libros',
    description: 'Acceso ilimitado a nuestra biblioteca completa de resúmenes y libros completos.',
  },
  {
    icon: GraduationCap,
    title: 'Todos los Cursos',
    description: 'Cursos en video sobre salud, finanzas personales y relaciones de pareja.',
  },
  {
    icon: Headphones,
    title: 'Audiolibros',
    description: 'Aprende mientras te desplazas con nuestra colección de audiolibros premium.',
  },
  {
    icon: RefreshCw,
    title: 'Actualizaciones Futuras Gratis',
    description: 'Todo el contenido nuevo que agreguemos estará incluido sin costo adicional.',
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
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    )
  }

  if (isSubscribed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Ya eres miembro</h1>
          <p className="text-white/60 mb-8">
            Tienes acceso vitalicio a todo el contenido de ALLYN. ¡Disfrútalo!
          </p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3">
              Ir al inicio
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-background to-pink-900/20 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-24 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
            <Star className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">Oferta de por vida</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Transforma tu vida con{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ALLYN
            </span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Accede a todos los libros, cursos y audiolibros sobre salud, dinero y amor — para siempre, con un solo pago.
          </p>
        </motion.div>

        {/* Pricing Card + Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold text-white mb-6">¿Qué incluye?</h2>
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                  <p className="text-white/50 text-xs mt-1">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pricing Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="sticky top-24"
          >
            <div className="relative rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/20 p-8 overflow-hidden">
              {/* Glow effect */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">Acceso Vitalicio</span>
                </div>

                <div className="mb-6">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-white">$499</span>
                    <span className="text-white/60 mb-2">MXN</span>
                  </div>
                  <p className="text-white/50 text-sm">Pago único — sin mensualidades</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    'Todos los libros y resúmenes',
                    'Todos los cursos en video',
                    'Colección completa de audiolibros',
                    'Acceso instantáneo y vitalicio',
                    'Actualizaciones futuras sin costo',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-white/80">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                {affiliateCode && (
                  <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-300">
                    Referido por código: <span className="font-bold">{affiliateCode}</span>
                  </div>
                )}

                <Button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full h-14 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200 hover:shadow-purple-500/40 hover:scale-[1.02] disabled:opacity-70 disabled:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    'Suscribirse Ahora — $499 MXN'
                  )}
                </Button>

                <p className="text-center text-white/30 text-xs mt-4">
                  Pago seguro con Stripe. No se guardan datos de tarjeta.
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
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      }
    >
      <SubscribeContent />
    </Suspense>
  )
}
