import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-03-25.dahlia',
    })
  }
  return _stripe
}

// Backwards-compatible alias (only use at runtime, not module level)
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export const SUBSCRIPTION_PRICE_MXN = 49900 // $499.00 MXN/mes en centavos
export const AFFILIATE_COMMISSION_MXN = 29900 // $299.00 MXN — comisión fija por afiliado
export const STRIPE_PRODUCT_ID = process.env.STRIPE_PRODUCT_ID || 'prod_UE462yyW9WvoGd'
