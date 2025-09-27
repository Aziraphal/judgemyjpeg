/**
 * Hero section localisé selon la géolocalisation de l'utilisateur
 * Adapte le contenu, les prix et le messaging selon le marché
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAutoLocalization } from '@/hooks/useAutoLocalization'
import { AnalysisLanguage } from './LanguageSelector'

interface LocalizedContent {
  title: string
  subtitle: string
  description: string
  cta: string
  features: string[]
  testimonial: {
    text: string
    author: string
    role: string
  }
  pricing: {
    currency: string
    symbol: string
    monthly: number
    annual: number
    lifetime: number
  }
  marketMessage?: string
}

// Contenu localisé par langue/marché
const LOCALIZED_CONTENT: Record<AnalysisLanguage, LocalizedContent> = {
  fr: {
    title: "JudgeMyJPEG",
    subtitle: "L'IA qui critique vos photos avec style",
    description: "Obtenez des analyses professionnelles et sarcastiques de vos photos par intelligence artificielle. Améliorez votre photographie avec des conseils experts.",
    cta: "Analyser gratuitement",
    features: [
      "3 analyses gratuites par mois",
      "Modes Pro & Cassant disponibles",
      "Conseils techniques personnalisés",
      "Interface française intuitive"
    ],
    testimonial: {
      text: "Cette IA m'a fait progresser en photo plus que 3 ans de cours !",
      author: "Marie L.",
      role: "Photographe amateur, Lyon"
    },
    pricing: {
      currency: "EUR",
      symbol: "€",
      monthly: 9.99,
      annual: 79,
      lifetime: 149
    },
    marketMessage: "🇫🇷 Créé en France, pour les photographes francophones"
  },
  
  en: {
    title: "JudgeMyJPEG",
    subtitle: "AI that critiques your photos with style",
    description: "Get professional and witty photo analysis powered by artificial intelligence. Improve your photography with expert insights and personalized recommendations.",
    cta: "Analyze for free",
    features: [
      "3 free analyses per month",
      "Pro & Roast modes available",
      "Personalized technical advice",
      "Clean, intuitive interface"
    ],
    testimonial: {
      text: "This AI has improved my photography more than 3 years of classes!",
      author: "Sarah M.",
      role: "Photography enthusiast, London"
    },
    pricing: {
      currency: "USD",
      symbol: "$",
      monthly: 10.99,
      annual: 89,
      lifetime: 159
    },
    marketMessage: "🌍 Global AI photography coach for English speakers"
  },
  
  es: {
    title: "JudgeMyJPEG",
    subtitle: "IA que critica tus fotos con estilo",
    description: "Obtén análisis profesionales y divertidos de tus fotos con inteligencia artificial. Mejora tu fotografía con consejos expertos y recomendaciones personalizadas.",
    cta: "Analizar gratis",
    features: [
      "3 análisis gratuitos por mes",
      "Modos Profesional y Sarcástico",
      "Consejos técnicos personalizados",
      "Interfaz en español intuitiva"
    ],
    testimonial: {
      text: "¡Esta IA me ha hecho mejorar más que 3 años de clases!",
      author: "Carlos R.",
      role: "Fotógrafo aficionado, Madrid"
    },
    pricing: {
      currency: "EUR",
      symbol: "€",
      monthly: 9.99,
      annual: 79,
      lifetime: 149
    },
    marketMessage: "🌶️ IA fotográfica para el mercado hispanohablante"
  },

  de: {
    title: "JudgeMyJPEG",
    subtitle: "KI, die deine Fotos mit Stil kritisiert",
    description: "Erhalte professionelle und unterhaltsame Fotoanalysen durch künstliche Intelligenz. Verbessere deine Fotografie mit Expertenratschlägen und personalisierten Empfehlungen.",
    cta: "Kostenlos analysieren",
    features: [
      "3 kostenlose Analysen pro Monat",
      "Profi- und Satiremodus verfügbar",
      "Personalisierte technische Ratschläge",
      "Deutsche Benutzeroberfläche"
    ],
    testimonial: {
      text: "Diese KI hat mich mehr weitergebracht als 3 Jahre Kurse!",
      author: "Klaus M.",
      role: "Hobbyfotograf, München"
    },
    pricing: {
      currency: "EUR",
      symbol: "€",
      monthly: 9.99,
      annual: 79,
      lifetime: 149
    },
    marketMessage: "🍺 Präzise KI-Fotokritik für deutsche Fotografen"
  },

  it: {
    title: "JudgeMyJPEG",
    subtitle: "IA che critica le tue foto con stile",
    description: "Ottieni analisi professionali e divertenti delle tue foto con intelligenza artificiale. Migliora la tua fotografia con consigli esperti e raccomandazioni personalizzate.",
    cta: "Analizza gratis",
    features: [
      "3 analisi gratuite al mese",
      "Modi Professionale e Sarcastico",
      "Consigli tecnici personalizzati",
      "Interfaccia italiana intuitiva"
    ],
    testimonial: {
      text: "Questa IA mi ha fatto migliorare più di 3 anni di corsi!",
      author: "Marco V.",
      role: "Fotografo amatoriale, Roma"
    },
    pricing: {
      currency: "EUR",
      symbol: "€",
      monthly: 9.99,
      annual: 79,
      lifetime: 149
    },
    marketMessage: "🍝 IA fotografica per il mercato italiano"
  },

  pt: {
    title: "JudgeMyJPEG", 
    subtitle: "IA que critica suas fotos com estilo",
    description: "Obtenha análises profissionais e divertidas de suas fotos com inteligência artificial. Melhore sua fotografia com conselhos especializados e recomendações personalizadas.",
    cta: "Analisar grátis",
    features: [
      "3 análises gratuitas por mês",
      "Modos Profissional e Sarcástico",
      "Conselhos técnicos personalizados",
      "Interface em português intuitiva"
    ],
    testimonial: {
      text: "Esta IA me fez melhorar mais que 3 anos de aulas!",
      author: "Ana S.",
      role: "Fotógrafa amadora, São Paulo"
    },
    pricing: {
      currency: "BRL",
      symbol: "R$",
      monthly: 19.99,
      annual: 159,
      lifetime: 299
    },
    marketMessage: "🇧🇷 IA fotográfica para o mercado brasileiro e português"
  }
}

interface LocalizedHeroProps {
  forceLanguage?: AnalysisLanguage
}

export default function LocalizedHero({ forceLanguage }: LocalizedHeroProps) {
  const { detectedLanguage, detectedCountry, isHighConfidence } = useAutoLocalization()
  const [currentLanguage, setCurrentLanguage] = useState<AnalysisLanguage>('fr')

  // Déterminer la langue à utiliser
  useEffect(() => {
    if (forceLanguage) {
      setCurrentLanguage(forceLanguage)
    } else if (detectedLanguage && isHighConfidence) {
      setCurrentLanguage(detectedLanguage)
    } else {
      setCurrentLanguage('fr') // Fallback français
    }
  }, [forceLanguage, detectedLanguage, isHighConfidence])

  const content = LOCALIZED_CONTENT[currentLanguage]
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background cosmique */}
      <div className="absolute inset-0 bg-cosmic-overlay"></div>
      
      {/* Éléments flottants */}
      <div className="absolute top-20 left-8 w-32 h-32 bg-glow-pink rounded-full blur-2xl opacity-20 animate-float"></div>
      <div className="absolute bottom-20 right-12 w-48 h-48 bg-glow-cyan rounded-full blur-2xl opacity-15 animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-glow-purple rounded-full blur-xl opacity-10 animate-float" style={{animationDelay: '1s'}}></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
        {/* Badge de localisation */}
        {detectedCountry && isHighConfidence && (
          <div className="inline-flex items-center px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/50 rounded-full mb-8 animate-fadeIn">
            <span className="text-sm text-neon-cyan">
              📍 {content.marketMessage || `Détecté depuis ${detectedCountry}`}
            </span>
          </div>
        )}

        {/* Titre principal */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="text-transparent bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan bg-clip-text animate-gradient">
            {content.title}
          </span>
        </h1>
        
        <h2 className="text-2xl md:text-3xl text-text-white mb-8 font-semibold">
          {content.subtitle}
        </h2>

        <p className="text-lg text-text-gray mb-12 max-w-3xl mx-auto leading-relaxed">
          {content.description}
        </p>

        {/* CTA principal */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link href="/analyze" className="btn-neon-pink text-lg px-8 py-4">
            {content.cta} ✨
          </Link>
          <div className="text-text-muted text-sm">
            {content.features[0]} • {currentLanguage === 'pt' ? 'Sem cartão' : 'Sans carte'}
          </div>
        </div>

        {/* Features principales */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {content.features.map((feature, index) => (
            <div key={index} className="glass-card p-4 hover-glow">
              <div className="text-neon-cyan mb-2 text-2xl">
                {index === 0 ? '🎯' : index === 1 ? '🎭' : index === 2 ? '⚡' : '🌟'}
              </div>
              <p className="text-text-white text-sm">{feature}</p>
            </div>
          ))}
        </div>

        {/* Témoignage */}
        <div className="glass-card p-8 max-w-2xl mx-auto mb-16">
          <p className="text-text-white text-lg italic mb-4">
            "{content.testimonial.text}"
          </p>
          <div className="text-text-muted">
            <span className="text-neon-cyan font-semibold">{content.testimonial.author}</span>
            <span className="mx-2">•</span>
            {content.testimonial.role}
          </div>
        </div>

        {/* Pricing adapté au marché */}
        <div className="glass-card p-6 max-w-md mx-auto">
          <h3 className="text-neon-pink font-bold text-lg mb-4">
            {currentLanguage === 'en' ? 'Pricing' : 
             currentLanguage === 'es' ? 'Precios' :
             currentLanguage === 'de' ? 'Preise' :
             currentLanguage === 'it' ? 'Prezzi' :
             currentLanguage === 'pt' ? 'Preços' : 'Tarifs'}
          </h3>
          <div className="space-y-2 text-text-gray text-sm">
            <div>📱 {currentLanguage === 'en' ? 'Monthly' : 'Mensuel'}: <span className="text-neon-cyan">{content.pricing.symbol}{content.pricing.monthly}</span></div>
            <div>📅 {currentLanguage === 'en' ? 'Annual' : 'Annuel'}: <span className="text-neon-cyan">{content.pricing.symbol}{content.pricing.annual}</span></div>
            <div>♾️ {currentLanguage === 'en' ? 'Lifetime' : 'À vie'}: <span className="text-neon-pink">{content.pricing.symbol}{content.pricing.lifetime}</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}