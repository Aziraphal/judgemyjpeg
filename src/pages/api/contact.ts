/**
 * API Contact - Envoi d'emails de contact via Resend
 * POST /api/contact
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'
import { logger, getClientIP } from '@/lib/logger'

const resend = new Resend(process.env.RESEND_API_KEY)

interface ContactFormData {
  name: string
  email: string
  subject: string
  category: 'support' | 'partnership' | 'business' | 'bug'
  message: string
  priority: 'low' | 'normal' | 'urgent'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name, email, subject, category, message, priority }: ContactFormData = req.body

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' })
    }

    if (message.length < 20) {
      return res.status(400).json({ error: 'Le message doit faire au moins 20 caractères' })
    }

    // Rate limiting basique par IP
    const ip = getClientIP(req)
    logger.info('Contact form submission', {
      name,
      email,
      category,
      priority,
      ip,
      subject: subject.substring(0, 50)
    })

    // Préparer l'email admin
    const adminEmail = process.env.ADMIN_EMAIL || 'cyril.paquier@gmail.com'
    const categoryEmojis = {
      support: '🛠️',
      partnership: '🤝', 
      business: '💼',
      bug: '🐛'
    }
    
    const priorityEmojis = {
      low: '🟢',
      normal: '🟡',
      urgent: '🔴'
    }

    // Envoyer l'email à l'admin
    await resend.emails.send({
      from: 'JudgeMyJPEG Contact <contact@judgemyjpeg.fr>',
      to: adminEmail,
      subject: `${categoryEmojis[category]} Contact - ${subject}`,
      html: createContactEmailHTML({
        name,
        email,
        subject,
        category,
        message,
        priority,
        ip
      }),
      text: createContactEmailText({
        name,
        email, 
        subject,
        category,
        message,
        priority,
        ip
      }),
      reply_to: email
    })

    // Email de confirmation à l'utilisateur
    await resend.emails.send({
      from: 'JudgeMyJPEG <noreply@judgemyjpeg.fr>',
      to: email,
      subject: '✅ Message reçu - JudgeMyJPEG',
      html: createConfirmationEmailHTML(name, subject),
      text: createConfirmationEmailText(name, subject)
    })

    res.status(200).json({ 
      success: true,
      message: 'Message envoyé avec succès'
    })

  } catch (error) {
    logger.error('Contact form error:', error)
    res.status(500).json({ 
      error: 'Erreur lors de l\'envoi du message'
    })
  }
}

function createContactEmailHTML(data: ContactFormData & { ip: string }): string {
  const categoryLabels = {
    support: 'Support Technique',
    partnership: 'Partenariat',
    business: 'Commercial',
    bug: 'Bug Report'
  }

  const priorityLabels = {
    low: 'Faible',
    normal: 'Normale', 
    urgent: 'URGENTE'
  }

  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #1F2937; color: white; border-radius: 10px; overflow: hidden;">
      <div style="background: linear-gradient(45deg, #FF006E, #00F5FF); padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 2em;">📬 Nouveau Message - JudgeMyJPEG</h1>
      </div>
      
      <div style="padding: 30px;">
        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #00F5FF; margin-top: 0;">👤 Expéditeur</h3>
          <p><strong>Nom:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>IP:</strong> ${data.ip}</p>
        </div>

        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #FF006E; margin-top: 0;">📋 Détails</h3>
          <p><strong>Catégorie:</strong> ${categoryLabels[data.category]}</p>
          <p><strong>Priorité:</strong> ${priorityLabels[data.priority]}</p>
          <p><strong>Sujet:</strong> ${data.subject}</p>
        </div>

        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
          <h3 style="color: #8B5CF6; margin-top: 0;">💬 Message</h3>
          <p style="line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="mailto:${data.email}?subject=Re: ${data.subject}" style="
            display: inline-block;
            background: linear-gradient(45deg, #22C55E, #16A34A);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 50px;
            font-weight: bold;
          ">📧 Répondre</a>
        </div>
      </div>
      
      <div style="background: rgba(0,0,0,0.3); padding: 15px; text-align: center; font-size: 12px; opacity: 0.7;">
        <p style="margin: 0;">© ${new Date().getFullYear()} JudgeMyJPEG - Contact Form</p>
        <p style="margin: 5px 0 0;">⏰ ${new Date().toLocaleString('fr-FR')}</p>
      </div>
    </div>
  `
}

function createContactEmailText(data: ContactFormData & { ip: string }): string {
  return `
NOUVEAU MESSAGE - JudgeMyJPEG

Expéditeur:
- Nom: ${data.name}
- Email: ${data.email}
- IP: ${data.ip}

Détails:
- Catégorie: ${data.category}
- Priorité: ${data.priority}
- Sujet: ${data.subject}

Message:
${data.message}

---
Répondre: ${data.email}
Date: ${new Date().toLocaleString('fr-FR')}
  `
}

function createConfirmationEmailHTML(name: string, subject: string): string {
  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; border-radius: 15px; overflow: hidden;">
      <div style="background: linear-gradient(45deg, #22C55E, #16A34A); padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 2.5em;">✅ JudgeMyJPEG</h1>
        <p style="margin: 10px 0 0; font-size: 1.2em;">Message bien reçu !</p>
      </div>
      
      <div style="padding: 40px 30px;">
        <h2 style="color: #22C55E; margin-bottom: 20px; text-align: center;">Merci ${name} !</h2>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
          Votre message concernant <strong>"${subject}"</strong> a été reçu et sera traité dans les plus brefs délais.
        </p>
        
        <div style="background: rgba(34, 197, 94, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #22C55E; margin-top: 0;">⏰ Temps de réponse</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Support technique: 24-48h</li>
            <li>Questions générales: 2-5 jours</li>
            <li>Partenariats: 1 semaine</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="https://judgemyjpeg.fr" style="
            display: inline-block;
            background: linear-gradient(45deg, #FF006E, #8B00FF);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 50px;
            font-weight: bold;
          ">🚀 Retour à l'App</a>
        </div>
      </div>
      
      <div style="background: rgba(0,0,0,0.3); padding: 20px; text-align: center; font-size: 12px; opacity: 0.7;">
        <p style="margin: 0;">© ${new Date().getFullYear()} JudgeMyJPEG - L'IA qui juge vos photos</p>
      </div>
    </div>
  `
}

function createConfirmationEmailText(name: string, subject: string): string {
  return `
MESSAGE REÇU - JudgeMyJPEG

Merci ${name} !

Votre message "${subject}" a été reçu et sera traité rapidement.

Temps de réponse:
- Support: 24-48h
- Questions: 2-5 jours  
- Partenariats: 1 semaine

JudgeMyJPEG - L'IA qui juge vos photos
https://judgemyjpeg.fr
  `
}