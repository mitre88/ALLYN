import Link from "next/link"

export const metadata = {
  title: "Política de Privacidad - ALLYN",
  description: "Política de privacidad y tratamiento de datos personales de ALLYN.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto max-w-3xl px-4 md:px-8">
        <div className="space-y-2 mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">Legal</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Política de Privacidad</h1>
          <p className="text-white/50 text-sm">Última actualización: marzo de 2026</p>
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Información que recopilamos</h2>
            <p>
              Al registrarte y utilizar ALLYN, recopilamos la siguiente información:
            </p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-white/60">
              <li>Nombre y dirección de correo electrónico</li>
              <li>Información de pago (procesada de forma segura por Stripe; no almacenamos datos de tarjeta)</li>
              <li>Datos de uso: contenido visto, tiempo de sesión, progreso</li>
              <li>Información técnica: dirección IP, tipo de dispositivo y navegador</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Uso de la información</h2>
            <p>Utilizamos tu información para:</p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-white/60">
              <li>Brindar y mejorar el Servicio</li>
              <li>Procesar pagos y gestionar tu suscripción</li>
              <li>Enviarte comunicaciones relacionadas con tu cuenta o el contenido (puedes darte de baja)</li>
              <li>Garantizar la seguridad de la plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Compartición de datos</h2>
            <p>
              No vendemos ni compartimos tu información personal con terceros, excepto:
            </p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-white/60">
              <li><strong className="text-white/80">Stripe</strong> — procesamiento de pagos</li>
              <li><strong className="text-white/80">Supabase</strong> — almacenamiento seguro de datos</li>
              <li>Cuando sea requerido por ley o autoridad competente</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Cookies y tecnologías similares</h2>
            <p>
              Utilizamos cookies esenciales para mantener tu sesión activa y garantizar el correcto funcionamiento del Servicio. No utilizamos cookies de rastreo de terceros para publicidad.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Seguridad de los datos</h2>
            <p>
              Implementamos medidas técnicas y organizativas para proteger tu información, incluyendo cifrado en tránsito (HTTPS) y en reposo. Sin embargo, ningún sistema es 100% seguro y no podemos garantizar la seguridad absoluta de los datos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Tus derechos</h2>
            <p>Tienes derecho a:</p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-white/60">
              <li>Acceder a los datos personales que tenemos sobre ti</li>
              <li>Solicitar la corrección de datos inexactos</li>
              <li>Solicitar la eliminación de tu cuenta y datos asociados</li>
              <li>Retirar tu consentimiento en cualquier momento</li>
            </ul>
            <p className="mt-3">
              Para ejercer estos derechos, escríbenos a{" "}
              <a href="mailto:contacto@allyn.mx" className="text-primary hover:text-primary/80 underline-offset-2 hover:underline">
                contacto@allyn.mx
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Retención de datos</h2>
            <p>
              Conservamos tu información mientras tu cuenta esté activa. Si eliminas tu cuenta, borraremos tus datos personales en un plazo de 30 días, excepto cuando la ley nos obligue a conservarlos por más tiempo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Cambios a esta política</h2>
            <p>
              Podemos actualizar esta política periódicamente. Te notificaremos por correo electrónico ante cambios significativos. La fecha de última actualización siempre estará visible al inicio de este documento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Contacto</h2>
            <p>
              Para cualquier consulta sobre privacidad, escríbenos a{" "}
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
