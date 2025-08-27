import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  publishedAt: string
  readTime: string
  category: string
  tags: string[]
  slug: string
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Comment juger une bonne photo ? Guide complet 2025',
    excerpt: "Découvrez les 7 critères essentiels que l'IA utilise pour évaluer vos photos. Composition, éclairage, netteté... tout ce qu'il faut savoir.",
    content: `
# Comment juger une bonne photo ? Guide complet 2025

Vous vous demandez ce qui fait qu'une photo est "bonne" ? L'IA analyse **7 critères techniques** pour donner une note objective sur 100.

## 1. Composition (15 points)
- **Règle des tiers** : Placement des éléments sur les lignes de force
- **Équilibre visuel** : Répartition harmonieuse des masses
- **Cadrage** : Choix du format et des limites de l'image

## 2. Éclairage (15 points)  
- **Qualité de lumière** : Douce vs dure, naturelle vs artificielle
- **Direction** : Frontale, latérale, contre-jour maîtrisé
- **Contraste** : Équilibre ombres/lumières

## 3. Netteté (15 points)
- **Mise au point** : Zone de netteté intentionnelle  
- **Profondeur de champ** : Utilisation créative du flou
- **Stabilité** : Absence de flou de bougé

## 4. Exposition (15 points)
- **Luminosité générale** : Ni sous-exposé, ni surexposé
- **Histogramme** : Répartition tonale équilibrée
- **Détails** : Conservation dans les hautes et basses lumières

## 5. Créativité (15 points)
- **Originalité** : Angle de vue unique
- **Innovation** : Approche non-conventionnelle
- **Style personnel** : Signature artistique

## 6. Émotion (15 points)
- **Impact visuel** : Capacité à émouvoir
- **Expression** : Transmission d'un sentiment
- **Connexion** : Lien avec le spectateur

## 7. Narration (10 points)
- **Histoire** : Capacité à raconter
- **Contexte** : Éléments narratifs
- **Message** : Intention claire

### Astuce Pro 💡
L'IA peut analyser votre photo en **mode professionnel** pour des conseils techniques précis, ou en **mode cassant** pour un retour humoristique mais constructif !

[Analyser ma photo maintenant →](/analyser-photo)
    `,
    publishedAt: '2025-01-17',
    readTime: '5 min',
    category: 'Guide',
    tags: ['composition', 'technique', 'évaluation'],
    slug: 'comment-juger-bonne-photo-guide-2025'
  },
  {
    id: '2', 
    title: "Top 5 erreurs en photo que l'IA repère instantanément",
    excerpt: "Ces erreurs communes ruinent vos photos ! L'intelligence artificielle les détecte en quelques secondes. Apprenez à les éviter.",
    content: `
# Top 5 erreurs en photo que l'IA repère instantanément

L'IA analyse **des milliers de photos** chaque mois. Voici les 5 erreurs les plus fréquentes qu'elle détecte :

## 1. 🎯 Centre mort : Sujet au milieu
**Problème** : Placer systématiquement le sujet au centre
**Solution** : Utilisez la règle des tiers pour des compositions plus dynamiques

## 2. 💡 Contre-jour non maîtrisé  
**Problème** : Sujet sombre sur fond lumineux
**Solution** : Utilisez le fill-flash ou changez d'angle

## 3. 📐 Horizon penché
**Problème** : Ligne d'horizon inclinée par négligence  
**Solution** : Activez la grille sur votre appareil

## 4. 🌪️ Arrière-plan distrayant
**Problème** : Éléments parasites qui détournent l'attention
**Solution** : Changez d'angle ou utilisez une plus grande ouverture

## 5. ⚡ Flou de bougé
**Problème** : Vitesse d'obturation trop lente
**Solution** : Règle 1/focale ou utilisez un trépied

### Le saviez-vous ? 🤖
L'IA peut analyser ces défauts en **moins de 30 secondes** et vous proposer des corrections spécifiques !

[Voir nos tarifs →](/tarifs)
    `,
    publishedAt: '2025-01-16',
    readTime: '3 min', 
    category: 'Conseils',
    tags: ['erreurs', 'technique', 'débutant'],
    slug: 'erreurs-photo-ia-detecte-instantanement'
  },
  {
    id: '3',
    title: 'Pourquoi utiliser une IA pour évaluer ses photos JPEG ?',
    excerpt: "L'intelligence artificielle révolutionne l'évaluation photo. Objectivité, rapidité, apprentissage... découvrez tous les avantages.",
    content: `
# Pourquoi utiliser une IA pour évaluer ses photos JPEG ?

L'**intelligence artificielle** transforme la manière d'évaluer les photos. Voici pourquoi c'est révolutionnaire :

## 🎯 Objectivité totale
- **Sans biais personnel** : L'IA juge selon des critères techniques purs
- **Cohérence** : Même photo = même note, toujours
- **Expertise** : Entraînée sur des milliers de photos de qualité

## ⚡ Rapidité instantanée
- **30 secondes** : Temps d'analyse complète
- **Disponible 24/7** : Pas d'attente, pas de rendez-vous
- **Feedback immédiat** : Amélioration en temps réel

## 📈 Apprentissage personnalisé  
- **Progression mesurable** : Note sur 100 pour suivre vos progrès
- **Conseils ciblés** : Recommandations spécifiques à vos faiblesses
- **Styles multiples** : Mode pro ou humoristique selon vos préférences

## 🔍 Analyse technique poussée
- **7 critères détaillés** : Composition, éclairage, netteté...
- **Micro-détections** : Défauts invisibles à l'œil nu
- **Références artistiques** : Comparaison aux grands maîtres

## 💰 Accessible à tous
- **Gratuit** : 3 analyses par mois
- **Premium abordable** : Analyses illimitées dès 9,99€
- **ROI formation** : Moins cher qu'un cours photo

### L'avis des utilisateurs 💬
*"En 2 semaines, mes photos Instagram ont gagné 40% de likes en plus !"* - Marie, 28 ans

*"L'IA m'a fait progresser plus vite qu'un an de tutos YouTube."* - Thomas, photographe amateur

[Analyser en lot →](/analyse-lot)
    `,
    publishedAt: '2025-01-15',
    readTime: '4 min',
    category: 'IA & Photo', 
    tags: ['intelligence artificielle', 'évaluation', 'avantages'],
    slug: 'pourquoi-utiliser-ia-evaluer-photos-jpeg'
  }
]

