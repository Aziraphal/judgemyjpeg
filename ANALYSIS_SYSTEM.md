# 🎭 Système d'Analyse IA - JudgeMyJPEG

## 📋 Vue d'Ensemble

Le système d'analyse photo utilise **OpenAI GPT-4o-mini** avec des prompts spécialisés pour offrir différents modes d'analyse selon les besoins et l'humeur de l'utilisateur.

## 🎯 Modes d'Analyse Disponibles

### 1. 🔥 **Mode Roast (Cassant)**
**Objectif** : Critique humoristique et sarcastique
- **Ton** : Sarcastique, créatif, drôle mais juste
- **Style** : Métaphores hilarantes, critiques spécifiques
- **Interdictions** : Mots fades ("intéressant", "basique", "pas mal")
- **Obligation** : Faire rire tout en étant constructif

**Exemple de sortie** :
> "Ah, cette photo... elle est cadrée comme un daltonien arrange ses chaussettes ! L'exposition est tellement ratée qu'on dirait que votre appareil a pris peur devant la lumière..."

### 2. 👨‍🎓 **Mode Pro (Professionnel)**  
**Objectif** : Analyse technique et pédagogique
- **Ton** : Constructif, encourageant, expert
- **Style** : Vocabulaire technique, conseils précis
- **Structure** : Points positifs d'abord, puis améliorations
- **Focus** : Apprentissage et progression

**Exemple de sortie** :
> "Excellent travail sur la règle des tiers ! La composition guide naturellement l'œil vers le sujet principal. Pour améliorer cette image, je recommande d'ajuster l'exposition de +0.7 EV et d'augmenter légèrement la saturation des bleus..."

### 3. 🎯 **Mode Expert (Technique Avancé)**
**Objectif** : Analyse ultra-technique pour photographes expérimentés  
- **Ton** : Technique, précis, sans concession
- **Style** : Vocabulaire photographique avancé, données techniques
- **Focus** : Analyse poussée de la technique photographique

## 🛠️ Architecture Technique

### Fichiers Impliqués

```
src/
├── services/
│   └── openai.ts              # Service principal IA
├── components/
│   ├── ToneSelector.tsx       # Sélecteur de mode
│   └── PhotoUpload.tsx        # Upload avec animations par mode
├── pages/
│   └── api/
│       └── analyze.ts         # API endpoint d'analyse
└── types/
    └── analysis.ts            # Types TypeScript
```

### Structure des Prompts

#### **Prompt Système de Base**
```typescript
const systemPrompt = `Tu es un expert en photographie avec 20 ans d'expérience. 
Tu analyses les photos avec expertise et donnes des conseils constructifs.
Tu dois TOUJOURS fournir:
- Une note sur 100 
- Des points d'amélioration spécifiques
- Des conseils techniques précis
- Une analyse de la composition, exposition, couleurs`
```

#### **Prompts Spécifiques par Mode**

**Mode Roast** :
```typescript
const roastPrompt = `${systemPrompt}
IMPORTANT: Adopte un ton sarcastique et humoristique, mais reste constructif.
- Utilise des métaphores créatives et drôles
- Critique avec humour mais justesse  
- INTERDICTION: "intéressant", "basique", "pas mal"
- OBLIGATION: Faire rire tout en aidant à progresser
- Reste respectueux malgré le sarcasme`
```

**Mode Pro** :
```typescript  
const proPrompt = `${systemPrompt}
IMPORTANT: Adopte un ton professionnel et pédagogique.
- Commence TOUJOURS par les points positifs
- Explique le "pourquoi" de tes évaluations
- Donne des conseils techniques précis (Lightroom, Photoshop)
- Utilise un vocabulaire technique approprié
- Encourage la progression`
```

**Mode Expert** :
```typescript
const expertPrompt = `${systemPrompt}
IMPORTANT: Analyse technique ultra-poussée pour photographes expérimentés.
- Vocabulaire photographique avancé
- Analyse technique sans concession
- Données précises sur exposition, composition, post-traitement
- Références aux techniques pros
- Conseils matériel si pertinent`
```

### Langues Supportées

Le système supporte **6 langues** avec adaptation culturelle :

```typescript
type AnalysisLanguage = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt'

const languageInstructions = {
  fr: "Réponds en français avec des références culturelles françaises",
  en: "Respond in English with international photography references", 
  es: "Responde en español con referencias culturales hispanas",
  de: "Antworte auf Deutsch mit europäischen Fotografie-Referenzen",
  it: "Rispondi in italiano con riferimenti alla cultura italiana",
  pt: "Responde em português com referências culturais lusófonas"
}
```

## 🎨 Animations et UX par Mode

### Animations de Loading

