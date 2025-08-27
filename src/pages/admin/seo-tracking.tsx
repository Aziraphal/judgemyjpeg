import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function SEOTrackingPage() {
  const [verificationStatus, setVerificationStatus] = useState({
    google: false,
    bing: false,
    analytics: false
  })

  return (
    <>
      <Head>
        <title>SEO Tracking - JudgeMyJPEG Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container p-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-glow mb-8 text-center">
            🔍 <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
              SEO Tracking Setup
            </span>
          </h1>

          {/* Google Search Console */}
          <div className="glass-card p-6 mb-6">
            <h2 className="text-2xl font-bold text-neon-cyan mb-4">📊 Google Search Console</h2>
            
            <div className="space-y-4">
              <div className="bg-cosmic-glass p-4 rounded-lg">
                <h3 className="font-semibold text-text-white mb-2">🔗 Étapes :</h3>
                <ol className="list-decimal list-inside space-y-2 text-text-gray">
                  <li>Va sur <a href="https://search.google.com/search-console" target="_blank" className="text-neon-cyan hover:underline">Google Search Console</a></li>
                  <li>Clique "Ajouter une propriété" → "Préfixe d'URL"</li>
                  <li>Saisis : <code className="bg-cosmic-black px-2 py-1 rounded">https://judgemyjpeg.com</code></li>
                  <li>Choisis méthode "Balise HTML" et copie le code</li>
                  <li>Remplace "REMPLACE_PAR_TON_CODE_GOOGLE" dans _app.tsx</li>
                  <li>Redéploie et clique "Vérifier"</li>
                </ol>
              </div>

              <div className="bg-green-900/20 border border-green-500 p-4 rounded-lg">
                <h4 className="font-semibold text-green-400 mb-2">📤 Après vérification :</h4>
                <ul className="list-disc list-inside space-y-1 text-green-300">
                  <li>Soumets le sitemap : <code>https://judgemyjpeg.com/sitemap.xml</code></li>
                  <li>Demande indexation de toutes les pages importantes</li>
                  <li>Configure alertes performance</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bing Webmaster */}
          <div className="glass-card p-6 mb-6">
            <h2 className="text-2xl font-bold text-neon-pink mb-4">🌐 Bing Webmaster Tools</h2>
            
            <div className="space-y-4">
              <div className="bg-cosmic-glass p-4 rounded-lg">
                <h3 className="font-semibold text-text-white mb-2">🔗 Étapes :</h3>
                <ol className="list-decimal list-inside space-y-2 text-text-gray">
                  <li>Va sur <a href="https://www.bing.com/webmasters" target="_blank" className="text-neon-pink hover:underline">Bing Webmaster Tools</a></li>
                  <li>Ajoute "www.judgemyjpeg.fr"</li>
                  <li>Choisis "Fichier XML BingSiteAuth.xml"</li>
                  <li>Remplace le code dans /public/BingSiteAuth.xml</li>
                  <li>Redéploie et vérifie</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Google Analytics */}
          <div className="glass-card p-6 mb-6">
            <h2 className="text-2xl font-bold text-neon-cyan mb-4">📈 Google Analytics 4</h2>
            
            <div className="space-y-4">
              <div className="bg-cosmic-glass p-4 rounded-lg">
                <h3 className="font-semibold text-text-white mb-2">🔗 Configuration :</h3>
                <ol className="list-decimal list-inside space-y-2 text-text-gray">
                  <li>Va sur <a href="https://analytics.google.com" target="_blank" className="text-neon-cyan hover:underline">Google Analytics</a></li>
                  <li>Crée une propriété "JudgeMyJPEG"</li>
                  <li>Configure flux de données web</li>
                  <li>Copie l'ID de mesure (G-XXXXXXXXXX)</li>
                  <li>Ajoute dans les variables d'environnement Railway</li>
                </ol>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-500 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-400 mb-2">⚙️ Variables Environment Railway :</h4>
                <pre className="text-yellow-300 text-sm">
                  <code>
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTAG_ID=G-XXXXXXXXXX
                  </code>
                </pre>
              </div>
            </div>
          </div>

          {/* Monitoring Setup */}
          <div className="glass-card p-6">
            <h2 className="text-2xl font-bold text-neon-pink mb-4">📊 Monitoring & Alertes</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-cosmic-glass p-4 rounded-lg">
                <h3 className="font-semibold text-text-white mb-2">🚨 Alertes Google Search Console :</h3>
                <ul className="list-disc list-inside space-y-1 text-text-gray text-sm">
                  <li>Erreurs d'indexation</li>
                  <li>Problèmes Core Web Vitals</li>
                  <li>Problèmes sécurité</li>
                  <li>Couverture sitemap</li>
                </ul>
              </div>

              <div className="bg-cosmic-glass p-4 rounded-lg">
                <h3 className="font-semibold text-text-white mb-2">📈 KPIs à surveiller :</h3>
                <ul className="list-disc list-inside space-y-1 text-text-gray text-sm">
                  <li>Pages indexées vs soumises</li>
                  <li>Impressions / Clics / CTR</li>
                  <li>Position moyenne mots-clés</li>
                  <li>Vitesse chargement mobile</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Liens rapides */}
          <div className="mt-8 text-center">
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="https://search.google.com/search-console" 
                target="_blank"
                className="btn-neon-cyan"
              >
                🔗 Google Search Console
              </a>
              <a 
                href="https://www.bing.com/webmasters" 
                target="_blank"
                className="btn-neon-pink"
              >
                🔗 Bing Webmaster
              </a>
              <a 
                href="https://analytics.google.com" 
                target="_blank"
                className="btn-neon-secondary"
              >
                🔗 Google Analytics
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}