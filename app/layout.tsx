import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ALLYN - Tu Plataforma de Desarrollo Personal",
  description: "Descubre contenido transformador en Salud, Dinero y Amor. Tu viaje de crecimiento personal comienza aquí.",
  keywords: ["desarrollo personal", "salud", "dinero", "amor", "crecimiento", "cursos", "videos"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className={inter.className}>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  )
}
