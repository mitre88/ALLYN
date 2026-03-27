"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/lib/hooks/use-toast"
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { showError } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      const accessToken =
        data.session?.access_token ?? (await supabase.auth.getSession()).data.session?.access_token

      const ensureProfileResponse = await fetch("/api/auth/ensure-profile", {
        method: "POST",
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : undefined,
      })

      if (!ensureProfileResponse.ok) {
        const payload = await ensureProfileResponse.json().catch(() => null)
        throw new Error(payload?.details || "No se pudo crear el perfil del usuario")
      }

      router.push("/")
      router.refresh()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error desconocido"
      const title = /email not confirmed/i.test(message)
        ? "Confirma tu correo primero"
        : "Error al iniciar sesión"

      showError(title, message)
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
          className="w-full h-11 bg-gradient-to-r bg-primary  text-white font-medium gap-2 shadow-lg shadow-primary/20"
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
