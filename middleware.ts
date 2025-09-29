import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import crypto from 'crypto'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Headers de sécurité critiques
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  
  // CSP forcé car next.config.js ne s'applique pas - FORCE IPAPI.CO
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com https://challenges.cloudflare.com https://*.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com",
    "connect-src 'self' https://judgemyjpeg.fr https://api.stripe.com https://api.openai.com https://res.cloudinary.com https://generativelanguage.googleapis.com https://ipapi.co https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://*.google-analytics.com https://challenges.cloudflare.com",
    "frame-src https://js.stripe.com https://challenges.cloudflare.com",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "block-all-mixed-content"
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)

  // Cache headers for static assets
  const url = request.nextUrl.pathname
  if (url === '/favicon.ico') {
    response.headers.set('Cache-Control', 'public, max-age=86400') // 1 day
  }

  return response
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}