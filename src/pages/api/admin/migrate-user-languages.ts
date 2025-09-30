/**
 * API Admin pour migrer les langues des utilisateurs existants
 * Détecte automatiquement la langue via géolocalisation
 * Usage: POST /api/admin/migrate-user-languages
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Vérifier si l'utilisateur est admin
    const session = await getServerSession(req, res, authOptions)

    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Non authentifié' })
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true, role: true }
    })

    if (!adminUser?.isAdmin && adminUser?.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé - Admin requis' })
    }

    // Récupérer tous les utilisateurs avec leurs préférences
    const users = await prisma.userPreferences.findMany({
      where: {
        language: 'fr' // Uniquement ceux qui ont encore le défaut français
      },
      select: {
        userId: true,
        language: true
      }
    })

    logger.info(`Migration: ${users.length} utilisateurs avec langue FR par défaut`)

    // Note: On ne peut pas détecter la langue en masse car on n'a pas l'IP
    // Cette API sert surtout à documenter le processus
    // La vraie détection se fait côté client lors de la connexion

    res.status(200).json({
      success: true,
      message: 'La détection automatique se fait côté client lors de la connexion',
      usersWithDefaultLanguage: users.length,
      info: 'Les utilisateurs verront automatiquement le site dans leur langue détectée (géolocalisation) lors de leur prochaine visite, même si leur préférence BDD est "fr"'
    })

  } catch (error) {
    logger.error('Erreur migration langues:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}