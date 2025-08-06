import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-cosmic-overlay border-t border-cosmic-glassborder py-12 mt-20">
      <div className="container mx-auto px-4">
        
        {/* Contenu principal du footer */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          
          {/* Colonne 1 : Marque */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                JudgeMyJPEG
              </span>
            </h3>
            <p className="text-text-muted text-sm">
              L'IA qui analyse vos photos avec expertise et créativité
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="mailto:contact.judgemyjpeg@gmail.com" className="text-text-muted hover:text-neon-cyan transition-colors" title="Contactez-nous">
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
            <h4 className="text-text-white font-semibold mb-4">Produit</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/analyze" className="text-text-muted hover:text-neon-cyan transition-colors">
                  Analyser une photo
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-text-muted hover:text-neon-cyan transition-colors">
                  Top Photos
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-text-muted hover:text-neon-cyan transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-text-muted hover:text-neon-cyan transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/insights" className="text-text-muted hover:text-neon-cyan transition-colors">
                  Insights
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Support */}
          <div>
            <h4 className="text-text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-text-muted hover:text-neon-cyan transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-text-muted hover:text-neon-cyan transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-text-muted hover:text-neon-cyan transition-colors">
                  Tarifs
                </Link>
              </li>
              <li>
                <a href="mailto:contact.judgemyjpeg@gmail.com" className="text-text-muted hover:text-neon-cyan transition-colors">
                  Email Support
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 4 : Légal */}
          <div>
            <h4 className="text-text-white font-semibold mb-4">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/terms" className="text-text-muted hover:text-neon-cyan transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-text-muted hover:text-neon-cyan transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/legal/mentions" className="text-text-muted hover:text-neon-cyan transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="text-text-muted hover:text-neon-cyan transition-colors">
                  Politique de cookies
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
              © {currentYear} CodeCraft Plus. Tous droits réservés.
            </div>

            {/* Liens rapides légaux */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/legal/terms" className="text-text-muted hover:text-neon-cyan transition-colors">
                CGU
              </Link>
              <Link href="/legal/privacy" className="text-text-muted hover:text-neon-cyan transition-colors">
                Confidentialité
              </Link>
              <Link href="/legal/mentions" className="text-text-muted hover:text-neon-cyan transition-colors">
                Mentions légales
              </Link>
              <Link href="/legal/cookies" className="text-text-muted hover:text-neon-cyan transition-colors">
                Cookies
              </Link>
              <Link href="/faq" className="text-text-muted hover:text-neon-cyan transition-colors">
                FAQ
              </Link>
              <Link href="/contact" className="text-text-muted hover:text-neon-cyan transition-colors">
                Contact
              </Link>
              <button
                onClick={() => {
                  // Effacer le consentement pour forcer l'affichage du banner
                  localStorage.removeItem('cookie-consent')
                  localStorage.removeItem('cookie-consent-date')
                  window.location.reload()
                }}
                className="text-text-muted hover:text-neon-cyan transition-colors"
                title="Gérer les préférences cookies"
              >
                🍪 Préférences
              </button>
            </div>

          </div>
        </div>

      </div>
    </footer>
  )
}