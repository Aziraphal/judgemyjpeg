import { useState } from 'react'
import Head from 'next/head'
import PhotoUpload from '@/components/PhotoUpload'
import AnalysisResult from '@/components/AnalysisResult'
import { PhotoAnalysis, AnalysisTone, AnalysisLanguage } from '@/services/openai'

export default function TestUploadPage() {
  const [result, setResult] = useState<{
    photo: any
    analysis: PhotoAnalysis
  } | null>(null)
  const [selectedTone, setSelectedTone] = useState<AnalysisTone>('professional')
  const [selectedLanguage, setSelectedLanguage] = useState<AnalysisLanguage>('fr')

  const handleAnalysisComplete = (analysisResult: { photo: any; analysis: PhotoAnalysis }) => {
    setResult(analysisResult)
  }

  const handleNewAnalysis = () => {
    setResult(null)
  }

  return (
    <>
      <Head>
        <title>Test Upload Railway - JudgeMyJPEG</title>
        <meta name="description" content="Test des uploads sans authentification" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        <div className="container mx-auto px-4 py-12 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                🧪 Test Upload Railway
              </span>
            </h1>
            <p className="text-text-gray max-w-2xl mx-auto">
              Test des uploads >4MB sans compression brutale
            </p>
          </div>

          {/* Mode selector */}
          <div className="flex justify-center mb-8">
            <div className="glass-card p-4">
              <div className="flex items-center space-x-4">
                <label className="text-text-white font-medium">Mode:</label>
                <select 
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value as AnalysisTone)}
                  className="bg-cosmic-glass border border-cosmic-glassborder rounded-lg px-3 py-2 text-text-white"
                >
                  <option value="professional">Professionnel</option>
                  <option value="roast">Cassant</option>
                </select>
              </div>
            </div>
          </div>

          {!result ? (
            <PhotoUpload 
              onAnalysisComplete={handleAnalysisComplete}
              tone={selectedTone}
              language={selectedLanguage}
            />
          ) : (
            <AnalysisResult 
              photo={result.photo}
              analysis={result.analysis}
              tone={selectedTone}
              language={selectedLanguage}
              onNewAnalysis={handleNewAnalysis}
            />
          )}
        </div>
      </main>
    </>
  )
}