import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { trackSubscription } from '@/lib/gtag'
import { logger } from '@/lib/logger'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import SEOHead from '@/components/SEOHead'

export default function PricingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useTranslation()
  const [loading, setLoading] = useState<string | null>(null)

  // Fonction de test pour le développement
  const handleTestSubscription = async (subscriptionType: 'premium' | 'annual') => {
    if (process.env.NODE_ENV === 'production') return
    
    setLoading(`test-${subscriptionType}`)
    
    try {
      const response = await fetch('/api/stripe/test-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionType })
      })

      if (response.ok) {
        alert(`Test réussi ! Abonnement ${subscriptionType} activé`)
        router.push('/success')
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      logger.error('Test error:', error)
      alert('Erreur lors du test')
    } finally {
      setLoading(null)
    }
  }

  const handleSubscribe = async (priceType: 'starter' | 'monthly' | 'annual') => {
    if (!session) {
      router.push('/')
      return
    }

    setLoading(priceType)

    // Track début processus abonnement
    let trackingType: string
    switch (priceType) {
      case 'starter': trackingType = 'starter'; break
      case 'monthly': trackingType = 'premium'; break
      case 'annual': trackingType = 'annual'; break
    }
    trackSubscription(trackingType, 'start')

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceType }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors du paiement')
      }

      const { url } = await response.json()
      window.location.href = url

    } catch (error) {
      logger.error('Erreur:', error)
      alert(error instanceof Error ? error.message : 'Erreur lors du paiement')
    } finally {
      setLoading(null)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen particles-container">
        <div className="spinner-neon w-12 h-12"></div>
      </div>
    )
  }

  const returnPolicy = {
    "@type": "MerchantReturnPolicy",
    "applicableCountry": "FR",
    "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
    "merchantReturnDays": 14,
    "returnMethod": "https://schema.org/ReturnByMail",
    "returnFees": "https://schema.org/FreeReturn"
  }

  const pricingOffers = [
    {
      "@type": "Offer",
      "name": "Plan Gratuit",
      "description": "3 analyses photo IA par mois avec tous les modes d'analyse (Roast, Professional, Learning). Idéal pour découvrir le service.",
      "price": "0",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": "2026-12-31",
      "hasMerchantReturnPolicy": returnPolicy,
      "eligibleQuantity": {
        "@type": "QuantitativeValue",
        "value": "3",
        "unitText": "analyses par mois"
      }
    },
    {
      "@type": "Offer",
      "name": "Starter Pack",
      "description": "10 analyses photo + 3 exports PDF + 3 partages sociaux. Paiement unique sans abonnement.",
      "price": "4.99",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": "2026-12-31",
      "hasMerchantReturnPolicy": returnPolicy,
      "eligibleQuantity": {
        "@type": "QuantitativeValue",
        "value": "10",
        "unitText": "analyses"
      }
    },
    {
      "@type": "Offer",
      "name": "Premium Monthly",
      "description": "Analyses photo IA illimitées, tous les modes, exports PDF illimités, partage social, collections personnalisées.",
      "price": "9.99",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": "2026-12-31",
      "hasMerchantReturnPolicy": returnPolicy,
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "9.99",
        "priceCurrency": "EUR",
        "billingDuration": "P1M",
        "billingIncrement": 1
      }
    },
    {
      "@type": "Offer",
      "name": "Lifetime Access",
      "description": "Accès à vie avec toutes les fonctionnalités premium : analyses illimitées, exports, partage, collections, futures features.",
      "price": "99",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "availabilityStarts": "2025-01-01",
      "priceValidUntil": "2026-12-31",
      "hasMerchantReturnPolicy": returnPolicy
    }
  ]

  return (
    <>
      <SEOHead
        title="Tarifs & Abonnements Analyse Photo IA | Plans Premium - JudgeMyJPEG"
        description="Plans d'abonnement analyse photo IA : Gratuit (3 analyses/mois), Starter Pack 4.99€ (10 analyses), Premium 9.99€/mois (illimité), Lifetime 99€ (accès à vie). Comparez nos offres et choisissez le plan adapté à vos besoins photographiques."
        keywords="tarifs analyse photo IA, prix critique photo AI, abonnement photo analysis, plan gratuit analyse photo, premium photography AI, lifetime photo critique, photo feedback pricing"
        canonicalUrl="https://www.judgemyjpeg.fr/pricing"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "JudgeMyJPEG - Analyse Photo IA",
          "description": "Service d'analyse photo par intelligence artificielle avec 3 modes d'expertise et plusieurs plans tarifaires adaptés à tous les besoins.",
          "image": "https://www.judgemyjpeg.fr/og-image.svg",
          "brand": {
            "@type": "Brand",
            "name": "JudgeMyJPEG"
          },
          "offers": pricingOffers,
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "150"
          }
        }}
      />

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        {/* Floating decorative elements */}
        <div className="absolute top-16 left-8 w-24 h-24 bg-glow-pink rounded-full blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-12 w-32 h-32 bg-glow-cyan rounded-full blur-xl opacity-15 animate-float" style={{animationDelay: '1.5s'}}></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-glow mb-4">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                {t('pricing.title')}
              </span>
            </h1>
            <p className="text-xl text-text-gray max-w-2xl mx-auto">
              {t('pricing.subtitle')}{' '}
              <span className="text-neon-cyan font-semibold">{t('pricing.subtitle2')}</span>{' '}
              {t('pricing.subtitle3')}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-4 mb-12">
            <button
              onClick={() => router.push('/')}
              className="btn-neon-secondary flex items-center space-x-2"
            >
              <span>←</span>
              <span>{t('nav.backHome')}</span>
            </button>
            <LanguageSwitcher />
          </div>

          {/* Plans tarifaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-6 max-w-7xl mx-auto">
            
            {/* Plan Gratuit */}
            <div className="glass-card p-8 hover-glow border-2 border-cosmic-glassborder">
              <div className="text-center mb-6">
                <div className="text-3xl mb-4">🆓</div>
                <h3 className="text-2xl font-bold text-text-white mb-2">{t('pricing.free')}</h3>
                <p className="text-text-gray">{t('pricing.discover')}</p>
              </div>

              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-neon-cyan mb-2">0€</div>
                <div className="text-text-muted">{t('pricing.forever')}</div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <span className="text-neon-cyan">✓</span>
                  <span className="text-text-white">3 {t('features.analysesPerMonth')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-neon-cyan">✓</span>
                  <span className="text-text-white">{t('features.modes')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-neon-cyan">✓</span>
                  <span className="text-text-white">{t('features.basicAdvice')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-red-400">✗</span>
                  <span className="text-text-muted">{t('features.shareableImages')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-red-400">✗</span>
                  <span className="text-text-muted">{t('features.advancedInsights')}</span>
                </div>
              </div>

              <button
                disabled
                className="w-full btn-neon-secondary opacity-50 cursor-not-allowed"
              >
                {t('pricing.currentPlan')}
              </button>
            </div>

            {/* Plan Starter Pack */}
            <div className="glass-card p-8 hover-glow border-2 border-yellow-500 relative">
              {/* Badge achat unique */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-semibold">
                  ⚡ {t('pricing.uniquePurchase')}
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="text-3xl mb-4">🛒</div>
                <h3 className="text-2xl font-bold text-text-white mb-2">{t('pricing.starter')}</h3>
                <p className="text-text-gray">{t('pricing.testMore')}</p>
              </div>

              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-yellow-400 mb-2">4,99€</div>
                <div className="text-text-muted">{t('pricing.oneTime')}</div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <span className="text-yellow-400">✓</span>
                  <span className="text-text-white font-semibold">10 {t('features.bonusAnalyses')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-yellow-400">✓</span>
                  <span className="text-text-white">{t('features.allModes')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-yellow-400">✓</span>
                  <span className="text-text-white">3 {t('features.socialShares')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-yellow-400">✓</span>
                  <span className="text-text-white">3 {t('features.pdfExports')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-yellow-400">✓</span>
                  <span className="text-text-white">{t('features.limitedOne')}</span>
                </div>
              </div>

              <button
                onClick={() => handleSubscribe('starter')}
                disabled={loading === 'starter'}
                className="w-full btn-neon-yellow"
              >
                {loading === 'starter' ? 'Commande...' : '🛒 Acheter maintenant'}
              </button>
            </div>

            {/* Plan Premium */}
            <div className="glass-card p-8 hover-glow border-2 border-neon-pink relative lg:transform lg:scale-105">
              {/* Badge populaire */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-neon-pink text-white px-4 py-1 rounded-full text-sm font-semibold">
                  🔥 {t('pricing.popular')}
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="text-3xl mb-4">💎</div>
                <h3 className="text-2xl font-bold text-text-white mb-2">{t('pricing.premium')}</h3>
                <p className="text-text-gray">{t('pricing.forPassionate')}</p>
              </div>

              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-neon-pink mb-2">9,99€</div>
                <div className="text-text-muted">{t('pricing.perMonth')}</div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <span className="text-neon-pink">✓</span>
                  <span className="text-text-white font-semibold">{t('features.unlimitedAnalyses')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-neon-pink">✓</span>
                  <span className="text-text-white">{t('features.storiesCards')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-neon-pink">✓</span>
                  <span className="text-text-white">{t('features.personalizedInsights')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-neon-pink">✓</span>
                  <span className="text-text-white">{t('features.dataExport')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-neon-pink">✓</span>
                  <span className="text-text-white">{t('features.prioritySupport')}</span>
                </div>
              </div>

              <button
                onClick={() => handleSubscribe('monthly')}
                disabled={loading === 'monthly' || !session}
                className="w-full btn-neon-pink"
              >
                {loading === 'monthly' ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="spinner-neon w-4 h-4"></div>
                    <span>Redirection...</span>
                  </span>
                ) : !session ? (
                  'Se connecter d\'abord'
                ) : (
                  'S\'abonner maintenant'
                )}
              </button>

              {/* Bouton de test en développement */}
              {process.env.NODE_ENV === 'development' && session && (
                <button
                  onClick={() => handleTestSubscription('premium')}
                  disabled={loading === 'test-premium'}
                  className="w-full mt-2 btn-neon-secondary text-sm"
                >
                  {loading === 'test-premium' ? 'Test...' : '🧪 Test Premium (Dev)'}
                </button>
              )}
            </div>


            {/* Plan Lifetime */}
            <div className="glass-card p-8 hover-glow border-2 border-neon-cyan">
              <div className="text-center mb-6">
                <div className="text-3xl mb-4">📅</div>
                <h3 className="text-2xl font-bold text-text-white mb-2">{t('pricing.annual')}</h3>
                <p className="text-text-gray">{t('pricing.bestValue2')}</p>
              </div>

              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-neon-cyan mb-2">79€</div>
                <div className="text-text-muted">{t('pricing.perYear')}</div>
                <div className="text-xs text-neon-pink mt-1">💎 {t('pricing.save33')}</div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <span className="text-neon-cyan">✓</span>
                  <span className="text-text-white">{t('features.allPremium')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-neon-cyan">✓</span>
                  <span className="text-text-white font-semibold">{t('features.unlimitedAnalyses')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-neon-cyan">✓</span>
                  <span className="text-text-white">{t('pricing.save40')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-neon-cyan">✓</span>
                  <span className="text-text-white">{t('features.prioritySupport')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-neon-cyan">✓</span>
                  <span className="text-text-white">{t('pricing.reducedCommitment')}</span>
                </div>
              </div>

              <button
                onClick={() => handleSubscribe('annual')}
                disabled={loading === 'annual' || !session}
                className="w-full btn-neon-cyan"
              >
                {loading === 'annual' ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="spinner-neon w-4 h-4"></div>
                    <span>Redirection...</span>
                  </span>
                ) : !session ? (
                  'Se connecter d\'abord'
                ) : (
                  'S\'abonner pour 1 an'
                )}
              </button>

              {/* Bouton de test en développement */}
              {process.env.NODE_ENV === 'development' && session && (
                <button
                  onClick={() => handleTestSubscription('annual')}
                  disabled={loading === 'test-annual'}
                  className="w-full mt-2 btn-neon-secondary text-sm"
                >
                  {loading === 'test-annual' ? 'Test...' : '🧪 Test Annuel (Dev)'}
                </button>
              )}
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto mt-16">
            <h2 className="text-2xl font-bold text-text-white text-center mb-8">
              Questions fréquentes
            </h2>
            
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-neon-cyan mb-2">
                  Puis-je changer de plan à tout moment ?
                </h3>
                <p className="text-text-gray">
                  Oui ! Vous pouvez passer du plan gratuit au premium/annuel, ou acheter le Starter Pack à tout moment. Le Starter Pack est limité à 1 achat par compte.
                </p>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-neon-cyan mb-2">
                  Que se passe-t-il si j'annule mon abonnement ?
                </h3>
                <p className="text-text-gray">
                  Vous gardez l'accès premium jusqu'à la fin de votre période payée, puis vous revenez au plan gratuit.
                </p>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-neon-cyan mb-2">
                  Y a-t-il un engagement de durée ?
                </h3>
                <p className="text-text-gray">
                  Non ! L'abonnement Premium est sans engagement. Vous pouvez annuler à tout moment depuis votre dashboard Stripe.
                </p>
              </div>
            </div>
          </div>

          {/* CTA final */}
          {!session && (
            <div className="text-center mt-16">
              <div className="glass-card p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-text-white mb-4">
                  Prêt à commencer ?
                </h3>
                <p className="text-text-gray mb-6">
                  Connectez-vous pour commencer avec 3 analyses gratuites !
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="btn-neon-pink text-lg px-8 py-3"
                >
                  Se connecter avec Google
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}