/**
 * Sélecteur de langue global
 * S'intègre avec i18next et le système de détection auto
 */

import { useState } from 'react'
import { useLanguageSync } from '@/hooks/useLanguageSync'
import { AnalysisLanguage } from './LanguageSelector'

export default function LanguageSwitcher() {
  const { currentLanguage, changeLanguage } = useLanguageSync()
  const [isOpen, setIsOpen] = useState(false)

  const languages: { code: AnalysisLanguage; flag: string; name: string }[] = [
    { code: 'fr', flag: '🇫🇷', name: 'Français' },
    { code: 'en', flag: '🇺🇸', name: 'English' },
    { code: 'es', flag: '🇪🇸', name: 'Español' },
    { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
    { code: 'it', flag: '🇮🇹', name: 'Italiano' },
    { code: 'pt', flag: '🇵🇹', name: 'Português' }
  ]

  const currentLangData = languages.find(l => l.code === currentLanguage) || languages[0]

  const handleLanguageChange = (lang: AnalysisLanguage) => {
    changeLanguage(lang)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Bouton actuel */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-cosmic-glass border border-cosmic-glassborder rounded-lg hover:bg-cosmic-glass/80 transition-colors"
        title="Change language"
      >
        <span className="text-xl">{currentLangData.flag}</span>
        <span className="text-text-white text-sm font-medium hidden sm:inline">
          {currentLangData.code.toUpperCase()}
        </span>
        <span className="text-text-gray text-xs">▼</span>
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <>
          {/* Overlay pour fermer */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-cosmic-glass border border-cosmic-glassborder rounded-lg shadow-xl z-50 overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-neon-cyan/10 transition-colors ${
                  lang.code === currentLanguage
                    ? 'bg-neon-cyan/20 border-l-2 border-neon-cyan'
                    : ''
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <div className="text-text-white text-sm font-medium">
                    {lang.name}
                  </div>
                  <div className="text-text-muted text-xs">
                    {lang.code.toUpperCase()}
                  </div>
                </div>
                {lang.code === currentLanguage && (
                  <span className="text-neon-cyan text-sm">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}