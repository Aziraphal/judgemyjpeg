/**
 * Security Notifications System - Phase 2 Security
 * Send email notifications for suspicious activities
 */

import nodemailer from 'nodemailer'
import type { SuspiciousActivity } from '@/lib/suspicious-login-detector'

/**
 * Create email transporter for security notifications
 */
function createSecurityEmailTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  })
}

/**
 * Send suspicious login notification email
 */
export async function sendSuspiciousLoginEmail(
  email: string,
  activities: SuspiciousActivity[],
  ipAddress: string,
  location?: {
    country?: string
    region?: string
    city?: string
    timezone?: string
  }
): Promise<void> {
  try {
    const transport = createSecurityEmailTransporter()
    
    const locationStr = location 
      ? `${location.city}, ${location.region}, ${location.country}`
      : 'Localisation inconnue'

    const activitiesHtml = activities
      .map(activity => `
        <div style="margin: 10px 0; padding: 10px; background: ${
          activity.severity === 'high' ? 'rgba(239, 68, 68, 0.1)' : 
          activity.severity === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 
          'rgba(156, 163, 175, 0.1)'
        }; border-radius: 8px;">
          <div style="font-weight: bold; color: ${
            activity.severity === 'high' ? '#DC2626' : 
            activity.severity === 'medium' ? '#D97706' : 
            '#6B7280'
          };">
            ${activity.severity.toUpperCase()}: ${activity.type.replace('_', ' ').toUpperCase()}
          </div>
          <div style="margin-top: 5px; font-size: 14px; color: #374151;">
            ${activity.description}
          </div>
        </div>
      `)
      .join('')

    await transport.sendMail({
      to: email,
      from: process.env.EMAIL_FROM,
      subject: `🚨 Connexion suspecte détectée - JudgeMyJPEG`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: 'Arial', sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; border-radius: 15px; overflow: hidden;">
          <div style="background: linear-gradient(45deg, #DC2626, #EF4444); padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 2.5em; text-shadow: 0 0 20px rgba(255,255,255,0.5);">🚨 JudgeMyJPEG</h1>
            <p style="margin: 10px 0 0; font-size: 1.2em; opacity: 0.9;">Alerte de Sécurité</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <h2 style="color: #EF4444; margin-bottom: 20px; text-align: center;">⚠️ Connexion Suspecte Détectée</h2>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
              Nous avons détecté une activité suspecte sur votre compte JudgeMyJPEG.
            </p>
            
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #F59E0B; margin-top: 0;">📍 Détails de la Connexion</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin: 8px 0;"><strong>📧 Compte:</strong> ${email}</li>
                <li style="margin: 8px 0;"><strong>🌐 Adresse IP:</strong> ${ipAddress}</li>
                <li style="margin: 8px 0;"><strong>📍 Localisation:</strong> ${locationStr}</li>
                <li style="margin: 8px 0;"><strong>⏰ Date:</strong> ${new Date().toLocaleString('fr-FR')}</li>
              </ul>
            </div>

            <div style="margin: 30px 0;">
              <h3 style="color: #EF4444; margin-bottom: 15px;">🔍 Activités Suspectes Détectées</h3>
              ${activitiesHtml}
            </div>
            
            <div style="background: rgba(59, 130, 246, 0.1); padding: 20px; border-radius: 10px; margin: 30px 0;">
              <h3 style="color: #3B82F6; margin-top: 0;">🛡️ Actions Recommandées</h3>
              <ul style="margin: 0; padding-left: 20px; color: #E5E7EB;">
                <li style="margin: 8px 0;">Si c'était vous, vous pouvez ignorer cet email</li>
                <li style="margin: 8px 0;">Si ce n'était pas vous, changez immédiatement votre mot de passe</li>
                <li style="margin: 8px 0;">Vérifiez l'activité récente de votre compte</li>
                <li style="margin: 8px 0;">Contactez-nous si vous avez des questions</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="https://judgemyjpeg.fr/dashboard" style="
                display: inline-block;
                background: linear-gradient(45deg, #3B82F6, #1D4ED8);
                color: white;
                text-decoration: none;
                padding: 15px 30px;
                border-radius: 50px;
                font-weight: bold;
                font-size: 16px;
                box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
                margin-right: 10px;
              ">
                🔍 Vérifier Mon Compte
              </a>
              <a href="https://judgemyjpeg.fr/auth/change-password" style="
                display: inline-block;
                background: linear-gradient(45deg, #DC2626, #B91C1C);
                color: white;
                text-decoration: none;
                padding: 15px 30px;
                border-radius: 50px;
                font-weight: bold;
                font-size: 16px;
                box-shadow: 0 10px 30px rgba(220, 38, 38, 0.3);
                margin-left: 10px;
              ">
                🔒 Changer Mon Mot de Passe
              </a>
            </div>
          </div>
          
          <div style="background: rgba(0,0,0,0.3); padding: 20px; text-align: center; font-size: 12px; opacity: 0.7;">
            <p style="margin: 0;">© ${new Date().getFullYear()} JudgeMyJPEG - Sécurité Renforcée</p>
            <p style="margin: 5px 0 0;">📧 Questions? Contactez-nous: ${process.env.EMAIL_FROM}</p>
          </div>
        </div>
      `,
      text: `
🚨 ALERTE SÉCURITÉ - JudgeMyJPEG

Connexion suspecte détectée sur votre compte:

Compte: ${email}
IP: ${ipAddress}
Localisation: ${locationStr}
Date: ${new Date().toLocaleString('fr-FR')}

Activités suspectes:
${activities.map(a => `- ${a.severity.toUpperCase()}: ${a.description}`).join('\n')}

Si c'était vous, ignorez cet email.
Si ce n'était pas vous, changez immédiatement votre mot de passe.

Vérifiez votre compte: https://judgemyjpeg.fr/dashboard
Changer mot de passe: https://judgemyjpeg.fr/auth/change-password

Questions? Contactez-nous: ${process.env.EMAIL_FROM}

© JudgeMyJPEG - Sécurité Renforcée
      `
    })

    console.log(`Security notification sent to ${email}`)

  } catch (error) {
    console.error('Failed to send suspicious login email:', error)
    throw error
  }
}

/**
 * Send critical security alert to admins
 */
export async function sendCriticalSecurityAlert(
  eventType: string,
  description: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const transport = createSecurityEmailTransporter()
    
    // In production, you'd have a list of admin emails
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM
    
    if (!adminEmail) return

    await transport.sendMail({
      to: adminEmail,
      from: process.env.EMAIL_FROM,
      subject: `🚨 CRITICAL SECURITY ALERT - JudgeMyJPEG`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #1F2937; color: white; border-radius: 10px; overflow: hidden;">
          <div style="background: #DC2626; padding: 20px; text-align: center;">
            <h1 style="margin: 0; color: white;">🚨 CRITICAL SECURITY ALERT</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">JudgeMyJPEG Security System</p>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #EF4444;">Event: ${eventType}</h2>
            <p style="font-size: 16px; line-height: 1.6;">${description}</p>
            
            ${metadata ? `
              <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #F59E0B;">Event Metadata:</h3>
                <pre style="color: #E5E7EB; font-size: 12px; white-space: pre-wrap;">${JSON.stringify(metadata, null, 2)}</pre>
              </div>
            ` : ''}
            
            <p style="color: #F87171; font-weight: bold;">
              ⚠️ Immediate attention required
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://judgemyjpeg.fr/admin" style="
                background: #1D4ED8;
                color: white;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-weight: bold;
              ">
                🔍 View Admin Dashboard
              </a>
            </div>
          </div>
        </div>
      `,
      text: `
🚨 CRITICAL SECURITY ALERT - JudgeMyJPEG

Event: ${eventType}
Description: ${description}

${metadata ? `Metadata:\n${JSON.stringify(metadata, null, 2)}` : ''}

⚠️ Immediate attention required

View Admin Dashboard: https://judgemyjpeg.fr/admin
      `
    })

    console.log(`Critical security alert sent to admin: ${eventType}`)

  } catch (error) {
    console.error('Failed to send critical security alert:', error)
  }
}