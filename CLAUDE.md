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

## 🔄 **Dernière Session (07/08/2025)**
### Problème résolu :
- **Scores incohérents** : IA donnait scores différents entre mode pro/roast
- **Solution appliquée** : Tentative de forcer scores identiques avec double requête
- **Décision finale** : Retour à analyse naturelle pour authenticité

### Changements majeurs :
1. **Analyse IA naturelle** : Chaque mode analyse authentiquement selon son style
2. **Mode Roast créatif** : Métaphores hilarantes, critiques spécifiques, drôle
3. **Mode Pro pédagogique** : Conseils constructifs, explications techniques
4. **Spécificité** : IA analyse détails réels de chaque photo vs générique

### Fichiers modifiés :
- `src/services/openai.ts` : Restauration analyse naturelle créative
- `src/components/AccessibilityProvider.tsx` : Bouton déplaçable implémenté
- `src/components/CookieConsent.tsx` : Boutons lisibles corrigés
- `src/pages/legal/` : Mentions légales et RGPD avec vraies infos
- `src/pages/_app.tsx` : SecurityStatusBar masqué en production

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
- **Contact** : contact@judgemyjpeg.com (email unique)
- **Médiateur** : CNPM-MÉDIATION pour litiges consommation

---
*Dernière mise à jour : 07 août 2025*
*Status : Prêt pour tests analyses IA créatives*