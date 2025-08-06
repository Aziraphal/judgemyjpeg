/**
 * Page Settings - Paramètres utilisateur avec 2FA
 */

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import TwoFactorManager from '@/components/TwoFactorManager'
import ChangePasswordForm from '@/components/ChangePasswordForm'
import SessionManager from '@/components/SessionManager'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('security')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen particles-container">
        <div className="spinner-neon w-12 h-12"></div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  const tabs = [
    { id: 'security', label: 'Sécurité', icon: '🔐' },
    { id: 'profile', label: 'Profil', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
  ]

  return (
    <>
      <Head>
        <title>Paramètres - JudgeMyJPEG</title>
        <meta name="description" content="Gérez vos paramètres de compte JudgeMyJPEG" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        {/* Floating decorative elements */}
        <div className="absolute top-10 left-5 w-24 h-24 bg-glow-pink rounded-full blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-glow-cyan rounded-full blur-xl opacity-15 animate-float" style={{animationDelay: '2s'}}></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          
          {/* Header avec navigation */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => router.back()}
              className="btn-neon-secondary"
            >
              ← Retour
            </button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-glow">
                <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                  Paramètres
                </span>
              </h1>
            </div>
            
            <div className="w-24"></div> {/* Spacer pour centrage */}
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-8">
              
              {/* Sidebar Navigation */}
              <div className="lg:col-span-1">
                <div className="glass-card p-6 sticky top-8">
                  <nav className="space-y-2">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                          activeTab === tab.id
                            ? 'bg-neon-cyan/20 text-neon-cyan border-l-4 border-neon-cyan'
                            : 'text-text-gray hover:text-text-white hover:bg-cosmic-glass'
                        }`}
                      >
                        <span className="text-lg">{tab.icon}</span>
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    ))}
                  </nav>

                  {/* User Info */}
                  <div className="mt-8 pt-6 border-t border-cosmic-glassborder">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-neon-pink to-neon-cyan rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
                        {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase()}
                      </div>
                      <p className="text-text-white text-sm font-semibold">
                        {session.user?.name || 'Utilisateur'}
                      </p>
                      <p className="text-text-muted text-xs">
                        {session.user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="lg:col-span-3">
                
                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-text-white mb-2">
                        🔐 Sécurité du compte
                      </h2>
                      <p className="text-text-gray mb-6">
                        Renforcez la sécurité de votre compte avec l'authentification à deux facteurs
                      </p>
                    </div>

                    {/* 2FA Management */}
                    <TwoFactorManager />

                    {/* Password Change */}
                    <div className="glass-card p-6">
                      <h3 className="text-lg font-semibold text-text-white mb-4 flex items-center">
                        <span className="text-xl mr-2">🔑</span>
                        Changer le mot de passe
                      </h3>
                      <p className="text-text-gray text-sm mb-4">
                        Modifiez votre mot de passe pour maintenir la sécurité de votre compte
                      </p>
                      
                      {/* Success/Error Messages */}
                      {message && (
                        <div className={`p-3 rounded-lg mb-4 ${
                          message.type === 'success' 
                            ? 'bg-green-900/20 border border-green-500/20 text-green-300' 
                            : 'bg-red-900/20 border border-red-500/20 text-red-300'
                        }`}>
                          {message.text}
                        </div>
                      )}
                      
                      {!showPasswordForm ? (
                        <button 
                          onClick={() => setShowPasswordForm(true)}
                          className="btn-neon-secondary"
                        >
                          Modifier le mot de passe
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <ChangePasswordForm
                            onSuccess={() => {
                              setMessage({ type: 'success', text: '🎉 Mot de passe modifié avec succès ! Un email de confirmation a été envoyé.' })
                              setShowPasswordForm(false)
                              setTimeout(() => setMessage(null), 5000)
                            }}
                            onError={(error) => {
                              setMessage({ type: 'error', text: error })
                              setTimeout(() => setMessage(null), 5000)
                            }}
                          />
                          <button 
                            onClick={() => setShowPasswordForm(false)}
                            className="text-text-gray hover:text-text-white text-sm"
                          >
                            Annuler
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Session Management */}
                    <div className="glass-card p-6">
                      <h3 className="text-lg font-semibold text-text-white mb-4 flex items-center">
                        <span className="text-xl mr-2">🖥️</span>
                        Sessions actives
                      </h3>
                      <p className="text-text-gray text-sm mb-4">
                        Gérez vos sessions actives sur différents appareils et surveillez l'activité suspecte
                      </p>
                      <SessionManager onUpdate={() => {
                        // Rafraîchir les données si nécessaire
                        console.log('Sessions updated')
                      }} />
                    </div>
                  </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-text-white mb-2">
                        👤 Profil utilisateur
                      </h2>
                      <p className="text-text-gray mb-6">
                        Gérez vos informations personnelles
                      </p>
                    </div>

                    <div className="glass-card p-6">
                      <h3 className="text-lg font-semibold text-text-white mb-4">
                        Informations personnelles
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-text-white text-sm mb-2">Nom</label>
                          <input
                            type="text"
                            value={session.user?.name || ''}
                            className="w-full p-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white"
                            placeholder="Votre nom"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-text-white text-sm mb-2">Email</label>
                          <input
                            type="email"
                            value={session.user?.email || ''}
                            className="w-full p-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-gray"
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <button className="btn-neon-secondary" disabled>
                          Sauvegarder les modifications
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-text-white mb-2">
                        🔔 Notifications
                      </h2>
                      <p className="text-text-gray mb-6">
                        Configurez vos préférences de notifications
                      </p>
                    </div>

                    <div className="glass-card p-6">
                      <h3 className="text-lg font-semibold text-text-white mb-4">
                        Préférences email
                      </h3>
                      <div className="space-y-4">
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" className="form-checkbox" defaultChecked />
                          <span className="text-text-white">Notifications de sécurité</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" className="form-checkbox" defaultChecked />
                          <span className="text-text-white">Mises à jour du produit</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" className="form-checkbox" />
                          <span className="text-text-white">Newsletter</span>
                        </label>
                      </div>
                      <div className="mt-6">
                        <button className="btn-neon-secondary">
                          Sauvegarder les préférences
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}