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

  const supabase = createAdminClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const user_id = session.metadata?.user_id
    const affiliate_code = session.metadata?.affiliate_code

    if (!user_id) {
      console.error('No user_id in session metadata')
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }

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

    // Insert subscription record (subscription ID stored in stripe_payment_intent_id column)
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id,
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.subscription as string || null,
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
            commission_amount: 24950,
            status: 'earned',
            subscription_id: subscription?.id || null,
          })

        if (affiliateError) {
          console.error('Error inserting affiliate record:', affiliateError)
        }
      }
    }
  }

  // Revoke access when subscription is cancelled or expires
  if (
    event.type === 'customer.subscription.deleted' ||
    (event.type === 'customer.subscription.updated' &&
      (event.data.object as Stripe.Subscription).status === 'canceled')
  ) {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    const { error } = await supabase
      .from('profiles')
      .update({ is_subscribed: false })
      .eq('stripe_customer_id', customerId)

    if (error) {
      console.error('Error revoking subscription access:', error)
    }
  }

  // Revoke access on payment failure (after retries exhausted)
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    // Only revoke if all retries are exhausted (attempt_count > 3)
    if ((invoice.attempt_count ?? 0) > 3) {
      const customerId = invoice.customer as string
      await supabase
        .from('profiles')
        .update({ is_subscribed: false })
        .eq('stripe_customer_id', customerId)
    }
  }

  return NextResponse.json({ received: true })
}
