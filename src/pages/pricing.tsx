import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { trackSubscription } from '@/lib/gtag'

export default function PricingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
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
      console.error('Test error:', error)
      alert('Erreur lors du test')
    } finally {
      setLoading(null)
    }
  }

  const handleSubscribe = async (priceType: 'monthly' | 'annual') => {
    if (!session) {
      router.push('/')
      return
    }

    setLoading(priceType)

    // Track début processus abonnement
    trackSubscription(priceType === 'monthly' ? 'premium' : 'annual', 'start')

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
      console.error('Erreur:', error)
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

  return (
    <>
      <Head>
        <title>Tarifs & Abonnements | Plans analyse photo IA - JudgeMyJPEG</title>
        <meta name="description" content="Découvrez nos plans d'abonnement pour l'analyse photo IA. Gratuit 3 analyses/mois, Starter Pack 4.99€, Premium 9.98€/mois, Annuel 79€/an. Analyses illimitées." />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        {/* Floating decorative elements */}
        <div className="absolute top-16 left-8 w-24 h-24 bg-glow-pink rounded-full blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-12 w-32 h-32 bg-glow-cyan rounded-full blur-xl opacity-15 animate-float" style={{animationDelay: '1.5s'}}></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-glow mb-4">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Tarifs
              </span>
            </h1>
            <p className="text-xl text-text-gray max-w-2xl mx-auto">
              Choisissez le plan parfait pour{' '}
              <span className="text-neon-cyan font-semibold">analyser vos photos</span>{' '}
              sans limites
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-center mb-12">
            <button
              onClick={() => router.push('/')}
              className="btn-neon-secondary flex items-center space-x-2"
            >
              <span>←</span>
              <span>Retour à l'accueil</span>
            </button>
          </div>

          {/* Plans tarifaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-6 max-w-7xl mx-auto">
            
            {/* Plan Gratuit */}
            <div className="glass-card p-8 hover-glow border-2 border-cosmic-glassborder">
              <div className="text-center mb-6">
                <div className="text-3xl mb-4">🆓</div>
                <h3 className="text-2xl font-bold text-text-white mb-2">Gratuit</h3>
                <p className="text-text-gray">Découvrez JudgeMyJPEG</p>
              </div>

              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-neon-cyan mb-2">0€</div>
                <div className="text-text-muted">Pour toujours</div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <span className="text-neon-cyan">✓</span>
                  <span className="text-text-white">3 analyses par mois</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-neon-cyan">✓</span>
                  <span className="text-text-white">Mode Pro, Cassant & Expert</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-neon-cyan">✓</span>
                  <span className="text-text-white">Score + conseils de base</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-red-400">✗</span>
                  <span className="text-text-muted">Images partageables</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-red-400">✗</span>
                  <span className="text-text-muted">Insights IA avancés</span>
                </div>
              </div>

              <button
                disabled
                className="w-full btn-neon-secondary opacity-50 cursor-not-allowed"
              >
                Plan actuel
              </button>
            </div>

            {/* Plan Starter Pack */}
            <div className="glass-card p-8 hover-glow border-2 border-yellow-500 relative">
              {/* Badge achat unique */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-semibold">
                  ⚡ ACHAT UNIQUE
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="text-3xl mb-4">🛒</div>
                <h3 className="text-2xl font-bold text-text-white mb-2">Starter Pack</h3>
                <p className="text-text-gray">Testez davantage</p>
              </div>

              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-yellow-400 mb-2">4,99€</div>
                <div className="text-text-muted">achat unique</div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <span className="text-yellow-400">✓</span>
                  <span className="text-text-white font-semibold">10 analyses bonus</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-yellow-400">✓</span>
                  <span className="text-text-white">Tous les modes (Pro, Roast, Expert)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-yellow-400">✓</span>
                  <span className="text-text-white">3 partages sociaux</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-yellow-400">✓</span>
                  <span className="text-text-white">3 exports PDF</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-yellow-400">✓</span>
                  <span className="text-text-white">Limité à 1 par compte</span>
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
                  🔥 POPULAIRE
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="text-3xl mb-4">💎</div>
                <h3 className="text-2xl font-bold text-text-white mb-2">Premium</h3>
                <p className="text-text-gray">Pour les passionnés</p>
              </div>

              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-neon-pink mb-2">9,98€</div>
                <div className="text-text-muted">par mois</div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <span className="text-neon-pink">✓</span>
                  <span className="text-text-white font-semibold">Analyses illimitées</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-neon-pink">✓</span>
                  <span className="text-text-white">Générateur d'images Stories</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-neon-pink">✓</span>
                  <span className="text-text-white">Insights IA personnalisés</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-neon-pink">✓</span>
                  <span className="text-text-white">Export de données</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-neon-pink">✓</span>
                  <span className="text-text-white">Support prioritaire</span>
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
                <h3 className="text-2xl font-bold text-text-white mb-2">Annuel</h3>
                <p className="text-text-gray">Meilleure valeur</p>
              </div>

              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-neon-cyan mb-2">79€</div>
                <div className="text-text-muted">par an</div>
                <div className="text-xs text-neon-pink mt-1">💎 Économisez 33% vs mensuel</div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <span className="text-neon-cyan">✓</span>
                  <span className="text-text-white">Tout du plan Premium</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-neon-cyan">✓</span>
                  <span className="text-text-white font-semibold">Analyses illimitées</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-neon-cyan">✓</span>
                  <span className="text-text-white">Économie de 40€/an</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-neon-cyan">✓</span>
                  <span className="text-text-white">Support prioritaire</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-neon-cyan">✓</span>
                  <span className="text-text-white">Engagement réduit</span>
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