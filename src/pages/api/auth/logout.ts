import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (session) {
      console.log('Force logout for user:', session.user?.email)
    }

    // Nettoyer TOUS les cookies possibles plus agressivement
    const cookieNames = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      '__Host-next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url',
      'next-auth.pkce.code_verifier',
      'next-auth.state'
    ]

    // Effacer pour tous les domaines et chemins possibles
    cookieNames.forEach(cookieName => {
      const clearCookies = [
        `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
        `${cookieName}=; Path=/; Domain=judgemyjpeg.fr; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax; Secure`,
        `${cookieName}=; Path=/; Domain=.judgemyjpeg.fr; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax; Secure`,
        `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=None; Secure`,
        `${cookieName}=; Path=/; Domain=judgemyjpeg.fr; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=None; Secure`
      ]
      res.setHeader('Set-Cookie', clearCookies)
    })

    res.status(200).json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout API error:', error)
    res.status(500).json({ error: 'Logout failed' })
  }
}