import { RegisterForm } from "@/components/auth/register-form"

export const metadata = {
  title: "Crear cuenta - ALLYN",
  description: "Crea tu cuenta en ALLYN y comienza tu viaje de transformación personal",
}

export default function RegisterPage() {
  return (
    <div className="w-full flex justify-center">
      <RegisterForm />
    </div>
  )
}
