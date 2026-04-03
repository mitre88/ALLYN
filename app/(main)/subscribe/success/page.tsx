'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2, Crown, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sileo as toast } from 'sileo'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const session_id = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (!session_id) {
      setStatus('error')
      return
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/stripe/verify?session_id=${session_id}`)
        const data = await res.json()

        if (data.paid) {
          setStatus('success')
          toast.success({ title: '¡Bienvenido a ALLYN! Tu suscripción está activa.' })
        } else {
          setStatus('error')
          toast.error({ title: 'No se pudo verificar el pago. Contacta soporte.' })
        }
      } catch {
        setStatus('error')
        toast.error({ title: 'Error al verificar el pago.' })
      }
    }

    verify()
  }, [session_id])

  // Countdown redirect after success
  useEffect(() => {
    if (status !== 'success') return
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
        <p className="text-white/60 text-sm">Verificando tu pago...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Algo salió mal</h1>
          <p className="text-white/60 mb-8">
            No pudimos verificar tu pago. Si realizaste el pago, tu cuenta se activará en breve. Escríbenos si el problema persiste.
          </p>
          <Button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          >
            Ir al inicio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-pink-900/20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
        className="relative z-10 text-center max-w-lg"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-500/40"
        >
          <CheckCircle className="w-12 h-12 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-2 mb-4">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-300 font-medium">Suscripción Activa</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ¡Bienvenido a{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ALLYN
            </span>
            !
          </h1>

          <p className="text-white/60 text-lg mb-8">
            Tu acceso anual está activo. Ahora tienes acceso a todos los libros, cursos y audiolibros por un año completo.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { emoji: '📚', label: 'Libros' },
              { emoji: '🎓', label: 'Cursos' },
              { emoji: '🎧', label: 'Audiolibros' },
            ].map((item) => (
              <div
                key={item.label}
                className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"
              >
                <div className="text-2xl mb-1">{item.emoji}</div>
                <div className="text-xs text-white/60">{item.label}</div>
              </div>
            ))}
          </div>

          <Button
            onClick={() => router.push('/')}
            className="h-14 px-10 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg shadow-purple-500/25"
          >
            Explorar contenido
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-white/30 text-sm mt-4">
            Redirigiendo automáticamente en {countdown}s...
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
