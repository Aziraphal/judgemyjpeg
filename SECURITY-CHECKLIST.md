# 🚨 CHECKLIST DE SÉCURITÉ - MISE EN PRODUCTION

## ✅ ÉTAPES COMPLÉTÉES

### 1. Next.js sécurisé
- [x] Mise à jour vers 14.2.30
- [x] 8 vulnérabilités critiques corrigées
- [x] `npm audit` montre 0 vulnérabilité

### 2. .env protégé
- [x] .env dans .gitignore  
- [x] Jamais commité dans Git
- [x] Template de production créé

## 🔄 ÉTAPES À FAIRE MAINTENANT

### 3. Régénérer TOUTES les clés API

#### Stripe (CRITIQUE)
- [ ] Dashboard Stripe → API Keys → Regenerate Secret Key
- [ ] Regenerate Publishable Key  
- [ ] Webhooks → Roll secret
- [ ] Noter les nouveaux : sk_test_..., pk_test_..., whsec_...

#### Google OAuth
- [ ] Google Cloud Console → Credentials → Reset secret
- [ ] Noter le nouveau : GOCSPX-...

#### Gemini AI  
- [ ] AI Studio → Delete + Create new API Key
- [ ] Noter le nouveau : AIza...

#### Cloudinary
- [ ] Console → Security → Regenerate API Secret
- [ ] Noter le nouveau secret

#### Admin
- [ ] Générer nouveau mot de passe fort (20+ chars)

### 4. Configuration production

#### Variables d'environnement serveur
- [ ] Utiliser le template .env.production.template
- [ ] Configurer sur ton serveur (Vercel/Netlify/etc.)
- [ ] JAMAIS de fichier .env en production

#### URLs production
- [ ] NEXTAUTH_URL="https://tondomaine.com"
- [ ] URLs de callback Stripe
- [ ] URLs de redirect Google OAuth

## 🎯 VALIDATION FINALE

### Test sécurité
- [ ] Vérifier que .env n'est pas accessible via URL
- [ ] Tester rate limiting : 6+ requêtes/minute bloquées
- [ ] Vérifier en-têtes sécurité : X-Frame-Options, CSP, etc.
- [ ] Upload fichier non-image : doit être rejeté

### Test fonctionnel  
- [ ] Connexion Google fonctionne
- [ ] Inscription email/password fonctionne
- [ ] Analyse de photo fonctionne
- [ ] Paiement Stripe fonctionne

## 🚨 ACTIONS CRITIQUES AVANT DÉPLOIEMENT

1. **IMMÉDIAT** : Régénérer toutes les clés API ci-dessus
2. **URGENT** : Configurer variables d'environnement serveur  
3. **IMPORTANT** : Tester toutes les fonctionnalités
4. **FINAL** : Supprimer .env local après déploiement

## ⚠️ RAPPEL SÉCURITÉ

- JAMAIS de .env en production
- JAMAIS de clés en dur dans le code
- TOUJOURS HTTPS en production
- Régénérer les clés si compromises

---

**Status actuel :** 🟡 EN COURS (2/4 étapes complétées)
**Status requis :** 🟢 PRODUCTION READY (4/4 étapes)