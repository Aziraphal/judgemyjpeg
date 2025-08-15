/**
 * Page Settings - Paramètres utilisateur avec 2FA
 */

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import TwoFactorManager from '@/components/TwoFactorManager'
import ChangePasswordForm from '@/components/ChangePasswordForm'
import SessionManager from '@/components/SessionManager'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // États pour les préférences utilisateur
  const [userPreferences, setUserPreferences] = useState({
    displayName: session?.user?.name || '',
    nickname: '',
    preferredAnalysisMode: 'professional' as 'professional' | 'roast' | 'expert',
    defaultExportFormat: 'pdf',
    theme: 'cosmic',
    language: 'fr',
    shareAnalytics: true,
    publicProfile: false
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Charger les préférences sauvegardées au démarrage
  useEffect(() => {
    if (session?.user?.email) {
      const savedPrefs = localStorage.getItem(`userPrefs_${session.user.email}`)
      if (savedPrefs) {
        try {
          const parsedPrefs = JSON.parse(savedPrefs)
          setUserPreferences({
            ...userPreferences,
            ...parsedPrefs,
            displayName: parsedPrefs.displayName || session.user.name || '',
          })
        } catch (error) {
          console.error('Erreur lecture préférences:', error)
        }
      }
    }
  }, [session])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    console.log('=== Tentative de sauvegarde ===')
    console.log('User preferences:', userPreferences)
    
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPreferences)
      })
      
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (response.ok) {
        // Sauvegarder localement les préférences
        if (session?.user?.email) {
          localStorage.setItem(`userPrefs_${session.user.email}`, JSON.stringify(userPreferences))
        }
        
        setMessage({ type: 'success', text: '✨ Profil mis à jour avec succès !' })
        setIsEditing(false)
      } else {
        setMessage({ type: 'error', text: `❌ ${data.error || 'Erreur lors de la sauvegarde'}` })
      }
    } catch (error) {
      console.error('Client error:', error)
      setMessage({ type: 'error', text: '❌ Erreur de connexion. Veuillez réessayer.' })
    } finally {
      setIsSaving(false)
      setTimeout(() => setMessage(null), 5000)
    }
  }

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
    { id: 'profile', label: 'Profil', icon: '👤' },
    { id: 'preferences', label: 'Préférences', icon: '⚙️' },
    { id: 'security', label: 'Sécurité', icon: '🔐' },
    { id: 'privacy', label: 'Confidentialité', icon: '🔒' }
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
                  <div className="space-y-6 sm:space-y-8">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-text-white mb-2">
                        👤 Profil utilisateur
                      </h2>
                      <p className="text-text-gray mb-4 sm:mb-6 text-sm sm:text-base">
                        Personnalisez votre profil et vos informations d'affichage
                      </p>
                    </div>

                    {/* Success/Error Messages */}
                    {message && (
                      <div className={`p-3 sm:p-4 rounded-lg ${
                        message.type === 'success' 
                          ? 'bg-green-900/20 border border-green-500/20 text-green-300' 
                          : 'bg-red-900/20 border border-red-500/20 text-red-300'
                      }`}>
                        {message.text}
                      </div>
                    )}

                    <div className="glass-card p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h3 className="text-base sm:text-lg font-semibold text-text-white">
                          Informations d'affichage
                        </h3>
                        {!isEditing ? (
                          <button 
                            onClick={() => setIsEditing(true)}
                            className="btn-neon-secondary text-sm"
                          >
                            ✏️ Modifier
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button 
                              onClick={handleSaveProfile}
                              disabled={isSaving}
                              className="btn-neon-pink text-sm"
                            >
                              {isSaving ? '💾 Sauvegarde...' : '💾 Sauvegarder'}
                            </button>
                            <button 
                              onClick={() => {setIsEditing(false); setUserPreferences({...userPreferences, displayName: session?.user?.name || ''})}}
                              className="btn-neon-secondary text-sm"
                            >
                              ❌ Annuler
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4 sm:space-y-6">
                        {/* Avatar et nom principal */}
                        <div className="flex items-center space-x-4 p-4 bg-cosmic-overlay rounded-lg">
                          <div className="w-16 h-16 bg-gradient-to-r from-neon-pink to-neon-cyan rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {(userPreferences.nickname || userPreferences.displayName)?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-base sm:text-lg font-semibold text-text-white">
                                {userPreferences.nickname || userPreferences.displayName || 'Utilisateur'}
                              </span>
                              {/* Premium badge placeholder */}
                              <span className="text-yellow-400">💎</span>
                            </div>
                            <p className="text-text-muted text-sm">
                              {session.user?.email}
                            </p>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-text-white text-sm mb-2">
                              <span className="hidden sm:inline">Nom d'affichage</span>
                              <span className="sm:hidden">Nom</span>
                            </label>
                            <input
                              type="text"
                              value={userPreferences.displayName}
                              onChange={(e) => setUserPreferences({...userPreferences, displayName: e.target.value})}
                              className={`w-full p-3 border rounded-lg text-text-white ${
                                isEditing 
                                  ? 'bg-cosmic-glass border-cosmic-glassborder focus:border-neon-cyan' 
                                  : 'bg-cosmic-overlay border-cosmic-glassborder/50'
                              }`}
                              placeholder="Votre nom complet"
                              readOnly={!isEditing}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-text-white text-sm mb-2">
                              Pseudo (optionnel)
                            </label>
                            <input
                              type="text"
                              value={userPreferences.nickname}
                              onChange={(e) => setUserPreferences({...userPreferences, nickname: e.target.value})}
                              className={`w-full p-3 border rounded-lg text-text-white ${
                                isEditing 
                                  ? 'bg-cosmic-glass border-cosmic-glassborder focus:border-neon-cyan' 
                                  : 'bg-cosmic-overlay border-cosmic-glassborder/50'
                              }`}
                              placeholder="Votre pseudo"
                              readOnly={!isEditing}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-text-white text-sm mb-2">
                            Email (non modifiable)
                          </label>
                          <input
                            type="email"
                            value={session.user?.email || ''}
                            className="w-full p-3 bg-cosmic-overlay border border-cosmic-glassborder/50 rounded-lg text-text-gray"
                            readOnly
                          />
                          <p className="text-text-muted text-xs mt-1">
                            Pour modifier votre email, contactez le support
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div className="space-y-6 sm:space-y-8">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-text-white mb-2">
                        ⚙️ Préférences
                      </h2>
                      <p className="text-text-gray mb-4 sm:mb-6 text-sm sm:text-base">
                        Personnalisez votre expérience JudgeMyJPEG
                      </p>
                    </div>

                    {/* Préférences IA */}
                    <div className="glass-card p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-text-white mb-4 flex items-center">
                        <span className="text-xl mr-2">🤖</span>
                        <span className="hidden sm:inline">Préférences d'analyse IA</span>
                        <span className="sm:hidden">IA</span>
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-text-white text-sm mb-2">
                            <span className="hidden sm:inline">Mode d'analyse préféré par défaut</span>
                            <span className="sm:hidden">Mode par défaut</span>
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                              { id: 'professional', label: 'Mode Pro', icon: '👔', desc: 'Analyse constructive' },
                              { id: 'roast', label: 'Mode Cassant', icon: '🔥', desc: 'Critique sarcastique' },
                              { id: 'expert', label: 'Mode Expert', icon: '🎯', desc: 'Analyse ultra-technique' }
                            ].map((mode) => (
                              <label key={mode.id} className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name="analysisMode"
                                  value={mode.id}
                                  checked={userPreferences.preferredAnalysisMode === mode.id}
                                  onChange={(e) => setUserPreferences({...userPreferences, preferredAnalysisMode: e.target.value as any})}
                                  className="sr-only"
                                />
                                <div className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${
                                  userPreferences.preferredAnalysisMode === mode.id
                                    ? 'border-neon-cyan bg-neon-cyan/10'
                                    : 'border-cosmic-glassborder bg-cosmic-glass hover:border-neon-cyan/50'
                                }`}>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-lg">{mode.icon}</span>
                                    <span className="text-text-white font-medium text-sm sm:text-base">{mode.label}</span>
                                  </div>
                                  <p className="text-text-muted text-xs hidden sm:block">{mode.desc}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Préférences d'export */}
                    <div className="glass-card p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-text-white mb-4 flex items-center">
                        <span className="text-xl mr-2">📄</span>
                        <span className="hidden sm:inline">Préférences d'export</span>
                        <span className="sm:hidden">Export</span>
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-text-white text-sm mb-2">Format par défaut</label>
                          <select 
                            value={userPreferences.defaultExportFormat}
                            onChange={(e) => setUserPreferences({...userPreferences, defaultExportFormat: e.target.value})}
                            className="w-full p-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white focus:border-neon-cyan"
                          >
                            <option value="pdf">PDF (recommandé)</option>
                            <option value="txt">Texte simple</option>
                            <option value="json">JSON (données brutes)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Préférences d'apparence */}
                    <div className="glass-card p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-text-white mb-4 flex items-center">
                        <span className="text-xl mr-2">🎨</span>
                        <span className="hidden sm:inline">Apparence et interface</span>
                        <span className="sm:hidden">Apparence</span>
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-text-white text-sm mb-2">Thème</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              { id: 'cosmic', label: 'Cosmic (défaut)', preview: 'bg-gradient-to-r from-neon-pink to-neon-cyan' },
                              { id: 'dark', label: 'Sombre', preview: 'bg-gradient-to-r from-gray-800 to-black' }
                            ].map((theme) => (
                              <label key={theme.id} className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name="theme"
                                  value={theme.id}
                                  checked={userPreferences.theme === theme.id}
                                  onChange={(e) => setUserPreferences({...userPreferences, theme: e.target.value})}
                                  className="sr-only"
                                />
                                <div className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${
                                  userPreferences.theme === theme.id
                                    ? 'border-neon-cyan bg-neon-cyan/10'
                                    : 'border-cosmic-glassborder bg-cosmic-glass hover:border-neon-cyan/50'
                                }`}>
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-6 h-6 rounded ${theme.preview}`}></div>
                                    <span className="text-text-white font-medium text-sm sm:text-base">{theme.label}</span>
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bouton de sauvegarde */}
                    <div className="flex justify-end">
                      <button 
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="btn-neon-pink"
                      >
                        {isSaving ? '💾 Sauvegarde...' : '💾 Sauvegarder les préférences'}
                      </button>
                    </div>
                  </div>
                )}


                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6 sm:space-y-8">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-text-white mb-2">
                        🔒 Confidentialité
                      </h2>
                      <p className="text-text-gray mb-4 sm:mb-6 text-sm sm:text-base">
                        Contrôlez vos données et votre visibilité
                      </p>
                    </div>

                    {/* Partage des données */}
                    <div className="glass-card p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-text-white mb-4 flex items-center">
                        <span className="text-xl mr-2">📊</span>
                        <span className="hidden sm:inline">Partage des données analytiques</span>
                        <span className="sm:hidden">Partage données</span>
                      </h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between">
                          <div>
                            <span className="text-text-white font-medium text-sm sm:text-base">
                              Partage anonyme des statistiques
                            </span>
                            <p className="text-text-muted text-xs">
                              <span className="hidden sm:inline">Aide à améliorer JudgeMyJPEG en partageant des données anonymisées</span>
                              <span className="sm:hidden">Améliore l'app (anonyme)</span>
                            </p>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={userPreferences.shareAnalytics}
                            onChange={(e) => setUserPreferences({...userPreferences, shareAnalytics: e.target.checked})}
                            className="form-checkbox h-5 w-5 text-neon-cyan" 
                          />
                        </label>
                        <label className="flex items-center justify-between">
                          <div>
                            <span className="text-text-white font-medium text-sm sm:text-base">
                              Profil public
                            </span>
                            <p className="text-text-muted text-xs">
                              <span className="hidden sm:inline">Rendre visible votre profil et vos meilleures photos</span>
                              <span className="sm:hidden">Profil visible publiquement</span>
                            </p>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={userPreferences.publicProfile}
                            onChange={(e) => setUserPreferences({...userPreferences, publicProfile: e.target.checked})}
                            className="form-checkbox h-5 w-5 text-neon-cyan" 
                          />
                        </label>
                      </div>
                    </div>

                    {/* Gestion des données */}
                    <div className="glass-card p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-text-white mb-4 flex items-center">
                        <span className="text-xl mr-2">🗂️</span>
                        <span className="hidden sm:inline">Gestion de vos données</span>
                        <span className="sm:hidden">Vos données</span>
                      </h3>
                      <div className="space-y-3">
                        <button 
                          className="btn-neon-secondary w-full sm:w-auto text-sm"
                          onClick={() => {
                            if (confirm('Êtes-vous sûr de vouloir supprimer toutes vos photos et analyses ? Cette action est irréversible.')) {
                              fetch('/api/user/delete-photos', { method: 'DELETE' })
                                .then(() => alert('Photos supprimées avec succès'))
                                .catch(() => alert('Erreur lors de la suppression'))
                            }
                          }}
                        >
                          🗑️ <span className="hidden sm:inline">Supprimer toutes mes photos</span><span className="sm:hidden">Suppr. photos</span>
                        </button>
                      </div>
                    </div>

                    {/* Informations légales */}
                    <div className="glass-card p-4 sm:p-6 bg-cosmic-glass border border-yellow-400/30">
                      <h3 className="text-base sm:text-lg font-semibold text-yellow-400 mb-4 flex items-center">
                        <span className="text-xl mr-2">⚖️</span>
                        <span className="hidden sm:inline">Informations légales</span>
                        <span className="sm:hidden">Légal</span>
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-text-gray">
                          <a href="/legal/privacy" className="text-neon-cyan hover:underline">
                            📜 <span className="hidden sm:inline">Politique de confidentialité</span><span className="sm:hidden">Confidentialité</span>
                          </a>
                        </p>
                        <p className="text-text-gray">
                          <a href="/legal/terms" className="text-neon-cyan hover:underline">
                            📋 <span className="hidden sm:inline">Conditions d'utilisation</span><span className="sm:hidden">CGU</span>
                          </a>
                        </p>
                        <p className="text-text-gray">
                          <a href="/legal/cookies" className="text-neon-cyan hover:underline">
                            🍪 <span className="hidden sm:inline">Politique des cookies</span><span className="sm:hidden">Cookies</span>
                          </a>
                        </p>
                      </div>
                    </div>

                    {/* Bouton de sauvegarde */}
                    <div className="flex justify-end">
                      <button 
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="btn-neon-pink"
                      >
                        {isSaving ? '💾 Sauvegarde...' : '💾 Sauvegarder'}
                      </button>
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