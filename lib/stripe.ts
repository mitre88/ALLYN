import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

export const SUBSCRIPTION_PRICE_MXN = 49900 // $499.00 MXN en centavos
export const AFFILIATE_COMMISSION_MXN = 29900 // $299.00 MXN en centavos
export const STRIPE_PRODUCT_ID = process.env.STRIPE_PRODUCT_ID || 'prod_UE462yyW9WvoGd'
