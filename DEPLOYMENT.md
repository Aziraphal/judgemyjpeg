# 🚀 JudgeMyJPEG - Guide de Déploiement Production

## 📋 Checklist Pré-Déploiement

### 1. 🔐 Configuration des Services Externes

#### A. Resend Email Service
1. Créer un compte sur [resend.com](https://resend.com)
2. Vérifier le domaine `judgemyjpeg.fr`
3. Générer une API key
4. Configurer DNS records (SPF, DKIM, DMARC)

#### B. Sentry Error Monitoring
1. Créer un compte sur [sentry.io](https://sentry.io)
2. Créer un projet "judgemyjpeg-app"
3. Noter le DSN publique
4. Configurer les alertes

#### C. Neon Database Backup
1. Activer les backups automatiques dans Neon
2. Configurer la rétention (7-30 jours)
3. Tester la restauration

### 2. ⚙️ Variables d'Environnement Vercel

```bash
# Production Variables (Vercel Dashboard -> Settings -> Environment Variables)
NEXTAUTH_URL=https://judgemyjpeg.fr
NEXTAUTH_SECRET=[générer avec: openssl rand -base64 32]

# Database
DATABASE_URL=[URL de production Neon]

# Email Service
RESEND_API_KEY=re_[votre_clé_resend]
EMAIL_FROM=noreply@judgemyjpeg.fr
ADMIN_EMAIL=admin@judgemyjpeg.fr

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://[votre_dsn]@sentry.io/[project_id]

# OAuth
GOOGLE_CLIENT_ID=[ID client Google pour production]
GOOGLE_CLIENT_SECRET=[Secret client Google]

# Stripe
STRIPE_SECRET_KEY=sk_live_[clé_production]
STRIPE_PUBLISHABLE_KEY=pk_live_[clé_publique]
STRIPE_WEBHOOK_SECRET=whsec_[secret_webhook]
STRIPE_MONTHLY_PRICE_ID=price_[id_prix_mensuel]
STRIPE_LIFETIME_PRICE_ID=price_[id_prix_lifetime]

# Cloudinary
CLOUDINARY_CLOUD_NAME=[nom_cloud]
CLOUDINARY_API_KEY=[clé_api]
CLOUDINARY_API_SECRET=[secret_api]

# Gemini AI
GEMINI_API_KEY=[clé_gemini]

# Admin
ADMIN_SECRET=[mot_de_passe_admin_complexe]
```

### 3. 🏗️ Configuration DNS

#### Records DNS requis pour `judgemyjpeg.fr` :
```dns
# Vercel
A     @     76.76.19.61
CNAME www   cname.vercel-dns.com

# Email (Resend)
TXT   @     "v=spf1 include:_spf.resend.com ~all"
CNAME resend._domainkey   resend._domainkey.resend.com
TXT   _dmarc   "v=DMARC1; p=quarantine; rua=mailto:admin@judgemyjpeg.fr"
```

### 4. 🔒 Configuration Sécurité

#### A. Google OAuth (Console Google Cloud)
```
Origines JavaScript autorisées:
- https://judgemyjpeg.fr
- https://www.judgemyjpeg.fr

URI de redirection autorisées:
- https://judgemyjpeg.fr/api/auth/callback/google
```

#### B. Stripe Webhooks
```
Endpoint URL: https://judgemyjpeg.fr/api/stripe/webhook
Événements:
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
```

## 🚀 Processus de Déploiement

### Étape 1: Vérifications Locales
```bash
# Test build
npm run build

# Test email (en dev avec Resend test key)
curl -X POST http://localhost:3000/api/test-email

# Vérifier les variables ENV
node -e "console.log(Object.keys(process.env).filter(k => k.includes('RESEND')))"
```

### Étape 2: Déploiement Vercel
```bash
# Connecter le projet
vercel --prod

# Ou via GitHub (automatique)
git push origin main
```

### Étape 3: Vérifications Post-Déploiement
1. ✅ Site accessible sur https://judgemyjpeg.fr
2. ✅ Inscription avec email fonctionne
3. ✅ Connexion Google OAuth
4. ✅ Upload et analyse photo
5. ✅ Paiement Stripe (mode test d'abord)
6. ✅ Monitoring Sentry actif
7. ✅ Analytics Vercel

### Étape 4: Tests de Charge
```bash
# Installer artillery pour les tests de charge
npm install -g artillery

# Test basique
artillery quick --count 10 --num 3 https://judgemyjpeg.fr
```

## 📊 Monitoring Post-Déploiement

### Dashboards à surveiller:
1. **Vercel Analytics** - Trafic, performance
2. **Sentry** - Erreurs, performance
3. **Neon** - Database metrics
4. **Resend** - Email delivery rates
5. **Stripe** - Transactions

### Alertes critiques:
- Erreur rate > 1%
- Response time > 2s
- Database connections > 80%
- Email bounce rate > 5%

## 🔧 Maintenance

### Tâches hebdomadaires:
- [ ] Vérifier logs d'audit
- [ ] Contrôler métriques performance
- [ ] Backup database verification
- [ ] Security scan (Dependabot)

### Tâches mensuelles:
- [ ] Rotation secrets API
- [ ] Review access logs
- [ ] Performance optimization
- [ ] Security audit

## 🆘 Rollback Plan

En cas de problème critique:
```bash
# 1. Rollback Vercel
vercel --prod --rollback

# 2. Ou redéployer version stable
git revert [commit_problématique]
git push origin main

# 3. Restaurer DB si nécessaire (Neon Console)
```

## 📞 Contacts d'Urgence

- **Vercel Support**: support@vercel.com
- **Neon Support**: support@neon.tech  
- **Resend Support**: support@resend.com
- **Sentry Support**: support@sentry.io

---

✅ **Checklist Final avant Go-Live:**
- [ ] Toutes les ENV variables configurées
- [ ] DNS configuré correctement
- [ ] Services externes testés
- [ ] Monitoring actif
- [ ] Backup automatique
- [ ] Tests de charge OK
- [ ] Plan de rollback documenté