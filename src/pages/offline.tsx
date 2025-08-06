import Head from 'next/head'
import Link from 'next/link'
import { usePWA } from '@/components/PWAManager'

export default function OfflinePage() {
  const { isOnline, isInstalled } = usePWA()

  return (
    <>
      <Head>
        <title>Mode Hors Ligne - JudgeMyJPEG</title>
        <meta name="description" content="Guide d'utilisation de JudgeMyJPEG en mode hors ligne" />
        <meta name="robots" content="noindex" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        <div className="container mx-auto px-4 py-12 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-6xl mb-4" aria-hidden="true">📱</div>
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Mode Hors Ligne
              </span>
            </h1>
            <p className="text-text-gray max-w-2xl mx-auto">
              JudgeMyJPEG fonctionne même sans connexion internet grâce à la technologie PWA
            </p>
          </div>

          {/* Statut actuel */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`glass-card p-6 text-center ${isOnline ? 'border-green-500/30' : 'border-yellow-500/30'}`}>
                <div className="text-3xl mb-4" aria-hidden="true">
                  {isOnline ? '🟢' : '🟡'}
                </div>
                <h2 className="text-xl font-bold mb-2">
                  {isOnline ? 'En ligne' : 'Hors ligne'}
                </h2>
                <p className="text-text-gray text-sm">
                  {isOnline 
                    ? 'Toutes les fonctionnalités sont disponibles'
                    : 'Mode dégradé - Fonctionnalités limitées'
                  }
                </p>
              </div>

              <div className={`glass-card p-6 text-center ${isInstalled ? 'border-neon-cyan/30' : 'border-gray-500/30'}`}>
                <div className="text-3xl mb-4" aria-hidden="true">
                  {isInstalled ? '📲' : '🌐'}
                </div>
                <h2 className="text-xl font-bold mb-2">
                  {isInstalled ? 'App installée' : 'Version web'}
                </h2>
                <p className="text-text-gray text-sm">
                  {isInstalled
                    ? 'Accès rapide depuis votre bureau'
                    : 'Installez l\'app pour une meilleure expérience'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Fonctionnalités disponibles hors ligne */}
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-center mb-8 text-neon-cyan">
              Fonctionnalités Hors Ligne
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="glass-card p-6">
                <div className="text-2xl mb-3" aria-hidden="true">📋</div>
                <h3 className="font-semibold text-text-white mb-2">Navigation</h3>
                <p className="text-text-gray text-sm">
                  Parcourez toutes les pages déjà visitées, même sans connexion
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="text-2xl mb-3" aria-hidden="true">📸</div>
                <h3 className="font-semibold text-text-white mb-2">Queue d'analyse</h3>
                <p className="text-text-gray text-sm">
                  Préparez vos photos pour analyse automatique au retour en ligne
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="text-2xl mb-3" aria-hidden="true">💾</div>
                <h3 className="font-semibold text-text-white mb-2">Cache local</h3>
                <p className="text-text-gray text-sm">
                  Vos analyses récentes restent accessibles grâce au cache intelligent
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="text-2xl mb-3" aria-hidden="true">🔄</div>
                <h3 className="font-semibold text-text-white mb-2">Sync automatique</h3>
                <p className="text-text-gray text-sm">
                  Dès que la connexion revient, tout se synchronise automatiquement
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="text-2xl mb-3" aria-hidden="true">🔔</div>
                <h3 className="font-semibold text-text-white mb-2">Notifications</h3>
                <p className="text-text-gray text-sm">
                  Soyez alerté quand vos analyses en attente sont terminées
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="text-2xl mb-3" aria-hidden="true">⚙️</div>
                <h3 className="font-semibold text-text-white mb-2">Préférences</h3>
                <p className="text-text-gray text-sm">
                  Modifiez vos réglages (langue, mode, etc.) même hors ligne
                </p>
              </div>

            </div>
          </div>

          {/* Guide d'utilisation */}
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-center mb-8 text-neon-pink">
              Guide d'Utilisation Hors Ligne
            </h2>

            <div className="space-y-6">
              
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-neon-cyan mb-4">
                  <span aria-hidden="true">1️⃣</span> Préparer vos photos
                </h3>
                <p className="text-text-gray mb-3">
                  Même sans connexion, vous pouvez sélectionner et préparer vos photos pour analyse :
                </p>
                <ul className="text-text-gray text-sm space-y-1 ml-4">
                  <li>• Glissez vos photos dans la zone d'upload</li>
                  <li>• Choisissez le mode d'analyse (Pro ou Cassant)</li>
                  <li>• Sélectionnez votre langue préférée</li>
                  <li>• Les photos sont ajoutées à la file d'attente</li>
                </ul>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-neon-cyan mb-4">
                  <span aria-hidden="true">2️⃣</span> Consulter l'historique
                </h3>
                <p className="text-text-gray mb-3">
                  Vos analyses récentes restent accessibles :
                </p>
                <ul className="text-text-gray text-sm space-y-1 ml-4">
                  <li>• Dashboard avec vos dernières analyses</li>
                  <li>• Collections personnelles déjà chargées</li>
                  <li>• Statistiques et insights précédents</li>
                  <li>• Photos favorites et top-rated</li>
                </ul>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-neon-cyan mb-4">
                  <span aria-hidden="true">3️⃣</span> Synchronisation automatique
                </h3>
                <p className="text-text-gray mb-3">
                  Dès le retour en ligne :
                </p>
                <ul className="text-text-gray text-sm space-y-1 ml-4">
                  <li>• Vos photos en attente sont automatiquement analysées</li>
                  <li>• Vous recevez une notification pour chaque analyse terminée</li>
                  <li>• Les résultats apparaissent dans votre dashboard</li>
                  <li>• Tout se met à jour en arrière-plan</li>
                </ul>
              </div>

            </div>
          </div>

          {/* Installation PWA */}
          {!isInstalled && (
            <div className="max-w-4xl mx-auto mb-12">
              <div className="glass-card p-8 text-center">
                <div className="text-4xl mb-4" aria-hidden="true">📲</div>
                <h2 className="text-2xl font-bold text-neon-pink mb-4">
                  Installer l'Application
                </h2>
                <p className="text-text-gray mb-6">
                  Pour une expérience hors ligne optimale, installez JudgeMyJPEG sur votre appareil
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl mb-2" aria-hidden="true">⚡</div>
                    <h3 className="font-semibold text-text-white mb-1">Plus rapide</h3>
                    <p className="text-text-gray text-sm">Lancement instantané depuis votre bureau</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2" aria-hidden="true">📱</div>
                    <h3 className="font-semibold text-text-white mb-1">Mode natif</h3>
                    <p className="text-text-gray text-sm">Interface plein écran sans navigateur</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2" aria-hidden="true">🔔</div>
                    <h3 className="font-semibold text-text-white mb-1">Notifications</h3>
                    <p className="text-text-gray text-sm">Alertes push pour vos analyses</p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    // Cette fonction sera gérée par PWAManager
                    const event = new CustomEvent('pwa-install-request')
                    window.dispatchEvent(event)
                  }}
                  className="btn-neon-pink"
                >
                  Installer l'Application
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="text-center">
            <Link href="/" className="btn-neon-secondary mr-4">
              ← Retour à l'accueil
            </Link>
            <Link href="/dashboard" className="btn-neon-primary">
              Dashboard →
            </Link>
          </div>

        </div>
      </main>
    </>
  )
}