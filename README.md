# JudgeMyJPEG 📸

Une application web avancée qui utilise l'IA OpenAI GPT-4o-mini pour analyser et critiquer vos photos avec précision professionnelle.

## ✨ Fonctionnalités Principales

### 🎭 Analyse IA Multi-Modes
- **👔 Mode Professionnel** : Analyse technique constructive et pédagogique
- **🔥 Mode Cassant** : Critique sarcastique avec métaphores créatives  
- **🎯 Mode Expert** : Analyse ultra-technique niveau photographe professionnel avec références aux maîtres

### 📊 Fonctionnalités Premium
- **📊 Analyse en lot** : Upload jusqu'à 10 photos simultanément avec rapport comparatif intelligent *(temporairement désactivé)*
- **📄 Export PDF** : Rapports professionnels détaillés pour portfolios et clients
- **📱 Générateur Instagram** : Auto-génération de posts avec 4 styles (Minimal, Tips, Storytelling, Pro)
- **🏆 Collections** : Organisez vos meilleures photos dans des albums personnalisés

### 🎓 **Expérience Utilisateur Avancée** *(Nouveau)*
- **🎯 Tutorial interactif** : Guide pas-à-pas pour les nouveaux utilisateurs
- **💡 Tooltips intelligentes** : Aide contextuelle avec positionnement automatique
- **📚 Progressive disclosure** : Interface adaptée selon votre niveau (débutant → expert)
- **⚡ Cache Redis** : Analyses ultra-rapides avec mise en cache intelligente

### 🔧 Outils Professionnels  
- **📈 Dashboard avancé** : Statistiques détaillées et évolution de vos performances
- **💡 Recommandations séparées** : Conseils pour la prochaine prise VS retouche de la photo actuelle
- **🔗 Intégrations** : Liens directs vers Lightroom, Photoshop, Snapseed, GIMP
- **⭐ Système de favoris** : Marquez et retrouvez vos meilleures créations

## 🛠️ Stack Technique

- **Frontend**: Next.js 14 + React + TypeScript (Pages Router)
- **Backend**: Next.js API Routes avec middleware avancé
- **Database**: PostgreSQL + Prisma ORM (avec UserPreferences)
- **Auth**: NextAuth.js (Google OAuth + Email/Password + 2FA)
- **IA**: OpenAI GPT-4o-mini avec prompts spécialisés
- **Paiement**: Stripe (€9.99/mois, €99 lifetime)
- **Storage**: Cloudinary + base64 optimisé
- **Cache**: Redis avec fallback mémoire + IndexedDB client
- **Styling**: Tailwind CSS + design glassmorphism "Cosmic Gradient"
- **Export**: jsPDF + html2canvas pour rapports PDF
- **Upload**: react-dropzone avec drag & drop avancé
- **UX**: Tutorial interactif + tooltips contextuelles
- **Offline**: Service Worker avec stratégies de cache multiples
- **Déploiement**: Railway (migration depuis Vercel)

## 🚀 Installation et Configuration

```bash
# Cloner le repo
git clone https://github.com/Aziraphal/judgemyjpeg.git
cd judgemyjpeg

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Remplir OPENAI_API_KEY, DATABASE_URL, NEXTAUTH_SECRET, etc.

# Générer le client Prisma
npx prisma generate

# Démarrer en développement (port 3005 - JAMAIS 3000)
npm run dev
```

