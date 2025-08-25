import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <title>JudgeMyJPEG - Analyse IA de Photos</title>
        <meta name="description" content="Analyse et critique de photos par IA" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()" />
        <meta httpEquiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains; preload" />
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com; connect-src 'self' https://api.stripe.com https://generativelanguage.googleapis.com https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://*.google-analytics.com; frame-src https://js.stripe.com; font-src 'self' data:" />
        <link rel="icon" href="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3crect width='16' height='16' fill='%23FF006E'/%3e%3ccircle cx='8' cy='6' r='2' fill='white'/%3e%3crect x='5' y='9' width='6' height='3' fill='white'/%3e%3c/svg%3e" />
        <link rel="icon" sizes="16x16" href="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3crect width='16' height='16' fill='%23FF006E'/%3e%3ccircle cx='8' cy='6' r='2' fill='white'/%3e%3crect x='5' y='9' width='6' height='3' fill='white'/%3e%3c/svg%3e" />
        <link rel="apple-touch-icon" href="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3e%3crect width='192' height='192' fill='%23FF006E'/%3e%3ccircle cx='96' cy='76' r='20' fill='white'/%3e%3crect x='66' y='116' width='60' height='30' fill='white'/%3e%3c/svg%3e" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}