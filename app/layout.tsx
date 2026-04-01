import type { Metadata } from "next"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/providers/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "ALLYN — Transformación Personal",
  description: "Descubre contenido transformador en Salud, Dinero y Amor. Tu viaje de crecimiento personal comienza aquí.",
  keywords: ["desarrollo personal", "salud", "dinero", "amor", "crecimiento", "cursos", "videos"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
