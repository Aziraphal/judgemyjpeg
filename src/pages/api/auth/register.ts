import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { validatePassword } from '@/lib/password-validation'
import { sendVerificationEmail } from '@/lib/email-service'
import { requireTurnstileVerification } from '@/lib/turnstile-verify'
import { getClientIP } from '@/lib/logger'
import crypto from 'crypto'
import { logger } from '@/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const clientIP = getClientIP(req)

  try {
    const { name, nickname, email, password, turnstileToken } = req.body

    // Validation des champs
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Tous les champs sont requis' })
    }

    // Vérification anti-bot
    const turnstileVerification = await requireTurnstileVerification(turnstileToken, clientIP)
    if (!turnstileVerification.success) {
      logger.warn('Failed bot verification during signup', { email, ip: clientIP })
      return res.status(400).json({ error: turnstileVerification.error })
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
        nickname: nickname || null,
        email,
        password: hashedPassword,
        // Nouveaux utilisateurs commencent en free (3 analyses/mois)
        subscriptionStatus: 'free',
        monthlyAnalysisCount: 0,
        lastAnalysisReset: new Date(),
        // Starter Pack doit être acheté (€4.99)
        starterPackPurchased: false,
        starterPackUsed: false,
        starterAnalysisCount: 0,
        starterSharesCount: 0,
        starterExportsCount: 0,
        // Créer automatiquement les préférences avec le nickname s'il existe
        userPreferences: nickname ? {
          create: {
            displayName: nickname,
            preferredAnalysisMode: 'professional',
            defaultExportFormat: 'pdf',
            theme: 'cosmic',
            language: 'fr',
            shareAnalytics: true,
            publicProfile: false
          }
        } : undefined
      }
    })

    // Créer un token de vérification
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires
      }
    })

    // Envoyer l'email de vérification
    try {
      const baseUrl = process.env.NEXTAUTH_URL || `https://${req.headers.host}`
      const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`
      
      logger.debug('🔗 URL de vérification générée:', verificationUrl)
      await sendVerificationEmail(email, verificationUrl)
      logger.debug('📧 Email de vérification envoyé à:', email)
    } catch (emailError) {
      logger.error('❌ Erreur envoi email:', emailError)
      // Ne pas faire échouer l'inscription si l'email échoue
    }

    // Retourner les données de l'utilisateur (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = user

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès. Vérifiez votre email pour activer votre compte.',
      user: userWithoutPassword,
      emailSent: true
    })

  } catch (error) {
    logger.error('Erreur lors de l\'inscription:', error)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}