# ✅ Checklist Déploiement Production - JudgeMyJPEG

## 🎯 **CONFIGURATIONS MANQUANTES IDENTIFIÉES**

### ❌ **Variables Railway manquantes importantes :**
```bash
# SÉCURITÉ
ADMIN_SECRET="votre-mot-de-passe-admin-super-secret"
ENCRYPTION_KEY="cle-32-caracteres-pour-chiffrement-2FA"
SYSTEM_CLEANUP_TOKEN="token-securise-pour-nettoyage-sessions"

# EMAIL CONFIGURATION
EMAIL_FROM="noreply@judgemyjpeg.fr"
ADMIN_EMAIL="contact.judgemyjpeg@gmail.com"

# MONITORING AVANCÉ
NEXT_PUBLIC_SENTRY_DSN="https://votre_sentry_dsn@sentry.io/project_id"
SENTRY_ORG="judgemyjpeg"
SENTRY_PROJECT="judgemyjpeg-app"
```

---

## 🚨 **ACTIONS URGENTES AVANT PROD**

### 1. **Stripe Configuration**
- [ ] Créer les produits en mode LIVE (pas Test)
- [ ] Configurer le webhook production
- [ ] Tester un paiement réel €0.50
- [ ] Vérifier la TVA automatique

### 2. **Variables Railway manquantes**
- [ ] `ADMIN_SECRET` (accès admin panel)
- [ ] `ENCRYPTION_KEY` (2FA users)
- [ ] `EMAIL_FROM` + `ADMIN_EMAIL`
- [ ] `SYSTEM_CLEANUP_TOKEN`

### 3. **DNS & Domaine**
- [ ] Railway custom domain configuré ?
- [ ] Certificate SSL auto ?
- [ ] Redirections HTTP → HTTPS ?

### 4. **Base de données**
- [ ] Neon DB en production (pas dev)
- [ ] Backup automatique configuré ?
- [ ] Connection pooling activé ?

---

## 🔐 **SÉCURITÉ CRITIQUE**

### Secrets à générer :
```bash
# NEXTAUTH_SECRET (32+ chars)
openssl rand -base64 32

# ENCRYPTION_KEY (exactement 32 chars pour 2FA)
openssl rand -hex 16

# ADMIN_SECRET (mot de passe fort)
openssl rand -base64 24

# SYSTEM_CLEANUP_TOKEN
openssl rand -base64 32
```

### Variables sensibles à vérifier :
- [ ] Toutes les clés commencent par les bons préfixes
- [ ] `STRIPE_SECRET_KEY` = `sk_live_...` (PAS sk_test_)
- [ ] `DATABASE_URL` pointe vers Supabase production
- [ ] `NEXTAUTH_URL` = `https://www.judgemyjpeg.fr`

---

## 📧 **EMAIL & NOTIFICATIONS**

### Configuration Resend :
- [ ] Domaine `judgemyjpeg.fr` vérifié dans Resend
- [ ] DNS records ajoutés (SPF, DKIM)  
- [ ] Email `noreply@judgemyjpeg.fr` configuré
- [ ] Template emails testés

### Emails critiques à tester :
- [ ] Inscription + vérification email
- [ ] Reset mot de passe
- [ ] Confirmation paiement
- [ ] 2FA setup codes

---

## 🤖 **IA & SERVICES EXTERNES**

### OpenAI :
- [ ] Clé API avec billing configuré
- [ ] Quota suffisant (>$100/mois recommandé)
- [ ] Rate limits appropriés

### Cloudinary :
- [ ] Plan avec assez de bandwidth
- [ ] Transformations auto-optimisation ON
- [ ] HTTPS forcé

### Google OAuth :
- [ ] Domaine autorisé dans Console Cloud
- [ ] Écran de consentement publié
- [ ] Redirections URI correctes

---

## 📊 **MONITORING & LOGS**

### Sentry (Optionnel mais recommandé) :
- [ ] Projet créé sur sentry.io
- [ ] DSN configuré dans Railway
- [ ] Alerts email configurées
- [ ] Filtres erreurs spam

### Logs Railway :
- [ ] Retention logs suffisante (7+ jours)
- [ ] Monitoring uptime
- [ ] Alertes si crash app

---

## 🧪 **TESTS FINAUX AVANT LANCEMENT**

### Tests utilisateur :
1. [ ] Inscription complète (email + 2FA optionnel)
2. [ ] 10 analyses starter pack fonctionnent
3. [ ] Tous les modes IA disponibles (Pro/Roast/Expert)
4. [ ] Upload + analyse + partage social
5. [ ] Export PDF (3 gratuits starter pack)
6. [ ] Collections fonctionnelles

### Tests paiement :
1. [ ] Paiement mensuel €9.99 fonctionne
2. [ ] Paiement annuel €79 fonctionne  
3. [ ] Webhook reçu + compte mis à jour
4. [ ] Analyses illimitées activées
5. [ ] Facture email reçue

### Tests admin :
1. [ ] Accès `/admin` avec `ADMIN_SECRET`
2. [ ] Dashboard stats fonctionnel
3. [ ] Export RGPD fonctionne
4. [ ] Remboursement prorata testable

---

## 🚀 **LANCEMENT**

### Pré-lancement :
- [ ] Tests complets sur staging
- [ ] Monitoring configuré
- [ ] Backup DB récent
- [ ] DNS propagé (24-48h)

### Go Live :
1. [ ] Push final vers Railway
2. [ ] Vérifier tous les endpoints critiques
3. [ ] Tester inscription depuis mobile + desktop
4. [ ] Surveiller logs erreurs première heure

### Post-lancement :
- [ ] Monitoring premier 24h
- [ ] Premiers utilisateurs feedback
- [ ] Métriques Stripe surveillées
- [ ] SEO indexation vérifiée

---

## ⚠️ **ROLLBACK PLAN**

Si problème critique :

### Plan A - Rollback rapide
```bash
railway rollback  # Retour version précédente
```

### Plan B - Fix urgent
```bash
# Variable manquante urgente
railway variables set VARIABLE_NAME=value
railway deploy --force
```

### Plan C - Maintenance mode
```bash
# Redirection temporaire ou page maintenance
railway variables set MAINTENANCE_MODE=true
```

---

## ✨ **RÉSUMÉ CRITIQUE**

### 🚨 **BLOQUANT PROD** (App ne marche pas) :
1. Variables Stripe production (pas test)
2. `NEXTAUTH_SECRET` + `NEXTAUTH_URL` corrects
3. `DATABASE_URL` production Supabase
4. `OPENAI_API_KEY` avec quota
5. `ADMIN_SECRET` pour accès admin

### ⚡ **IMPORTANT** (Fonctionnalités limitées) :
6. Variables Cloudinary complètes
7. Configuration email Resend
8. Google OAuth credentials
9. `ENCRYPTION_KEY` pour 2FA
10. Webhook Stripe configuré

### 📈 **BONUS** (Améliore l'expérience) :
11. Sentry monitoring
12. Analytics Google
13. Optimisations Railway
14. Backup automatique
15. CDN Cloudinary

**Total estimation : 2-3h de configuration pour être 100% prêt ! 🎯**