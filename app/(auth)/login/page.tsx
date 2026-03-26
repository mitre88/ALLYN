import { LoginForm } from "@/components/auth/login-form"

export const metadata = {
  title: "Iniciar sesión - ALLYN",
  description: "Inicia sesión en ALLYN para acceder a tu contenido de desarrollo personal",
}

export default function LoginPage() {
  return (
    <div className="w-full flex justify-center">
      <LoginForm />
    </div>
  )
}
