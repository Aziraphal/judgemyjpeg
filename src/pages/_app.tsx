import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import SecurityStatusBar from '@/components/SecurityStatusBar'
import CookieConsent from '@/components/CookieConsent'
import FeedbackButton from '@/components/FeedbackButton'
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
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#FF006E" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#FF006E" />

        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="YfeeUTQ42Qwb2-7dxicfHr6r7-6TL1E3GbfYyR828eo" />

        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://judgemyjpeg.com" />
        <meta name="twitter:title" content="JudgeMyJPEG - Analyse IA de Photos" />
        <meta name="twitter:description" content="L'IA qui analyse vos photos avec expertise et créativité" />
        <meta name="twitter:image" content="https://judgemyjpeg.com/twitter-card.svg" />
        <meta name="twitter:creator" content="@judgemyjpeg" />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="JudgeMyJPEG - Analyse IA de Photos" />
        <meta property="og:description" content="L'IA qui analyse vos photos avec expertise et créativité" />
        <meta property="og:site_name" content="JudgeMyJPEG" />
        <meta property="og:url" content="https://judgemyjpeg.com" />
        <meta property="og:image" content="https://judgemyjpeg.com/og-image.svg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </Head>

      {/* Google Analytics Scripts - Consent-based loading */}
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
                
                // Initialize with consent denied by default (Google Consent Mode v2)
                gtag('consent', 'default', {
                  'analytics_storage': 'denied',
                  'ad_storage': 'denied',
                  'ad_user_data': 'denied',
                  'ad_personalization': 'denied',
                  'functionality_storage': 'denied',
                  'personalization_storage': 'denied',
                  'security_storage': 'granted', // Always granted for security
                });
                
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                  anonymize_ip: true,
                  cookie_flags: 'SameSite=None;Secure'
                });

                // Check for existing consent and update Google Consent Mode
                const checkConsent = () => {
                  const consent = localStorage.getItem('cookie-consent');
                  if (consent) {
                    try {
                      const prefs = JSON.parse(consent);
                      
                      // Update consent based on user preferences
                      const consentUpdate = {
                        'analytics_storage': prefs.analytics ? 'granted' : 'denied',
                        'ad_storage': 'denied', // Never granted - no ads
                        'ad_user_data': 'denied', // Never granted - no ads
                        'ad_personalization': 'denied', // Never granted - no ads
                        'functionality_storage': prefs.personalization ? 'granted' : 'denied',
                        'personalization_storage': prefs.personalization ? 'granted' : 'denied',
                        'security_storage': 'granted' // Always granted for security
                      };

                      gtag('consent', 'update', consentUpdate);
                      
                      // Log consent status for debugging (dev only)
                      if (process.env.NODE_ENV === 'development') {
                        console.log('Cookie consent updated:', consentUpdate);
                      }
                      
                    } catch (e) {
                      console.warn('Error parsing cookie consent:', e);
                    }
                  }
                };

                // Check on load
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', checkConsent);
                } else {
                  checkConsent();
                }
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
        
        {/* Bouton feedback flottant sur toutes les pages (sauf admin) */}
        {!router.pathname.startsWith('/admin') && !router.pathname.startsWith('/auth') && (
          <FeedbackButton variant="floating" size="md" />
        )}
      </SessionProvider>
    </>
  )
}