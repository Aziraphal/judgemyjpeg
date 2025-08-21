import { useState, useMemo } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { glossaryData, categories, searchTerms, getTermsByCategory, getRelatedTerms, GlossaryTerm } from '@/data/glossary'

export default function GlossairePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null)

  // Filtrage des termes
  const filteredTerms = useMemo(() => {
    let terms = glossaryData

    // Recherche textuelle
    if (searchQuery) {
      terms = searchTerms(searchQuery)
    }

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      terms = terms.filter(term => term.category === selectedCategory)
    }

    // Filtre par niveau
    if (selectedLevel !== 'all') {
      terms = terms.filter(term => term.level === selectedLevel)
    }

    // Tri alphabétique
    return terms.sort((a, b) => a.term.localeCompare(b.term))
  }, [searchQuery, selectedCategory, selectedLevel])

  // Groupement par première lettre
  const groupedTerms = useMemo(() => {
    const groups: { [key: string]: GlossaryTerm[] } = {}
    filteredTerms.forEach(term => {
      const firstLetter = term.term[0].toUpperCase()
      if (!groups[firstLetter]) {
        groups[firstLetter] = []
      }
      groups[firstLetter].push(term)
    })
    return groups
  }, [filteredTerms])

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'debutant': return 'text-green-400'
      case 'intermediaire': return 'text-yellow-400'
      case 'avance': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'debutant': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'intermediaire': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'avance': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <>
      <Head>
        <title>Glossaire Photographique - JudgeMyJPEG</title>
        <meta name="description" content="Dictionnaire complet des termes photographiques : règle des tiers, bokeh, stops, focale... Apprenez le vocabulaire photo professionnel." />
        <meta name="keywords" content="glossaire photo, vocabulaire photographie, règle des tiers, bokeh, stops exposition, focale objectif" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay relative">
        <div className="container mx-auto px-4 py-8">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                📚 Glossaire Photographique
              </span>
            </h1>
            <p className="text-text-gray max-w-3xl mx-auto text-lg">
              Découvrez et maîtrisez le vocabulaire photographique essentiel. 
              Chaque terme utilisé dans nos analyses IA est expliqué simplement avec des exemples concrets.
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-neon-cyan">{glossaryData.length}</div>
              <div className="text-sm text-text-muted">Termes définis</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-neon-pink">{Object.keys(categories).length}</div>
              <div className="text-sm text-text-muted">Catégories</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{glossaryData.filter(t => t.level === 'debutant').length}</div>
              <div className="text-sm text-text-muted">Débutant</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{glossaryData.filter(t => t.level === 'avance').length}</div>
              <div className="text-sm text-text-muted">Avancé</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Sidebar avec filtres */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Recherche */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-text-white mb-4 flex items-center">
                  <span className="mr-2">🔍</span>
                  Recherche
                </h3>
                <input
                  type="text"
                  placeholder="Rechercher un terme..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white placeholder-text-muted focus:border-neon-cyan outline-none"
                />
              </div>

              {/* Filtres par catégorie */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-text-white mb-4">Catégories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedCategory === 'all' 
                        ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50' 
                        : 'bg-cosmic-glass text-text-white hover:bg-cosmic-glassborder'
                    }`}
                  >
                    <span className="mr-2">🎯</span> Toutes ({glossaryData.length})
                  </button>
                  {Object.entries(categories).map(([key, cat]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedCategory === key 
                          ? `bg-${cat.color}/20 text-${cat.color} border border-${cat.color}/50` 
                          : 'bg-cosmic-glass text-text-white hover:bg-cosmic-glassborder'
                      }`}
                    >
                      <span className="mr-2">{cat.icon}</span> 
                      {cat.name} ({getTermsByCategory(key).length})
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtres par niveau */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-text-white mb-4">Niveau</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedLevel('all')}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedLevel === 'all' 
                        ? 'bg-gray-500/20 text-white border border-gray-500/50' 
                        : 'bg-cosmic-glass text-text-white hover:bg-cosmic-glassborder'
                    }`}
                  >
                    Tous niveaux
                  </button>
                  {['debutant', 'intermediaire', 'avance'].map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedLevel === level 
                          ? `${getLevelBadge(level)} border` 
                          : 'bg-cosmic-glass text-text-white hover:bg-cosmic-glassborder'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)} 
                      ({glossaryData.filter(t => t.level === level).length})
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Liste des termes */}
            <div className="lg:col-span-2">
              {Object.keys(groupedTerms).length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-text-white mb-2">Aucun terme trouvé</h3>
                  <p className="text-text-muted">Essayez de modifier vos filtres ou votre recherche.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.keys(groupedTerms).sort().map(letter => (
                    <div key={letter}>
                      {/* Lettre de regroupement */}
                      <div className="sticky top-4 z-10 bg-cosmic-overlay border-b border-cosmic-glassborder pb-2 mb-4">
                        <h2 className="text-2xl font-bold text-neon-cyan">{letter}</h2>
                      </div>
                      
                      {/* Termes de cette lettre */}
                      <div className="grid gap-4">
                        {groupedTerms[letter].map(term => (
                          <div 
                            key={term.id}
                            className="glass-card p-6 hover-glow cursor-pointer transition-all"
                            onClick={() => setSelectedTerm(term)}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-xl font-semibold text-text-white">
                                {term.term}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm px-2 py-1 rounded border ${getLevelBadge(term.level)}`}>
                                  {term.level}
                                </span>
                                <span className={`text-${categories[term.category].color}`}>
                                  {categories[term.category].icon}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-text-gray mb-3 line-clamp-3">
                              {term.definition}
                            </p>
                            
                            {term.example && (
                              <div className="bg-cosmic-glass p-3 rounded-lg mb-3">
                                <div className="text-xs text-text-muted mb-1">Exemple :</div>
                                <div className="text-sm text-text-white italic">
                                  "{term.example}"
                                </div>
                              </div>
                            )}
                            
                            {term.relatedTerms && term.relatedTerms.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                <span className="text-xs text-text-muted">Voir aussi :</span>
                                {term.relatedTerms.slice(0, 3).map(relatedId => {
                                  const relatedTerm = glossaryData.find(t => t.id === relatedId)
                                  return relatedTerm ? (
                                    <span 
                                      key={relatedId}
                                      className="text-xs bg-neon-pink/20 text-neon-pink px-2 py-1 rounded cursor-pointer hover:bg-neon-pink/30"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedTerm(relatedTerm)
                                      }}
                                    >
                                      {relatedTerm.term}
                                    </span>
                                  ) : null
                                })}
                                {term.relatedTerms.length > 3 && (
                                  <span className="text-xs text-text-muted">
                                    +{term.relatedTerms.length - 3} autres
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Retour vers analyse */}
          <div className="text-center mt-12">
            <Link href="/analyze" className="btn-neon-pink">
              📸 Analyser une photo avec ce vocabulaire
            </Link>
          </div>

        </div>

        {/* Modal terme détaillé */}
        {selectedTerm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="glass-card max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-text-white">
                    {selectedTerm.term}
                  </h2>
                  <button
                    onClick={() => setSelectedTerm(null)}
                    className="text-text-muted hover:text-text-white text-xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <span className={`text-${categories[selectedTerm.category].color} text-xl`}>
                    {categories[selectedTerm.category].icon}
                  </span>
                  <span className="text-text-muted">{categories[selectedTerm.category].name}</span>
                  <span className={`text-sm px-2 py-1 rounded border ${getLevelBadge(selectedTerm.level)}`}>
                    {selectedTerm.level}
                  </span>
                </div>
                
                <p className="text-text-gray text-lg mb-6">
                  {selectedTerm.definition}
                </p>
                
                {selectedTerm.example && (
                  <div className="bg-cosmic-glass p-4 rounded-lg mb-6">
                    <div className="text-sm text-text-muted mb-2">💡 Exemple pratique :</div>
                    <div className="text-text-white italic">
                      "{selectedTerm.example}"
                    </div>
                  </div>
                )}
                
                {selectedTerm.relatedTerms && selectedTerm.relatedTerms.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-text-white mb-3">
                      Termes connexes
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {getRelatedTerms(selectedTerm.id).map(related => (
                        <button
                          key={related.id}
                          onClick={() => setSelectedTerm(related)}
                          className="text-left p-3 bg-cosmic-glass rounded-lg hover:bg-cosmic-glassborder transition-all"
                        >
                          <div className="font-medium text-neon-cyan">{related.term}</div>
                          <div className="text-sm text-text-muted line-clamp-2">
                            {related.definition}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}