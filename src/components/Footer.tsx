import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-cosmic-overlay border-t border-cosmic-glassborder py-12 mt-20">
      <div className="container mx-auto px-4">
        
        {/* Contenu principal du footer */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          
          {/* Colonne 1 : Marque */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                JudgeMyJPEG
              </span>
            </h3>
            <p className="text-text-muted text-sm">
              {t.footer.tagline}
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="mailto:contact.judgemyjpeg@gmail.com" className="text-text-muted hover:text-neon-cyan transition-colors" title="Contactez-moi">
                <span className="text-xl">📧</span>
              </a>
              <a href="#" className="text-text-muted hover:text-neon-cyan transition-colors">
                <span className="text-xl">📱</span>
              </a>
              <a href="#" className="text-text-muted hover:text-neon-cyan transition-colors">
                <span className="text-xl">🐦</span>
              </a>
            </div>
          </div>

          {/* Colonne 2 : Produit */}
          <div>
            <h4 className="text-text-white font-semibold mb-4">{t.footer.productTitle}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/analyze" className="text-text-muted hover:text-neon-cyan transition-colors">
                  {t.footer.analyzePhoto}
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-text-muted hover:text-neon-cyan transition-colors">
                  {t.footer.topPhotos}
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-text-muted hover:text-neon-cyan transition-colors">
                  {t.footer.collections}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-text-muted hover:text-neon-cyan transition-colors">
                  {t.footer.dashboard}
                </Link>
              </li>
              <li>
                <Link href="/insights" className="text-text-muted hover:text-neon-cyan transition-colors">
                  {t.footer.insights}
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Support */}
          <div>
            <h4 className="text-text-white font-semibold mb-4">{t.footer.supportTitle}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-text-muted hover:text-neon-cyan transition-colors">
                  {t.footer.faq}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-text-muted hover:text-neon-cyan transition-colors">
                  {t.footer.contact}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-text-muted hover:text-neon-cyan transition-colors">
                  {t.footer.pricing}
                </Link>
              </li>
              <li>
                <Link href="/glossaire" className="text-text-muted hover:text-neon-cyan transition-colors">
                  📚 {t.footer.glossary}
                </Link>
              </li>
              <li>
                <Link href="/ressources" className="text-text-muted hover:text-neon-cyan transition-colors">
                  {t.footer.resourcesTitle}
                </Link>
              </li>
              <li>
                <Link href="/partenariats" className="text-text-muted hover:text-neon-cyan transition-colors">
                  {t.footer.partnerships}
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4 : SEO Français */}
          <div>
            <h4 className="text-text-white font-semibold mb-4">{t.footer.analysisTitle}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/analyser-photo-gratuit" className="text-text-muted hover:text-neon-cyan transition-colors">
                  {t.footer.analyzeFree}
                </Link>
              </li>
              <li>
                <Link href="/analyse-image-gratuite" className="text-text-muted hover:text-neon-cyan transition-colors">
                  Analyse image gratuite
                </Link>
              </li>
              <li>
                <Link href="/diagnostic-photo" className="text-text-muted hover:text-neon-cyan transition-colors">
                  Diagnostic photo
                </Link>
              </li>
              <li>
                <Link href="/ia-analyse-photo" className="text-text-muted hover:text-neon-cyan transition-colors">
                  IA analyse photo
                </Link>
              </li>
              <li>
                <Link href="/critique-photo-ia" className="text-text-muted hover:text-neon-cyan transition-colors">
                  {t.footer.aiCritique}
                </Link>
              </li>
              <li>
                <Link href="/analyse-lot" className="text-text-muted hover:text-neon-cyan transition-colors">
                  {t.footer.batchAnalysis}
                </Link>
              </li>
              <li>
                <Link href="/collections-photos" className="text-text-muted hover:text-neon-cyan transition-colors">
                  {t.footer.photoCollections}
                </Link>
              </li>
              <li>
                <Link href="/toutes-mes-photos" className="text-text-muted hover:text-neon-cyan transition-colors">
                  {t.footer.allMyPhotos}
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 5 : Légal */}
          <div>
            <h4 className="text-text-white font-semibold mb-4">{t.footer.legalTitle}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/terms" className="text-text-muted hover:text-neon-cyan transition-colors">
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-text-muted hover:text-neon-cyan transition-colors">
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href="/legal/mentions" className="text-text-muted hover:text-neon-cyan transition-colors">
                  {t.footer.legalNotice}
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="text-text-muted hover:text-neon-cyan transition-colors">
                  {t.footer.cookies}
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Ligne de séparation */}
        <div className="border-t border-cosmic-glassborder pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            
            {/* Copyright */}
            <div className="text-text-muted text-sm mb-4 md:mb-0">
              © {currentYear} CodeCraft Plus. {t.footer.allRightsReserved}.
            </div>

            {/* Liens rapides légaux */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/legal/terms" className="text-text-muted hover:text-neon-cyan transition-colors">
                {t.footer.terms}
              </Link>
              <Link href="/legal/privacy" className="text-text-muted hover:text-neon-cyan transition-colors">
                {t.footer.privacy}
              </Link>
              <Link href="/legal/mentions" className="text-text-muted hover:text-neon-cyan transition-colors">
                {t.footer.legalNotice}
              </Link>
              <Link href="/legal/cookies" className="text-text-muted hover:text-neon-cyan transition-colors">
                {t.footer.cookies}
              </Link>
              <Link href="/faq" className="text-text-muted hover:text-neon-cyan transition-colors">
                {t.footer.faq}
              </Link>
              <Link href="/contact" className="text-text-muted hover:text-neon-cyan transition-colors">
                {t.footer.contact}
              </Link>
              <button
                onClick={() => {
                  // Utilise la fonction globale pour ouvrir les paramètres
                  if ((window as any).openCookieSettings) {
                    (window as any).openCookieSettings()
                  } else {
                    // Fallback: effacer le consentement pour forcer l'affichage du banner
                    localStorage.removeItem('cookie-consent')
                    localStorage.removeItem('cookie-consent-date')
                    window.location.reload()
                  }
                }}
                className="text-text-muted hover:text-neon-cyan transition-colors"
                title={t.footer.cookiePreferences}
              >
                🍪 {t.footer.cookiePreferences}
              </button>
            </div>

          </div>
        </div>

      </div>
    </footer>
  )
}