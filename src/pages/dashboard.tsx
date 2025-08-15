import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import StatCard from '@/components/StatCard'
import ScoreChart from '@/components/ScoreChart'
import FavoriteButton from '@/components/FavoriteButton'

interface DashboardStats {
  overview: {
    totalPhotos: number
    topPhotos: number
    totalFavorites: number
    totalCollections: number
    avgScore: number
    recentPhotos: number
  }
  distribution: {
    excellent: number
    good: number
    average: number
    poor: number
  }
  monthlyStats: Array<{
    month: string
    count: number
    avgScore: number
  }>
  latestPhotos: Array<{
    id: string
    url: string
    filename: string
    score: number
    createdAt: string
    favoriteCount: number
  }>
  popularCollections: Array<{
    id: string
    name: string
    color: string
    photoCount: number
    previewPhoto: any
  }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (session) {
      fetchStats()
    }
  }, [session, status])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen particles-container">
        <div className="spinner-neon w-12 h-12"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Dashboard - JudgeMyJPEG</title>
        <meta name="description" content="Vos stats et performances photo en un coup d'œil" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        {/* Floating decorative elements */}
        <div className="absolute top-16 left-8 w-24 h-24 bg-glow-pink rounded-full blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-12 w-32 h-32 bg-glow-cyan rounded-full blur-xl opacity-15 animate-float" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-glow-pink rounded-full blur-lg opacity-10 animate-float" style={{animationDelay: '0.8s'}}></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-glow mb-4">
              📊{' '}
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Dashboard
              </span>
            </h1>
            <p className="text-xl text-text-gray max-w-2xl mx-auto">
              Vue d'ensemble de vos{' '}
              <span className="text-neon-cyan font-semibold">statistiques</span>{' '}
              et{' '}
              <span className="text-neon-pink font-semibold">performances</span>
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col space-y-4 mb-8">
            <button
              onClick={() => router.push('/')}
              className="btn-neon-secondary flex items-center justify-center space-x-2 w-full sm:w-auto self-start"
            >
              <span>←</span>
              <span>Retour à l'accueil</span>
            </button>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => router.push('/analyze')}
                className="btn-neon-pink text-sm px-4 py-2"
              >
                📸 Analyser une photo
              </button>
              <button
                onClick={() => router.push('/batch')}
                className="btn-neon-secondary text-sm px-4 py-2"
              >
                📊 Analyse en lot
              </button>
              <button
                onClick={() => router.push('/gallery')}
                className="btn-neon-secondary text-sm px-4 py-2"
              >
                🏆 Top Photos
              </button>
              <button
                onClick={() => router.push('/insights')}
                className="btn-neon-secondary text-sm px-4 py-2"
              >
                🧠 Insights IA
              </button>
            </div>
          </div>

          {stats ? (
            <div className="space-y-8">
              {/* Statistiques principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Photos analysées"
                  value={stats.overview.totalPhotos}
                  icon="📸"
                  subtitle="Total dans votre galerie"
                  color="primary"
                />
                
                <StatCard
                  title="Chefs-d'œuvre"
                  value={stats.overview.topPhotos}
                  icon="🏆"
                  subtitle="Score ≥ 85/100"
                  color="success"
                />
                
                <StatCard
                  title="Score moyen"
                  value={`${stats.overview.avgScore}/100`}
                  icon="⭐"
                  subtitle="Moyenne de toutes vos photos"
                  color="warning"
                />
                
                <StatCard
                  title="Photos récentes"
                  value={stats.overview.recentPhotos}
                  icon="🔥"
                  subtitle="7 derniers jours"
                  color="secondary"
                />
              </div>

              {/* Seconde ligne de stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Favoris"
                  value={stats.overview.totalFavorites}
                  icon="❤️"
                  subtitle="Photos que vous aimez"
                  color="primary"
                />
                
                <StatCard
                  title="Collections"
                  value={stats.overview.totalCollections}
                  icon="📁"
                  subtitle="Vos albums personnalisés"
                  color="secondary"
                />
                
              </div>

              {/* Graphiques et analyses */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Distribution des scores */}
                <ScoreChart 
                  distribution={stats.distribution} 
                  totalPhotos={stats.overview.totalPhotos}
                />

                {/* Évolution mensuelle */}
                <div className="glass-card p-6 hover-glow">
                  <h3 className="text-lg font-semibold text-text-white mb-6 flex items-center">
                    <span className="text-2xl mr-2">📈</span>
                    Évolution récente
                  </h3>
                  
                  {stats.monthlyStats.length > 0 ? (
                    <div className="space-y-4">
                      {stats.monthlyStats.map((month) => (
                        <div key={month.month} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-neon-cyan rounded-full"></div>
                            <span className="text-text-white font-medium">
                              {formatMonth(month.month)}
                            </span>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-text-white font-semibold">
                              {month.count} photo{month.count !== 1 ? 's' : ''}
                            </div>
                            <div className="text-text-muted text-sm">
                              Moy: {month.avgScore}/100
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📅</div>
                      <p className="text-text-muted">
                        Pas encore de données mensuelles
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Photos récentes */}
              <div className="glass-card p-6 hover-glow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-text-white flex items-center">
                    <span className="text-2xl mr-2">📷</span>
                    Photos récentes
                  </h3>
                  
                  <button
                    onClick={() => router.push('/gallery')}
                    className="btn-neon-secondary text-sm"
                  >
                    Voir tout →
                  </button>
                </div>

                {stats.latestPhotos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {stats.latestPhotos.map((photo) => (
                      <div key={photo.id} className="group relative">
                        <div className="aspect-square relative rounded-lg overflow-hidden hover-glow">
                          <Image
                            src={photo.url}
                            alt={photo.filename}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          
                          {/* Score badge */}
                          <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-cosmic-glass backdrop-blur-sm text-xs text-text-white font-medium">
                            {photo.score}/100
                          </div>
                          
                          {/* Favori */}
                          <div className="absolute top-2 right-2">
                            <FavoriteButton
                              photoId={photo.id}
                              initialIsFavorite={photo.favoriteCount > 0}
                              size="sm"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-text-white text-sm font-medium truncate">
                            {photo.filename}
                          </p>
                          <p className="text-text-muted text-xs">
                            {new Date(photo.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📸</div>
                    <h4 className="text-xl font-semibold text-text-white mb-2">
                      Aucune photo pour le moment
                    </h4>
                    <p className="text-text-gray mb-6">
                      Commencez par analyser votre première photo !
                    </p>
                    <button
                      onClick={() => router.push('/analyze')}
                      className="btn-neon-pink"
                    >
                      Analyser une photo
                    </button>
                  </div>
                )}
              </div>

              {/* Collections populaires */}
              {stats.popularCollections.length > 0 && (
                <div className="glass-card p-6 hover-glow">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-text-white flex items-center">
                      <span className="text-2xl mr-2">📁</span>
                      Collections populaires
                    </h3>
                    
                    <button
                      onClick={() => router.push('/collections')}
                      className="btn-neon-secondary text-sm"
                    >
                      Gérer →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.popularCollections.map((collection) => (
                      <div
                        key={collection.id}
                        className="glass-card p-4 hover:bg-cosmic-glassborder transition-all duration-300 cursor-pointer"
                        onClick={() => router.push('/collections')}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: collection.color }}
                          />
                          <h4 className="text-text-white font-medium truncate">
                            {collection.name}
                          </h4>
                        </div>
                        
                        {collection.previewPhoto ? (
                          <div className="aspect-video relative rounded-lg overflow-hidden mb-3">
                            <Image
                              src={collection.previewPhoto.url}
                              alt={collection.previewPhoto.filename}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video bg-cosmic-glass rounded-lg flex items-center justify-center mb-3">
                            <span className="text-text-muted text-sm">Vide</span>
                          </div>
                        )}
                        
                        <div className="text-text-muted text-sm">
                          {collection.photoCount} photo{collection.photoCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-text-white mb-4">
                Impossible de charger les statistiques
              </h3>
              <button
                onClick={fetchStats}
                className="btn-neon-pink"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}