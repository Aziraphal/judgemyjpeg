# 📊 Google Analytics 4 + Stripe Conversion Tracking

## ✅ Implémentation Complète

### 🎯 Événements Trackés
1. **Client-side (gtag.ts)**
   - `photo_analysis` : Analyse photo avec score/mode/langue
   - `subscription_start` : Début checkout Stripe
   - `subscription_success` : Retour page succès
   - `collection_create` : Création collection
   - `collection_add_photo` : Ajout photo à collection

2. **Server-side (analytics-server.ts)**
   - `purchase` : Conversion Stripe réussie (standard ecommerce GA4)
   - `begin_checkout` : Début processus paiement
   - `cancel_subscription` : Annulation abonnement

### 🔧 Configuration Technique

#### Variables d'environnement requises
```bash
# Google Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
GA_API_SECRET="your_ga_measurement_protocol_api_secret"
```

#### Génération GA_API_SECRET
1. Google Analytics → Admin → Data Streams
2. Sélectionner votre stream web
3. "Measurement Protocol API secrets"
4. Créer nouveau secret → Copier la valeur

### 📈 Dashboard GA4 Recommandé

#### Conversions importantes
- **Purchase** : Revenus totaux Stripe
- **Begin_checkout** : Taux conversion checkout
- **Photo_analysis** : Engagement utilisateur
- **Subscription_start vs success** : Taux abandon panier

#### Événements personnalisés
```javascript
// Exemple événement personnalisé
gtag('event', 'photo_analysis', {
  'event_category': 'engagement',
  'event_label': 'pro_french_score_80',
  'value': 80,
  'subscription_type': 'premium', // Custom parameter
  'photo_category': 'portrait'    // Custom parameter
});
```

### 🚀 Intégration Stripe

#### Webhook events trackés
- `checkout.session.completed` → `purchase` event
- `customer.subscription.deleted` → `cancel_subscription` event
- `invoice.payment_failed` → Custom warning (pas de GA event)

#### Métadonnées Stripe → GA4
```javascript
{
  transactionId: session.id,           // Stripe session ID
  plan: 'premium_monthly',             // Type abonnement
  value: 9.99,                         // Prix en euros
  currency: 'EUR',                     // Devise
  method: 'stripe',                    // Méthode paiement
  items: [{
    item_id: 'premium_monthly',
    item_name: 'JudgeMyJPEG Premium',
    item_category: 'subscription',
    price: 9.99,
    quantity: 1
  }]
}
```

### 📊 Segments GA4 Utiles

1. **Utilisateurs Convertis**
   - Condition : `purchase` event existe

2. **Utilisateurs Engagés**  
   - Condition : `photo_analysis` event ≥ 3 fois

3. **Abandon Checkout**
   - Condition : `begin_checkout` MAIS PAS `purchase`

4. **Power Users**
   - Condition : `photo_analysis` event ≥ 10 fois + Subscription active

### 🎯 KPIs Marketing

#### Acquisition
- **CAC (Cost per Acquisition)** : Coût marketing / Conversions
- **LTV (Lifetime Value)** : Revenus moyen par utilisateur
- **Payback Period** : CAC / Revenus mensuels moyens

#### Engagement  
- **Analyses par utilisateur** : Moyenne `photo_analysis`
- **Taux rétention D7/D30** : Utilisateurs actifs après X jours
- **Feature adoption** : % utilisateurs créant collections

#### Conversion
- **Taux conversion free → paid** : Purchase events / Inscriptions
- **Churn rate** : Cancel_subscription / Active subscriptions
- **ARPU (Average Revenue Per User)** : Revenus / Utilisateurs actifs

### 🔍 Debug & Testing

#### Test événements locaux
```javascript
// Console browser
gtag('event', 'test_purchase', {
  'transaction_id': 'test_123',
  'value': 9.99,
  'currency': 'EUR'
});
```

#### Vérifier réception GA4
1. GA4 → Reports → Realtime
2. Chercher événements custom dans les 30min
3. DebugView pour détails complets

#### Test webhook Stripe
```bash
# Stripe CLI pour test local
stripe listen --forward-to localhost:3008/api/stripe/webhook
stripe trigger checkout.session.completed
```

### ⚠️ Points Attention

1. **Privacy** : GA4 respecte RGPD (consent mode déjà implémenté)
2. **Sampling** : Production seulement (dev mode = disabled)  
3. **Rate limiting** : GA4 API limité à 60 requêtes/minute
4. **Data retention** : GA4 conserve 14 mois par défaut
5. **CORS** : Server-side tracking évite blocage AdBlockers

### 📋 Checklist Déploiement

- [x] **gtag.ts** configuré avec événements business
- [x] **analytics-server.ts** créé pour server-side tracking
- [x] **Webhook Stripe** intégré avec conversions GA4
- [x] **Variables d'env** documentées (.env.example)
- [ ] **GA_API_SECRET** configuré en production
- [ ] **Tableau de bord GA4** personnalisé créé
- [ ] **Tests conversion** validés sur environnement de staging
- [ ] **Alertes GA4** configurées pour drops de conversion

---

🎯 **Next Step**: Configurer GA_API_SECRET en production et tester première conversion !