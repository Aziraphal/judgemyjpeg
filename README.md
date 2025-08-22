# 📸 JudgeMyJPEG - AI Photo Analysis SaaS

<div align="center">

![JudgeMyJPEG Logo](https://res.cloudinary.com/judgemyjpeg/image/upload/v1729082345/logo-cosmic.png)

**L'IA qui analyse vos photos avec expertise et créativité**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-judgemyjpeg.fr-FF006E?style=for-the-badge)](https://www.judgemyjpeg.fr)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-success?style=for-the-badge)](https://github.com/Aziraphal/judgemyjpeg)
[![Made with Next.js](https://img.shields.io/badge/Made_with-Next.js_14-000000?style=for-the-badge&logo=next.js)](https://nextjs.org)

</div>

---

## 🎯 **Qu'est-ce que JudgeMyJPEG ?**

**JudgeMyJPEG** est une application SaaS révolutionnaire qui utilise l'IA (OpenAI GPT-4o-mini) pour analyser vos photos avec **3 personnalités distinctes** :

### 🎭 **3 Modes d'Analyse Uniques**

| Mode | Description | Exemple |
|------|-------------|---------|
| 🔥 **Roast** | Critiques hilarantes et créatives | *"Cette exposition ressemble à un vampire qui a peur de la lumière..."* |
| 👨‍🎓 **Pro** | Conseils techniques constructifs | *"Ajustez les ombres à +30 dans Lightroom pour plus de détails"* |
| ⚡ **Expert** | Analyse ultra-technique professionnelle | *"Compression spatiale d'un 85mm à f/1.4, falloff naturel, zone système VII-VIII"* |

---

## 🚀 **Démo Live & Fonctionnalités**

### 🌐 **[Essayez maintenant →](https://www.judgemyjpeg.fr)**

**3 analyses gratuites par mois** - Aucune carte de crédit requise

### ✨ **Fonctionnalités Principales**

- **🎯 Analyse technique précise** : Composition, exposition, lumière, créativité
- **📊 Scores détaillés** sur 100 points avec breakdown par critère
- **🌍 Support multilingue** : Français, Anglais, Espagnol, Italien, Allemand, Portugais
- **📸 Types spécialisés** : Portrait, Paysage, Street, Macro, Architecture
- **📱 Responsive design** avec support mobile complet
- **🔄 Collections** personnalisées et partage social
- **💾 Export PDF/JPEG** des analyses avec branding
- **🏆 Galerie Top Photos** (scores ≥85)
- **📈 Dashboard** avec statistiques personnelles

---

## 🏗️ **Architecture Technique**

### **Stack Technology**

```bash
Frontend     │ Next.js 14 + TypeScript + Tailwind CSS
Backend      │ Next.js API Routes + Prisma ORM  
Database     │ PostgreSQL (Railway)
AI Engine    │ OpenAI GPT-4o-mini
Auth         │ NextAuth.js (Google OAuth + Email/Password)
Payments     │ Stripe (€9.99/mois, €99 lifetime)
Storage      │ Cloudinary (images + CDN)
Monitoring   │ Sentry + Google Analytics 4
Deployment   │ Railway (CI/CD automatisé)
```

### **🔧 Architecture**

```
src/
├── 📁 pages/               # Pages Next.js (App Router)
│   ├── api/               # API Routes (auth, stripe, photos)
│   ├── auth/              # Authentication pages
│   └── [routes]/          # App pages
├── 📁 components/         # React Components
│   ├── ui/               # Design system components
│   ├── modals/           # Modal components
│   └── forms/            # Form components
├── 📁 services/          # Business logic
│   ├── openai.ts         # IA analysis engine
│   ├── subscription.ts   # Subscription management
│   └── cloudinary.ts     # Image processing
├── 📁 lib/               # Utilities & configurations
│   ├── auth-middleware.ts # Authentication logic
│   ├── stripe.ts         # Payment processing
│   ├── gtag.ts           # Analytics tracking
│   └── logger.ts         # Secure logging
└── 📁 types/             # TypeScript definitions
```

---

## 🛡️ **Sécurité & Performance**

### **Sécurité Exemplaire**

- ✅ **Headers sécurisés** : CSP, XSS Protection, HSTS
- ✅ **Rate limiting** intelligent par endpoint (5 analyses/min)
- ✅ **Authentification 2FA** disponible
- ✅ **Chiffrement** des données sensibles
- ✅ **Audit logs** des sessions suspectes
- ✅ **RGPD compliant** avec export de données

### **Performance Optimisée**

- ✅ **Bundle size** optimisé avec code splitting
- ✅ **Images** WebP/AVIF + CDN Cloudinary
- ✅ **Caching** stratégique et sessions sécurisées
- ✅ **PWA** avec support offline
- ✅ **Lighthouse score** : 98/100

### **Monitoring & Observabilité**

- ✅ **Sentry** error tracking (client + serveur)
- ✅ **Google Analytics 4** + conversion tracking
- ✅ **Health checks** (`/api/health` + `/api/ping`)
- ✅ **Logs structurés** avec masquage des secrets
- ✅ **UptimeRobot** monitoring 24/7

---

## 💰 **Business Model**

### **Freemium Équilibré**

| Plan | Prix | Fonctionnalités |
|------|------|-----------------|
| **Gratuit** | 0€ | 3 analyses/mois, tous les modes |
| **Starter Pack** | 4,99€ | 10 analyses + 3 exports + 3 partages |
| **Premium** | 9,99€/mois | Analyses illimitées + toutes fonctionnalités |
| **Lifetime** | 99€ | Accès à vie (early birds) |

### **📊 Métriques Trackées**

- **Conversion rate** Free → Paid
- **Engagement** : Analyses par utilisateur
- **Retention** D7/D30
- **Churn rate** et Customer LTV
- **Acquisition** par canal marketing

---

## 🚦 **Installation & Développement**

### **Prerequisites**

```bash
Node.js ≥ 18.0.0
PostgreSQL ≥ 13
npm ou yarn
```

### **Installation**

```bash
# Clone le repository
git clone https://github.com/Aziraphal/judgemyjpeg.git
cd judgemyjpeg

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Remplir .env.local avec vos clés API

# Setup database
npx prisma generate
npx prisma db push

# Start development
npm run dev
```

### **🔧 Variables d'Environnement**

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3008"
NEXTAUTH_SECRET="your-secret"

# OpenAI
OPENAI_API_KEY="sk-proj-..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
GA_API_SECRET="your-ga-secret"

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="https://..."
```

### **📋 Scripts Disponibles**

```bash
npm run dev          # Développement (port 3008)
npm run build        # Build production
npm run start        # Start production
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm run load-test    # Test de charge avec autocannon
```

---

## 📈 **Roadmap & Features**

### **✅ Implémenté**

- [x] 3 modes d'analyse IA (Roast/Pro/Expert)
- [x] Support multilingue (6 langues)
- [x] Types de photographie spécialisés
- [x] Collections personnalisées
- [x] Partage social optimisé
- [x] Dashboard avec analytics
- [x] Système freemium complet
- [x] RGPD compliance totale
- [x] PWA avec offline support
- [x] Monitoring & observabilité

### **🔄 En Cours**

- [ ] Plugin Lightroom Classic
- [ ] API publique pour développeurs
- [ ] Analyses batch avancées
- [ ] Mobile app (React Native)

### **🎯 Futur (Q1 2025)**

- [ ] Intégration Adobe Photoshop
- [ ] Marketplace de presets
- [ ] Community features & contests
- [ ] AI training on user preferences
- [ ] White-label solutions

---

## 🤝 **Contribution & Support**

### **🐛 Bug Reports**

Utilisez les [GitHub Issues](https://github.com/Aziraphal/judgemyjpeg/issues) pour signaler des bugs.

### **💡 Feature Requests**

Les suggestions d'amélioration sont les bienvenues dans les Issues.

### **📧 Contact Business**

- **Email** : contact.judgemyjpeg@gmail.com
- **Support** : Via l'application (bouton feedback)
- **Médiation** : CNPM-MÉDIATION pour litiges

---

## 📊 **Stats & Métriques**

### **Performance**

- **⚡ Lighthouse Score** : 98/100
- **📱 Mobile Performance** : 95/100  
- **🔒 Security Headers** : A+ grade
- **♿ Accessibility** : WCAG 2.1 AA compliant

### **Technique**

- **📦 Bundle Size** : 120kB gzipped
- **🚀 Time to Interactive** : <2s
- **📸 Image Optimization** : WebP/AVIF + CDN
- **🔄 API Response Time** : <500ms average

---

## 📜 **License & Légal**

### **Propriété Intellectuelle**

Ce projet est la propriété de **CodeCraft Plus** (SIRET: 98958739900019).  
Tous droits réservés.

### **Informations Légales**

- **Propriétaire** : Cyril Paquier
- **Entreprise** : CodeCraft Plus
- **SIRET** : 98958739900019
- **Adresse** : 9 Allée de la Meilleraie, 85340 Les Sables-d'Olonne, France

### **Conformité**

- ✅ **RGPD** compliant (EU)
- ✅ **Mentions légales** complètes
- ✅ **CGV** et politique de confidentialité
- ✅ **Médiateur** : CNPM-MÉDIATION

---

## 🌟 **Pourquoi JudgeMyJPEG ?**

### **🎯 Unique Value Proposition**

1. **Personnalités IA distinctes** - Seul service avec mode "Roast" créatif
2. **Analyse technique poussée** - Mode Expert avec vocabulaire professionnel
3. **Design gaming unique** - Aesthetic cyber/cosmic dans un marché terne
4. **Prix accessibles** - 10x moins cher que la concurrence premium
5. **Innovation constante** - Features uniques (partage social, collections)

### **🏆 Avantages Concurrentiels**

- **Différenciation forte** vs Generic AI photo tools
- **Market français** early mover advantage
- **Viral potential** avec mode Roast
- **Technical excellence** - Architecture SaaS moderne
- **Business model** équilibré et profitable

---

<div align="center">

## 🚀 **Ready to Judge Your Photos?**

[![Try JudgeMyJPEG](https://img.shields.io/badge/🎯_Analyser_mes_Photos-FF006E?style=for-the-badge&logoColor=white)](https://www.judgemyjpeg.fr)

**3 analyses gratuites - Aucune carte de crédit requise**

---

*Made with ❤️ by [CodeCraft Plus](https://www.judgemyjpeg.fr) - France 🇫🇷*

</div>