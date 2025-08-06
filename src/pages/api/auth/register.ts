import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { validatePassword } from '@/lib/password-validation'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name, email, password } = req.body

    // Validation des champs
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Tous les champs sont requis' })
    }

    // Validation email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Format d\'email invalide' })
    }

    // Validation robuste du mot de passe
    const passwordValidation = validatePassword(password, email)
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: 'Mot de passe trop faible',
        details: passwordValidation.errors,
        strength: passwordValidation.strength,
        score: passwordValidation.score
      })
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