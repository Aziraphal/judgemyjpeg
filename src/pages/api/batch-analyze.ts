import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { analyzePhoto } from '@/services/openai'
import { PhotoAnalysis } from '@/types/analysis'
import { BatchAnalyzer } from '@/services/batch-analyzer'
import { PrismaClient } from '@prisma/client'
import { rateLimit } from '@/lib/rate-limit'
import { moderateText } from '@/lib/moderation'
import { logger } from '@/lib/logger'

const prisma = new PrismaClient()
const batchAnalyzer = new BatchAnalyzer()

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
    rank?: number // Position dans le classement
    isFamous?: boolean // Photo célèbre détectée
    famousInfo?: {
      photographer?: string
      title?: string
      confidence: number
    }
  }[]
  report: {
    totalPhotos: number
    avgScore: number
    bestPhoto: {
      id: string
      filename: string
      score: number
      reason: string // Pourquoi c'est la meilleure
    }
    worstPhoto: {
      id: string
      filename: string
      score: number
      issues: string[] // Problèmes principaux
    }
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
    photographyStyle: string // Style dominant détecté
    improvementPriority: string // Axe d'amélioration prioritaire
    famousPhotosCount: number // Nombre de photos célèbres détectées
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

    // Vérifier le statut premium (simplifié pour ce demo)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    // Pour le demo, on assume que tous les utilisateurs sont premium
    // En production, ajouter la logique de vérification d'abonnement
    const isPremium = true
    const { images, tone = 'professional' }: BatchAnalysisRequest = req.body

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ error: 'Images manquantes' })
    }

    // Limiter le nombre d'images selon le statut
    const maxImages = isPremium ? 5 : 3
    if (images.length > maxImages) {
      return res.status(400).json({ 
        error: `Limite dépassée : ${maxImages} images max${!isPremium ? ' (Premium: 5)' : ''}` 
      })
    }

    // Valider chaque image
    for (const image of images) {
      if (!image.data || !image.id || !image.filename) {
        return res.status(400).json({ error: 'Données d\'image invalides' })
      }
      
      // 🛡️ Modération du nom de fichier
      try {
        const moderationResult = await moderateText(image.filename)
        if (moderationResult.flagged) {
          logger.warn(`🚨 Contenu bloqué: ${image.filename} - ${moderationResult.reason}`)
          return res.status(400).json({ 
            error: `Contenu non autorisé: "${image.filename}" - ${moderationResult.reason}`
          })
        }
      } catch (moderationError) {
        logger.error('Erreur modération:', moderationError)
      }
      
      // Vérifier la taille base64 (approximatif)
      const sizeInBytes = (image.data.length * 3) / 4
      const sizeMB = Math.round(sizeInBytes / (1024 * 1024) * 10) / 10
      if (sizeInBytes > 15 * 1024 * 1024) { // 15MB
        return res.status(400).json({ error: `Image trop volumineuse: ${image.filename} (${sizeMB}MB). Limite: 15MB par photo.` })
      }
    }

    logger.debug(`🚀 Début analyse batch: ${images.length} photos pour ${session.user.email}`)

    // 🚀 Analyser toutes les images EN PARALLÈLE pour éviter les timeouts
    const analysisPromises = images.map(async (image, index) => {
      try {
        logger.debug(`📸 Analyse ${index + 1}/${images.length}: ${image.filename}`)
        
        const analysis = await analyzePhoto(image.data, tone)
        
        // Sauvegarder en base en parallèle
        const photoRecord = prisma.photo.create({
          data: {
            filename: image.filename,
            url: `data:image/jpeg;base64,${image.data}`, // Base64 inline pour analyse batch
            score: analysis.score,
            analysis: analysis as any,
            userId: user.id
          }
        })
        
        return {
          id: image.id,
          filename: image.filename,
          analysis: analysis,
          imageBase64: image.data,
          photoRecord
        }
        
      } catch (error) {
        logger.error(`❌ Erreur analyse ${image.filename}:`, error)
        return {
          id: image.id,
          error: 'Erreur lors de l\'analyse'
        }
      }
    })

    // Attendre TOUTES les analyses en parallèle avec timeout
    logger.info(`⚡ Lancement de ${images.length} analyses en parallèle...`)
    const analysisResults = await Promise.allSettled(analysisPromises)
    
    // Séparer les succès et les erreurs
    const photosForBatch = []
    const errors = []
    
    for (let i = 0; i < analysisResults.length; i++) {
      const result = analysisResults[i]
      
      if (result.status === 'fulfilled' && result.value && !result.value.error && 
          result.value.filename && result.value.analysis && result.value.imageBase64) {
        photosForBatch.push({
          id: result.value.id,
          filename: result.value.filename,
          analysis: result.value.analysis,
          imageBase64: result.value.imageBase64
        })
        
        // Attendre la sauvegarde DB si elle existe
        if (result.value.photoRecord) {
          await result.value.photoRecord
        }
      } else {
        errors.push({
          id: images[i].id,
          error: result.status === 'rejected' 
            ? 'Timeout ou erreur réseau' 
            : result.value?.error || 'Erreur inconnue'
        })
      }
    }
    
    logger.info(`✅ Analyses terminées: ${photosForBatch.length} succès, ${errors.length} erreurs`)

    // Générer le rapport intelligent avec classement et détection célébrités
    let report = null
    const results = []
    
    if (photosForBatch.length > 0) {
      const batchReport = await batchAnalyzer.analyzeBatch(photosForBatch)
      
      // Construire les résultats avec ranking et détection célébrités
      for (const rankedPhoto of batchReport.ranking) {
        results.push({
          id: rankedPhoto.id,
          analysis: rankedPhoto.analysis,
          rank: rankedPhoto.rank,
          isFamous: rankedPhoto.isFamous,
          famousInfo: rankedPhoto.famousInfo
        })
      }
      
      report = {
        totalPhotos: batchReport.totalPhotos,
        avgScore: batchReport.avgScore,
        bestPhoto: batchReport.bestPhoto,
        worstPhoto: batchReport.worstPhoto,
        categoryAverages: batchReport.categoryAverages,
        overallRecommendations: batchReport.overallRecommendations,
        photographyStyle: batchReport.photographyStyle,
        improvementPriority: batchReport.improvementPriority,
        famousPhotosCount: batchReport.famousPhotosCount
      }
      
      logger.debug(`✅ Analyse batch terminée: ${photosForBatch.length}/${images.length} réussies`)
      logger.debug(`🏆 Meilleure photo: ${batchReport.bestPhoto.filename} (${batchReport.bestPhoto.score}/100)`)
      logger.debug(`🎨 Photos célèbres détectées: ${batchReport.famousPhotosCount}`)
      
    }
    
    // Ajouter les erreurs d'analyse à la fin
    errors.forEach(error => {
      results.push(error)
    })
    
    // Générer un rapport même avec des erreurs partielles
    if (results.length === 0) {
      report = {
        totalPhotos: 0,
        avgScore: 0,
        bestPhoto: { id: '', filename: '', score: 0, reason: 'Aucune analyse réussie' },
        worstPhoto: { id: '', filename: '', score: 0, issues: ['Aucune analyse réussie'] },
        categoryAverages: {
          composition: 0, lighting: 0, focus: 0, exposure: 0,
          creativity: 0, emotion: 0, storytelling: 0
        },
        overallRecommendations: ['Aucune analyse réussie'],
        photographyStyle: 'Indéterminé',
        improvementPriority: 'Réussir l\'upload des photos',
        famousPhotosCount: 0
      }
    }

    return res.status(200).json({
      success: true,
      results,
      report
    })

  } catch (error) {
    logger.error('💥 Erreur batch analysis:', error)
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
    },
    responseLimit: false, // Désactiver la limite de réponse
    externalResolver: true, // Pour les timeouts longs
  }
}