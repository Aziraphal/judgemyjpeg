import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  logger.debug('=== API /user/preferences appelée ===')
  logger.debug('Method:', req.method)

  if (req.method === 'GET') {
    // Récupérer les préférences
    try {
      const session = await getServerSession(req, res, authOptions)
      
      if (!session?.user?.id) {
        return res.status(401).json({ error: 'Non authentifié' })
      }

      const userPreferences = await prisma.userPreferences.findUnique({
        where: { userId: session.user.id }
      })

      if (!userPreferences) {
        // Retourner des préférences par défaut
        // Note: la langue 'fr' ici est un fallback si pas de détection auto
        // Le système de détection auto prend priorité côté client
        return res.status(200).json({
          displayName: session.user.nickname || session.user.name || '',
          preferredAnalysisMode: 'professional',
          defaultExportFormat: 'pdf',
          theme: 'cosmic',
          language: 'fr', // Fallback uniquement
          shareAnalytics: true,
          publicProfile: false
        })
      }

      return res.status(200).json({
        displayName: userPreferences.displayName || session.user.nickname || session.user.name || '',
        preferredAnalysisMode: userPreferences.preferredAnalysisMode,
        defaultExportFormat: userPreferences.defaultExportFormat,
        theme: userPreferences.theme,
        language: userPreferences.language,
        shareAnalytics: userPreferences.shareAnalytics,
        publicProfile: userPreferences.publicProfile
      })

    } catch (error) {
      logger.error('❌ Erreur lecture préférences:', error)
      return res.status(500).json({ error: 'Erreur serveur' })
    }
  }

  if (req.method === 'POST') {
    // Sauvegarder les préférences
    try {
      const session = await getServerSession(req, res, authOptions)
      
      if (!session?.user?.id) {
        return res.status(401).json({ error: 'Non authentifié' })
      }

      const preferences = req.body

      // Validation des données
      if (!preferences.displayName?.trim()) {
        return res.status(400).json({ error: 'Le nom d\'affichage est requis' })
      }

      logger.debug('Sauvegarde des préférences utilisateur:', {
        userId: session.user.id,
        preferences
      })

      // Sauvegarder ou mettre à jour les préférences
      const userPreferences = await prisma.userPreferences.upsert({
        where: { userId: session.user.id },
        update: {
          displayName: preferences.displayName,
          preferredAnalysisMode: preferences.preferredAnalysisMode || 'professional',
          defaultExportFormat: preferences.defaultExportFormat || 'pdf',
          theme: preferences.theme || 'cosmic',
          language: preferences.language || 'fr',
          shareAnalytics: preferences.shareAnalytics ?? true,
          publicProfile: preferences.publicProfile ?? false,
        },
        create: {
          userId: session.user.id,
          displayName: preferences.displayName,
          preferredAnalysisMode: preferences.preferredAnalysisMode || 'professional',
          defaultExportFormat: preferences.defaultExportFormat || 'pdf',
          theme: preferences.theme || 'cosmic',
          language: preferences.language || 'fr',
          shareAnalytics: preferences.shareAnalytics ?? true,
          publicProfile: preferences.publicProfile ?? false,
        }
      })

      // Mettre à jour aussi le nickname dans la table User pour cohérence avec NextAuth
      await prisma.user.update({
        where: { id: session.user.id },
        data: { nickname: preferences.displayName }
      })

      logger.debug('✅ Préférences sauvegardées avec succès')
      return res.status(200).json({ 
        success: true, 
        message: 'Préférences sauvegardées avec succès',
        preferences: userPreferences
      })

    } catch (error) {
      logger.error('❌ Erreur sauvegarde préférences:', error)
      return res.status(500).json({ error: 'Erreur serveur lors de la sauvegarde' })
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' })
}