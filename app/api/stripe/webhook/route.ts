import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const user_id = session.metadata?.user_id
    const affiliate_code = session.metadata?.affiliate_code

    if (!user_id) {
      console.error('No user_id in session metadata')
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }

    // Use admin client to bypass RLS for server-side operations
    const supabase = createAdminClient()

    // Update profile: set is_subscribed = true
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        is_subscribed: true,
        stripe_customer_id: session.customer as string || null,
      })
      .eq('id', user_id)

    if (profileError) {
      console.error('Error updating profile:', profileError)
    }

    // Insert subscription record
    const { data: subscription, error: subError } = await supabase
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

    if (subError) {
      console.error('Error inserting subscription:', subError)
    }

    // Handle affiliate commission if affiliate_code was provided
    if (affiliate_code && affiliate_code.trim() !== '') {
      // Find the referrer by their referral_code
      const { data: referrerProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', affiliate_code)
        .single()

      if (referrerProfile) {
        const { error: affiliateError } = await supabase
          .from('affiliates')
          .insert({
            referrer_id: referrerProfile.id,
            referred_user_id: user_id,
            referred_email: session.customer_email || '',
            commission_amount: 29900,
            status: 'earned',
            subscription_id: subscription?.id || null,
          })

        if (affiliateError) {
          console.error('Error inserting affiliate record:', affiliateError)
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
