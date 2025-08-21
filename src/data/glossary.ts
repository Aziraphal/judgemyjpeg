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
    definition: 'Diviser ton image en 9 cases (3x3). Place ton sujet ou l\'horizon sur ces lignes → ta photo paraît plus équilibrée.',
    example: 'Mettre l\'horizon sur la ligne du bas pour donner plus de place au ciel.',
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
    definition: 'Un "cran" de lumière. +1 stop = 2× plus lumineux. -1 stop = 2× plus sombre.',
    example: 'Passer de 1/500s à 1/250s double la lumière (donc +1 stop).',
    relatedTerms: ['exposition', 'ouverture', 'vitesse', 'iso'],
    level: 'intermediaire'
  },
  {
    id: 'focale',
    term: 'Focale',
    category: 'materiel',
    definition: 'C\'est la distance (en mm) qui détermine ton champ de vision.',
    example: '24mm = grand angle (large), 50mm = comme l\'œil, 200mm = zoom.',
    relatedTerms: ['angle-de-vue', 'grand-angle', 'telephoto', 'compression'],
    level: 'debutant'
  },
  {
    id: 'ouverture',
    term: 'Ouverture (f/)',
    category: 'technique',
    definition: 'C\'est l\'ouverture du diaphragme de ton objectif. Plus le chiffre f est petit, plus ça laisse entrer de lumière et floute l\'arrière-plan.',
    example: 'f/1.8 → arrière-plan flou, f/8 → photo nette partout.',
    relatedTerms: ['profondeur-de-champ', 'exposition', 'diaphragme'],
    level: 'debutant'
  },
  {
    id: 'iso',
    term: 'ISO',
    category: 'technique',
    definition: 'C\'est la sensibilité du capteur à la lumière. Haut ISO = plus lumineux mais plus de grain.',
    example: 'ISO 100 en plein jour, ISO 3200 dans une salle sombre.',
    relatedTerms: ['bruit', 'exposition', 'capteur'],
    level: 'debutant'
  },
  {
    id: 'vitesse',
    term: 'Vitesse d\'obturation',
    category: 'technique',
    definition: 'C\'est le temps où ton appareil capte la lumière. Court = figer le mouvement. Long = montrer le mouvement.',
    example: '1/1000s fige un sportif, 1s rend l\'eau d\'une cascade fluide.',
    relatedTerms: ['mouvement', 'exposition', 'obturateur', 'flou'],
    level: 'debutant'
  },
  {
    id: 'profondeur-de-champ',
    term: 'Profondeur de champ',
    category: 'technique',
    definition: 'C\'est la zone nette autour de ton sujet. Dépend de l\'ouverture, de la focale et de la distance.',
    example: 'Portrait à f/2.0 → sujet net, fond flou.',
    relatedTerms: ['ouverture', 'bokeh', 'mise-au-point', 'focale'],
    level: 'debutant'
  },
  {
    id: 'balance-des-blancs',
    term: 'Balance des blancs',
    category: 'technique',
    definition: 'Ajuste les couleurs selon la lumière ambiante pour que le blanc reste vraiment blanc.',
    example: 'En intérieur jaune → régler sur "Tungstène" corrige la teinte orange.',
    relatedTerms: ['temperature-couleur', 'kelvin', 'couleur'],
    level: 'intermediaire'
  },
  {
    id: 'histogramme',
    term: 'Histogramme',
    category: 'technique',
    definition: 'Graphique qui montre si ta photo est trop sombre ou trop claire.',
    example: 'Collé à gauche = photo sombre, collé à droite = photo cramée.',
    relatedTerms: ['exposition', 'tons', 'ombres', 'hautes-lumieres'],
    level: 'intermediaire'
  },
  // COMPOSITION
  {
    id: 'leading-lines',
    term: 'Lignes directrices',
    category: 'composition',
    definition: 'Ce sont les lignes naturelles (routes, escaliers, rivières) qui guident l\'œil vers ton sujet.',
    example: 'Une route qui mène l\'œil vers une montagne au fond.',
    relatedTerms: ['composition', 'perspective', 'dynamisme'],
    level: 'intermediaire'
  },
  {
    id: 'golden-hour',
    term: 'Golden Hour',
    category: 'eclairage',
    definition: 'L\'heure magique : juste après le lever ou avant le coucher du soleil. La lumière est douce, dorée et flatteuse.',
    example: 'Portrait au coucher du soleil → lumière chaude et agréable.',
    relatedTerms: ['eclairage-naturel', 'temperature-couleur', 'lumiere-douce'],
    level: 'debutant'
  },
  {
    id: 'zone-system',
    term: 'Zone System',
    category: 'technique',
    definition: 'Méthode historique d\'Ansel Adams qui divise la photo en 11 zones de luminosité (du noir au blanc) pour contrôler l\'exposition. En gros : c\'est une "règle du jeu" avancée pour gérer parfaitement la lumière.',
    example: 'Placer la peau en Zone VI pour un rendu réaliste.',
    relatedTerms: ['exposition', 'tons', 'ansel-adams', 'mesure'],
    level: 'avance'
  },
  {
    id: 'compression-spatiale',
    term: 'Compression spatiale',
    category: 'technique',
    definition: 'Effet d\'un téléobjectif qui fait paraître les objets plus proches les uns des autres. En gros : c\'est une illusion de profondeur réduite.',
    example: 'La lune paraît énorme derrière une personne photographiée au 200mm.',
    relatedTerms: ['telephoto', 'perspective', 'focale'],
    level: 'avance'
  },
  {
    id: 'clipping',
    term: 'Clipping',
    category: 'technique',
    definition: 'Quand une zone est tellement sombre ou claire qu\'elle perd tout détail.',
    example: 'Ciel complètement blanc sans nuages visibles = clipping.',
    relatedTerms: ['exposition', 'histogramme', 'dynamique'],
    level: 'intermediaire'
  },
  {
    id: 'dynamique',
    term: 'Plage dynamique',
    category: 'technique',
    definition: 'L\'écart entre le noir le plus sombre et le blanc le plus clair que ton appareil peut enregistrer. En gros : plus la plage est large, plus tu récupères d\'infos.',
    example: 'Un capteur avec 14 stops de dynamique capte plus de détails qu\'un capteur à 12.',
    relatedTerms: ['capteur', 'exposition', 'tons', 'latitude'],
    level: 'avance'
  },
  // MATÉRIEL
  {
    id: 'grand-angle',
    term: 'Grand angle',
    category: 'materiel',
    definition: 'Objectif court (ex. 14–24mm) qui montre une grande partie de la scène, mais déforme un peu.',
    example: 'Idéal pour paysage ou architecture.',
    relatedTerms: ['focale', 'perspective', 'deformation'],
    level: 'debutant'
  },
  {
    id: 'telephoto',
    term: 'Téléobjectif',
    category: 'materiel',
    definition: 'Objectif long (ex. 85–200mm+) qui rapproche les sujets lointains et compresse les distances.',
    example: 'Photos de sport, d\'animaux ou portraits serrés.',
    relatedTerms: ['focale', 'compression-spatiale', 'portee'],
    level: 'debutant'
  },
  {
    id: 'macro',
    term: 'Macro',
    category: 'materiel',
    definition: 'Photo très rapprochée qui rend les petits sujets énormes dans l\'image (rapport 1:1).',
    example: 'Insectes, fleurs, textures.',
    relatedTerms: ['rapport-reproduction', 'proxiphoto', 'distance-minimale'],
    level: 'intermediaire'
  },
  // TRAITEMENT
  {
    id: 'raw',
    term: 'RAW',
    category: 'traitement',
    definition: 'Fichier brut qui contient toutes les infos du capteur, contrairement au JPEG compressé.',
    example: 'Un RAW te permet de récupérer une photo trop sombre.',
    relatedTerms: ['post-traitement', 'latitude', 'compression'],
    level: 'intermediaire'
  },
  {
    id: 'hdr',
    term: 'HDR',
    category: 'traitement',
    definition: 'Technique qui combine plusieurs photos à expositions différentes pour capturer tous les détails (ombres + hautes lumières).',
    example: 'Paysage avec ciel et sol détaillés sans zone noire ou cramée.',
    relatedTerms: ['dynamique', 'bracketing', 'exposition-multiple'],
    level: 'intermediaire'
  },
  {
    id: 'noise',
    term: 'Bruit numérique',
    category: 'technique',
    definition: 'Grain indésirable qui apparaît quand on monte trop l\'ISO ou qu\'on manque de lumière.',
    example: 'Photo sombre à ISO 6400 → beaucoup de petits points colorés.',
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