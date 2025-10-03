import { useState } from 'react'
import type { AnalysisLanguage } from '@/types/analysis'
import { useLanguage } from '@/contexts/LanguageContext'

interface LanguageSelectorProps {
  selectedLanguage: AnalysisLanguage
  onLanguageChange: (language: AnalysisLanguage) => void
}

export default function LanguageSelector({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) {
  const { t } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)

  const languageOptions = {
    fr: {
      label: 'Français',
      flag: '🇫🇷',
      example: 'Excellente composition selon la règle des tiers...'
    },
    en: {
      label: 'English',
      flag: '🇺🇸',
      example: 'Excellent composition following the rule of thirds...'
    },
    es: {
      label: 'Español',
      flag: '🇪🇸',
      example: 'Excelente composición siguiendo la regla de los tercios...'
    },
    zh: {
      label: '简体中文',
      flag: '🇨🇳',
      example: '构图优秀，遵循三分法则...'
    },
    de: {
      label: 'Deutsch',
      flag: '🇩🇪',
      example: 'Ausgezeichnete Komposition nach der Drittelregel...'
    },
    it: {
      label: 'Italiano',
      flag: '🇮🇹',
      example: 'Eccellente composizione seguendo la regola dei terzi...'
    },
    pt: {
      label: 'Português',
      flag: '🇵🇹',
      example: 'Excelente composição seguindo a regra dos terços...'
    }
  }

  return (
    <div className="glass-card p-6 mb-6 hover-glow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-white flex items-center">
          <span className="text-2xl mr-2">🌍</span>
          {t.languageSelector.title}
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="btn-neon-secondary text-sm"
        >
          {isExpanded ? '▼' : '▶'} {t.languageSelector.seeAll}
        </button>
      </div>

      {/* Sélection rapide - 3 langues principales */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {(['fr', 'en', 'es'] as AnalysisLanguage[]).map((lang) => {
          const config = languageOptions[lang]
          return (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`p-3 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                selectedLanguage === lang 
                  ? 'border-neon-cyan bg-neon-cyan/20' 
                  : 'border-neon-cyan/50 bg-neon-cyan/10 hover:border-opacity-75'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">{config.flag}</div>
                <div className="text-text-white font-semibold text-sm">{config.label}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Toutes les langues */}
      {isExpanded && (
        <div className="animate-fadeIn">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {Object.entries(languageOptions).map(([lang, config]) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang as AnalysisLanguage)}
                className={`p-3 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                  selectedLanguage === lang 
                    ? 'border-neon-cyan bg-neon-cyan/20' 
                    : 'border-neon-cyan/50 bg-neon-cyan/10 hover:border-opacity-75'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{config.flag}</div>
                  <div className="text-text-white font-semibold text-sm">{config.label}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Exemple dans la langue sélectionnée */}
          <div className="glass-card p-4 border border-neon-cyan/30">
            <div className="flex items-center mb-2">
              <span className="text-xl mr-2">{languageOptions[selectedLanguage].flag}</span>
              <span className="text-neon-cyan font-semibold">{t.languageSelector.exampleIn} {languageOptions[selectedLanguage].label}</span>
            </div>
            <p className="text-text-gray text-sm italic">
              "{languageOptions[selectedLanguage].example}"
            </p>
          </div>
        </div>
      )}

      {/* Indicateur de sélection actuelle */}
      <div className="mt-4 p-3 rounded-lg bg-cosmic-glass border border-cosmic-glassborder">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{languageOptions[selectedLanguage].flag}</span>
            <div>
              <div className="text-text-white font-semibold">
                {languageOptions[selectedLanguage].label}
              </div>
              <div className="text-text-muted text-sm">
                {t.languageSelector.aiWillRespond}
              </div>
            </div>
          </div>
          <div className="text-neon-cyan text-sm font-semibold">
            ✓ {t.languageSelector.selected}
          </div>
        </div>
      </div>
    </div>
  )
}