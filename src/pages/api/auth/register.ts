import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name, email, password } = req.body

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Tous les champs sont requis' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' })
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Un compte avec cet email existe déjà' })
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // Nouveaux utilisateurs commencent en free
        subscriptionStatus: 'free',
        monthlyAnalysisCount: 0,
        lastAnalysisReset: new Date(),
      }
    })

    // Retourner les données de l'utilisateur (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = user

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}