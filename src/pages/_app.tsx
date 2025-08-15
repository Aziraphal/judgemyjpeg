import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import SecurityStatusBar from '@/components/SecurityStatusBar'
import CookieConsent from '@/components/CookieConsent'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const router = useRouter()
  
  // Ne pas afficher la barre de sécurité sur les pages d'auth
  const hideSecurityBar = ['/auth/signin', '/auth/signup', '/auth/error', '/auth/verify-2fa'].includes(router.pathname)

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

        <link rel="apple-touch-icon" sizes="152x152" href="/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#FF006E" />
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
      
      <SessionProvider session={session}>
        {/* SecurityStatusBar désactivé par défaut - trop invasif pour l'utilisateur final */}
        {process.env.NODE_ENV === 'development' && !hideSecurityBar && <SecurityStatusBar compact position="top" />}
        <Component {...pageProps} />
        <CookieConsent />
      </SessionProvider>
    </>
  )
}