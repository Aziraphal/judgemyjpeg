import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* CSP forcé dans HTML - Bypass Railway */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; connect-src 'self' https://ipapi.co https://api.stripe.com https://api.openai.com https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://*.google-analytics.com; img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com https://challenges.cloudflare.com https://*.cloudflare.com; font-src 'self' data:; frame-src https://js.stripe.com https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self'; block-all-mixed-content"
        />
        
        {/* Favicons - Optimisés avec RealFaviconGenerator */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        
        {/* Multi-size PNG pour tous navigateurs */}
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* PWA Icons */}
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}