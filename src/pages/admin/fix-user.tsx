import { useState } from 'react'
import Head from 'next/head'
import { withAdminProtection } from '@/lib/withAdminProtection'

export default function FixUserPage() {
  const [email, setEmail] = useState('jennifernachtegale@gmail.com')
  const [adminSecret, setAdminSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleFix = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/fix-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret
        },
        body: JSON.stringify({
          userEmail: email,
          subscriptionType: 'premium',
          manual: true
        })
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  const handleDiagnostic = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch(`/api/admin/stripe-debug?userEmail=${email}`, {
        headers: {
          'x-admin-secret': adminSecret
        }
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Fix User - Admin</title>
      </Head>

      <main className="min-h-screen bg-cosmic-overlay p-8">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card p-8">
            <h1 className="text-2xl font-bold text-text-white mb-6">🔧 Fix User Subscription</h1>

            <div className="space-y-4">
              <div>
                <label className="block text-text-white mb-2">Email utilisateur:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-cosmic-glass border border-cosmic-glassborder rounded text-text-white"
                />
              </div>

              <div>
                <label className="block text-text-white mb-2">Admin Secret:</label>
                <input
                  type="password"
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  className="w-full p-3 bg-cosmic-glass border border-cosmic-glassborder rounded text-text-white"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleDiagnostic}
                  disabled={loading || !email || !adminSecret}
                  className="btn-neon-secondary"
                >
                  {loading ? 'Loading...' : '🔍 Diagnostic'}
                </button>

                <button
                  onClick={handleFix}
                  disabled={loading || !email || !adminSecret}
                  className="btn-neon-pink"
                >
                  {loading ? 'Loading...' : '🔧 Fix Premium'}
                </button>
              </div>
            </div>

            {result && (
              <div className="mt-6 p-4 bg-cosmic-glass rounded">
                <h3 className="text-neon-cyan mb-2">Résultat:</h3>
                <pre className="text-text-white text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

export const getServerSideProps = withAdminProtection()