"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { Eye, EyeOff, Loader2, ArrowRight, Mail } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setNeedsConfirmation(false)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      router.refresh()
      router.push("/")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error desconocido"
      if (message.toLowerCase().includes("email not confirmed") || message.toLowerCase().includes("confirm")) {
        setNeedsConfirmation(true)
      } else if (message.toLowerCase().includes("invalid login credentials")) {
        setFormError("Correo o contraseña incorrectos.")
      } else {
        setFormError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Bienvenido de vuelta</h2>
        <p className="text-sm text-muted-foreground">
          Continúa tu transformación donde la dejaste.
        </p>
      </div>

      {/* Email confirmation warning */}
      {needsConfirmation && (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4" role="alert">
          <Mail className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-600 dark:text-amber-400 leading-relaxed">
            Debes confirmar tu correo antes de iniciar sesión.
            Revisa tu bandeja de entrada (y carpeta de spam).
          </p>
        </div>
      )}

      {/* Inline error */}
      {formError && (
        <div
          className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3"
          role="alert"
        >
          {formError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Correo electrónico
          </label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="h-10 bg-muted/30 border-border/50 focus:border-primary/40 focus:bg-background transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Contraseña
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:text-primary/80 underline-offset-2 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="h-10 bg-muted/30 border-border/50 focus:border-primary/40 focus:bg-background transition-colors pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-primary text-white font-medium gap-2 shadow-lg shadow-primary/20"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            <>
              Iniciar sesión
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="text-primary hover:text-primary/80 font-medium underline-offset-2 hover:underline">
          Regístrate gratis
        </Link>
      </p>
    </div>
  )
}
