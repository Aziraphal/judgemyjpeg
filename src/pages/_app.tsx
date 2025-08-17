import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import SecurityStatusBar from '@/components/SecurityStatusBar'
import CookieConsent from '@/components/CookieConsent'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { GA_TRACKING_ID, pageview } from '@/lib/gtag'
import Script from 'next/script'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const router = useRouter()
  
  // Ne pas afficher la barre de sécurité sur les pages d'auth
  const hideSecurityBar = ['/auth/signin', '/auth/signup', '/auth/error', '/auth/verify-2fa'].includes(router.pathname)

  // Google Analytics page tracking
  useEffect(() => {
    if (GA_TRACKING_ID) {
      const handleRouteChange = (url: string) => {
        pageview(url)
      }
      router.events.on('routeChangeComplete', handleRouteChange)
      return () => {
        router.events.off('routeChangeComplete', handleRouteChange)
      }
    }
  }, [router.events])

  return (
    <>
      <Head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="JudgeMyJPEG" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="JudgeMyJPEG" />
        <meta name="description" content="L'IA qui analyse vos photos avec expertise et créativité" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#FF006E" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#FF006E" />

        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="REMPLACE_PAR_TON_CODE_GOOGLE" />

        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://judgemyjpeg.com" />
        <meta name="twitter:title" content="JudgeMyJPEG - Analyse IA de Photos" />
        <meta name="twitter:description" content="L'IA qui analyse vos photos avec expertise et créativité" />
        <meta name="twitter:image" content="https://judgemyjpeg.com/twitter-card.png" />
        <meta name="twitter:creator" content="@judgemyjpeg" />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="JudgeMyJPEG - Analyse IA de Photos" />
        <meta property="og:description" content="L'IA qui analyse vos photos avec expertise et créativité" />
        <meta property="og:site_name" content="JudgeMyJPEG" />
        <meta property="og:url" content="https://judgemyjpeg.com" />
        <meta property="og:image" content="https://judgemyjpeg.com/og-image.png" />
      </Head>

      {/* Google Analytics Scripts */}
      {GA_TRACKING_ID && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                  anonymize_ip: true,
                  cookie_flags: 'SameSite=None;Secure'
                });
              `,
            }}
          />
        </>
      )}
      
      <SessionProvider session={session}>
        {/* SecurityStatusBar désactivé par défaut - trop invasif pour l'utilisateur final */}
        {process.env.NODE_ENV === 'development' && !hideSecurityBar && <SecurityStatusBar compact position="top" />}
        <Component {...pageProps} />
        <CookieConsent />
      </SessionProvider>
    </>
  )
}