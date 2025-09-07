/**
 * API Advanced Editing Analysis - Conseils de retouche précis
 * POST /api/analysis/advanced-editing
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import { logger } from '@/lib/logger'
import { ExifData } from '@/types/exif'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

interface AdvancedEditingRequest {
  imageBase64: string
  currentScore: number
  currentAnalysis: string
  exifData?: ExifData | null
  platform: 'lightroom' | 'snapseed' | 'both'
}

interface EditingStep {
  id: string
  title: string
  description: string
  values: Record<string, number | string>
  impact: 'high' | 'medium' | 'low'
  difficulty: 'easy' | 'medium' | 'advanced'
}

interface AdvancedEditingAnalysis {
  estimatedNewScore: number
  scoreImprovement: number
  lightroom: {
    steps: EditingStep[]
    webUrl: string
  }
  snapseed: {
    steps: EditingStep[]
    downloadUrl: string
  }
  explanation: string
  priority: 'exposure' | 'composition' | 'colors' | 'details'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { imageBase64, currentScore, currentAnalysis, exifData, platform }: AdvancedEditingRequest = req.body

    if (!imageBase64 || !currentScore) {
      return res.status(400).json({ error: 'Image et score requis' })
    }

    // Gérer le fallback mobile - conversion côté serveur si nécessaire
    let finalImageBase64 = imageBase64
    
    if (imageBase64.startsWith('CLOUDINARY_URL:')) {
      const cloudinaryUrl = imageBase64.replace('CLOUDINARY_URL:', '')
      logger.info('Mobile fallback - Converting Cloudinary URL server-side', { url: cloudinaryUrl.substring(0, 50) })
      
      try {
        const response = await fetch(cloudinaryUrl)
        if (!response.ok) {
          throw new Error(`Fetch failed: ${response.status}`)
        }
        
        const buffer = await response.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')
        finalImageBase64 = base64
        
        logger.info('Server-side conversion successful', { size: base64.length })
      } catch (fetchError) {
        logger.error('Server-side conversion failed:', fetchError)
        return res.status(400).json({ 
          error: 'Impossible de traiter l\'image depuis Cloudinary',
          details: fetchError instanceof Error ? fetchError.message : 'Erreur inconnue'
        })
      }
    }

    logger.info('Advanced editing analysis requested', {
      currentScore,
      platform,
      hasExif: !!exifData
    })

    // Construire le contexte EXIF
    const exifContext = exifData ? `
DONNÉES TECHNIQUES ACTUELLES :
- Appareil : ${exifData.camera || 'Inconnu'}
- Objectif : ${exifData.lens || 'Inconnu'}
- ISO : ${exifData.iso || 'Inconnu'}
- Ouverture : f/${exifData.aperture || 'Inconnu'}
- Vitesse : ${exifData.shutterSpeed || 'Inconnue'}
- Focale : ${exifData.focalLength || 'Inconnue'}mm
` : ''

    const prompt = `Tu es un expert en retouche photo professionnel avec 15 ans d'expérience. Analyse cette image VISUELLEMENT et propose des corrections SPÉCIFIQUES qui vont réellement améliorer la qualité photographique.

CONTEXTE ACTUEL :
- Score obtenu : ${currentScore}/100
- Problèmes identifiés : "${currentAnalysis}"
${exifContext}

MISSION CRITIQUE : 
Identifie les VRAIS défauts visibles sur cette photo et donne des valeurs de correction PRÉCISES qui vont concrètement améliorer :
1. L'exposition (zones sous/sur-exposées)
2. Le contraste local et global  
3. La netteté des détails importants
4. L'équilibre colorimétrique
5. La composition (recadrage si nécessaire)

IMPORTANT : Tes conseils doivent être basés sur ce que tu VOIS réellement dans l'image, pas sur des généralités.

FORMAT DE RÉPONSE (JSON strict) :
{
  "estimatedNewScore": 85,
  "scoreImprovement": 13,
  "priority": "exposure",
  "explanation": "Les principaux problèmes sont la sous-exposition et le manque de contraste...",
  "lightroom": {
    "webUrl": "https://lightroom.adobe.com",
    "steps": [
      {
        "id": "exposure",
        "title": "Corriger l'exposition",
        "description": "Éclaircir l'image sous-exposée",
        "values": {
          "exposure": "+0.8",
          "highlights": "-25",
          "shadows": "+45"
        },
        "impact": "high",
        "difficulty": "easy"
      }
    ]
  },
  "snapseed": {
    "downloadUrl": "https://play.google.com/store/apps/details?id=com.niksoftware.snapseed",
    "steps": [
      {
        "id": "tuning",
        "title": "Réglage des tons",
        "description": "Ajuster luminosité et contraste",
        "values": {
          "brightness": "+25",
          "ambiance": "+20",
          "highlights": "-30"
        },
        "impact": "high",
        "difficulty": "easy"
      }
    ]
  }
}

RÈGLES CRITIQUES POUR EFFICACITÉ :
1. Analyse VISUELLE de l'image - identifie les défauts réels que tu vois
2. Valeurs TESTÉES et réalistes : Exposition (-1.0 à +1.0), Contraste (-50 à +50), etc.
3. Ordre par IMPACT VISUEL RÉEL (ce qui fait vraiment la différence)
4. Maximum 4 steps ESSENTIELS (pas de remplissage)
5. Estimation CONSERVATIVE du gain de score (+3 à +15 points maximum)
6. Instructions PRÉCISES : "Zone X trop sombre, augmenter de Y"
7. Focus sur les DÉFAUTS MAJEURS visibles, ignorer les détails mineurs

TYPES DE CORRECTIONS POSSIBLES :
- Exposition (exposure, highlights, shadows, whites, blacks)
- Couleurs (vibrance, saturation, temperature, tint)
- Détails (clarity, texture, dehaze, noise reduction)
- Local (masques, corrections sélectives)
- Géométrie (crop, straighten, perspective)

Analyse cette photo et donne des conseils CONCRETS qui marchent !`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${finalImageBase64}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('Pas de réponse de l\'IA')
    }

    // Parser la réponse JSON avec fallbacks multiples
    let analysisResult: AdvancedEditingAnalysis
    
    logger.info('Raw AI response preview:', { 
      contentStart: content.substring(0, 200),
      contentEnd: content.substring(content.length - 200),
      contentLength: content.length
    })
    
    try {
      // Méthode 1: Chercher JSON avec accolades équilibrées
      let jsonString = ''
      let braceCount = 0
      let startIndex = -1
      
      for (let i = 0; i < content.length; i++) {
        const char = content[i]
        if (char === '{') {
          if (startIndex === -1) startIndex = i
          braceCount++
        } else if (char === '}') {
          braceCount--
          if (braceCount === 0 && startIndex !== -1) {
            jsonString = content.substring(startIndex, i + 1)
            break
          }
        }
      }
      
      // Méthode 2: Fallback avec regex simple si méthode 1 échoue
      if (!jsonString) {
        const jsonMatch = content.match(/\{[\s\S]*?\}/)
        jsonString = jsonMatch ? jsonMatch[0] : ''
      }
      
      // Méthode 3: Dernier recours - prendre tout entre première { et dernière }
      if (!jsonString) {
        const firstBrace = content.indexOf('{')
        const lastBrace = content.lastIndexOf('}')
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonString = content.substring(firstBrace, lastBrace + 1)
        }
      }
      
      if (!jsonString) {
        logger.error('Aucun JSON trouvé dans la réponse IA:', { content })
        throw new Error('Format JSON introuvable')
      }
      
      logger.info('JSON extracted:', { jsonStart: jsonString.substring(0, 100) })
      
      analysisResult = JSON.parse(jsonString)
      
      // Validation robuste des données
      if (typeof analysisResult !== 'object' || !analysisResult) {
        throw new Error('JSON invalide - pas un objet')
      }
      
      if (!analysisResult.estimatedNewScore || typeof analysisResult.estimatedNewScore !== 'number') {
        throw new Error('estimatedNewScore manquant ou invalide')
      }
      
      if (!analysisResult.lightroom || !Array.isArray(analysisResult.lightroom.steps)) {
        throw new Error('Structure lightroom invalide')
      }
      
      if (!analysisResult.snapseed || !Array.isArray(analysisResult.snapseed.steps)) {
        throw new Error('Structure snapseed invalide')
      }

      // Valeurs par défaut pour les champs optionnels
      analysisResult.scoreImprovement = analysisResult.scoreImprovement || (analysisResult.estimatedNewScore - currentScore)
      analysisResult.explanation = analysisResult.explanation || 'Analyse de retouche générée'
      analysisResult.priority = analysisResult.priority || 'exposure'
      
      // URLs par défaut si manquantes
      if (!analysisResult.lightroom.webUrl) {
        analysisResult.lightroom.webUrl = 'https://lightroom.adobe.com'
      }
      if (!analysisResult.snapseed.downloadUrl) {
        analysisResult.snapseed.downloadUrl = 'https://play.google.com/store/apps/details?id=com.niksoftware.snapseed'
      }
      
      logger.info('JSON validation successful')
      
    } catch (parseError) {
      logger.error('Erreur parsing JSON IA:', { 
        error: parseError instanceof Error ? parseError.message : String(parseError),
        contentPreview: content.substring(0, 500)
      })
      throw new Error(`Réponse IA invalide: ${parseError instanceof Error ? parseError.message : 'Erreur parsing'}`)
    }

    // Logs pour monitoring
    logger.info('Advanced editing analysis completed', {
      originalScore: currentScore,
      newScore: analysisResult.estimatedNewScore,
      improvement: analysisResult.scoreImprovement,
      priority: analysisResult.priority,
      lightroomSteps: analysisResult.lightroom.steps.length,
      snapseedSteps: analysisResult.snapseed.steps.length
    })

    res.status(200).json({
      success: true,
      analysis: analysisResult,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Advanced editing analysis error:', error)
    res.status(500).json({ 
      error: 'Erreur lors de l\'analyse avancée',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    })
  }
}