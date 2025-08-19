import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY n\'est pas défini')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Configuration des produits Stripe
export const STRIPE_CONFIG = {
  // Prix Starter Pack €4.99 (one-shot)
  STARTER_PRICE_ID: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter_499',
  
  // Prix mensuels €9.98/mois
  MONTHLY_PRICE_ID: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly_998',
  
  // Prix annuel €79/an
  ANNUAL_PRICE_ID: process.env.STRIPE_ANNUAL_PRICE_ID || 'price_annual_7900',
  
  // URLs de retour
  SUCCESS_URL: process.env.NODE_ENV === 'production' 
    ? 'https://www.judgemyjpeg.fr/success'
    : 'http://localhost:3002/success',
    
  CANCEL_URL: process.env.NODE_ENV === 'production'
    ? 'https://www.judgemyjpeg.fr/pricing'
    : 'http://localhost:3002/pricing',
    
  // Webhook endpoint
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
}

export const createCheckoutSession = async (
  customerId: string,
  priceId: string,
  metadata: Record<string, string> = {}
) => {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    mode: priceId === STRIPE_CONFIG.STARTER_PRICE_ID ? 'payment' : 'subscription', // Starter Pack = payment one-shot, autres = subscription
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    // Calcul automatique des taxes (TVA française)
    automatic_tax: {
      enabled: true,
    },
    // Collecter automatiquement l'adresse pour la taxe
    customer_update: {
      address: 'auto',
    },
    // Collecter l'adresse de facturation
    billing_address_collection: 'required',
    // Pas de subscription_data = paiement immédiat par défaut
    success_url: STRIPE_CONFIG.SUCCESS_URL + '?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: STRIPE_CONFIG.CANCEL_URL,
    metadata,
    allow_promotion_codes: true, // Codes promo
  })
}

export const createStripeCustomer = async (email: string, name?: string) => {
  return await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      source: 'judgemyjpeg'
    }
  })
}

export const getStripeCustomer = async (customerId: string) => {
  return await stripe.customers.retrieve(customerId)
}