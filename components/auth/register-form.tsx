"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/lib/hooks/use-toast"
import { Eye, EyeOff, Loader2, Gift, Mail, ArrowRight, CheckCircle2 } from "lucide-react"

function RegisterFormInner() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [refCode, setRefCode] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { showError } = useToast()

  const redirectTo = searchParams.get("redirect") || "/"

  useEffect(() => {
    const ref = searchParams.get("ref")
    if (ref) setRefCode(ref)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          data: {
            full_name: fullName,
            username,
            ...(refCode ? { referred_by: refCode } : {}),
          },
        },
      })

      if (error) throw error

      // If session is null, Supabase requires email confirmation
      if (!data.session) {
        setEmailSent(true)
        return
      }

      // Fire-and-forget: create profile in background, don't block navigation
      fetch("/api/auth/ensure-profile", { method: "POST" }).catch(() => {})

      router.push(redirectTo)
      router.refresh()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error desconocido"
      showError("Error al crear cuenta", message)
    } finally {
      setLoading(false)
    }
  }

  // ── Email sent confirmation screen ─────────────────────────────────
  if (emailSent) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center mx-auto">
          <Mail className="w-7 h-7 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Revisa tu correo</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Enviamos un enlace de confirmación a{" "}
            <span className="font-medium text-foreground">{email}</span>.
            <br />
            Haz clic en el enlace para activar tu cuenta.
          </p>
        </div>
        <div className="flex items-start gap-3 bg-muted/50 rounded-xl p-4 text-left">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            ¿No lo ves? Revisa tu carpeta de spam o{" "}
            <button
              onClick={() => setEmailSent(false)}
              className="text-primary hover:text-primary/80 underline underline-offset-2"
            >
              vuelve a intentarlo
            </button>
            .
          </p>
        </div>
      </div>
    )
  }

  // ── Registration form ───────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Crea tu cuenta</h2>
        <p className="text-sm text-muted-foreground">
          Empieza gratis. Sin tarjeta de crédito.
        </p>
      </div>

      {/* Referral badge */}
      {refCode && (
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
          <Gift className="w-4 h-4 text-primary shrink-0" />
          <p className="text-sm text-primary/80 font-medium">
            ¡Fuiste invitado! Tienes acceso especial 🎉
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="username" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Usuario
            </label>
            <Input
              id="username"
              type="text"
              placeholder="@tunombre"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="h-10 bg-muted/30 border-border/50 focus:border-primary/40 focus:bg-background transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Nombre
            </label>
            <Input
              id="fullName"
              type="text"
              placeholder="Tu nombre"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
              className="h-10 bg-muted/30 border-border/50 focus:border-primary/40 focus:bg-background transition-colors"
            />
          </div>
        </div>

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
          <label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Contraseña
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
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
          className="w-full h-11 bg-primary text-primary-foreground font-medium gap-2 shadow-lg shadow-primary/20"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            <>
              Crear cuenta gratis
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Al registrarte aceptas nuestros{" "}
        <Link href="/terms" className="text-primary hover:text-primary/80 underline-offset-2 hover:underline">
          Términos
        </Link>{" "}
        y{" "}
        <Link href="/privacy" className="text-primary hover:text-primary/80 underline-offset-2 hover:underline">
          Privacidad
        </Link>
      </p>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href={`/login${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`} className="text-primary hover:text-primary/80 font-medium underline-offset-2 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}

export function RegisterForm() {
  return (
    <Suspense fallback={null}>
      <RegisterFormInner />
    </Suspense>
  )
}
