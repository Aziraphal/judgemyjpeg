# 📸 JudgeMyJPEG - Contexte Claude

## 🎯 **Projet**
Application d'analyse de photos par IA avec OpenAI GPT-4o-mini, design "Cosmic Gradient", système freemium Stripe.

## 🏗️ **Stack Technique**
- **Frontend** : Next.js 14 + TypeScript (Pages Router)
- **Database** : PostgreSQL + Prisma ORM
- **Auth** : NextAuth.js (Google OAuth + Email/Password)
- **AI** : OpenAI GPT-4o-mini pour analyse photos
- **Paiement** : Stripe (€9.99/mois, €99 lifetime)
- **Storage** : Cloudinary
- **Style** : Tailwind CSS + design glassmorphism

## 📁 **Structure Importante**
```
src/
├── pages/               # Pages principales
├── components/          # Composants React
├── services/openai.ts   # Service IA (CRITIQUE - analyse créative)
├── lib/
│   ├── auth-middleware.ts  # Auth centralisé
│   ├── logger.ts          # Logs sécurisés
│   └── stripe.ts          # Config Stripe
└── middleware.ts        # Rate limiting
```

## ⚡ **Commandes Essentielles**
```bash
# Développement
npm run dev              # Port 3005 (généralement)

# Base de données
npx prisma generate      # Après changements schema
npx prisma db push       # Sync DB

# Tests et build
npm run build           # Build production
npm run lint            # ESLint (désactivé en build)
```

## 🔐 **Sécurité Appliquée**
- ✅ Rate limiting (5 analyses/min)
- ✅ Auth middleware centralisé
- ✅ Logs sécurisés (masquage secrets)
- ✅ Validation fichiers binaires
- ✅ Headers sécurité (CSP, XSS, etc.)

## 🎨 **Features Implémentées**
- ✅ Dual AI personalities (Pro/Cassant)
- ✅ Analyses multilingues (6 langues)
- ✅ Dashboard avec stats
- ✅ Collections personnalisées
- ✅ Top Photos (score ≥85)
- ✅ Partage social avec images
- ✅ Système freemium complet
- ✅ Responsive design optimisé
- ✅ Accessibilité WCAG 2.1 AA complète
- ✅ PWA avec offline support
- ✅ FAQ interactive et complète
- ✅ Conformité RGPD totale

## 🚨 **Points Critiques Récents**
1. **IA Analysis** : Passage de Gemini vers OpenAI GPT-4o-mini avec analyses créatives
2. **Roast Mode** : Ton sarcastique et créatif avec métaphores hilarantes
3. **Mode Pro** : Analyses pédagogiques constructives avec conseils précis
4. **UX 2025** : Bouton accessibilité déplaçable, cookie consent lisible
5. **Legal Compliance** : Mentions légales et RGPD avec vraies infos business

## 📊 **État Actuel**
- ✅ Développement : 98% terminé
- ✅ Sécurité : Auditée et corrigée
- ✅ Responsive : Optimisé (95% score)
- ✅ Accessibilité : WCAG 2.1 AA compliant
- ✅ Legal : RGPD + mentions légales complètes
- ⏳ Performance : Build TypeScript à corriger

## 🔄 **Session 14/08/2025 - Améliorations UX Majeures**
### 🎭 Animations spectaculaires implémentées :
- **Mode Roast** : Couteau 🔪 5xl + explosions multiples + feu + éclairs (dramatique)
- **Mode Pro** : Engrenages ⚙️ 4xl imbriqués + barres progression + microscope (sophistiqué)
- **Taille énorme** : h-20 au lieu de h-8, text-4xl/5xl, expérience immersive

### 📁 Système collections finalisé :
- **Bug critique résolu** : CreateCollectionModal n'était pas intégré dans AddToCollectionModal
- **Top Photos** : Boutons collections ajoutés dans gallery.tsx
- **Workflow complet** : Analyser → Ajouter à collection → Créer collection → Photo sauvée
- **UX cohérente** : Même style que le reste de l'app

### 🧹 Suppression logs techniques :
- **✖️ FINI** : "[16:30:43] 📁 Fichier détecté: 4.82MB, image/jpeg"
- **✖️ FINI** : Tous les addDebugInfo() visibles remplacés par console.log()
- **✔️ Messages intégrés** : "🔥 Préparation du châtiment" / "⚡ Analyse en cours"
- **Interface pure** : Plus de distractions techniques pendant l'analyse

### 🔐 Sécurité renforcée :
- **GitGuardian alert** : Fichier suspect "C\357\200\272photo-judge-appsrcservicesopenai.ts" supprimé
- **Git history cleaned** : git filter-branch pour nettoyer l'historique
- **.gitignore amélioré** : Protection secrets + fichiers temporaires Claude

### 🚀 Déploiement Railway :
- **Projet déplacé** : judgemyjpeg maintenant sur le bureau pour accès facile
- **Push automatique** : 6 commits successifs (animations, collections, sécurité, fixes)
- **Build corrigé** : Erreurs TypeScript résolues (scope variables)

### Fichiers modifiés principales :
- `src/components/PhotoUpload.tsx` : Animations énormes + suppression logs
- `src/pages/gallery.tsx` : Boutons collections intégrés  
- `src/components/AddToCollectionModal.tsx` : Intégration CreateCollectionModal
- `.gitignore` : Protection renforcée secrets
- `README.md` : Mise à jour Railway + OpenAI o3 mini

## 🔄 **Session précédente (07/08/2025)**
### Analyse IA naturelle créative :
- Mode Roast : Métaphores hilarantes, critiques spécifiques
- Mode Pro : Conseils constructifs, explications techniques
- Spécificité : IA analyse détails réels vs générique

## 🎯 **Philosophie Design IA**
### Mode Roast 🔥
- Créatif, drôle, sarcastique mais juste
- Métaphores hilarantes ("cadré comme un daltonien arrange ses chaussettes")
- Analyse spécifique aux détails de chaque photo
- Interdiction mots fades : "intéressant", "basique"
- Obligation d'être créatif et de faire rire

### Mode Professionnel 👨‍🎓
- Pédagogique, constructif, encourageant
- Conseils techniques précis (Lightroom, Photoshop)
- Explique le "pourquoi" des évaluations
- Commence par les points positifs
- Solutions concrètes aux problèmes identifiés

## 🔧 **Next Steps Possibles**
- Fix build TypeScript pour production
- Tests utilisateurs des nouvelles analyses IA
- Optimisation bundle size
- Monitoring performance en prod

## 📝 **Informations Business**
- **Propriétaire** : Cyril Paquier (CodeCraft Plus)
- **SIRET** : 98958739900019
- **Adresse** : 9 Allée de la Meilleraie, 85340 Les Sables-d'Olonne
- **Contact** : contact.judgemyjpeg@gmail.com (email unique)
- **Médiateur** : CNPM-MÉDIATION pour litiges consommation

---
*Dernière mise à jour : 14 août 2025*
*Status : UX transformée - Animations spectaculaires + Collections fonctionnelles + Logs cachés*