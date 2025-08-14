import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { Resend } from 'resend'

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email requis' })
  }

  try {
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // Toujours retourner succès pour éviter l'énumération d'emails
    if (!user) {
      return res.status(200).json({ 
        message: 'Un email de réinitialisation a été envoyé si cette adresse existe.' 
      })
    }

    // Générer token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    // Sauvegarder le token
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // Envoyer email de réinitialisation
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@judgemyjpeg.fr',
      to: email,
      subject: '🔐 Réinitialisation de votre mot de passe JudgeMyJPEG',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #ffffff; padding: 20px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ff006e; margin: 0;">🔐 Réinitialisation mot de passe</h1>
            <p style="color: #888; margin: 10px 0;">JudgeMyJPEG</p>
          </div>
          
          <p>Bonjour,</p>
          
          <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte JudgeMyJPEG.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(45deg, #ff006e, #00d9ff); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;
                      display: inline-block;">
              🔄 Réinitialiser mon mot de passe
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px;">
            Ce lien expire dans 24 heures.<br>
            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
          </p>
          
          <hr style="border: 1px solid #333; margin: 20px 0;">
          
          <p style="color: #666; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} JudgeMyJPEG - L'IA qui juge vos photos
          </p>
        </div>
      `
    })

    res.status(200).json({ 
      message: 'Un email de réinitialisation a été envoyé si cette adresse existe.' 
    })

  } catch (error) {
    console.error('Erreur forgot-password:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  } finally {
    await prisma.$disconnect()
  }
}