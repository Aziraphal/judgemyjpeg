import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { logger, getClientIP } from '@/lib/logger'
import { rateLimit } from '@/lib/rate-limit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate limiting - 5 feedbacks par heure
  const rateLimitResult = await rateLimit(req, res, {
    interval: 60 * 60 * 1000, // 1 heure
    uniqueTokenPerInterval: 1000,
    maxRequests: 5
  })

  if (!rateLimitResult.success) {
    return res.status(429).json({ 
      error: 'Trop de feedbacks envoyés. Réessayez dans une heure.',
      retryAfter: rateLimitResult.resetTime 
    })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    const ip = getClientIP(req)
    
    const {
      type,
      category,
      rating,
      title,
      message,
      page,
      email: providedEmail
    } = req.body

    // Validation des données
    if (!message || message.trim().length < 5) {
      return res.status(400).json({ error: 'Message trop court (minimum 5 caractères)' })
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message trop long (maximum 2000 caractères)' })
    }

    if (type && !['bug', 'feature', 'general', 'love', 'confusion'].includes(type)) {
      return res.status(400).json({ error: 'Type de feedback invalide' })
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Note invalide (1-5)' })
    }

    // Détection de l'email (user connecté ou fourni)
    const email = session?.user?.email || providedEmail

    // Métadonnées techniques pour debug
    const metadata = {
      userAgent: req.headers['user-agent'],
      referer: req.headers['referer'],
      ip,
      timestamp: new Date().toISOString(),
      sessionId: session?.user?.id ? 'authenticated' : 'anonymous'
    }

    // Créer le feedback en base
    const feedback = await prisma.feedback.create({
      data: {
        userId: session?.user?.id || null,
        email: email || null,
        type: type || 'general',
        category: category || null,
        rating: rating || null,
        title: title?.slice(0, 100) || null,
        message: message.slice(0, 2000),
        page: page?.slice(0, 200) || null,
        userAgent: req.headers['user-agent']?.slice(0, 500) || null,
        metadata: JSON.stringify(metadata),
        status: 'new'
      }
    })

    // Log pour admin
    logger.info('New feedback received', {
      feedbackId: feedback.id,
      type: feedback.type,
      rating: feedback.rating,
      userId: feedback.userId,
      hasMessage: !!feedback.message
    })

    // Réponse de succès
    res.status(201).json({
      success: true,
      message: 'Merci pour votre feedback ! Nous le prenons en compte.',
      feedbackId: feedback.id
    })

  } catch (error) {
    logger.error('Feedback submission error', error)
    res.status(500).json({ error: 'Erreur lors de l\'envoi du feedback' })
  }
}