/**
 * Section témoignages clients
 * Social proof pour augmenter la conversion
 */

import { useState } from 'react'

interface Testimonial {
  id: number
  name: string
  role: string
  avatar: string
  rating: number
  text: string
  photoType?: string
  improvement?: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Marie L.",
    role: "Photographe amateur",
    avatar: "👩‍🎨",
    rating: 5,
    text: "L'analyse IA m'a aidée à comprendre mes erreurs de composition. Mon score est passé de 65 à 92 en 2 semaines !",
    photoType: "Portrait",
    improvement: "+27 points"
  },
  {
    id: 2,
    name: "Thomas D.",
    role: "Content Creator",
    avatar: "👨‍💻",
    rating: 5,
    text: "Le mode Cassant est hilarant mais tellement utile ! J'ai enfin compris pourquoi mes photos Instagram ne marchaient pas.",
    photoType: "Street",
    improvement: "10x plus d'engagement"
  },
  {
    id: 3,
    name: "Sophie M.",
    role: "Photographe pro",
    avatar: "📸",
    rating: 5,
    text: "J'utilise JudgeMyJPEG pour former mes clients. Le mode Learning est parfait pour expliquer la technique.",
    photoType: "Mariage",
    improvement: "Clients ravis"
  },
  {
    id: 4,
    name: "Lucas R.",
    role: "Étudiant photo",
    avatar: "🎓",
    rating: 5,
    text: "Meilleur outil d'apprentissage ! Les analyses détaillées valent des heures de cours. Et c'est gratuit pour commencer !",
    photoType: "Paysage",
    improvement: "Note école: A+"
  },
  {
    id: 5,
    name: "Emma B.",
    role: "Influenceuse voyage",
    avatar: "✈️",
    rating: 5,
    text: "Mes photos de voyage ont explosé sur Insta grâce aux conseils de l'IA. Score moyen passé à 88/100 !",
    photoType: "Travel",
    improvement: "+250% likes"
  },
  {
    id: 6,
    name: "Alexandre P.",
    role: "Photographe culinaire",
    avatar: "🍽️",
    rating: 5,
    text: "L'analyse de la lumière et des couleurs est bluffante. J'ai amélioré tout mon workflow food photo.",
    photoType: "Food",
    improvement: "+3 clients"
  }
]

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section className="py-20 bg-cosmic-glass relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-glow-pink rounded-full blur-3xl opacity-10"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-glow-cyan rounded-full blur-3xl opacity-10"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
              Ils ont amélioré leurs photos
            </span>
          </h2>
          <p className="text-xl text-text-gray max-w-2xl mx-auto">
            Rejoignez les <span className="text-neon-pink font-bold">12,547+ photographes</span> qui progressent avec JudgeMyJPEG
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap justify-center gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-neon-pink mb-2">4.8/5</div>
            <div className="text-sm text-text-muted">⭐⭐⭐⭐⭐</div>
            <div className="text-xs text-text-gray mt-1">150+ avis</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-neon-cyan mb-2">+27</div>
            <div className="text-sm text-text-muted">points</div>
            <div className="text-xs text-text-gray mt-1">Amélioration moyenne</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-neon-purple mb-2">92%</div>
            <div className="text-sm text-text-muted">satisfaction</div>
            <div className="text-xs text-text-gray mt-1">Recommandent l'app</div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`glass-card p-6 hover-glow transition-all duration-300 ${
                index === activeIndex ? 'border-2 border-neon-pink' : ''
              }`}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">{testimonial.avatar}</div>
                <div className="flex-1">
                  <h4 className="text-text-white font-semibold">{testimonial.name}</h4>
                  <p className="text-text-muted text-sm">{testimonial.role}</p>
                </div>
                <div className="text-yellow-400">
                  {'⭐'.repeat(testimonial.rating)}
                </div>
              </div>

              {/* Quote */}
              <p className="text-text-gray italic mb-4 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Metrics */}
              <div className="flex items-center justify-between pt-4 border-t border-cosmic-glassborder">
                <div className="text-xs text-text-muted">
                  📸 {testimonial.photoType}
                </div>
                <div className="text-sm font-semibold text-neon-cyan">
                  {testimonial.improvement}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="/analyze"
            className="inline-block bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-cyan text-white text-xl font-bold px-10 py-4 rounded-xl shadow-lg hover:shadow-neon-pink/50 transition-all duration-300 transform hover:scale-105"
          >
            🚀 Commencer gratuitement
          </a>
          <p className="text-text-muted text-sm mt-4">
            3 analyses gratuites • Aucune carte requise • Résultats instantanés
          </p>
        </div>
      </div>
    </section>
  )
}
