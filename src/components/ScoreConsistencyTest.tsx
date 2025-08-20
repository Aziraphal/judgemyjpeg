import { useState } from 'react'
import { PhotoAnalysis } from '@/types/analysis'

interface ScoreTestProps {
  imageBase64: string
}

export default function ScoreConsistencyTest({ imageBase64 }: ScoreTestProps) {
  const [results, setResults] = useState<{
    professional?: PhotoAnalysis
    roast?: PhotoAnalysis
    testing: boolean
  }>({ testing: false })

  const testBothModes = async () => {
    setResults({ testing: true })
    
    try {
      // Appeler l'API au lieu d'importer directement analyzePhoto
      const [professionalResponse, roastResponse] = await Promise.all([
        fetch('/api/photos/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64,
            tone: 'professional',
            language: 'fr',
            photoType: 'other'
          })
        }),
        fetch('/api/photos/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64,
            tone: 'roast',
            language: 'fr',
            photoType: 'other'
          })
        })
      ])
      
      const professionalResult = await professionalResponse.json()
      const roastResult = await roastResponse.json()
      
      setResults({
        professional: professionalResult.analysis,
        roast: roastResult.analysis,
        testing: false
      })
    } catch (error) {
      console.error('Erreur test:', error)
      setResults({ testing: false })
    }
  }

  const scoreDifference = results.professional && results.roast 
    ? Math.abs(results.professional.score - results.roast.score)
    : 0

  return (
    <div className="glass-card p-4 mb-4 border border-yellow-500/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-white font-semibold">🧪 Test de cohérence des scores</h3>
        <button
          onClick={testBothModes}
          disabled={results.testing}
          className="btn-neon-secondary text-sm"
        >
          {results.testing ? '⏳ Test...' : '🔄 Tester les 2 modes'}
        </button>
      </div>

      {results.professional && results.roast && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-500/10 p-3 rounded border border-blue-500/30">
              <div className="text-blue-400 font-semibold">👔 Mode Pro</div>
              <div className="text-white text-xl">{results.professional.score}/100</div>
              <div className="text-xs text-gray-400">Score final</div>
            </div>
            
            <div className="bg-pink-500/10 p-3 rounded border border-pink-500/30">
              <div className="text-pink-400 font-semibold">🔥 Mode Cassant</div>
              <div className="text-white text-xl">{results.roast.score}/100</div>
              <div className="text-xs text-gray-400">Score final</div>
            </div>
          </div>

          <div className={`text-center p-2 rounded ${
            scoreDifference === 0 
              ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
              : 'bg-red-500/20 text-red-400 border border-red-500/50'
          }`}>
            {scoreDifference === 0 
              ? '✅ Scores identiques - Parfait !' 
              : `❌ Écart de ${scoreDifference} points - Problème détecté !`
            }
          </div>

          {scoreDifference > 0 && (
            <div className="text-xs text-yellow-400 text-center">
              💡 L'IA change encore le score selon le ton. Prompt à améliorer.
            </div>
          )}
        </div>
      )}
    </div>
  )
}