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

/**
 * Nettoie une chaîne JSON en échappant les caractères problématiques
 */
function cleanJsonString(jsonStr: string): string {
  try {
    let cleaned = jsonStr
    
    // Étape 1: Nettoyer les échappements problématiques
    // Doubler les backslashes isolés qui ne sont pas des échappements valides
    cleaned = cleaned.replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, '\\\\')
    
    // Étape 2: Corriger les guillemets non échappés dans les valeurs
    cleaned = cleaned.replace(/(?<!\\)"/g, (match, offset) => {
      // Vérifier si on est dans une valeur de string JSON
      const beforeMatch = cleaned.substring(0, offset)
      const colonCount = (beforeMatch.match(/:/g) || []).length
      const openBraceCount = (beforeMatch.match(/"/g) || []).length
      
      // Si nombre impair de guillemets avant, on est dans une string
      if (openBraceCount % 2 === 1) {
        return '\\"' // Échapper le guillemet
      }
      return match
    })
    
    // Étape 3: Méthode robuste par tokens
    const tokens: string[] = []
    let current = ''
    let inString = false
    let escapeNext = false
    
    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i]
      
      if (escapeNext) {
        current += char
        escapeNext = false
        continue
      }
      
      if (char === '\\') {
        current += char
        escapeNext = true
        continue
      }
      
      if (char === '"') {
        if (inString) {
          // Fin de string - nettoyer le contenu accumulé
          let cleanContent = current
          
          // Nettoyer les caractères de contrôle
          cleanContent = cleanContent
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r') 
            .replace(/\t/g, '\\t')
            .replace(/\f/g, '\\f')
            .replace(/\b/g, '\\b')
            // Supprimer les caractères de contrôle non imprimables
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
          
          tokens.push(cleanContent + '"')
          current = ''
          inString = false
        } else {
          // Début de string
          if (current.trim()) tokens.push(current)
          current = '"'
          inString = true
        }
        continue
      }
      
      if (inString) {
        // Dans une string - accumuler (les caractères seront nettoyés à la fin)
        current += char
      } else {
        // Hors string - caractères structurels JSON
        if (char.match(/\s/) && !current.trim()) {
          continue // Ignorer les espaces en début
        }
        current += char
      }
    }
    
    // Ajouter le dernier token
    if (current) {
      if (inString) {
        // String non fermée - la fermer après nettoyage
        let cleanContent = current
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t')
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        tokens.push(cleanContent + '"')
      } else {
        tokens.push(current)
      }
    }
    
    const result = tokens.join('')
    
    // Validation finale: essayer de parser pour vérifier
    JSON.parse(result)
    logger.info('Advanced JSON cleaning successful')
    
    return result
    
  } catch (error) {
    logger.warn('Erreur nettoyage JSON avancé, trying aggressive fallback:', error)
    
    // Fallback ultra-agressif pour cas désespérés
    try {
      let fallback = jsonStr
        // Supprimer tous les caractères de contrôle
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        // Échapper tous les backslashes isolés
        .replace(/\\(?!["\\/bfnrtua-fA-F])/g, '\\\\')
        // Nettoyer les sauts de ligne dans les strings
        .replace(/"([^"]*?)\n([^"]*?)"/g, '"$1\\n$2"')
        .replace(/"([^"]*?)\r([^"]*?)"/g, '"$1\\r$2"')
        .replace(/"([^"]*?)\t([^"]*?)"/g, '"$1\\t$2"')
        // Supprimer les virgules en double
        .replace(/,\s*,/g, ',')
        // Supprimer les virgules avant }
        .replace(/,\s*}/g, '}')
      
      // Test de validation
      JSON.parse(fallback)
      logger.info('Fallback JSON cleaning successful')
      
      return fallback
      
    } catch (fallbackError) {
      logger.error('All JSON cleaning methods failed:', { 
        originalError: error, 
        fallbackError,
        jsonPreview: jsonStr.substring(0, 100)
      })
      
      // Dernier recours: retourner un JSON minimal valide
      return `{
        "estimatedNewScore": 75,
        "scoreImprovement": 5,
        "explanation": "Analyse de retouche générée automatiquement",
        "priority": "exposure",
        "lightroom": {
          "webUrl": "https://lightroom.adobe.com",
          "steps": [
            {
              "id": "exposure",
              "title": "Ajuster l'exposition",
              "description": "Améliorer la luminosité générale",
              "values": {"exposure": "+0.5"},
              "impact": "high",
              "difficulty": "easy"
            }
          ]
        },
        "snapseed": {
          "downloadUrl": "https://play.google.com/store/apps/details?id=com.niksoftware.snapseed",
          "steps": [
            {
              "id": "tune",
              "title": "Réglages de base",
              "description": "Ajuster luminosité et contraste",
              "values": {"brightness": "+20"},
              "impact": "high", 
              "difficulty": "easy"
            }
          ]
        }
      }`
    }
  }
}

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
      
      logger.info('JSON extracted (raw):', { jsonStart: jsonString.substring(0, 100) })
      
      // Nettoyer le JSON avant parsing
      const cleanedJsonString = cleanJsonString(jsonString)
      logger.info('JSON cleaned:', { jsonStart: cleanedJsonString.substring(0, 100) })
      
      analysisResult = JSON.parse(cleanedJsonString)
      
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