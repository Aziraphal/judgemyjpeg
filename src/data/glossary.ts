// Glossaire photographique complet pour JudgeMyJPEG

export interface GlossaryTerm {
  id: string
  term: string
  category: 'technique' | 'composition' | 'eclairage' | 'materiel' | 'traitement'
  definition: string
  example?: string
  relatedTerms?: string[]
  level: 'debutant' | 'intermediaire' | 'avance'
}

export const glossaryData: GlossaryTerm[] = [
  // TECHNIQUE
  {
    id: 'regle-des-tiers',
    term: 'Règle des tiers',
    category: 'composition',
    definition: 'Principe de composition qui divise l\'image en 9 sections égales par 2 lignes horizontales et 2 lignes verticales. Placer les éléments importants sur ces lignes ou leurs intersections crée une composition plus équilibrée et dynamique.',
    example: 'Placer l\'horizon sur la ligne du tiers inférieur pour donner plus d\'importance au ciel.',
    relatedTerms: ['composition', 'cadrage', 'equilibre'],
    level: 'debutant'
  },
  {
    id: 'bokeh',
    term: 'Bokeh',
    category: 'technique',
    definition: 'Qualité esthétique du flou d\'arrière-plan créé par l\'objectif. Un bon bokeh produit un flou doux et agréable, particulièrement visible dans les zones de lumière hors focus qui deviennent des cercles lumineux.',
    example: 'Portrait avec f/1.4 créant un bokeh crémeux derrière le sujet.',
    relatedTerms: ['profondeur-de-champ', 'ouverture', 'mise-au-point'],
    level: 'intermediaire'
  },
  {
    id: 'stop',
    term: 'Stop (exposition)',
    category: 'technique',
    definition: 'Unité de mesure de l\'exposition. +1 stop double la quantité de lumière, -1 stop la divise par deux. Utilisé pour l\'ouverture, la vitesse et l\'ISO.',
    example: 'Corriger une photo sous-exposée en ajoutant +2 stops.',
    relatedTerms: ['exposition', 'ouverture', 'vitesse', 'iso'],
    level: 'intermediaire'
  },
  {
    id: 'focale',
    term: 'Focale',
    category: 'materiel',
    definition: 'Distance entre le centre optique de l\'objectif et le capteur, exprimée en millimètres. Détermine l\'angle de vue : plus la focale est courte, plus l\'angle est large.',
    example: '24mm = grand angle, 50mm = vision naturelle, 200mm = téléobjectif.',
    relatedTerms: ['angle-de-vue', 'grand-angle', 'telephoto', 'compression'],
    level: 'debutant'
  },
  {
    id: 'ouverture',
    term: 'Ouverture (f/)',
    category: 'technique',
    definition: 'Diamètre du diaphragme de l\'objectif qui contrôle la quantité de lumière et la profondeur de champ. Plus le nombre f/ est petit, plus l\'ouverture est grande.',
    example: 'f/1.4 = très ouvert (peu de profondeur), f/8 = fermé (plus de netteté).',
    relatedTerms: ['profondeur-de-champ', 'exposition', 'diaphragme'],
    level: 'debutant'
  },
  {
    id: 'iso',
    term: 'ISO',
    category: 'technique',
    definition: 'Sensibilité du capteur à la lumière. Plus l\'ISO est élevé, plus le capteur est sensible, mais plus le bruit numérique augmente.',
    example: 'ISO 100 = basse sensibilité (plein jour), ISO 3200 = haute sensibilité (faible lumière).',
    relatedTerms: ['bruit', 'exposition', 'capteur'],
    level: 'debutant'
  },
  {
    id: 'vitesse',
    term: 'Vitesse d\'obturation',
    category: 'technique',
    definition: 'Durée pendant laquelle l\'obturateur reste ouvert pour exposer le capteur. Contrôle le mouvement et l\'exposition.',
    example: '1/1000s = fige le mouvement, 1s = flou de mouvement créatif.',
    relatedTerms: ['mouvement', 'exposition', 'obturateur', 'flou'],
    level: 'debutant'
  },
  {
    id: 'profondeur-de-champ',
    term: 'Profondeur de champ',
    category: 'technique',
    definition: 'Zone de netteté acceptable devant et derrière le point de mise au point. Contrôlée par l\'ouverture, la focale et la distance au sujet.',
    example: 'Portrait avec faible profondeur de champ pour détacher le sujet du fond.',
    relatedTerms: ['ouverture', 'bokeh', 'mise-au-point', 'focale'],
    level: 'debutant'
  },
  {
    id: 'balance-des-blancs',
    term: 'Balance des blancs',
    category: 'technique',
    definition: 'Ajustement des couleurs pour compenser la température de couleur de la source lumineuse et obtenir des blancs neutres.',
    example: 'Tungstène (3200K) pour lumière chaude, Daylight (5600K) pour lumière naturelle.',
    relatedTerms: ['temperature-couleur', 'kelvin', 'couleur'],
    level: 'intermediaire'
  },
  {
    id: 'histogramme',
    term: 'Histogramme',
    category: 'technique',
    definition: 'Graphique représentant la distribution des tons dans l\'image, des ombres (gauche) aux hautes lumières (droite). Outil essentiel pour contrôler l\'exposition.',
    example: 'Histogramme décalé à droite = image claire, décalé à gauche = image sombre.',
    relatedTerms: ['exposition', 'tons', 'ombres', 'hautes-lumieres'],
    level: 'intermediaire'
  },
  // COMPOSITION
  {
    id: 'leading-lines',
    term: 'Lignes directrices',
    category: 'composition',
    definition: 'Lignes dans l\'image qui guident l\'œil vers le sujet principal ou un point d\'intérêt. Peuvent être droites, courbes, diagonales.',
    example: 'Route menant vers un paysage, escalier dirigeant vers un personnage.',
    relatedTerms: ['composition', 'perspective', 'dynamisme'],
    level: 'intermediaire'
  },
  {
    id: 'golden-hour',
    term: 'Golden Hour',
    category: 'eclairage',
    definition: 'Période juste après le lever ou avant le coucher du soleil où la lumière est douce, chaude et dorée. Idéale pour les portraits et paysages.',
    example: 'Portrait en extérieur 1 heure avant le coucher du soleil.',
    relatedTerms: ['eclairage-naturel', 'temperature-couleur', 'lumiere-douce'],
    level: 'debutant'
  },
  {
    id: 'zone-system',
    term: 'Zone System',
    category: 'technique',
    definition: 'Système développé par Ansel Adams divisant les tons d\'une image en 11 zones, du noir pur (Zone 0) au blanc pur (Zone X). Permet un contrôle précis de l\'exposition.',
    example: 'Exposer pour placer la peau en Zone VI (gris moyen clair).',
    relatedTerms: ['exposition', 'tons', 'ansel-adams', 'mesure'],
    level: 'avance'
  },
  {
    id: 'compression-spatiale',
    term: 'Compression spatiale',
    category: 'technique',
    definition: 'Effet créé par les téléobjectifs qui "rapproche" visuellement les éléments distants, réduisant la perception de profondeur.',
    example: 'Téléobjectif 200mm faisant paraître la lune énorme derrière un sujet.',
    relatedTerms: ['telephoto', 'perspective', 'focale'],
    level: 'avance'
  },
  {
    id: 'clipping',
    term: 'Clipping',
    category: 'technique',
    definition: 'Perte d\'information dans les tons extrêmes (noir bouché ou blanc brûlé) où les détails deviennent irrecupérables.',
    example: 'Ciel complètement blanc sans texture = clipping des hautes lumières.',
    relatedTerms: ['exposition', 'histogramme', 'dynamique'],
    level: 'intermediaire'
  },
  {
    id: 'dynamique',
    term: 'Plage dynamique',
    category: 'technique',
    definition: 'Écart entre les tons les plus sombres et les plus clairs qu\'un capteur peut enregistrer simultanément.',
    example: 'Capteur avec 14 stops de dynamique capture plus de détails qu\'un capteur 12 stops.',
    relatedTerms: ['capteur', 'exposition', 'tons', 'latitude'],
    level: 'avance'
  },
  // MATÉRIEL
  {
    id: 'grand-angle',
    term: 'Grand angle',
    category: 'materiel',
    definition: 'Objectif avec une focale courte (généralement < 35mm) offrant un champ de vision large. Accentue la perspective et peut créer des déformations.',
    example: '14mm pour paysages, architecture, photos de groupe.',
    relatedTerms: ['focale', 'perspective', 'deformation'],
    level: 'debutant'
  },
  {
    id: 'telephoto',
    term: 'Téléobjectif',
    category: 'materiel',
    definition: 'Objectif avec une focale longue (généralement > 85mm) permettant de photographier des sujets distants avec un champ de vision étroit.',
    example: '200mm pour sport, wildlife, portraits avec compression.',
    relatedTerms: ['focale', 'compression-spatiale', 'portee'],
    level: 'debutant'
  },
  {
    id: 'macro',
    term: 'Macro',
    category: 'materiel',
    definition: 'Photographie rapprochée permettant d\'obtenir un rapport de reproduction 1:1 ou supérieur (sujet aussi grand sur le capteur qu\'en réalité).',
    example: 'Objectif macro 100mm pour insectes, fleurs, détails.',
    relatedTerms: ['rapport-reproduction', 'proxiphoto', 'distance-minimale'],
    level: 'intermediaire'
  },
  // TRAITEMENT
  {
    id: 'raw',
    term: 'RAW',
    category: 'traitement',
    definition: 'Format de fichier non compressé contenant toutes les données brutes du capteur. Permet un traitement non-destructif avec plus de latitude.',
    example: 'Fichier .CR3 (Canon) ou .NEF (Nikon) vs JPEG compressé.',
    relatedTerms: ['post-traitement', 'latitude', 'compression'],
    level: 'intermediaire'
  },
  {
    id: 'hdr',
    term: 'HDR',
    category: 'traitement',
    definition: 'High Dynamic Range - Technique combinant plusieurs expositions pour capturer une plage dynamique étendue impossible en une seule prise.',
    example: 'Paysage avec 3 expositions : ombres, moyens tons, hautes lumières.',
    relatedTerms: ['dynamique', 'bracketing', 'exposition-multiple'],
    level: 'intermediaire'
  },
  {
    id: 'noise',
    term: 'Bruit numérique',
    category: 'technique',
    definition: 'Grain indésirable dans l\'image, particulièrement visible dans les zones sombres. Augmente avec l\'ISO et le sous-exposition.',
    example: 'ISO 6400 en faible lumière produit du bruit chromatique et de luminance.',
    relatedTerms: ['iso', 'capteur', 'reduction-bruit'],
    level: 'intermediaire'
  }
]

