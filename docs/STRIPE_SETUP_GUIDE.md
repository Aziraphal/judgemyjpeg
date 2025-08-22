# 🏦 Guide Configuration Stripe Production - JudgeMyJPEG

## 🎯 Vue d'ensemble
Migration du plan Lifetime vers plan Annual + configuration production complète.

---

## 📋 **ÉTAPE 1 : Créer les produits Stripe**

### A. Accéder au Dashboard Stripe Production
1. Aller sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. **IMPORTANT** : Vérifier que vous êtes en **mode LIVE** (pas Test)
3. Menu **Products** → **Add product**

### B. Créer le produit principal
```
Nom du produit: JudgeMyJPEG Premium
Description: Analyses photo IA illimitées + fonctionnalités premium
```

### C. Ajouter les prix
**Prix 1 - Mensuel :**
```
Prix: €9.98
Récurrence: Mensuel
ID suggéré: price_monthly_judgemyjpeg_998
```

**Prix 2 - Annuel :**
```
Prix: €79.00
Récurrence: Annuel  
ID suggéré: price_annual_judgemyjpeg_7900
Économie: €40/an vs mensuel
```

---

## 🔧 **ÉTAPE 2 : Configuration technique**

### A. Récupérer les clés API
Dans **Developers** → **API keys** :
- `STRIPE_SECRET_KEY` = `sk_live_...`
- `STRIPE_PUBLISHABLE_KEY` = `pk_live_...`

### B. Configurer les webhooks
1. **Developers** → **Webhooks** → **Add endpoint**
2. URL : `https://www.judgemyjpeg.fr/api/stripe/webhook`
3. Events à écouter :
   ```
   customer.subscription.created
   customer.subscription.updated
   customer.subscription.deleted
   invoice.payment_succeeded
   invoice.payment_failed
   ```
4. Récupérer `STRIPE_WEBHOOK_SECRET`

---

## 🏠 **ÉTAPE 3 : Variables Railway**

### Variables de production à ajouter :

```bash
# === STRIPE PRODUCTION ===
STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_SECRETE
STRIPE_PUBLISHABLE_KEY=pk_live_VOTRE_CLE_PUBLIQUE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_WEBHOOK_SECRET
STRIPE_MONTHLY_PRICE_ID=price_VOTRE_ID_MENSUEL
STRIPE_ANNUAL_PRICE_ID=price_VOTRE_ID_ANNUEL

# === URLS PRODUCTION ===
NEXTAUTH_URL=https://www.judgemyjpeg.fr
NEXTAUTH_SECRET=VOTRE_SECRET_NEXTAUTH_32_CHARS_MIN

# === BASE DE DONNÉES ===
DATABASE_URL=postgresql://VOTRE_URL_NEON

# === OPENAI ===
OPENAI_API_KEY=sk-proj-VOTRE_CLE_OPENAI

# === CLOUDINARY ===
CLOUDINARY_CLOUD_NAME=VOTRE_CLOUD_NAME
CLOUDINARY_API_KEY=VOTRE_API_KEY
CLOUDINARY_API_SECRET=VOTRE_API_SECRET

# === GOOGLE OAUTH ===
GOOGLE_CLIENT_ID=VOTRE_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=VOTRE_GOOGLE_CLIENT_SECRET

# === EMAIL (Resend) ===
RESEND_API_KEY=re_VOTRE_CLE_RESEND
```

---

## ✅ **ÉTAPE 4 : Tests de validation**

### A. Test des paiements
1. Créer un compte test sur votre site
2. Tenter un paiement mensuel (€9.98)
3. Tenter un paiement annuel (€79)
4. Vérifier dans Stripe Dashboard → Payments

### B. Test des webhooks
1. Stripe Dashboard → Webhooks → Votre endpoint
2. Vérifier **Recent deliveries** (codes 200)
3. Tester une souscription depuis le site

### C. Test des analyses
1. Nouveau compte = 10 analyses starter pack ✓
2. Compte premium = analyses illimitées ✓
3. Compte annual = analyses illimitées ✓

---

## 🚨 **SÉCURITÉ & CONFORMITÉ**

### A. TVA européenne
- ✅ `automatic_tax: enabled` configuré
- ✅ Collecte d'adresse de facturation
- ✅ Codes promo supportés

### B. RGPD
- ✅ Export de données implémenté
- ✅ Politique de remboursement prorata
- ✅ Droit de rétractation 14 jours

---

## 📞 **ÉTAPE 5 : Support client**

### Messages d'erreur à surveiller :
- `Votre carte a été déclinée`
- `Erreur lors de la création de la session`
- `Limite d'analyses atteinte`

### Actions admin disponibles :
- Remboursement prorata : `/admin/refund-prorata`
- Export RGPD : `/admin/dashboard`
- Upgrade manuel : `/admin/upgrade-user`

---

## 📊 **MÉTRIQUES À SUIVRE**

### KPIs Stripe importants :
- **Taux de conversion** checkout
- **MRR** (Monthly Recurring Revenue) 
- **Churn rate** mensuel/annuel
- **Revenue per user** moyenne

### Dashboard Railway :
- Surveiller les **erreurs 500** sur `/api/stripe/*`
- **Logs webhook** : codes 200 vs erreurs
- **Usage database** avec nouveaux champs starter pack

---

## 🔧 **COMMANDES UTILES**

### Recréer les plans (si nécessaire) :
```bash
node scripts/setup-stripe-plans.js
```

### Vérifier la DB après migration :
```bash
npx prisma studio
# Vérifier les nouveaux champs starter pack
```

### Test local avec ngrok :
```bash
ngrok http 3002
# Mettre l'URL ngrok dans Stripe webhook (dev uniquement)
```

---

## ✨ **RÉSUMÉ FINAL**

**Ancienne config :**
- Plan Lifetime €99 (problème juridique)
- 2 plans seulement

**Nouvelle config :**
- Plan Mensuel €9.98
- Plan Annuel €79 (économie €40/an) 
- Starter Pack 10 analyses
- Conformité RGPD complète
- API remboursement prorata

**Prêt pour le lancement ! 🚀**