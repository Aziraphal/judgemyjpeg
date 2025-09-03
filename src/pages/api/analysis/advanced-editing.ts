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

    const prompt = `Tu es un expert en retouche photo professionnel. Analyse cette image et ses données techniques pour proposer des conseils de retouche PRÉCIS et EFFICACES.

CONTEXTE :
- Score actuel : ${currentScore}/100
- Analyse précédente : "${currentAnalysis}"
${exifContext}

MISSION : 
Propose des corrections concrètes et mesurables qui vont VRAIMENT améliorer le score de cette photo.

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

RÈGLES IMPÉRATIVES :
1. Valeurs EXACTES et réalistes (pas de "-999" ou "+100")
2. Steps ordonnés par IMPACT (high -> medium -> low)
3. Maximum 5 steps par plateforme
4. Estimation de score réaliste (+5 à +20 points max)
5. Conseils applicables aux versions gratuites
6. Terminologie française

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
                url: `data:image/jpeg;base64,${imageBase64}`,
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

    // Parser la réponse JSON
    let analysisResult: AdvancedEditingAnalysis
    try {
      // Nettoyer la réponse pour extraire le JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Format JSON invalide')
      }
      
      analysisResult = JSON.parse(jsonMatch[0])
      
      // Validation des données
      if (!analysisResult.estimatedNewScore || !analysisResult.lightroom || !analysisResult.snapseed) {
        throw new Error('Structure de réponse invalide')
      }
      
    } catch (parseError) {
      logger.error('Erreur parsing JSON IA:', parseError)
      throw new Error('Réponse IA invalide')
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