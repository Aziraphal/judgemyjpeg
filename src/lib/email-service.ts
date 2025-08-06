/**
 * Professional Email Service with Resend
 * Production-ready email sending
 */

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send verification email for new registrations
 */
export async function sendVerificationEmail(email: string, verificationUrl: string): Promise<void> {
  try {
    await resend.emails.send({
      from: 'JudgeMyJPEG <noreply@judgemyjpeg.fr>',
      to: email,
      subject: '🔐 Vérifiez votre email - JudgeMyJPEG',
      html: createVerificationEmailHTML(email, verificationUrl),
      text: createVerificationEmailText(email, verificationUrl)
    })
  } catch (error) {
    console.error('Failed to send verification email:', error)
    throw new Error('Email sending failed')
  }
}

/**
 * Send suspicious login notification
 */
export async function sendSuspiciousLoginEmail(
  email: string,
  activities: Array<{
    type: string
    severity: 'low' | 'medium' | 'high'
    description: string
  }>,
  ipAddress: string,
  location?: {
    country?: string
    region?: string
    city?: string
  }
): Promise<void> {
  try {
    const locationStr = location 
      ? `${location.city}, ${location.region}, ${location.country}`
      : 'Localisation inconnue'

    await resend.emails.send({
      from: 'JudgeMyJPEG Security <security@judgemyjpeg.fr>',
      to: email,
      subject: '🚨 Connexion suspecte détectée - JudgeMyJPEG',
      html: createSuspiciousLoginHTML(email, activities, ipAddress, locationStr),
      text: createSuspiciousLoginText(email, activities, ipAddress, locationStr)
    })
  } catch (error) {
    console.error('Failed to send suspicious login email:', error)
    throw new Error('Security email sending failed')
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
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@judgemyjpeg.fr'
    
    await resend.emails.send({
      from: 'JudgeMyJPEG Security <security@judgemyjpeg.fr>',
      to: adminEmail,
      subject: '🚨 CRITICAL SECURITY ALERT - JudgeMyJPEG',
      html: createCriticalAlertHTML(eventType, description, metadata),
      text: createCriticalAlertText(eventType, description, metadata)
    })
  } catch (error) {
    console.error('Failed to send critical security alert:', error)
  }
}

/**
 * HTML template for email verification
 */
