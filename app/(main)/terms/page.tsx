import Link from "next/link"

export const metadata = {
  title: "Términos de Uso - ALLYN",
  description: "Términos y condiciones de uso de la plataforma ALLYN.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto max-w-3xl px-4 md:px-8">
        <div className="space-y-2 mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">Legal</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Términos de Uso</h1>
          <p className="text-white/50 text-sm">Última actualización: marzo de 2026</p>
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Aceptación de los términos</h2>
            <p>
              Al acceder y utilizar la plataforma ALLYN ("el Servicio"), aceptas quedar vinculado por estos Términos de Uso. Si no estás de acuerdo con alguna parte de estos términos, no deberás acceder al Servicio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Descripción del servicio</h2>
            <p>
              ALLYN es una plataforma digital de contenido educativo y de desarrollo personal que ofrece libros, audiolibros, cursos en video y materiales formativos en las áreas de salud, finanzas y relaciones personales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Suscripción y pagos</h2>
            <p>
              El acceso al contenido premium requiere una suscripción activa. Al suscribirte, autorizas el cargo recurrente según el plan seleccionado. Los precios están expresados en pesos mexicanos (MXN) e incluyen los impuestos aplicables.
            </p>
            <p className="mt-3">
              Puedes cancelar tu suscripción en cualquier momento desde tu perfil. La cancelación tendrá efecto al final del período de facturación vigente y no genera reembolso por el período en curso.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Uso permitido</h2>
            <p>
              El contenido de ALLYN es exclusivamente para uso personal y no comercial. Queda estrictamente prohibido:
            </p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-white/60">
              <li>Reproducir, distribuir o compartir el contenido sin autorización</li>
              <li>Utilizar el contenido con fines comerciales</li>
              <li>Descargar o copiar material protegido por derechos de autor</li>
              <li>Compartir credenciales de acceso con terceros</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Propiedad intelectual</h2>
            <p>
              Todo el contenido disponible en ALLYN — incluyendo textos, imágenes, videos, audios y materiales formativos — está protegido por derechos de autor. ALLYN tiene licencia para distribuir dicho contenido en su plataforma, pero no transfiere ningún derecho de propiedad al usuario.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos de cambios significativos por correo electrónico o mediante un aviso visible en la plataforma. El uso continuado del Servicio después de dichos cambios constituye tu aceptación de los nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Contacto</h2>
            <p>
              Para cualquier consulta sobre estos términos, puedes escribirnos a{" "}
              <a href="mailto:contacto@allyn.mx" className="text-primary hover:text-primary/80 underline-offset-2 hover:underline">
                contacto@allyn.mx
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/8">
          <Link href="/" className="text-sm text-white/40 hover:text-white/70 transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
