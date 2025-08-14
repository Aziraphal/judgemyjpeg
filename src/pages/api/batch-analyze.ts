import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { analyzePhoto, PhotoAnalysis } from '@/services/openai'
import { PrismaClient } from '@prisma/client'
import { rateLimit } from '@/lib/rate-limit'

const prisma = new PrismaClient()

interface BatchAnalysisRequest {
  images: {
    id: string
    data: string // base64
    filename: string
  }[]
  tone?: 'professional' | 'roast'
}

interface BatchAnalysisResponse {
  success: boolean
  results: {
    id: string
    analysis?: PhotoAnalysis
    error?: string
  }[]
  report: {
    totalPhotos: number
    avgScore: number
    categoryAverages: {
      composition: number
      lighting: number
      focus: number
      exposure: number
      creativity: number
      emotion: number
      storytelling: number
    }
    overallRecommendations: string[]
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BatchAnalysisResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  try {
    // Vérification session
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Non authentifié' })
    }

    // Rate limiting pour batch analysis (plus restrictif)
    const rateLimitResult = await rateLimit(req, res, {
      interval: 60 * 1000, // 1 minute
      uniqueTokenPerInterval: 100,
      maxRequests: 1 // 1 seule analyse batch par minute
    })

    if (!rateLimitResult.success) {
      return res.status(429).json({ 
        error: 'Trop de requêtes. Veuillez attendre avant de relancer une analyse en lot.' 
      })
    }

    // Vérifier le statut premium
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    })

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    const isPremium = user.subscription?.status === 'active'
    const { images, tone = 'professional' }: BatchAnalysisRequest = req.body

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ error: 'Images manquantes' })
    }

    // Limiter le nombre d'images selon le statut
    const maxImages = isPremium ? 10 : 3
    if (images.length > maxImages) {
      return res.status(400).json({ 
        error: `Limite dépassée : ${maxImages} images max${!isPremium ? ' (Premium: 10)' : ''}` 
      })
    }

    // Valider chaque image
    for (const image of images) {
      if (!image.data || !image.id || !image.filename) {
        return res.status(400).json({ error: 'Données d\'image invalides' })
      }
      
      // Vérifier la taille base64 (approximatif)
      const sizeInBytes = (image.data.length * 3) / 4
      if (sizeInBytes > 10 * 1024 * 1024) { // 10MB
        return res.status(400).json({ error: `Image trop volumineuse: ${image.filename}` })
      }
    }

    console.log(`🚀 Début analyse batch: ${images.length} photos pour ${session.user.email}`)

    // Analyser chaque image
    const results = []
    const successfulAnalyses: PhotoAnalysis[] = []

    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      
      try {
        console.log(`📸 Analyse ${i + 1}/${images.length}: ${image.filename}`)
        
        const analysis = await analyzePhoto(image.data, tone)
        
        // Sauvegarder en base
        await prisma.photo.create({
          data: {
            filename: image.filename,
            url: `data:image/jpeg;base64,${image.data}`, // Temporaire pour la démo
            score: analysis.score,
            analysis: analysis as any,
            userId: user.id,
            tone: tone
          }
        })

        results.push({
          id: image.id,
          analysis
        })
        
        successfulAnalyses.push(analysis)
        
      } catch (error) {
        console.error(`❌ Erreur analyse ${image.filename}:`, error)
        results.push({
          id: image.id,
          error: 'Erreur lors de l\'analyse'
        })
      }
    }

    // Générer le rapport comparatif
    const report = generateBatchReport(successfulAnalyses)

    console.log(`✅ Analyse batch terminée: ${successfulAnalyses.length}/${images.length} réussies`)

    return res.status(200).json({
      success: true,
      results,
      report
    })

  } catch (error) {
    console.error('💥 Erreur batch analysis:', error)
    return res.status(500).json({ error: 'Erreur serveur lors de l\'analyse en lot' })
  } finally {
    await prisma.$disconnect()
  }
}