function createVerificationEmailHTML(email: string, verificationUrl: string): string {
  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Arial', sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; border-radius: 15px; overflow: hidden;">
      <div style="background: linear-gradient(45deg, #FF006E, #00F5FF); padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 2.5em; text-shadow: 0 0 20px rgba(255,255,255,0.5);">📸 JudgeMyJPEG</h1>
        <p style="margin: 10px 0 0; font-size: 1.2em; opacity: 0.9;">L'IA qui juge vos photos sans pitié</p>
      </div>
      
      <div style="padding: 40px 30px;">
        <h2 style="color: #00F5FF; margin-bottom: 20px; text-align: center;">🚀 Vérifiez votre compte</h2>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
          Cliquez sur le bouton ci-dessous pour vérifier votre adresse email et activer votre compte JudgeMyJPEG.
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${verificationUrl}" style="
            display: inline-block;
            background: linear-gradient(45deg, #FF006E, #8B00FF);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 50px;
            font-weight: bold;
            font-size: 18px;
            box-shadow: 0 10px 30px rgba(255, 0, 110, 0.3);
          ">
            ✅ Vérifier mon email
          </a>
        </div>
        
        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin-top: 30px;">
          <p style="margin: 0; font-size: 14px; text-align: center; opacity: 0.8;">
            🔒 Ce lien est valide pendant 24 heures<br>
            Si vous n'avez pas créé de compte, ignorez cet email.
          </p>
        </div>
      </div>
      
      <div style="background: rgba(0,0,0,0.3); padding: 20px; text-align: center; font-size: 12px; opacity: 0.7;">
        <p style="margin: 0;">© ${new Date().getFullYear()} JudgeMyJPEG - Propulsé par l'IA</p>
        <p style="margin: 5px 0 0;">📧 noreply@judgemyjpeg.fr</p>
      </div>
    </div>
  `
}

function createVerificationEmailText(email: string, verificationUrl: string): string {
  return `
Vérifiez votre compte JudgeMyJPEG

Cliquez sur ce lien pour vérifier votre email: ${verificationUrl}

Ce lien expire dans 24 heures.

© JudgeMyJPEG - L'IA qui juge vos photos sans pitié
  `
}

function createSuspiciousLoginHTML(
  email: string, 
  activities: Array<{type: string, severity: string, description: string}>,
  ipAddress: string,
  location: string
): string {
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

  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Arial', sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; border-radius: 15px; overflow: hidden;">
      <div style="background: linear-gradient(45deg, #DC2626, #EF4444); padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 2.5em;">🚨 JudgeMyJPEG</h1>
        <p style="margin: 10px 0 0; font-size: 1.2em;">Alerte de Sécurité</p>
      </div>
      
      <div style="padding: 40px 30px;">
        <h2 style="color: #EF4444; margin-bottom: 20px; text-align: center;">⚠️ Connexion Suspecte Détectée</h2>
        
        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #F59E0B; margin-top: 0;">📍 Détails de la Connexion</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin: 8px 0;"><strong>📧 Compte:</strong> ${email}</li>
            <li style="margin: 8px 0;"><strong>🌐 Adresse IP:</strong> ${ipAddress}</li>
            <li style="margin: 8px 0;"><strong>📍 Localisation:</strong> ${location}</li>
            <li style="margin: 8px 0;"><strong>⏰ Date:</strong> ${new Date().toLocaleString('fr-FR')}</li>
          </ul>
        </div>

        <div style="margin: 30px 0;">
          <h3 style="color: #EF4444; margin-bottom: 15px;">🔍 Activités Suspectes</h3>
          ${activitiesHtml}
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
            margin-right: 10px;
          ">🔍 Vérifier Mon Compte</a>
        </div>
      </div>
    </div>
  `
}

function createSuspiciousLoginText(
  email: string,
  activities: Array<{type: string, severity: string, description: string}>,
  ipAddress: string,
  location: string
): string {
  return `
🚨 ALERTE SÉCURITÉ - JudgeMyJPEG

Connexion suspecte détectée:
- Compte: ${email}
- IP: ${ipAddress}  
- Localisation: ${location}
- Date: ${new Date().toLocaleString('fr-FR')}

Activités suspectes:
${activities.map(a => `- ${a.severity.toUpperCase()}: ${a.description}`).join('\n')}

Vérifiez votre compte: https://judgemyjpeg.fr/dashboard
  `
}

function createCriticalAlertHTML(eventType: string, description: string, metadata?: Record<string, any>): string {
  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #1F2937; color: white; border-radius: 10px; overflow: hidden;">
      <div style="background: #DC2626; padding: 20px; text-align: center;">
        <h1 style="margin: 0; color: white;">🚨 CRITICAL SECURITY ALERT</h1>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #EF4444;">Event: ${eventType}</h2>
        <p style="font-size: 16px;">${description}</p>
        
        ${metadata ? `
          <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #F59E0B;">Metadata:</h3>
            <pre style="color: #E5E7EB; font-size: 12px;">${JSON.stringify(metadata, null, 2)}</pre>
          </div>
        ` : ''}
      </div>
    </div>
  `
}

function createCriticalAlertText(eventType: string, description: string, metadata?: Record<string, any>): string {
  return `
🚨 CRITICAL SECURITY ALERT - JudgeMyJPEG

Event: ${eventType}
Description: ${description}

${metadata ? `Metadata:\n${JSON.stringify(metadata, null, 2)}` : ''}
  `
}