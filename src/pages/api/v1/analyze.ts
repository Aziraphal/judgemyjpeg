/**
 * API Publique JudgeMyJPEG v1.0
 * Endpoint: POST /api/v1/analyze
 *
 * Permet aux développeurs d'analyser des photos programmatically
 * Pricing: €0.10 par analyse (via Stripe metered billing)
 */
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { analyzePhotoWithAI } from '@/services/openai'
import { logger } from '@/lib/logger'
import crypto from 'crypto'

// Rate limiting par API key (Redis recommended pour production)
const rateLimiter = new Map<string, { count: number; resetAt: number }>()

interface AnalyzeRequest {
  imageUrl?: string
  imageBase64?: string
  tone?: 'roast' | 'professional' | 'learning'
  language?: string
  photoType?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 1. Authentification via API Key
    const apiKey = req.headers.authorization?.replace('Bearer ', '')
    if (!apiKey) {
      return res.status(401).json({
        error: 'Missing API key',
        message: 'Include "Authorization: Bearer YOUR_API_KEY" header'
      })
    }

    // Vérifier API key dans database
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true }
    })

    if (!apiKeyRecord || !apiKeyRecord.isActive) {
      return res.status(401).json({
        error: 'Invalid or inactive API key',
        message: 'Get your API key at https://judgemyjpeg.fr/account/api'
      })
    }

    // 2. Rate limiting (100 requêtes/heure par clé)
    const rateLimitKey = apiKey
    const now = Date.now()
    const limit = apiKeyRecord.rateLimit || 100 // Défaut 100/h
    const windowMs = 60 * 60 * 1000 // 1 heure

    let rateData = rateLimiter.get(rateLimitKey)
    if (!rateData || now > rateData.resetAt) {
      rateData = { count: 0, resetAt: now + windowMs }
      rateLimiter.set(rateLimitKey, rateData)
    }

    if (rateData.count >= limit) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        limit,
        resetAt: new Date(rateData.resetAt).toISOString()
      })
    }

    rateData.count++

    // 3. Validation requête
    const { imageUrl, imageBase64, tone = 'professional', language = 'en', photoType = 'general' }: AnalyzeRequest = req.body

    if (!imageUrl && !imageBase64) {
      return res.status(400).json({
        error: 'Missing image data',
        message: 'Provide either "imageUrl" or "imageBase64"'
      })
    }

    // Valider tone
    if (!['roast', 'professional', 'learning'].includes(tone)) {
      return res.status(400).json({
        error: 'Invalid tone',
        message: 'Tone must be: roast, professional, or learning'
      })
    }

    // 4. Télécharger image si URL
    let imageData: string
    if (imageUrl) {
      const imageResponse = await fetch(imageUrl, { signal: AbortSignal.timeout(10000) })
      if (!imageResponse.ok) {
        return res.status(400).json({ error: 'Failed to fetch image from URL' })
      }
      const buffer = await imageResponse.arrayBuffer()
      imageData = Buffer.from(buffer).toString('base64')
    } else {
      imageData = imageBase64!
    }

    // 5. Générer hash image pour cache
    const imageHash = crypto.createHash('sha256').update(imageData).digest('hex').substring(0, 16)

    // 6. Vérifier cache (optionnel, économise coûts)
    const cacheKey = `api:${imageHash}:${tone}:${language}`
    // TODO: Implémenter cache Redis lookup

    // 7. Analyser avec OpenAI
    const startTime = Date.now()
    const analysis = await analyzePhotoWithAI({
      imageBase64: imageData,
      tone,
      language,
      photoType
    })
    const processingTime = Date.now() - startTime

    // 8. Enregistrer usage pour billing
    await prisma.apiUsage.create({
      data: {
        apiKeyId: apiKeyRecord.id,
        userId: apiKeyRecord.userId,
        endpoint: '/api/v1/analyze',
        creditsUsed: 1, // 1 crédit = 1 analyse
        requestData: {
          tone,
          language,
          photoType,
          imageHash
        },
        responseTime: processingTime,
        success: true
      }
    })

    // 9. Incrémenter compteur Stripe (metered billing)
    if (apiKeyRecord.stripeSubscriptionItemId) {
      try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
        await stripe.subscriptionItems.createUsageRecord(
          apiKeyRecord.stripeSubscriptionItemId,
          {
            quantity: 1,
            timestamp: Math.floor(Date.now() / 1000),
            action: 'increment'
          }
        )
      } catch (stripeError) {
        logger.error('Stripe metered billing error:', stripeError)
        // Ne pas bloquer la réponse si Stripe échoue
      }
    }

    // 10. Logger pour analytics
    logger.info('✅ API v1 analyze success', {
      userId: apiKeyRecord.userId,
      tone,
      language,
      processingTime,
      imageHash
    })

    // 11. Retourner résultat
    res.status(200).json({
      success: true,
      data: {
        score: analysis.score,
        partialScores: analysis.partialScores,
        summary: analysis.summary,
        suggestions: analysis.suggestions,
        improvements: analysis.improvements,
        tone,
        language,
        processingTime
      },
      usage: {
        creditsUsed: 1,
        creditsRemaining: apiKeyRecord.creditsRemaining - 1,
        rateLimit: {
          limit,
          remaining: limit - rateData.count,
          resetAt: new Date(rateData.resetAt).toISOString()
        }
      },
      metadata: {
        apiVersion: '1.0',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    logger.error('❌ API v1 analyze error:', error)

    // Enregistrer l'échec
    const apiKey = req.headers.authorization?.replace('Bearer ', '')
    if (apiKey) {
      const apiKeyRecord = await prisma.apiKey.findUnique({
        where: { key: apiKey }
      })

      if (apiKeyRecord) {
        await prisma.apiUsage.create({
          data: {
            apiKeyId: apiKeyRecord.id,
            userId: apiKeyRecord.userId,
            endpoint: '/api/v1/analyze',
            creditsUsed: 0,
            success: false,
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        })
      }
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Configuration Next.js
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
}