# Photo Judge App

Une application web qui utilise l'IA Gemini pour analyser et critiquer les photos des utilisateurs.

## Fonctionnalités

- 📸 Analyse de photos par IA (Gemini)
- 🔍 Conseils d'amélioration professionnels
- 📊 Tableau de bord utilisateur
- 🔗 Liens vers Lightroom/Photoshop/Snapseed
- 🔐 Authentification Google
- 💳 Système de paiement Stripe

## Stack technique

- **Frontend**: Next.js 14 + React + TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **IA**: Google Gemini API
- **Paiement**: Stripe
- **Styling**: Tailwind CSS

## Installation

```bash
npm install
npm run dev
```

## Structure du projet

```
src/
├── components/    # Composants réutilisables
├── pages/        # Pages Next.js
├── api/          # API routes
├── services/     # Services (Gemini, Stripe, etc.)
├── lib/          # Utilitaires, config DB
├── hooks/        # Custom hooks React
└── types/        # Types TypeScript
```