### ⚠️ **IMPORTANT - Configuration Ports**
- **✅ Port autorisé** : 3005 (configuré dans next.config.js)
- **❌ Port INTERDIT** : 3000 (conflits avec d'autres services)
- **🔧 Modification port** : Via `next.config.js` ou variable d'environnement `PORT=3005`

## 🌐 Déploiement

L'application est déployée sur **Railway** :
- ✅ Pas de limite de taille d'image
- ✅ Auto-déploiement depuis GitHub
- ✅ PostgreSQL intégré
- ✅ Variables d'environnement sécurisées

## 📁 Structure du Projet

```
src/
├── components/           # Composants React réutilisables
│   ├── InstagramGenerator.tsx   # Génération posts Instagram
│   ├── PhotoUpload.tsx          # Upload avec animations
│   ├── AnalysisResult.tsx       # Affichage résultats
│   └── ToneSelector.tsx         # Sélection mode IA
├── pages/               # Pages Next.js + API routes
│   ├── batch.tsx        # Analyse en lot (premium)
│   ├── analyze.tsx      # Analyse simple
│   ├── dashboard.tsx    # Statistiques utilisateur
│   └── api/
│       ├── batch-analyze.ts     # API analyse lot
│       └── auth/[...nextauth].ts # Auth NextAuth
├── services/            # Services externes
│   ├── openai.ts        # Service IA avec 3 modes
│   ├── pdf-export.ts    # Génération rapports PDF
│   └── instagram-generator.ts   # Auto-posts Instagram
├── lib/                 # Utilitaires et configuration
│   ├── rate-limit.ts    # Rate limiting API
│   └── auth-middleware.ts # Middleware auth centralisé
└── hooks/               # Custom hooks React
```

## 🎯 Workflow Premium Complet

1. **📸 Upload** → Glisser-déposer jusqu'à 10 photos
2. **🤖 Analyse** → IA traite simultanément avec mode Expert
3. **📊 Rapport** → Comparaison intelligente + recommandations
4. **📄 Export** → PDF professionnel pour clients
5. **📱 Social** → Posts Instagram générés automatiquement

## 🔐 Sécurité et Performance

- **Rate limiting** : Protection API contre les abus
- **CORS configuré** : Sécurité cross-origin
- **Headers sécurisés** : CSP, XSS protection
- **Validation stricte** : Types TypeScript + Prisma
- **Logs sécurisés** : Masquage des données sensibles
- **Session management** : Gestion sessions avancée

## 🆕 Dernières Mises à Jour (Session 18 Août 2025)

### 💬 **Système de Feedback Intégré (NOUVEAU)**
- ✅ **FeedbackModal** : Interface utilisateur complète avec 5 types de feedback
- ✅ **API sécurisée** : `/api/feedback/submit` avec rate limiting (5/heure)
- ✅ **Base de données** : Modèle Prisma Feedback avec métadonnées techniques
- ✅ **Bouton flottant** : Widget 💬 présent sur toutes les pages (sauf admin/auth)
- ✅ **Admin dashboard** : Gestion complète des feedbacks avec statuts et filtres
- ✅ **Types de feedback** : ❤️ J'adore, 🐛 Bug, 💡 Idée, 😕 Confus, 💬 Autre
- ✅ **Anonyme supporté** : Pas besoin de compte pour donner son avis

### 🔧 **Masquage Plugin Lightroom (NOUVEAU)**
- ✅ **Plugin désactivé** : Références supprimées du site (page d'accueil + footer)
- ✅ **Fichiers préservés** : Code plugin gardé en `.disabled` pour future maj
- ✅ **Focus produit** : Concentration sur les features stables et opérationnelles
- ✅ **UX simplifiée** : Suppression des éléments non-finalisés

### 📊 **Audit Complet Application (NOUVEAU)**
- ✅ **Structure analysée** : 163 fichiers TypeScript bien organisés
- ✅ **Sécurité auditée** : Rate limiting, 2FA, headers CSP, audit trail complet
- ✅ **Performance validée** : Build 0 erreur, code splitting optimisé, PWA
- ✅ **RGPD conforme** : Mentions légales, politique confidentialité, cookies
- ✅ **Qualité code** : TypeScript strict, patterns cohérents, monitoring Sentry
- ✅ **Score global** : 9.5/10 - Production ready

## 🆕 Dernières Mises à Jour (Décembre 2024)

### 📈 **Performance & UX (Ajout récent)**
- ✅ **Cache Redis** : Service de cache avec fallback mémoire pour les analyses
- ✅ **Tutorial interactif** : Système de guided tour pour nouveaux utilisateurs
- ✅ **Tooltips contextuelles** : Aide intelligente avec positionnement automatique
- ✅ **Progressive disclosure** : Interface adaptée au niveau utilisateur (débutant/expert)
- ✅ **Lazy loading optimisé** : Chargement intelligent des images avec intersection observer
- ✅ **Service Worker** : Expérience offline avec stratégies de cache multiples
- ✅ **IndexedDB** : Queue offline et cache client-side

### 🗃️ **Données & Préférences (Ajout récent)**
- ✅ **UserPreferences** : Modèle Prisma pour persistance des préférences
- ✅ **Display name** : Noms d'affichage persistants entre sessions
- ✅ **Session callbacks** : Rechargement automatique des données utilisateur
- ✅ **Admin panel** : Interface d'administration avec authentification sécurisée

### 🧹 **Optimisation & Nettoyage (Ajout récent)**
- ✅ **Suppression Vercel** : Migration complète vers Railway
- ✅ **Code cleanup** : Suppression fichiers doublons et dépendances inutiles
- ✅ **Analyse en lot** : Temporairement désactivée (future MAJ)
- ✅ **Port 3005** : Évitement des conflits de port (JAMAIS 3000)

### 🔧 **Fonctionnalités Existantes**
- ✅ **Mode Expert IA** : Analyse photographique niveau professionnel
- ✅ **Export PDF** : Rapports détaillés pour portfolios  
- ✅ **Générateur Instagram** : 4 styles de posts automatiques
- ✅ **Recommandations séparées** : Prochaine prise vs retouche actuelle
- ✅ **Animations immersives** : Interface dynamique selon le mode
- ✅ **Build optimisé** : Compilation TypeScript parfaite

## 🚧 Idées en Discussion / Non Abouties

### 💰 **Optimisation Pricing (En Discussion)**
- 💭 **Plan Starter** : 4,99€/mois pour 10 analyses (récurrent)
- 💭 **Plan Annuel** : 79€/an (Premium avec -33%)
- 💭 **Lifetime ajusté** : 149€ avec promos à 99€ pour urgence
- 💭 **Progression** : 3 → 10 → ∞ analyses (escalade naturelle)
- 💭 **Justification** : Gap trop important 0€ → 9,98€, manque option intermédiaire

### 🔧 **Migration Sentry (Dispensable)**
- 💭 **Instrumentation.ts** : Migration vers nouvelle architecture Next.js
- 💭 **Statut** : Warnings deprecation mais fonctionnel
- 💭 **Priorité** : Faible, cosmétique uniquement
- 💭 **Report** : Prochaine grosse MAJ

### 📸 **Plugin Lightroom (Future MAJ)**
- 💭 **Réactivation** : Quand technologie plus mature
- 💭 **Code préservé** : Tous fichiers en `.disabled`
- 💭 **Alternative** : API directe ou bridge différent
- 💭 **Timing** : Pas avant 6-12 mois

### 🚀 **Améliorations Performance (Backlog)**
- 💭 **Bundle optimization** : Réduire strings 191kiB + 139kiB
- 💭 **Lighthouse CI** : Configuration tests automatisés
- 💭 **Image optimization** : WebP/AVIF plus agressif
- 💭 **Code splitting** : Lazy loading composants lourds

### 🤖 **IA Avancée (R&D)**
- 💭 **Mode Batch intelligent** : Réactivation avec UI repensée
- 💭 **Analyse comparative** : Photos similaires auto-détectées
- 💭 **Suggestions contextuelles** : Basées sur style/genre photo
- 💭 **Learning utilisateur** : IA s'adapte aux préférences

### 📊 **Analytics & Insights (Future)**
- 💭 **Heatmaps utilisateur** : Zones de clic/scroll
- 💭 **A/B testing** : Optimisation conversion pricing
- 💭 **Retention analysis** : Pourquoi les users partent
- 💭 **Feature usage** : Quelles fonctions sont utilisées