// Catégories avec descriptions
export const categories = {
  technique: {
    name: 'Technique',
    description: 'Paramètres d\'exposition, mesure, mise au point',
    icon: '⚙️',
    color: 'neon-cyan'
  },
  composition: {
    name: 'Composition',
    description: 'Règles et principes de cadrage artistique',
    icon: '🎨',
    color: 'neon-pink'
  },
  eclairage: {
    name: 'Éclairage',
    description: 'Lumière naturelle et artificielle',
    icon: '💡',
    color: 'yellow-400'
  },
  materiel: {
    name: 'Matériel',
    description: 'Objectifs, boîtiers, accessoires',
    icon: '📷',
    color: 'green-400'
  },
  traitement: {
    name: 'Traitement',
    description: 'Post-production et développement numérique',
    icon: '🖥️',
    color: 'purple-400'
  }
}

// Fonctions utilitaires
export const getTermsByCategory = (category: string) => 
  glossaryData.filter(term => term.category === category)

export const getTermsByLevel = (level: string) => 
  glossaryData.filter(term => term.level === level)

export const searchTerms = (query: string) => 
  glossaryData.filter(term => 
    term.term.toLowerCase().includes(query.toLowerCase()) ||
    term.definition.toLowerCase().includes(query.toLowerCase())
  )

export const getRelatedTerms = (termId: string) => {
  const term = glossaryData.find(t => t.id === termId)
  if (!term?.relatedTerms) return []
  
  return glossaryData.filter(t => term.relatedTerms!.includes(t.id))
}