function generateBatchReport(analyses: PhotoAnalysis[]) {
  if (analyses.length === 0) {
    return {
      totalPhotos: 0,
      avgScore: 0,
      categoryAverages: {
        composition: 0, lighting: 0, focus: 0, exposure: 0,
        creativity: 0, emotion: 0, storytelling: 0
      },
      overallRecommendations: ['Aucune analyse réussie']
    }
  }

  // Calcul des moyennes
  const totalScore = analyses.reduce((sum, a) => sum + a.score, 0)
  const avgScore = Math.round(totalScore / analyses.length)

  const categoryTotals = analyses.reduce((totals, analysis) => {
    const scores = analysis.partialScores
    return {
      composition: totals.composition + scores.composition,
      lighting: totals.lighting + scores.lighting,
      focus: totals.focus + scores.focus,
      exposure: totals.exposure + scores.exposure,
      creativity: totals.creativity + scores.creativity,
      emotion: totals.emotion + scores.emotion,
      storytelling: totals.storytelling + scores.storytelling
    }
  }, {
    composition: 0, lighting: 0, focus: 0, exposure: 0,
    creativity: 0, emotion: 0, storytelling: 0
  })

  const categoryAverages = {
    composition: Math.round(categoryTotals.composition / analyses.length),
    lighting: Math.round(categoryTotals.lighting / analyses.length),
    focus: Math.round(categoryTotals.focus / analyses.length),
    exposure: Math.round(categoryTotals.exposure / analyses.length),
    creativity: Math.round(categoryTotals.creativity / analyses.length),
    emotion: Math.round(categoryTotals.emotion / analyses.length),
    storytelling: Math.round(categoryTotals.storytelling / analyses.length)
  }

  // Générer des recommandations globales intelligentes
  const overallRecommendations = generateSmartRecommendations(categoryAverages, analyses)

  return {
    totalPhotos: analyses.length,
    avgScore,
    categoryAverages,
    overallRecommendations
  }
}

function generateSmartRecommendations(categories: any, analyses: PhotoAnalysis[]): string[] {
  const recommendations: string[] = []
  
  // Identifier les 2-3 points les plus faibles
  const weakestCategories = Object.entries(categories)
    .map(([name, score]) => ({ 
      name, 
      score: score as number,
      maxScore: name === 'storytelling' ? 10 : 15
    }))
    .sort((a, b) => (a.score/a.maxScore) - (b.score/b.maxScore))
    .slice(0, 3)

  // Recommandations spécifiques par catégorie faible
  weakestCategories.forEach(({ name, score, maxScore }) => {
    const percentage = (score / maxScore) * 100
    
    if (percentage < 70) {
      switch (name) {
        case 'composition':
          recommendations.push("🎯 Composition: Travaillez la règle des tiers et l'équilibre visuel. Variez vos cadrages et angles de vue.")
          break
        case 'lighting':
          recommendations.push("💡 Éclairage: Portez attention à la qualité de lumière. Évitez les contre-jours non maîtrisés et recherchez la golden hour.")
          break
        case 'focus':
          recommendations.push("🔍 Netteté: Vérifiez systématiquement votre mise au point. Utilisez le focus peaking si disponible sur votre appareil.")
          break
        case 'exposure':
          recommendations.push("📊 Exposition: Consultez l'histogramme avant le déclenchement. Évitez les zones surexposées et sous-exposées.")
          break
        case 'creativity':
          recommendations.push("✨ Créativité: Explorez des perspectives originales. Sortez des sentiers battus et expérimentez de nouveaux angles.")
          break
        case 'emotion':
          recommendations.push("❤️ Émotion: Cherchez les moments expressifs. Patience et anticipation sont clés pour capturer l'émotion authentique.")
          break
        case 'storytelling':
          recommendations.push("📖 Narration: Développez le storytelling visuel. Chaque photo doit raconter une histoire ou transmettre un message.")
          break
      }
    }
  })

  // Recommandation globale basée sur le niveau général
  const avgScore = categories.composition + categories.lighting + categories.focus + 
                   categories.exposure + categories.creativity + categories.emotion + categories.storytelling
  const avgPercentage = (avgScore / 100) * 100

  if (avgPercentage >= 85) {
    recommendations.unshift("🏆 Excellent niveau ! Continuez à expérimenter pour maintenir cette qualité et développer votre style personnel.")
  } else if (avgPercentage >= 70) {
    recommendations.unshift("⭐ Bon niveau général. Concentrez-vous sur les points faibles identifiés pour atteindre l'excellence.")
  } else if (avgPercentage >= 55) {
    recommendations.unshift("📈 Potentiel intéressant. Travaillez régulièrement sur les bases techniques pour progresser rapidement.")
  } else {
    recommendations.unshift("💪 Beaucoup de marge de progression. Revenez aux fondamentaux : composition, exposition et netteté.")
  }

  // Si pas assez de recommandations spécifiques, ajouter des conseils généraux
  if (recommendations.length < 3) {
    recommendations.push("📚 Étudiez le travail des grands photographes de votre domaine d'intérêt pour développer votre œil artistique.")
    recommendations.push("🔄 Pratiquez régulièrement et analysez vos propres photos pour identifier vos patterns et points d'amélioration.")
  }

  return recommendations.slice(0, 5) // Max 5 recommandations
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Limite élevée pour batch
    }
  }
}