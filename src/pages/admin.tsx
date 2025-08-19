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

          {/* Formulaire upgrade user */}
          <div className="max-w-2xl mx-auto">
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

            {/* Instructions */}
            <div className="glass-card p-6 mt-8">
              <h3 className="text-lg font-bold text-neon-cyan mb-4">📋 Instructions :</h3>
              <div className="space-y-2 text-sm text-text-gray">
                <p>1. Ajoute <code className="text-neon-pink">ADMIN_SECRET="ton-mot-de-passe"</code> dans ton .env</p>
                <p>2. Entre ton email (ou celui d'un autre user)</p>
                <p>3. Choisis le plan à attribuer</p>
                <p>4. Entre le secret admin</p>
                <p>5. Clique "Upgrade Utilisateur"</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}