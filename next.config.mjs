import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  experimental: {
    instrumentationHook: true,
  },
  // Désactiver les source maps en production pour la sécurité
  productionBrowserSourceMaps: false,
}

// Configuration Sentry
const sentryConfig = {
  // Sentry options
  silent: true, // Pas de logs Sentry en build
  org: "cyril-paquier",
  project: "judgemyjpeg",
  
  // Webpack options
  widenClientFileUpload: true,
  transpileClientSDK: true,
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelBypassRewrite: false,
};

export default withSentryConfig(nextConfig, sentryConfig);