import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// Stockage temporaire des tentatives (en production, utiliser Redis)
const attemptStore = new Map<string, { count: number, lastAttempt: number }>()

// ⚠️ API ADMIN - Sécurisée par secret + rate limiting
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate limiting par IP
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown'
  const now = Date.now()
  const attempts = attemptStore.get(clientIP as string) || { count: 0, lastAttempt: 0 }
  
  // Reset après 1 heure
  if (now - attempts.lastAttempt > 60 * 60 * 1000) {
    attempts.count = 0
  }
  
  // Bloquer après 5 tentatives
  if (attempts.count >= 5) {
    return res.status(429).json({ 
      error: 'Trop de tentatives. Réessayez plus tard.',
      retryAfter: 3600 
    })
  }

  try {
    const { email, plan, secret } = req.body

    // Sécurité : vérifier le secret admin
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      // Incrémenter les tentatives
      attempts.count++
      attempts.lastAttempt = now
      attemptStore.set(clientIP as string, attempts)
      
      return res.status(401).json({ error: 'Secret admin incorrect' })
    }

    // Reset des tentatives après succès de l'auth
    attemptStore.delete(clientIP as string)

    if (!email || !plan) {
      return res.status(400).json({ error: 'Email et plan requis' })
    }

    if (!['free', 'premium', 'lifetime'].includes(plan)) {
      return res.status(400).json({ error: 'Plan invalide' })
    }

    // Mettre à jour l'utilisateur
    const user = await prisma.user.update({
      where: { email },
      data: {
        subscriptionStatus: plan,
        // Reset du compteur si upgrade
        ...(plan !== 'free' && { monthlyAnalysisCount: 0 })
      }
    })

    res.status(200).json({ 
      success: true, 
      message: `${email} est maintenant ${plan}`,
      user: {
        id: user.id,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus
      }
    })

  } catch (error) {
    logger.error('Erreur upgrade user:', error)
    res.status(500).json({ 
      error: 'Erreur lors de l\'upgrade',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    })
  }
}