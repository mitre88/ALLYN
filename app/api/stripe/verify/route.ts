import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const session_id = searchParams.get('session_id') ?? null

  if (!session_id) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ paid: false, status: session.payment_status })
    }

    const user_id = session.metadata?.user_id
    const affiliate_code = session.metadata?.affiliate_code

    if (!user_id) {
      return NextResponse.json({ paid: true, activated: false })
    }

    const supabase = await createClient()

    // Check if already activated
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('stripe_session_id', session_id)
      .single()

    if (existing) {
      // Already processed by webhook
      return NextResponse.json({ paid: true, activated: true })
    }

    // Activate subscription (fallback if webhook missed)
    await supabase
      .from('profiles')
      .update({
        is_subscribed: true,
        stripe_customer_id: session.customer as string || null,
      })
      .eq('id', user_id)

    const { data: subscription } = await supabase
      .from('subscriptions')
      .insert({
        user_id,
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string || null,
        amount: session.amount_total || 49900,
        currency: session.currency || 'mxn',
        status: 'completed',
        affiliate_code: affiliate_code || null,
      })
      .select()
      .single()

    if (affiliate_code && affiliate_code.trim() !== '') {
      const { data: referrerProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', affiliate_code)
        .single()

      if (referrerProfile) {
        await supabase.from('affiliates').insert({
          referrer_id: referrerProfile.id,
          referred_user_id: user_id,
          referred_email: session.customer_email || '',
          commission_amount: 29900,
          status: 'earned',
          subscription_id: subscription?.id || null,
        })
      }
    }

    return NextResponse.json({ paid: true, activated: true })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Error verificando pago' }, { status: 500 })
  }
}
