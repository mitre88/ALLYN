import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { affiliate_code } = await request.json().catch(() => ({ affiliate_code: null }))

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile?.is_subscribed) {
      return NextResponse.json({ error: 'Ya tienes una suscripción activa' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            unit_amount: 49900,
            recurring: { interval: 'month' },
            product_data: {
              name: 'ALLYN - Membresía Mensual',
              description: 'Acceso mensual a todos los libros, cursos, audiolibros y contenido nuevo.',
              images: [`${APP_URL}/og-image.png`],
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/subscribe`,
      metadata: {
        user_id: user.id,
        affiliate_code: affiliate_code || '',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Error al crear sesión de pago' }, { status: 500 })
  }
}
