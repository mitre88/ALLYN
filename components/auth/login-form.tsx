"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/lib/hooks/use-toast"
import { Eye, EyeOff, Loader2, ArrowRight, Mail } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { showError } = useToast()

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/api/auth/callback` },
      })
      if (error) throw error
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error con Google"
      showError("Error al iniciar sesión con Google", message)
      setLoadingGoogle(false)
    }
  }

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

      {/* Google OAuth */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 gap-2 font-medium"
        onClick={handleGoogleLogin}
        disabled={loadingGoogle || loading}
        aria-label="Iniciar sesión con Google"
      >
        {loadingGoogle ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        Continuar con Google
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border/50" />
        <span className="text-xs text-muted-foreground">o con email</span>
        <div className="flex-1 h-px bg-border/50" />
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
          className="w-full h-11 bg-gradient-to-r bg-primary text-white font-medium gap-2 shadow-lg shadow-primary/20"
          disabled={loading || loadingGoogle}
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
