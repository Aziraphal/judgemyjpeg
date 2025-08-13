import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from '@/lib/email-service'
import { checkLoginAttempts, recordFailedLogin, recordSuccessfulLogin } from '@/lib/password-validation'
import { sendNewDeviceLoginNotification } from '@/lib/email-service'
import { getFullDeviceContext, generateDeviceFingerprint, isNewDevice, registerNewDevice } from '@/lib/device-detection'
import { AuditLogger } from '@/lib/audit-trail'
import { SuspiciousLoginDetector, notifySuspiciousLogin } from '@/lib/suspicious-login-detector'
import { is2FAEnabled } from '@/lib/two-factor'
import { createTempSession, verifyToken } from './verify-2fa-login'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 heures
    updateAge: 60 * 60, // 1 heure
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // This runs after successful sign in
      if (user && user.email) {
        // Create audit logger (we don't have req here, so we'll handle it differently)
        try {
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              email: user.email,
              ipAddress: 'unknown', // Will be handled in JWT callback
              eventType: 'login_success',
              description: `Successful login via ${account?.provider || 'credentials'}`,
              metadata: JSON.stringify({
                provider: account?.provider,
                isNewUser
              }),
              riskLevel: 'low',
              success: true
            }
          })
        } catch (error) {
          console.error('Failed to log sign in event:', error)
        }
      }
    },
    async signOut({ token }) {
      if (token?.email) {
        try {
          await prisma.auditLog.create({
            data: {
              userId: token.id as string,
              email: token.email as string,
              ipAddress: 'unknown',
              eventType: 'logout',
              description: 'User logged out',
              riskLevel: 'low',
              success: true
            }
          })
        } catch (error) {
          console.error('Failed to log sign out event:', error)
        }
      }
    }
  },
  // Forcer l'utilisation du domaine custom
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.judgemyjpeg.fr' : undefined,
      }
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.csrf-token' 
        : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.judgemyjpeg.fr' : undefined,
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    EmailProvider({
      server: "dummy", // Not used with custom sendVerificationRequest
      from: process.env.EMAIL_FROM || "noreply@judgemyjpeg.fr",
      sendVerificationRequest: async ({ identifier: email, url, token }) => {
        // Use our custom verification endpoint instead of NextAuth default
        const customUrl = new URL(url)
        customUrl.pathname = '/api/auth/verify-email'
        customUrl.searchParams.set('email', email)
        customUrl.searchParams.set('token', token)
        
        await sendVerificationEmail(email, customUrl.toString())
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          redirect_uri: process.env.NODE_ENV === 'production' 
            ? 'https://www.judgemyjpeg.fr/api/auth/callback/google'
            : 'http://localhost:3005/api/auth/callback/google'
        }
      }
    }),
    // Provider pour connexion avec email/mot de passe (étape 1)
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Vérifier les tentatives de connexion (account lockout)
        const loginCheck = checkLoginAttempts(credentials.email)
        if (!loginCheck.allowed) {
          throw new Error(`Compte temporairement verrouillé. Réessayez dans ${loginCheck.remainingTime} minutes.`)
        }

        const user = await prisma.user.findUnique({
          where: { 
            email: credentials.email 
          },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            password: true,
            twoFactorEnabled: true,
            emailVerified: true
          }
        })

        if (!user || !user.password) {
          recordFailedLogin(credentials.email)
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          recordFailedLogin(credentials.email)
          return null
        }

        // Vérifier que l'email est vérifié
        if (!user.emailVerified) {
          throw new Error('Email non vérifié. Vérifiez votre boite email.')
        }

        // Connexion réussie - reset les tentatives
        recordSuccessfulLogin(credentials.email)

        // Si 2FA activé, créer session temporaire et rediriger vers 2FA
        if (user.twoFactorEnabled) {
          const tempSessionId = createTempSession(user.id, user.email!)
          // Utiliser un format spécial pour indiquer qu'il faut 2FA
          throw new Error(`2FA_REQUIRED:${tempSessionId}:${user.email}`)
        }

        // Pas de 2FA, connexion normale
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    }),
    
    // Provider pour finalisation après 2FA (étape 2)
    CredentialsProvider({
      id: 'credentials-2fa',
      name: 'credentials-2fa',
      credentials: {
        email: { type: 'text' },
        tempSessionId: { type: 'text' },
        verificationToken: { type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.verificationToken) {
          return null
        }

        // Vérifier le token de vérification 2FA
        const tokenData = verifyToken(credentials.verificationToken)
        
        if (!tokenData || tokenData.email !== credentials.email) {
          return null
        }

        // Récupérer l'utilisateur
        const user = await prisma.user.findUnique({
          where: { 
            id: tokenData.userId 
          },
          select: {
            id: true,
            email: true,
            name: true,
            image: true
          }
        })

        if (!user) {
          return null
        }

        return user
      }
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      if (account) {
        token.provider = account.provider
        token.providerAccountId = account.providerAccountId
      }
      return token
    },
    session: async ({ session, token }) => {
      if (session?.user && token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        
        // Vérification de cohérence de session
        if (session.user.email !== token.email) {
          throw new Error('Session mismatch detected')
        }
      }
      return session
    },
    redirect: async ({ url, baseUrl }) => {
      // Toujours rediriger vers la page d'accueil après connexion
      if (url.startsWith(baseUrl)) return url
      else if (url.startsWith('/')) return `${baseUrl}${url}`
      return baseUrl
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    signOut: '/',
  },
  debug: process.env.NODE_ENV === 'development',
}

export default NextAuth(authOptions)