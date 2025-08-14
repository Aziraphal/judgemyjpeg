/**
 * Professional Email Service with Resend
 * Production-ready email sending
 */

import { Resend } from 'resend'

let resend: Resend | null = null

function getResendClient(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

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
    await getResendClient().emails.send({
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

    await getResendClient().emails.send({
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
 * Send password change notification
 */
export async function sendPasswordChangeNotification(
  email: string,
  deviceInfo: {
    browser?: string
    os?: string
    ip?: string
    location?: string
  }
): Promise<void> {
  try {
    await getResendClient().emails.send({
      from: 'JudgeMyJPEG Security <security@judgemyjpeg.fr>',
      to: email,
      subject: '🔐 Mot de passe modifié - JudgeMyJPEG',
      html: createPasswordChangeHTML(email, deviceInfo),
      text: createPasswordChangeText(email, deviceInfo)
    })
  } catch (error) {
    console.error('Failed to send password change notification:', error)
    throw new Error('Failed to send password change notification')
  }
}

/**
 * Send account lockout notification
 */
export async function sendAccountLockoutNotification(
  email: string,
  lockoutInfo: {
    attempts: number
    lockoutDuration: number // minutes
    lastAttemptIp?: string
    lastAttemptLocation?: string
    unlockTime: Date
  }
): Promise<void> {
  try {
    await getResendClient().emails.send({
      from: 'JudgeMyJPEG Security <security@judgemyjpeg.fr>',
      to: email,
      subject: '🚫 Compte temporairement verrouillé - JudgeMyJPEG',
      html: createAccountLockoutHTML(email, lockoutInfo),
      text: createAccountLockoutText(email, lockoutInfo)
    })
  } catch (error) {
    console.error('Failed to send account lockout notification:', error)
    throw new Error('Failed to send account lockout notification')
  }
}

/**
 * Send new device login notification
 */
export async function sendNewDeviceLoginNotification(
  email: string,
  loginInfo: {
    deviceName: string
    browser: string
    os: string
    ip: string
    location: string
    loginTime: Date
    isFirstTime: boolean
  }
): Promise<void> {
  try {
    await getResendClient().emails.send({
      from: 'JudgeMyJPEG Security <security@judgemyjpeg.fr>',
      to: email,
      subject: loginInfo.isFirstTime 
        ? '🆕 Nouvelle connexion depuis un nouvel appareil - JudgeMyJPEG'
        : '✅ Connexion réussie - JudgeMyJPEG',
      html: createNewDeviceLoginHTML(email, loginInfo),
      text: createNewDeviceLoginText(email, loginInfo)
    })
  } catch (error) {
    console.error('Failed to send new device login notification:', error)
    throw new Error('Failed to send new device login notification')
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
    
    await getResendClient().emails.send({
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

/**
 * HTML template for password change notification
 */
function createPasswordChangeHTML(
  email: string, 
  deviceInfo: { browser?: string; os?: string; ip?: string; location?: string }
): string {
  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Arial', sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; border-radius: 15px; overflow: hidden;">
      <div style="background: linear-gradient(45deg, #3B82F6, #1D4ED8); padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 2.5em; text-shadow: 0 0 20px rgba(255,255,255,0.5);">🔐 JudgeMyJPEG</h1>
        <p style="margin: 10px 0 0; font-size: 1.2em; opacity: 0.9;">Notification de Sécurité</p>
      </div>
      
      <div style="padding: 40px 30px;">
        <h2 style="color: #3B82F6; margin-bottom: 20px; text-align: center;">✅ Mot de passe modifié</h2>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
          Le mot de passe de votre compte <strong>${email}</strong> a été modifié avec succès.
        </p>
        
        <div style="background: rgba(59, 130, 246, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #3B82F6; margin-top: 0;">📍 Détails de la modification</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin: 8px 0;"><strong>⏰ Date:</strong> ${new Date().toLocaleString('fr-FR')}</li>
            ${deviceInfo.ip ? `<li style="margin: 8px 0;"><strong>🌐 Adresse IP:</strong> ${deviceInfo.ip}</li>` : ''}
            ${deviceInfo.location ? `<li style="margin: 8px 0;"><strong>📍 Localisation:</strong> ${deviceInfo.location}</li>` : ''}
            ${deviceInfo.browser ? `<li style="margin: 8px 0;"><strong>🌐 Navigateur:</strong> ${deviceInfo.browser}</li>` : ''}
            ${deviceInfo.os ? `<li style="margin: 8px 0;"><strong>💻 Système:</strong> ${deviceInfo.os}</li>` : ''}
          </ul>
        </div>

        <div style="background: rgba(34, 197, 94, 0.1); padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #22C55E;">
            <strong>✅ Sécurisé:</strong> Si vous êtes à l'origine de cette modification, aucune action n'est requise.
          </p>
        </div>

        <div style="background: rgba(239, 68, 68, 0.1); padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
          <p style="margin: 0; font-size: 14px; color: #EF4444;">
            <strong>⚠️ Pas vous ?</strong> Si vous n'avez pas modifié votre mot de passe, contactez-nous immédiatement.
          </p>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="https://judgemyjpeg.fr/contact" style="
            display: inline-block;
            background: linear-gradient(45deg, #EF4444, #DC2626);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 50px;
            font-weight: bold;
            margin-right: 10px;
          ">🚨 Signaler un Problème</a>
          
          <a href="https://judgemyjpeg.fr/settings" style="
            display: inline-block;
            background: linear-gradient(45px, #3B82F6, #1D4ED8);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 50px;
            font-weight: bold;
          ">⚙️ Paramètres de Sécurité</a>
        </div>
      </div>
      
      <div style="background: rgba(0,0,0,0.3); padding: 20px; text-align: center; font-size: 12px; opacity: 0.7;">
        <p style="margin: 0;">© ${new Date().getFullYear()} JudgeMyJPEG - Sécurité & Confiance</p>
        <p style="margin: 5px 0 0;">📧 security@judgemyjpeg.fr</p>
      </div>
    </div>
  `
}

function createPasswordChangeText(
  email: string, 
  deviceInfo: { browser?: string; os?: string; ip?: string; location?: string }
): string {
  return `
🔐 MOT DE PASSE MODIFIÉ - JudgeMyJPEG

Le mot de passe de votre compte ${email} a été modifié.

Détails:
- Date: ${new Date().toLocaleString('fr-FR')}
${deviceInfo.ip ? `- IP: ${deviceInfo.ip}` : ''}
${deviceInfo.location ? `- Localisation: ${deviceInfo.location}` : ''}
${deviceInfo.browser ? `- Navigateur: ${deviceInfo.browser}` : ''}
${deviceInfo.os ? `- Système: ${deviceInfo.os}` : ''}

✅ Si vous êtes à l'origine de cette modification, aucune action n'est requise.
⚠️  Si ce n'est pas vous, contactez-nous: https://judgemyjpeg.fr/contact

Paramètres de sécurité: https://judgemyjpeg.fr/settings
  `
}

/**
 * HTML template for account lockout notification
 */
function createAccountLockoutHTML(
  email: string,
  lockoutInfo: { attempts: number; lockoutDuration: number; lastAttemptIp?: string; lastAttemptLocation?: string; unlockTime: Date }
): string {
  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Arial', sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; border-radius: 15px; overflow: hidden;">
      <div style="background: linear-gradient(45deg, #DC2626, #991B1B); padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 2.5em;">🚫 JudgeMyJPEG</h1>
        <p style="margin: 10px 0 0; font-size: 1.2em;">Sécurité du Compte</p>
      </div>
      
      <div style="padding: 40px 30px;">
        <h2 style="color: #DC2626; margin-bottom: 20px; text-align: center;">🔒 Compte Temporairement Verrouillé</h2>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
          Votre compte <strong>${email}</strong> a été temporairement verrouillé pour des raisons de sécurité.
        </p>
        
        <div style="background: rgba(220, 38, 38, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #DC2626; margin-top: 0;">⚠️ Détails du Verrouillage</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin: 8px 0;"><strong>❌ Tentatives échouées:</strong> ${lockoutInfo.attempts}</li>
            <li style="margin: 8px 0;"><strong>⏰ Durée du verrouillage:</strong> ${lockoutInfo.lockoutDuration} minutes</li>
            <li style="margin: 8px 0;"><strong>🔓 Déblocage automatique:</strong> ${lockoutInfo.unlockTime.toLocaleString('fr-FR')}</li>
            ${lockoutInfo.lastAttemptIp ? `<li style="margin: 8px 0;"><strong>🌐 Dernière IP:</strong> ${lockoutInfo.lastAttemptIp}</li>` : ''}
            ${lockoutInfo.lastAttemptLocation ? `<li style="margin: 8px 0;"><strong>📍 Localisation:</strong> ${lockoutInfo.lastAttemptLocation}</li>` : ''}
          </ul>
        </div>

        <div style="background: rgba(34, 197, 94, 0.1); padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #22C55E; margin-top: 0; font-size: 16px;">🛡️ Que faire maintenant ?</h4>
          <ul style="margin: 0; padding-left: 20px; color: #94A3B8;">
            <li>Attendez ${lockoutInfo.lockoutDuration} minutes pour le déblocage automatique</li>
            <li>Vérifiez que vous utilisez le bon mot de passe</li>
            <li>Si ce n'est pas vous, changez votre mot de passe immédiatement après déblocage</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="https://judgemyjpeg.fr/auth/signin" style="
            display: inline-block;
            background: linear-gradient(45deg, #22C55E, #16A34A);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 50px;
            font-weight: bold;
            margin-right: 10px;
          ">🔓 Réessayer Plus Tard</a>
          
          <a href="https://judgemyjpeg.fr/contact" style="
            display: inline-block;
            background: linear-gradient(45deg, #3B82F6, #1D4ED8);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 50px;
            font-weight: bold;
          ">📞 Contacter le Support</a>
        </div>
      </div>
      
      <div style="background: rgba(0,0,0,0.3); padding: 20px; text-align: center; font-size: 12px; opacity: 0.7;">
        <p style="margin: 0;">© ${new Date().getFullYear()} JudgeMyJPEG - Protection Automatique</p>
      </div>
    </div>
  `
}

function createAccountLockoutText(
  email: string,
  lockoutInfo: { attempts: number; lockoutDuration: number; lastAttemptIp?: string; lastAttemptLocation?: string; unlockTime: Date }
): string {
  return `
🚫 COMPTE VERROUILLÉ - JudgeMyJPEG

Votre compte ${email} a été temporairement verrouillé.

Détails:
- Tentatives échouées: ${lockoutInfo.attempts}
- Durée: ${lockoutInfo.lockoutDuration} minutes
- Déblocage: ${lockoutInfo.unlockTime.toLocaleString('fr-FR')}
${lockoutInfo.lastAttemptIp ? `- Dernière IP: ${lockoutInfo.lastAttemptIp}` : ''}
${lockoutInfo.lastAttemptLocation ? `- Localisation: ${lockoutInfo.lastAttemptLocation}` : ''}

🛡️ Que faire:
- Attendez le déblocage automatique
- Vérifiez votre mot de passe
- Contactez-nous si suspect

Connexion: https://judgemyjpeg.fr/auth/signin
Support: https://judgemyjpeg.fr/contact
  `
}

/**
 * HTML template for new device login notification
 */
function createNewDeviceLoginHTML(
  email: string,
  loginInfo: { deviceName: string; browser: string; os: string; ip: string; location: string; loginTime: Date; isFirstTime: boolean }
): string {
  const headerColor = loginInfo.isFirstTime ? '#F59E0B' : '#22C55E'
  const headerGradient = loginInfo.isFirstTime 
    ? 'linear-gradient(45deg, #F59E0B, #D97706)' 
    : 'linear-gradient(45deg, #22C55E, #16A34A)'
  const icon = loginInfo.isFirstTime ? '🆕' : '✅'
  const title = loginInfo.isFirstTime ? 'Nouvelle Connexion Détectée' : 'Connexion Réussie'

  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Arial', sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; border-radius: 15px; overflow: hidden;">
      <div style="background: ${headerGradient}; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 2.5em;">${icon} JudgeMyJPEG</h1>
        <p style="margin: 10px 0 0; font-size: 1.2em;">Notification de Connexion</p>
      </div>
      
      <div style="padding: 40px 30px;">
        <h2 style="color: ${headerColor}; margin-bottom: 20px; text-align: center;">${title}</h2>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
          ${loginInfo.isFirstTime 
            ? `Une connexion depuis un <strong>nouvel appareil</strong> a été détectée sur votre compte ${email}.`
            : `Connexion réussie sur votre compte ${email}.`
          }
        </p>
        
        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: ${headerColor}; margin-top: 0;">📱 Détails de l'Appareil</h3>
          <div style="display: grid; gap: 8px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #94A3B8;">🖥️ Appareil:</span>
              <span style="font-weight: bold;">${loginInfo.deviceName}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #94A3B8;">🌐 Navigateur:</span>
              <span style="font-weight: bold;">${loginInfo.browser}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #94A3B8;">💻 Système:</span>
              <span style="font-weight: bold;">${loginInfo.os}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #94A3B8;">🌐 Adresse IP:</span>
              <span style="font-weight: bold;">${loginInfo.ip}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #94A3B8;">📍 Localisation:</span>
              <span style="font-weight: bold;">${loginInfo.location}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0;">
              <span style="color: #94A3B8;">⏰ Heure:</span>
              <span style="font-weight: bold;">${loginInfo.loginTime.toLocaleString('fr-FR')}</span>
            </div>
          </div>
        </div>

        ${loginInfo.isFirstTime ? `
          <div style="background: rgba(239, 68, 68, 0.1); padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
            <p style="margin: 0; font-size: 14px; color: #EF4444;">
              <strong>⚠️ Ce n'est pas vous ?</strong> Sécurisez immédiatement votre compte en changeant votre mot de passe.
            </p>
          </div>
        ` : `
          <div style="background: rgba(34, 197, 94, 0.1); padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #22C55E;">
              <strong>✅ Tout semble normal.</strong> Cette connexion correspond à votre activité habituelle.
            </p>
          </div>
        `}
        
        <div style="text-align: center; margin: 40px 0;">
          ${loginInfo.isFirstTime ? `
            <a href="https://judgemyjpeg.fr/settings" style="
              display: inline-block;
              background: linear-gradient(45deg, #EF4444, #DC2626);
              color: white;
              text-decoration: none;
              padding: 15px 30px;
              border-radius: 50px;
              font-weight: bold;
              margin-right: 10px;
            ">🔒 Sécuriser mon Compte</a>
          ` : ''}
          
          <a href="https://judgemyjpeg.fr/dashboard" style="
            display: inline-block;
            background: linear-gradient(45deg, #3B82F6, #1D4ED8);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 50px;
            font-weight: bold;
          ">📊 Accéder au Dashboard</a>
        </div>
      </div>
      
      <div style="background: rgba(0,0,0,0.3); padding: 20px; text-align: center; font-size: 12px; opacity: 0.7;">
        <p style="margin: 0;">© ${new Date().getFullYear()} JudgeMyJPEG - Surveillance Sécurisée</p>
      </div>
    </div>
  `
}

function createNewDeviceLoginText(
  email: string,
  loginInfo: { deviceName: string; browser: string; os: string; ip: string; location: string; loginTime: Date; isFirstTime: boolean }
): string {
  return `
${loginInfo.isFirstTime ? '🆕 NOUVELLE CONNEXION' : '✅ CONNEXION RÉUSSIE'} - JudgeMyJPEG

${loginInfo.isFirstTime 
  ? `Nouvelle connexion détectée sur ${email}`
  : `Connexion sur ${email}`
}

Détails:
- Appareil: ${loginInfo.deviceName}
- Navigateur: ${loginInfo.browser}
- Système: ${loginInfo.os}
- IP: ${loginInfo.ip}
- Localisation: ${loginInfo.location}
- Heure: ${loginInfo.loginTime.toLocaleString('fr-FR')}

${loginInfo.isFirstTime 
  ? '⚠️ Ce n\'est pas vous ? Sécurisez votre compte: https://judgemyjpeg.fr/settings'
  : '✅ Tout semble normal.'
}

Dashboard: https://judgemyjpeg.fr/dashboard
  `
}