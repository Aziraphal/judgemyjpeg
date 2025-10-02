# 🚂 Variables Railway - JudgeMyJPEG Production

## 📋 **VARIABLES ESSENTIELLES À CONFIGURER**

### 🏦 **STRIPE (Paiements)**
```bash
STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_SECRETE_PRODUCTION
STRIPE_PUBLISHABLE_KEY=pk_live_VOTRE_CLE_PUBLIQUE_PRODUCTION  
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_WEBHOOK_SECRET
STRIPE_MONTHLY_PRICE_ID=price_1RxlQHFRRcxMaxXVgTk7si2G
STRIPE_ANNUAL_PRICE_ID=price_1RxlQHFRRcxMaxXVPbTcEgKv
```

### 🔐 **NEXTAUTH (Authentification)**
```bash
NEXTAUTH_URL=https://www.judgemyjpeg.fr
NEXTAUTH_SECRET=VOTRE_SECRET_NEXTAUTH_32_CARACTERES_MINIMUM
```

### 🗄️ **DATABASE (Neon PostgreSQL)**
```bash
DATABASE_URL=postgresql://YOUR_SUPABASE_CONNECTION_STRING?sslmode=require
```

### 🤖 **OPENAI (Analyses IA)**
```bash
OPENAI_API_KEY=sk-proj-VOTRE_CLE_OPENAI_API
```

### 🌅 **CLOUDINARY (Images)**
```bash
CLOUDINARY_CLOUD_NAME=dzwlkzqpb
CLOUDINARY_API_KEY=VOTRE_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=VOTRE_CLOUDINARY_API_SECRET
```

### 🔍 **GOOGLE OAUTH**
```bash
GOOGLE_CLIENT_ID=VOTRE_GOOGLE_OAUTH_CLIENT_ID
GOOGLE_CLIENT_SECRET=VOTRE_GOOGLE_OAUTH_CLIENT_SECRET
```

### 📧 **RESEND (Emails)**
```bash
RESEND_API_KEY=re_VOTRE_CLE_RESEND_API
```

### 🚦 **ENVIRONMENT**
```bash
NODE_ENV=production
```

---

## ⚠️ **VARIABLES OPTIONNELLES**

### 📊 **SENTRY (Monitoring)**
```bash
SENTRY_DSN=https://VOTRE_SENTRY_DSN@sentry.io/PROJECT_ID
SENTRY_ORG=votre-org
SENTRY_PROJECT=judgemyjpeg
```

### 📈 **ANALYTICS**
```bash
NEXT_PUBLIC_GA_ID=G-VOTRE_GOOGLE_ANALYTICS_ID
```

---

## 🔧 **PROCÉDURE DE CONFIGURATION**

### 1. Accéder aux variables Railway
```bash
# Via CLI Railway
railway login
railway environment

# Ou via Dashboard Web
https://railway.app/project/VOTRE_PROJECT_ID/settings
```

### 2. Ajouter chaque variable
```bash
# Exemple avec CLI
railway variables set STRIPE_SECRET_KEY=sk_live_...
railway variables set NEXTAUTH_URL=https://www.judgemyjpeg.fr

# Ou via interface web (plus pratique)
Dashboard > Variables > Add Variable
```

### 3. Redéployer l'application
```bash
railway deploy
# Ou push git (déploiement automatique)
git push origin main
```

---

## ✅ **CHECKLIST DE VÉRIFICATION**

### Variables critiques (OBLIGATOIRES) :
- [ ] `STRIPE_SECRET_KEY` (paiements ne marchent pas sinon)
- [ ] `STRIPE_WEBHOOK_SECRET` (webhooks échouent)
- [ ] `NEXTAUTH_URL` (redirections OAuth cassées)
- [ ] `NEXTAUTH_SECRET` (sessions invalides) 
- [ ] `DATABASE_URL` (app ne démarre pas)
- [ ] `OPENAI_API_KEY` (analyses IA échouent)

### Variables importantes :
- [ ] `CLOUDINARY_*` (upload images échoue)
- [ ] `GOOGLE_CLIENT_*` (login Google cassé)
- [ ] `RESEND_API_KEY` (emails pas envoyés)

### Variables optionnelles :
- [ ] `SENTRY_DSN` (pas de monitoring erreurs)
- [ ] `NEXT_PUBLIC_GA_ID` (pas d'analytics)

---

## 🚨 **ERREURS COMMUNES**

### ❌ **Railway ne démarre pas**
```
Cause: DATABASE_URL manquant ou incorrect
Solution: Vérifier l'URL Neon + sslmode=require
```

### ❌ **Paiements échouent**  
```
Cause: STRIPE_SECRET_KEY en mode test au lieu de live
Solution: Utiliser sk_live_... pas sk_test_...
```

### ❌ **OAuth Google cassé**
```
Cause: NEXTAUTH_URL incorrect ou GOOGLE_CLIENT_ID manquant
Solution: URL exacte + credentials Google Cloud Console
```

### ❌ **Analyses IA ne marchent pas**
```
Cause: OPENAI_API_KEY invalide ou quota dépassé  
Solution: Vérifier clé + billing OpenAI
```

---

## 📊 **MONITORING VARIABLES**

### Variables à surveiller en production :
```bash
# Vérifier les variables sont bien définies
railway variables

# Logs applicatifs
railway logs

# Status des variables sensibles (sans révéler la valeur)
echo $STRIPE_SECRET_KEY | wc -c  # Doit être > 50 chars
echo $DATABASE_URL | grep postgresql  # Doit contenir postgresql://
```

### Dashboard Railway à surveiller :
- **Deploy Status** : Succès/Échec
- **Resource Usage** : CPU/Mémoire 
- **Error Logs** : Variables manquantes

---

## 🔄 **PROCÉDURE ROLLBACK**

Si problème après déploiement :

### 1. Rollback rapide
```bash
railway rollback
# Ou revenir au commit précédent
git revert HEAD
git push
```

### 2. Variables de debug temporaires
```bash
railway variables set DEBUG_MODE=true
railway variables set LOG_LEVEL=verbose
```

### 3. Tests locaux avant redéploiement
```bash
# Copier les variables prod en local
cp .env.example .env.local
# Modifier avec les vraies valeurs
npm run dev
```

---

## ✨ **RÉSUMÉ PRIORITÉS**

### 🚨 **URGENT (App cassée sans ça)**
1. `DATABASE_URL`
2. `NEXTAUTH_SECRET` + `NEXTAUTH_URL` 
3. `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`

### ⚡ **IMPORTANT (Fonctionnalités dégradées)**
4. `OPENAI_API_KEY`
5. `CLOUDINARY_*`
6. `STRIPE_*_PRICE_ID`

### 📈 **BONUS (Améliore l'expérience)**
7. `GOOGLE_CLIENT_*`
8. `RESEND_API_KEY`
9. `SENTRY_DSN`

**Total : ~15 variables pour un fonctionnement optimal 🚀**