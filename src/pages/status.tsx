import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

interface ServiceStatus {
  name: string
  status: 'operational' | 'degraded' | 'down'
  description: string
}

interface StatusData {
  overall: 'operational' | 'degraded' | 'major_outage'
  services: ServiceStatus[]
  lastUpdated: string
}

export default function StatusPage() {
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatus()
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status')
      const data = await response.json()
      setStatusData(data)
    } catch (error) {
      console.error('Failed to fetch status:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-400'
      case 'degraded': return 'text-yellow-400'
      case 'down':
      case 'major_outage': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return '✅'
      case 'degraded': return '⚠️'
      case 'down':
      case 'major_outage': return '❌'
      default: return '⏳'
    }
  }

  const getOverallMessage = (status: string) => {
    switch (status) {
      case 'operational': return 'Tous les systèmes fonctionnent normalement'
      case 'degraded': return 'Certains services peuvent être ralentis'
      case 'major_outage': return 'Panne majeure en cours de résolution'
      default: return 'Vérification en cours...'
    }
  }

  return (
    <>
      <Head>
        <title>Statut des Services - JudgeMyJPEG</title>
        <meta name="description" content="État en temps réel des services JudgeMyJPEG" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        <div className="container mx-auto px-4 py-12 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Statut des Services
              </span>
            </h1>
            <p className="text-text-gray max-w-2xl mx-auto">
              État en temps réel de tous les services JudgeMyJPEG
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="btn-neon-secondary">
              ← Retour à l'accueil
            </Link>
          </div>

          <div className="max-w-4xl mx-auto">
            
            {loading ? (
              <div className="text-center">
                <div className="spinner-neon w-12 h-12 mx-auto mb-4"></div>
                <p className="text-text-gray">Vérification des services...</p>
              </div>
            ) : statusData ? (
              <>
                {/* Overall Status */}
                <div className="glass-card p-8 mb-8 text-center">
                  <div className="text-6xl mb-4">
                    {getStatusIcon(statusData.overall)}
                  </div>
                  <h2 className={`text-2xl font-bold mb-2 ${getStatusColor(statusData.overall)}`}>
                    {statusData.overall === 'operational' ? 'Tous les systèmes opérationnels' :
                     statusData.overall === 'degraded' ? 'Performance dégradée' :
                     'Panne majeure'}
                  </h2>
                  <p className="text-text-gray">
                    {getOverallMessage(statusData.overall)}
                  </p>
                  <p className="text-text-muted text-sm mt-4">
                    Dernière mise à jour: {new Date(statusData.lastUpdated).toLocaleString('fr-FR')}
                  </p>
                </div>

                {/* Services Details */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-neon-cyan mb-4">Détail des Services</h3>
                  
                  {statusData.services.map((service, index) => (
                    <div key={index} className="glass-card p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl">
                            {getStatusIcon(service.status)}
                          </span>
                          <div>
                            <h4 className="font-semibold text-text-white">
                              {service.name}
                            </h4>
                            <p className="text-text-muted text-sm">
                              {service.description}
                            </p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(service.status)}`}>
                          {service.status === 'operational' ? 'Opérationnel' :
                           service.status === 'degraded' ? 'Dégradé' :
                           'Hors service'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Refresh Button */}
                <div className="text-center mt-8">
                  <button 
                    onClick={fetchStatus}
                    className="btn-neon-secondary"
                    disabled={loading}
                  >
                    🔄 Actualiser
                  </button>
                </div>

                {/* Help Section */}
                <div className="glass-card p-6 mt-8">
                  <h3 className="text-lg font-bold text-neon-pink mb-4">
                    Problème avec nos services ?
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold text-text-white mb-2">Contact Support</h4>
                      <p className="text-text-muted">
                        📧 <a href="mailto:contact.judgemyjpeg@gmail.com" className="text-neon-cyan hover:underline">
                          contact.judgemyjpeg@gmail.com
                        </a>
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-white mb-2">Ressources</h4>
                      <div className="space-y-1">
                        <Link href="/faq" className="block text-neon-cyan hover:underline">
                          FAQ
                        </Link>
                        <Link href="/contact" className="block text-neon-cyan hover:underline">
                          Nous contacter
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-card p-8 text-center">
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-2xl font-bold mb-2 text-red-400">
                  Impossible de vérifier le statut
                </h2>
                <p className="text-text-gray mb-4">
                  Nous ne pouvons pas récupérer les informations de statut en ce moment.
                </p>
                <button 
                  onClick={fetchStatus}
                  className="btn-neon-pink"
                >
                  🔄 Réessayer
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}