import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-foreground/10 mb-4 tabular-nums">404</p>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Pagina no encontrada
        </h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          El contenido que buscas no existe o fue movido. Regresa al inicio para seguir explorando la biblioteca.
        </p>
        <Link href="/">
          <Button className="rounded-full px-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  )
}
