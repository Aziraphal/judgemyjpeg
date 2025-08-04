import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('FORCE LOGOUT - Nuclear option activated')

    // Liste exhaustive de tous les cookies NextAuth possibles
    const allPossibleCookies = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.session-token',
      'next-auth.csrf-token', 
      '__Secure-next-auth.csrf-token',
      '__Host-next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url',
      '__Host-next-auth.callback-url',
      'next-auth.pkce.code_verifier',
      'next-auth.state'
    ]

    // Effacer avec TOUTES les combinaisons possibles
    const clearInstructions: string[] = []
    
    allPossibleCookies.forEach(cookieName => {
      // Sans domaine
      clearInstructions.push(`${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`)
      clearInstructions.push(`${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax; Secure`)
      
      // Avec domaine judgemyjpeg.fr
      clearInstructions.push(`${cookieName}=; Path=/; Domain=judgemyjpeg.fr; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax; Secure`)
      
      // Avec domaine .judgemyjpeg.fr (subdomain)
      clearInstructions.push(`${cookieName}=; Path=/; Domain=.judgemyjpeg.fr; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax; Secure`)
      
      // SameSite=None pour compatibilité
      clearInstructions.push(`${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=None; Secure`)
      clearInstructions.push(`${cookieName}=; Path=/; Domain=judgemyjpeg.fr; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=None; Secure`)
    })

    // Appliquer TOUTES les instructions de suppression
    res.setHeader('Set-Cookie', clearInstructions)

    console.log(`Applied ${clearInstructions.length} cookie clearing instructions`)

    res.status(200).json({ 
      success: true, 
      message: 'Nuclear logout completed',
      clearedCookies: allPossibleCookies.length,
      instructions: clearInstructions.length
    })

  } catch (error) {
    console.error('Force logout error:', error)
    res.status(500).json({ error: 'Force logout failed' })
  }
}