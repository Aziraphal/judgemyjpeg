/**
 * Server-Side Google Analytics 4 Tracking
 * Utilisé pour tracker les conversions côté serveur (webhooks Stripe)
 */
import { logger } from '@/lib/logger'

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID
const GA_MEASUREMENT_ID = GA_TRACKING_ID?.replace('G-', '')
const GA_API_SECRET = process.env.GA_API_SECRET // Secret pour Measurement Protocol

interface GAEvent {
  name: string
  parameters?: Record<string, any>
}

interface GAPayload {
  client_id: string
  events: GAEvent[]
  user_id?: string
}

/**
 * Envoie un événement à Google Analytics 4 côté serveur
 * Utilisé pour tracking conversions Stripe
 */
export async function trackServerEvent(
  clientId: string,
  event: GAEvent,
  userId?: string
): Promise<boolean> {
  if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
    logger.warn('GA server tracking disabled: missing NEXT_PUBLIC_GA_ID or GA_API_SECRET')
    return false
  }

  const payload: GAPayload = {
    client_id: clientId,
    events: [event]
  }

  if (userId) {
    payload.user_id = userId
  }

  try {
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`GA API returned ${response.status}`)
    }

    logger.debug(`✅ GA Server Event tracked: ${event.name}`)
    return true
  } catch (error) {
    logger.error('❌ Failed to track GA server event:', error)
    return false
  }
}

/**
 * Track conversion Stripe → GA4
 * Événement standard ecommerce GA4
 */
export async function trackStripeConversion(
  clientId: string,
  userId: string,
  transactionDetails: {
    transactionId: string
    plan: string
    value: number
    currency: string
    method: 'stripe'
  }
): Promise<void> {
  await trackServerEvent(
    clientId,
    {
      name: 'purchase',
      parameters: {
        transaction_id: transactionDetails.transactionId,
        affiliation: 'JudgeMyJPEG',
        value: transactionDetails.value,
        currency: transactionDetails.currency,
        payment_type: transactionDetails.method,
        items: [
          {
            item_id: transactionDetails.plan,
            item_name: `JudgeMyJPEG ${transactionDetails.plan}`,
            item_category: 'subscription',
            price: transactionDetails.value,
            quantity: 1
          }
        ],
        // Paramètres personnalisés JudgeMyJPEG
        subscription_type: transactionDetails.plan,
        conversion_source: 'stripe_webhook'
      }
    },
    userId
  )
}

/**
 * Track début de checkout
 */
export async function trackCheckoutStart(
  clientId: string,
  userId: string,
  plan: string,
  value: number
): Promise<void> {
  await trackServerEvent(
    clientId,
    {
      name: 'begin_checkout',
      parameters: {
        currency: 'EUR',
        value: value,
        items: [
          {
            item_id: plan,
            item_name: `JudgeMyJPEG ${plan}`,
            item_category: 'subscription',
            price: value,
            quantity: 1
          }
        ]
      }
    },
    userId
  )
}

/**
 * Track subscription cancellation
 */
export async function trackSubscriptionCancellation(
  clientId: string,
  userId: string,
  plan: string
): Promise<void> {
  await trackServerEvent(
    clientId,
    {
      name: 'cancel_subscription',
      parameters: {
        subscription_type: plan,
        method: 'stripe',
        cancellation_source: 'stripe_webhook'
      }
    },
    userId
  )
}

/**
 * Génère un client_id unique pour GA4
 * Format: timestamp.random (ex: 1641234567.123456)
 */
export function generateClientId(): string {
  const timestamp = Math.floor(Date.now() / 1000)
  const random = Math.floor(Math.random() * 1000000)
  return `${timestamp}.${random}`
}