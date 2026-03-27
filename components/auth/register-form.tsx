"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/lib/hooks/use-toast"
import { BlurFade } from "@/components/magicui/blur-fade"
import { Eye, EyeOff, Loader2, Gift } from "lucide-react"

function RegisterFormInner() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [refCode, setRefCode] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    const ref = searchParams.get("ref")
    if (ref) setRefCode(ref)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username,
            ...(refCode ? { referred_by: refCode } : {}),
          },
        },
      })

      if (error) throw error

      showSuccess("¡Cuenta creada!", "Bienvenido a ALLYN. Tu transformación comienza ahora.")
      router.push("/")
      router.refresh()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error desconocido"
      showError("Error al crear cuenta", message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BlurFade delay={0.1}>
      <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ALLYN
          </CardTitle>
          <CardDescription className="text-center">
            Crea tu cuenta y comienza tu viaje de transformación
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Referral badge */}
          {refCode && (
            <div className="mb-4 flex items-center gap-2 bg-purple-900/20 border border-purple-500/30 rounded-lg px-3 py-2.5">
              <Gift className="w-4 h-4 text-purple-400 shrink-0" />
              <p className="text-sm text-purple-300 font-medium">
                ¡Fuiste invitado por un amigo! 🎉
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Nombre de usuario
              </label>
              <Input
                id="username"
                type="text"
                placeholder="@tunombre"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-background"
                autoComplete="username"
              />
            </div>

            {/* Full name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Nombre completo
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="Tu nombre"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-background"
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-background pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </BlurFade>
  )
}

export function RegisterForm() {
  return (
    <Suspense fallback={null}>
      <RegisterFormInner />
    </Suspense>
  )
}
