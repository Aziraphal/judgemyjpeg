import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [plan, setPlan] = useState<'free' | 'premium' | 'annual'>('premium')
  const [secret, setSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [blocked, setBlocked] = useState(false)

  // États pour la suppression d'utilisateur
  const [deleteEmail, setDeleteEmail] = useState('')
  const [deleteSecret, setDeleteSecret] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteResult, setDeleteResult] = useState<string | null>(null)
  const [deleteAttempts, setDeleteAttempts] = useState(0)
  const [deleteBlocked, setDeleteBlocked] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState('')

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (blocked) {
      setResult('❌ Trop de tentatives échouées. Rechargez la page.')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/upgrade-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, plan, secret }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(`✅ ${data.message}`)
        setEmail('')
        setAttempts(0) // Reset après succès
      } else {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        setResult(`❌ ${data.error} (Tentative ${newAttempts}/3)`)
        
        // Blocage après 3 tentatives
        if (newAttempts >= 3) {
          setBlocked(true)
          setResult('❌ Trop de tentatives échouées. Accès bloqué.')
          setTimeout(() => {
            router.push('/')
          }, 2000)
        }
      }

    } catch (error) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setResult(`❌ Erreur: ${error} (Tentative ${newAttempts}/3)`)
      
      if (newAttempts >= 3) {
        setBlocked(true)
        setResult('❌ Trop de tentatives échouées. Accès bloqué.')
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (deleteBlocked) {
      setDeleteResult('❌ Trop de tentatives échouées. Rechargez la page.')
      return
    }

    // Vérification de confirmation
    if (confirmDelete !== 'SUPPRIMER DÉFINITIVEMENT') {
      setDeleteResult('❌ Vous devez taper "SUPPRIMER DÉFINITIVEMENT" pour confirmer')
      return
    }

    setDeleteLoading(true)
    setDeleteResult(null)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ADMIN_SECRET || 'dev-token'}`
        },
        body: JSON.stringify({ email: deleteEmail, secret: deleteSecret }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setDeleteResult(`✅ ${data.message}`)
        if (data.deletedData) {
          setDeleteResult(prev => prev + `\n📊 Données supprimées: ${data.deletedData.photosDeleted} photos, ${data.deletedData.collectionsDeleted} collections, ${data.deletedData.favoritesDeleted} favoris`)
        }
        setDeleteEmail('')
        setConfirmDelete('')
        setDeleteAttempts(0) // Reset après succès
      } else {
        const newAttempts = deleteAttempts + 1
        setDeleteAttempts(newAttempts)
        setDeleteResult(`❌ ${data.message || 'Erreur inconnue'} (Tentative ${newAttempts}/3)`)
        
        // Blocage après 3 tentatives
        if (newAttempts >= 3) {
          setDeleteBlocked(true)
          setDeleteResult('❌ Trop de tentatives échouées. Accès bloqué.')
          setTimeout(() => {
            router.push('/')
          }, 2000)
        }
      }

    } catch (error) {
      const newAttempts = deleteAttempts + 1
      setDeleteAttempts(newAttempts)
      setDeleteResult(`❌ Erreur: ${error} (Tentative ${newAttempts}/3)`)
      
      if (newAttempts >= 3) {
        setDeleteBlocked(true)
        setDeleteResult('❌ Trop de tentatives échouées. Accès bloqué.')
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    } finally {
      setDeleteLoading(false)
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
        <title>Admin - JudgeMyJPEG</title>
        <meta name="description" content="Panneau d'administration" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        <div className="container mx-auto px-4 py-8 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-glow mb-4">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Admin Panel
              </span>
            </h1>
            <button
              onClick={() => router.push('/')}
              className="btn-neon-secondary"
            >
              ← Retour à l'accueil
            </button>
          </div>

          {/* Formulaires Admin */}
          <div className="max-w-2xl mx-auto space-y-8">
            
            {/* Formulaire upgrade user */}
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-text-white mb-6">
                🔧 Upgrade Utilisateur
              </h2>

              <form onSubmit={handleUpgrade} className="space-y-6">
                <div>
                  <label className="block text-text-white mb-2">Email utilisateur :</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white"
                    placeholder="user@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-text-white mb-2">Plan :</label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as any)}
                    className="w-full p-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white"
                  >
                    <option value="free">🆓 Gratuit</option>
                    <option value="premium">💎 Premium</option>
                    <option value="annual">📅 Annuel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-white mb-2">Secret Admin :</label>
                  <input
                    type="password"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    className="w-full p-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white"
                    placeholder="Mot de passe admin"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || blocked}
                  className="w-full btn-neon-pink"
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="spinner-neon w-4 h-4"></div>
                      <span>Upgrade...</span>
                    </span>
                  ) : (
                    'Upgrade Utilisateur'
                  )}
                </button>
              </form>

              {result && (
                <div className="mt-6 p-4 bg-cosmic-glass border border-cosmic-glassborder rounded-lg">
                  <p className="text-text-white">{result}</p>
                </div>
              )}
            </div>

            {/* Formulaire suppression utilisateur */}
            <div className="glass-card p-8 border border-red-500/30">
              <h2 className="text-2xl font-bold text-red-400 mb-6">
                🗑️ Suppression Définitive d'Utilisateur
              </h2>
              <div className="bg-red-950/50 border border-red-500/50 rounded-lg p-4 mb-6">
                <p className="text-red-300 font-semibold">⚠️ ATTENTION : ACTION IRRÉVERSIBLE</p>
                <p className="text-red-200 text-sm mt-2">Cette action supprimera DÉFINITIVEMENT l'utilisateur et TOUTES ses données (photos, collections, favoris, sessions, etc.)</p>
              </div>

              <form onSubmit={handleDeleteUser} className="space-y-6">
                <div>
                  <label className="block text-text-white mb-2">Email utilisateur à supprimer :</label>
                  <input
                    type="email"
                    value={deleteEmail}
                    onChange={(e) => setDeleteEmail(e.target.value)}
                    className="w-full p-3 bg-cosmic-glass border border-red-500/30 rounded-lg text-text-white"
                    placeholder="user@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-text-white mb-2">Confirmation (tapez "SUPPRIMER DÉFINITIVEMENT") :</label>
                  <input
                    type="text"
                    value={confirmDelete}
                    onChange={(e) => setConfirmDelete(e.target.value)}
                    className="w-full p-3 bg-cosmic-glass border border-red-500/30 rounded-lg text-text-white"
                    placeholder="SUPPRIMER DÉFINITIVEMENT"
                    required
                  />
                </div>

                <div>
                  <label className="block text-text-white mb-2">Secret Admin :</label>
                  <input
                    type="password"
                    value={deleteSecret}
                    onChange={(e) => setDeleteSecret(e.target.value)}
                    className="w-full p-3 bg-cosmic-glass border border-red-500/30 rounded-lg text-text-white"
                    placeholder="Mot de passe admin"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={deleteLoading || deleteBlocked || confirmDelete !== 'SUPPRIMER DÉFINITIVEMENT'}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  {deleteLoading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="spinner-neon w-4 h-4"></div>
                      <span>Suppression...</span>
                    </span>
                  ) : (
                    '🗑️ SUPPRIMER DÉFINITIVEMENT'
                  )}
                </button>
              </form>

              {deleteResult && (
                <div className="mt-6 p-4 bg-cosmic-glass border border-cosmic-glassborder rounded-lg">
                  <pre className="text-text-white whitespace-pre-wrap text-sm">{deleteResult}</pre>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-neon-cyan mb-4">📋 Instructions :</h3>
              <div className="space-y-2 text-sm text-text-gray">
                <p className="font-semibold text-neon-pink">Configuration :</p>
                <p>1. Ajoute <code className="text-neon-pink">ADMIN_SECRET="ton-mot-de-passe"</code> dans ton .env</p>
                
                <p className="font-semibold text-neon-cyan mt-4">Upgrade utilisateur :</p>
                <p>2. Entre l'email de l'utilisateur</p>
                <p>3. Choisis le plan à attribuer</p>
                <p>4. Entre le secret admin</p>
                
                <p className="font-semibold text-red-400 mt-4">Suppression utilisateur :</p>
                <p>5. ⚠️ TRÈS DANGEREUX - Supprime DÉFINITIVEMENT toutes les données</p>
                <p>6. Entre l'email de l'utilisateur</p>
                <p>7. Tape exactement "SUPPRIMER DÉFINITIVEMENT"</p>
                <p>8. Entre le secret admin</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}