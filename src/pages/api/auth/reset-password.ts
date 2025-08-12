import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  const { token, password } = req.body

  if (!token || !password) {
    return res.status(400).json({ error: 'Token et mot de passe requis' })
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' })
  }

  try {
    // Vérifier le token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date() // Token non expiré
        }
      }
    })

    if (!user) {
      return res.status(400).json({ 
        error: 'Token invalide ou expiré. Demandez un nouveau lien de réinitialisation.' 
      })
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Mettre à jour le mot de passe et supprimer le token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        emailVerified: new Date() // Marquer l'email comme vérifié
      }
    })

    res.status(200).json({ 
      message: 'Mot de passe réinitialisé avec succès' 
    })

  } catch (error) {
    console.error('Erreur reset-password:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  } finally {
    await prisma.$disconnect()
  }
}