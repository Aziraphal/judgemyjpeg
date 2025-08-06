/**
 * Custom Email Verification Handler
 * Handles email verification properly with Resend
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token, email } = req.query

  if (!token || !email) {
    return res.redirect('/auth/signin?error=InvalidToken')
  }

  try {
    // Vérifier le token de vérification dans la base
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        token: token as string
      }
    })

    if (!verificationToken) {
      return res.redirect('/auth/signin?error=TokenNotFound')
    }

    // Vérifier que le token n'est pas expiré
    if (verificationToken.expires < new Date()) {
      // Supprimer le token expiré
      await prisma.verificationToken.delete({
        where: { token: token as string }
      })
      return res.redirect('/auth/signin?error=TokenExpired')
    }

    // Vérifier que l'email correspond
    if (verificationToken.identifier !== email) {
      return res.redirect('/auth/signin?error=EmailMismatch')
    }

    // Marquer l'utilisateur comme vérifié
    await prisma.user.update({
      where: { email: email as string },
      data: { emailVerified: new Date() }
    })

    // Supprimer le token utilisé
    await prisma.verificationToken.delete({
      where: { token: token as string }
    })

    // Rediriger vers la page de connexion avec message de succès
    return res.redirect('/auth/signin?message=EmailVerified')

  } catch (error) {
    console.error('Email verification error:', error)
    return res.redirect('/auth/signin?error=VerificationFailed')
  }
}