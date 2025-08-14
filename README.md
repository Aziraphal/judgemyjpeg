# JudgeMyJPEG 📸

Une application web avancée qui utilise l'IA OpenAI GPT-4o-mini pour analyser et critiquer vos photos avec précision professionnelle.

## ✨ Fonctionnalités Principales

### 🎭 Analyse IA Multi-Modes
- **👔 Mode Professionnel** : Analyse technique constructive et pédagogique
- **🔥 Mode Cassant** : Critique sarcastique avec métaphores créatives  
- **🎯 Mode Expert** : Analyse ultra-technique niveau photographe professionnel avec références aux maîtres

### 📊 Fonctionnalités Premium
- **📊 Analyse en lot** : Upload jusqu'à 10 photos simultanément avec rapport comparatif intelligent
- **📄 Export PDF** : Rapports professionnels détaillés pour portfolios et clients
- **📱 Générateur Instagram** : Auto-génération de posts avec 4 styles (Minimal, Tips, Storytelling, Pro)
- **🏆 Collections** : Organisez vos meilleures photos dans des albums personnalisés

### 🔧 Outils Professionnels  
- **📈 Dashboard avancé** : Statistiques détaillées et évolution de vos performances
- **💡 Recommandations séparées** : Conseils pour la prochaine prise VS retouche de la photo actuelle
- **🔗 Intégrations** : Liens directs vers Lightroom, Photoshop, Snapseed, GIMP
- **⭐ Système de favoris** : Marquez et retrouvez vos meilleures créations

## 🛠️ Stack Technique

- **Frontend**: Next.js 14 + React + TypeScript (Pages Router)
- **Backend**: Next.js API Routes avec middleware avancé
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (Google OAuth + Email/Password + 2FA)
- **IA**: OpenAI GPT-4o-mini avec prompts spécialisés
- **Paiement**: Stripe (€9.99/mois, €99 lifetime)
- **Storage**: Cloudinary + base64 optimisé
- **Styling**: Tailwind CSS + design glassmorphism "Cosmic Gradient"
- **Export**: jsPDF + html2canvas pour rapports PDF
- **Upload**: react-dropzone avec drag & drop avancé

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

# Démarrer en développement
npm run dev
```

## 🌐 Déploiement

L'application est déployée sur **Railway** :
- ✅ Pas de limite de taille d'image (vs Vercel)
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

## 🆕 Dernières Mises à Jour (Décembre 2024)

- ✅ **Mode Expert IA** : Analyse photographique niveau professionnel
- ✅ **Analyse en lot** : Jusqu'à 10 photos avec rapport comparatif
- ✅ **Export PDF** : Rapports détaillés pour portfolios
- ✅ **Générateur Instagram** : 4 styles de posts automatiques
- ✅ **Recommandations séparées** : Prochaine prise vs retouche actuelle
- ✅ **Animations immersives** : Interface dynamique selon le mode
- ✅ **Build optimisé** : Compilation TypeScript parfaite
