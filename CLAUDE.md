# 📸 JudgeMyJPEG - Contexte Claude

## 🎯 **Projet**
Application d'analyse de photos par IA avec Gemini, design "Cosmic Gradient", système freemium Stripe.

## 🏗️ **Stack Technique**
- **Frontend** : Next.js 14 + TypeScript (Pages Router)
- **Database** : PostgreSQL + Prisma ORM
- **Auth** : NextAuth.js (Google OAuth + Email/Password)
- **AI** : Gemini AI pour analyse photos
- **Paiement** : Stripe (€9.99/mois, €99 lifetime)
- **Storage** : Cloudinary
- **Style** : Tailwind CSS + design glassmorphism

## 📁 **Structure Importante**
```
src/
├── pages/               # Pages principales
├── components/          # Composants React
├── services/gemini.ts   # Service IA (CRITIQUE - score consistency fix)
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

## 🚨 **Points Critiques**
1. **Score Consistency** : Bug majeur corrigé dans gemini.ts (même score Pro/Cassant)
2. **Stripe Keys** : À régénérer avant production
3. **TypeScript Build** : Erreurs à corriger pour build prod
4. **Console.log** : Remplacés par logger sécurisé

## 📊 **État Actuel**
- ✅ Développement : 95% terminé
- ✅ Sécurité : Auditée et corrigée
- ✅ Responsive : Optimisé
- ⏳ Performance : Build à corriger
- ⏳ Production : Prêt (après fix TypeScript)

## 🔄 **Dernière Session**
- Analyse responsive design complète
- Corrections appliquées (pricing, dashboard, typography)
- Score final : 95% - Excellent responsive
- Prochaine étape : Optimisation bundle + fix build TypeScript

---
*Dernière mise à jour : 2025-01-20*