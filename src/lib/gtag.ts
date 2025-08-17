// Google Analytics configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

// Types pour événements
export interface GtagEvent {
  action: string
  category: string
  label?: string
  value?: number
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: GtagEvent) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Événements spécifiques JudgeMyJPEG
export const trackPhotoAnalysis = (tone: string, language: string, score: number) => {
  event({
    action: 'photo_analysis',
    category: 'engagement',
    label: `${tone}_${language}_score_${Math.floor(score/10)*10}`,
    value: score
  })
}

export const trackSubscription = (plan: string, action: 'start' | 'success' | 'cancel') => {
  event({
    action: `subscription_${action}`,
    category: 'conversion',
    label: plan,
    value: plan === 'premium' ? 999 : 9999
  })
}

export const trackCollectionAction = (action: 'create' | 'add_photo' | 'share') => {
  event({
    action: `collection_${action}`,
    category: 'engagement',
    label: action
  })
}

// Déclaration types globaux
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: {
        page_path?: string
        event_category?: string
        event_label?: string
        value?: number
      }
    ) => void
  }
}