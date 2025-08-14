import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('=== API /user/preferences appelée ===')
  console.log('Method:', req.method)
  console.log('Body:', req.body)

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    console.log('Session:', session)
    
    if (!session?.user?.email) {
      console.log('Session manquante ou email manquant')
      return res.status(401).json({ error: 'Non authentifié' })
    }

    const preferences = req.body

    // Validation des données
    if (!preferences.displayName?.trim()) {
      return res.status(400).json({ error: 'Le nom d\'affichage est requis' })
    }

    // Pour l'instant, on simule la sauvegarde en base de données
    // TODO: Implémenter la vraie sauvegarde avec Prisma
    console.log('Sauvegarde des préférences utilisateur:', {
      userEmail: session.user.email,
      userName: session.user.name,
      preferences: {
        displayName: preferences.displayName,
        nickname: preferences.nickname,
        preferredAnalysisMode: preferences.preferredAnalysisMode,
        defaultExportFormat: preferences.defaultExportFormat,
        theme: preferences.theme,
        shareAnalytics: preferences.shareAnalytics,
        publicProfile: preferences.publicProfile
      }
    })

    // Simulation d'un délai de sauvegarde
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log('✅ Sauvegarde simulée réussie')
    return res.status(200).json({ 
      success: true, 
      message: 'Préférences sauvegardées avec succès' 
    })

  } catch (error) {
    console.error('❌ Erreur sauvegarde préférences:', error)
    return res.status(500).json({ error: 'Erreur serveur lors de la sauvegarde' })
  }
}