**Mode Roast** :
- **Icône** : Couteau 🔪 en rotation (text-5xl)  
- **Effets** : Explosions multiples + feu + éclairs
- **Couleurs** : Rouge/orange (dramatique)
- **Message** : "🔥 Préparation du châtiment..."

**Mode Pro** :
- **Icône** : Engrenages ⚙️ imbriqués (text-4xl)
- **Effets** : Barres de progression + microscope  
- **Couleurs** : Bleu/cyan (sophistiqué)
- **Message** : "⚡ Analyse professionnelle en cours..."

**Mode Expert** :
- **Icône** : Microscope 🔬 avec zoom (text-4xl)
- **Effets** : Grilles d'analyse + données techniques
- **Couleurs** : Violet/magenta (technique)
- **Message** : "🎯 Analyse technique approfondie..."

### Taille des Animations

```css
/* Animations énormes pour expérience immersive */
.analysis-icon {
  height: 5rem;        /* h-20 au lieu de h-8 */
  font-size: 3rem;     /* text-4xl/5xl */
  animation-duration: 2s;
}
```

## ⚙️ Configuration API

### Service OpenAI

```typescript
// src/services/openai.ts
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const ANALYSIS_CONFIG = {
  model: 'gpt-4o-mini',
  max_tokens: 1500,
  temperature: 0.8,    // Créativité pour Mode Roast
  temperature_pro: 0.5  // Plus précis pour Mode Pro
}
```

### Endpoint API

```typescript
// src/pages/api/analyze.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { imageBase64, tone, language = 'fr' } = req.body
  
  // Sélection du prompt selon le mode
  const prompt = buildPromptForTone(tone, language)
  
  // Appel OpenAI avec image + prompt
  const analysis = await analyzePhotoWithAI(imageBase64, prompt)
  
  return res.json(analysis)
}
```

## 📊 Format de Réponse

### Structure JSON Retournée

```typescript
interface AnalysisResult {
  score: number              // Note sur 100
  analysis: string          // Analyse complète  
  strengths: string[]       // Points forts
  improvements: string[]    // Améliorations
  technicalAdvice: string[] // Conseils techniques
  tone: 'roast' | 'pro' | 'expert'
  language: AnalysisLanguage
  processingTime: number    // Temps de traitement
}
```

### Exemple de Réponse Mode Roast

```json
{
  "score": 72,
  "analysis": "Cette photo... elle a du caractère, je vais lui accorder ça ! Malheureusement, elle a aussi une exposition qui fait penser à un vampire qui découvre la lumière du jour pour la première fois. Le cadrage penché donne l'impression que votre trépied a bu avant vous...",
  "strengths": [
    "Sujet intéressant et bien choisi",
    "Couleurs naturelles préservées"
  ],
  "improvements": [
    "Corriger l'exposition (+1.5 EV minimum)",
    "Redresser l'horizon (règle de base !)",
    "Retravailler la composition selon la règle des tiers"
  ],
  "technicalAdvice": [
    "Utiliser le mode priorité ouverture (A/Av)",
    "Activer l'histogramme pour contrôler l'exposition",
    "Utiliser un trépied pour éviter le flou de bougé"
  ],
  "tone": "roast",
  "language": "fr"
}
```

## 🔐 Limitations et Sécurité

### Validation Entrées
- **Taille max** : 10MB par image
- **Formats** : JPG, PNG, WebP uniquement  
- **Résolution** : Redimensionnement automatique pour optimiser l'API
- **Rate limiting** : 5 analyses/minute par utilisateur

### Filtres Contenu
- Détection contenu inapproprié via OpenAI Moderation
- Blocage images NSFW ou violentes
- Logs sécurisés (pas de stockage images)

### Variables d'Environnement

```bash
OPENAI_API_KEY=sk-proj-xxx           # Clé OpenAI  
OPENAI_MODEL=gpt-4o-mini             # Modèle utilisé
ANALYSIS_MAX_TOKENS=1500             # Limite tokens
ANALYSIS_TEMPERATURE=0.8             # Créativité
```

## 🚀 Évolutions Futures Possibles

### Modes Supplémentaires Envisagés
- **Mode Artistique** : Focus sur l'aspect créatif et émotionnel
- **Mode Commercial** : Analyse pour photos produits/marketing
- **Mode Portrait** : Spécialisé portraits/photos de personnes
- **Mode Paysage** : Dédié aux photos de nature/architecture

### Améliorations Techniques
- **Vision multiple** : Analyse de séries de photos
- **Comparaison avant/après** : Suivi progression utilisateur  
- **Suggestions matériel** : Recommandations équipement
- **Export détaillé** : Rapports PDF avec graphiques

---

*Documentation mise à jour : Décembre 2024*  
*Système d'analyse IA fonctionnel et testé en production*