import { NextRequest, NextResponse } from 'next/server'
import { stripe, RENEWAL_PRICE_MXN, SETUP_FEE_MXN } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://allyn-taupe.vercel.app'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { affiliate_code } = await request.json().catch(() => ({ affiliate_code: null }))

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_subscribed, role')
      .eq('id', user.id)
      .single()

    if (profile?.is_subscribed) {
      return NextResponse.json({ error: 'Ya tienes una suscripción activa' }, { status: 400 })
    }

    // Pricing: $499 primer año = $400 cargo inicial + $99 suscripción anual
    // Renovaciones año 2+: $99/año automáticos vía Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            unit_amount: RENEWAL_PRICE_MXN, // $99 — precio recurrente anual
            recurring: { interval: 'year' },
            product_data: {
              name: 'ALLYN — Membresía Anual',
              description: 'Acceso completo a todos los cursos, audiolibros y libros. Renovación automática cada año.',
              images: [`${APP_URL}/og-image.png`],
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        // Cargo único de inicio: primer pago = $99 + $400 = $499 total
        add_invoice_items: [
          {
            price_data: {
              currency: 'mxn',
              unit_amount: SETUP_FEE_MXN, // $400 — solo se cobra una vez
              product_data: {
                name: 'ALLYN — Registro Inicial',
                description: 'Cargo único al registrarse.',
              },
            },
          },
        ],
        metadata: {
          user_id: user.id,
          affiliate_code: affiliate_code || '',
        },
      },
      metadata: {
        user_id: user.id,
        affiliate_code: affiliate_code || '',
      },
      success_url: `${APP_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/subscribe`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Error al crear sesión de pago' }, { status: 500 })
  }
}
