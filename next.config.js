const { withSentryConfig } = require("@sentry/nextjs");
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    // Désactiver ESLint pendant le build pour les tests de performance
    ignoreDuringBuilds: true,
  },
  
  // Configuration i18n
  i18n: {
    locales: ['fr', 'en', 'es', 'de', 'it', 'pt'],
    defaultLocale: 'fr',
    localeDetection: false,
  },
  images: {
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
  },
  
  // En-têtes de sécurité - Configuration forcée pour Railway (v2.1 - Cloudinary fix)
  async headers() {
    const securityHeaders = [
      {
        key: 'X-Frame-Options',
        value: 'DENY'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block'
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()'
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload'
      },
      {
        key: 'Cross-Origin-Opener-Policy',
        value: 'same-origin'
      },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com https://challenges.cloudflare.com https://*.cloudflare.com",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com",
          "connect-src 'self' https://api.stripe.com https://api.openai.com https://res.cloudinary.com https://generativelanguage.googleapis.com https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://*.google-analytics.com https://challenges.cloudflare.com",
          "frame-src https://js.stripe.com https://challenges.cloudflare.com",
          "font-src 'self' data:",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "block-all-mixed-content"
        ].join('; ')
      },
      {
        key: 'X-MetaMask-Block',
        value: 'true'
      },
      {
        key: 'X-Crypto-Block', 
        value: 'true'
      }
    ]

    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Forcer les headers sur toutes les routes API aussi
      {
        source: '/api/:path*',
        headers: securityHeaders,
      }
    ]
  },
  
  // Redirections pour éviter les contenus dupliqués
  async redirects() {
    return [
      // Redirections des anciennes URLs vers les nouvelles
      {
        source: '/analyser-photo',
        destination: '/analyze',
        permanent: true,
      },
      {
        source: '/tableau-bord',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/toutes-mes-photos',
        destination: '/all-photos',
        permanent: true,
      },
      {
        source: '/collections-photos',
        destination: '/collections',
        permanent: true,
      },
      {
        source: '/analyse-lot',
        destination: '/batch',
        permanent: true,
      },
      {
        source: '/tarifs',
        destination: '/pricing',
        permanent: true,
      },
      // Redirect www vers non-www si configuré côté serveur
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.judgemyjpeg.com',
          },
        ],
        destination: 'https://judgemyjpeg.com/:path*',
        permanent: true,
      },
    ]
  },
}

// Export conditionally - disable Sentry in problematic builds
const shouldUseSentry = process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN && !process.env.DISABLE_SENTRY

if (shouldUseSentry) {
  module.exports = withBundleAnalyzer(withSentryConfig(nextConfig, {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    org: "judgemyjpeg",
    project: "judgemyjpeg-app",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors.
    automaticVercelMonitors: false, // Disable for Railway
  }))
} else {
  module.exports = withBundleAnalyzer(nextConfig)
}