export default function BlogPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const categories = ['all', 'Guide', 'Conseils', 'IA & Photo']
  
  const filteredPosts = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory)

  return (
    <>
      <Head>
        <title>Blog Photo IA | Guides et conseils analyse JPEG - JudgeMyJPEG</title>
        <meta name="description" content="Guides photo, conseils techniques et astuces IA pour améliorer vos photos. Apprenez à maîtriser la composition, l'éclairage et l'évaluation photo." />
        
        {/* Open Graph */}
        <meta property="og:title" content="Blog Photo IA | Guides et conseils analyse JPEG" />
        <meta property="og:description" content="Guides photo, conseils techniques et astuces IA pour améliorer vos photos." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://judgemyjpeg.com/blog" />
        
        {/* Schema.org pour Blog */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog", 
            "name": "Blog JudgeMyJPEG",
            "description": "Guides et conseils pour améliorer vos photos avec l'IA",
            "url": "https://judgemyjpeg.com/blog",
            "publisher": {
              "@type": "Organization",
              "name": "JudgeMyJPEG",
              "url": "https://judgemyjpeg.com"
            },
            "blogPost": blogPosts.map(post => ({
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.excerpt,
              "datePublished": post.publishedAt,
              "url": `https://judgemyjpeg.com/blog/${post.slug}`,
              "keywords": post.tags.join(', ')
            }))
          })}
        </script>
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        {/* Floating decorative elements */}
        <div className="absolute top-16 left-8 w-20 h-20 bg-glow-pink rounded-full blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-24 right-12 w-28 h-28 bg-glow-cyan rounded-full blur-xl opacity-15 animate-float" style={{animationDelay: '1.5s'}}></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-glow mb-4">
              📚 Blog{' '}
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Photo IA
              </span>
            </h1>
            <p className="text-xl text-text-gray max-w-2xl mx-auto">
              Guides, conseils et astuces pour{' '}
              <span className="text-neon-cyan font-semibold">maîtriser l'art</span>{' '}
              de la photographie avec l'intelligence artificielle
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => router.push('/')}
              className="btn-neon-secondary flex items-center space-x-2"
            >
              <span>←</span>
              <span>Retour à l'accueil</span>
            </button>
            
            <Link href="/analyze" className="btn-neon-pink">
              📸 Analyser une photo
            </Link>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-neon-pink border-neon-pink text-white'
                    : 'border-cosmic-glassborder text-text-gray hover:border-neon-pink'
                }`}
              >
                {category === 'all' ? 'Tous les articles' : category}
              </button>
            ))}
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article key={post.id} className="glass-card p-6 hover-glow group">
                <div className="space-y-4">
                  {/* Category & Date */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="px-2 py-1 bg-neon-pink/20 text-neon-pink rounded-md">
                      {post.category}
                    </span>
                    <span className="text-text-muted">{post.readTime}</span>
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-xl font-bold text-text-white group-hover:text-neon-cyan transition-colors">
                    {post.title}
                  </h2>
                  
                  {/* Excerpt */}
                  <p className="text-text-gray">
                    {post.excerpt}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 bg-cosmic-glass text-text-muted rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Read More */}
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center text-neon-cyan hover:text-neon-pink transition-colors"
                  >
                    Lire l'article →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* CTA Section */}
          <div className="glass-card p-8 mt-12 text-center">
            <h3 className="text-2xl font-bold text-text-white mb-4">
              Prêt à analyser vos photos ?
            </h3>
            <p className="text-text-gray mb-6">
              Mettez en pratique ces conseils et obtenez une évaluation IA personnalisée
            </p>
            <Link href="/analyze" className="btn-neon-pink text-lg">
              🚀 Analyser ma photo gratuitement
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}