import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import PhotoUpload from '@/components/PhotoUpload'
import AnalysisResult from '@/components/AnalysisResult'
import ToneSelector from '@/components/ToneSelector'
import LanguageSelector from '@/components/LanguageSelector'
import SubscriptionStatus from '@/components/SubscriptionStatus'
import { PhotoAnalysis, AnalysisTone, AnalysisLanguage } from '@/services/gemini'

export default function AnalyzePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [result, setResult] = useState<{
    photo: any
    analysis: PhotoAnalysis
  } | null>(null)
  const [selectedTone, setSelectedTone] = useState<AnalysisTone>('professional')
  const [selectedLanguage, setSelectedLanguage] = useState<AnalysisLanguage>('fr')

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen particles-container">
        <div className="spinner-neon w-12 h-12"></div>
      </div>
    )
  }

  if (!session) {
    router.push('/')
    return null
  }

  const handleAnalysisComplete = (analysisResult: { photo: any; analysis: PhotoAnalysis }) => {
    setResult(analysisResult)
  }

  const handleNewAnalysis = () => {
    setResult(null)
  }

  return (
    <>
      <Head>
        <title>Analyser une photo - JudgeMyJPEG</title>
        <meta name="description" content="L'IA qui juge vos photos avec humour ou professionnalisme" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        {/* Floating decorative elements */}
        <div className="absolute top-10 left-5 w-24 h-24 bg-glow-pink rounded-full blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-glow-cyan rounded-full blur-xl opacity-15 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-glow-pink rounded-full blur-lg opacity-10 animate-float" style={{animationDelay: '1s'}}></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header avec navigation */}
          <div className="flex justify-between items-center mb-8">
            {/* Bouton retour */}
            <button
              onClick={() => router.push('/')}
              className="btn-neon-secondary text-sm"
            >
              ← Accueil
            </button>

            {/* Titre centré */}
            <div className="text-center flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                  Analyse Photo IA
                </span>
              </h1>
              <p className="text-base text-text-gray">
                <span className="text-neon-cyan">Analyse IA professionnelle</span> de vos photos
              </p>
            </div>

            {/* Sélecteur de langue */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as AnalysisLanguage)}
                  className="btn-neon-secondary text-sm appearance-none pr-8 cursor-pointer"
                  style={{
                    color: 'white',
                    backgroundColor: 'rgba(15, 23, 42, 0.9)'
                  }}
                >
                  <option value="fr" style={{ backgroundColor: '#1e293b', color: 'white' }}>🇫🇷 Français</option>
                  <option value="en" style={{ backgroundColor: '#1e293b', color: 'white' }}>🇬🇧 English</option>
                  <option value="es" style={{ backgroundColor: '#1e293b', color: 'white' }}>🇪🇸 Español</option>
                  <option value="de" style={{ backgroundColor: '#1e293b', color: 'white' }}>🇩🇪 Deutsch</option>
                  <option value="it" style={{ backgroundColor: '#1e293b', color: 'white' }}>🇮🇹 Italiano</option>
                  <option value="pt" style={{ backgroundColor: '#1e293b', color: 'white' }}>🇵🇹 Português</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <span className="text-text-gray">▼</span>
                </div>
              </div>
              
              {result && (
                <button
                  onClick={handleNewAnalysis}
                  className="btn-neon-pink text-sm"
                >
                  📸 Nouvelle analyse
                </button>
              )}
            </div>
          </div>

          {/* Contenu principal */}
          {!result ? (
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Colonne gauche : Modes d'analyse */}
                <div>
                  <div className="glass-card p-6">
                    <h2 className="text-xl font-bold text-text-white mb-6 flex items-center">
                      <span className="text-neon-pink mr-3">🎭</span>
                      Mode d'analyse
                    </h2>
                    
                    <ToneSelector 
                      selectedTone={selectedTone}
                      onToneChange={setSelectedTone}
                    />
                  </div>
                </div>

                {/* Colonne droite : Upload photo */}
                <div>
                  <div className="glass-card p-6 h-full">
                    <h2 className="text-xl font-bold text-text-white mb-6 flex items-center">
                      <span className="text-neon-cyan mr-3">📸</span>
                      Votre photo
                    </h2>
                    
                    <PhotoUpload 
                      onAnalysisComplete={handleAnalysisComplete} 
                      tone={selectedTone}
                      language={selectedLanguage}
                    />
                  </div>
                </div>
              </div>

              {/* Section inférieure : Abonnements */}
              <div className="w-full">
                <SubscriptionStatus />
              </div>
            </div>
          ) : (
            <AnalysisResult photo={result.photo} analysis={result.analysis} tone={selectedTone} />
          )}
        </div>
      </main>
    </>
  )
}