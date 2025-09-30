# 🔐 Gestion des accès premium manuels

Ce système permet d'offrir un **accès premium gratuit à vie** à certains utilisateurs (testeurs beta, contributeurs, etc.) sans qu'ils aient besoin de payer via Stripe.

## Pourquoi ce système ?

Lorsqu'on force manuellement le `subscriptionStatus` à `premium` dans la base de données, les webhooks Stripe peuvent écraser cette valeur et remettre l'utilisateur en `free`. Le système d'accès premium manuel évite ce problème en utilisant un champ dédié `manualPremiumAccess` qui est **prioritaire** sur le statut Stripe.

## Avantages

- ✅ **Permanent** : L'accès ne sera jamais révoqué par les webhooks Stripe
- ✅ **Traçable** : On sait qui a accordé l'accès, quand et pourquoi
- ✅ **Cohabitation** : Fonctionne même si l'utilisateur a aussi un abonnement Stripe
- ✅ **Analyses illimitées** : Comme un vrai premium
- ✅ **Tous les avantages** : Exports PDF, partages sociaux illimités

## Utilisation

### Accorder un accès premium gratuit

```bash
node grant-premium.js grant <email> <raison> [accordé_par]
```

**Exemple :**
```bash
node grant-premium.js grant user@example.com "Testeur beta - programme early access" "admin"
```

### Lister les utilisateurs avec accès manuel

```bash
node grant-premium.js list
```

### Révoquer un accès manuel

```bash
node grant-premium.js revoke <email>
```

## Exemples de raisons valides

- `"Testeur beta - programme early access"`
- `"Contributeur open-source"`
- `"Partenaire média"`
- `"Photographe ambassadeur"`
- `"Gagnant concours septembre 2025"`

## Schéma de la base de données

Champs ajoutés au modèle `User` :

| Champ | Type | Description |
|-------|------|-------------|
| `manualPremiumAccess` | Boolean | Si `true`, l'utilisateur a un accès premium manuel |
| `manualPremiumReason` | String? | Raison de l'accès (ex: "Testeur beta") |
| `manualPremiumGrantedAt` | DateTime? | Date d'attribution de l'accès |
| `manualPremiumGrantedBy` | String? | Qui a accordé l'accès (ex: "admin") |

## Logique de priorité

```typescript
// Dans getUserSubscription()
const effectiveStatus = user.manualPremiumAccess
  ? 'premium'
  : user.subscriptionStatus

const canAnalyze = user.manualPremiumAccess
  || ['premium', 'annual'].includes(user.subscriptionStatus)
  || currentCount < maxAnalyses
  || hasStarterAnalyses
```

**Ordre de priorité :**
1. 🔐 Accès premium manuel (`manualPremiumAccess: true`)
2. 💳 Abonnement Stripe actif (`subscriptionStatus: 'premium' | 'annual'`)
3. 📦 Starter Pack disponible
4. 🆓 Analyses gratuites restantes (3/mois)

## Sécurité

- ⚠️ Seuls les administrateurs devraient avoir accès au script `grant-premium.js`
- 📝 Toutes les attributions sont tracées avec date, raison et auteur
- 🔍 Le script demande confirmation avant de révoquer un accès
- 🛡️ Les webhooks Stripe ne peuvent PAS supprimer un accès manuel

## Cas d'usage

### Scénario 1 : Testeur beta
Un testeur participe au programme beta et mérite un accès lifetime :
```bash
node grant-premium.js grant beta@tester.com "Testeur beta - early adopter" "admin"
```

### Scénario 2 : Contributeur
Un développeur contribue au projet open-source :
```bash
node grant-premium.js grant dev@contributor.com "Contribution GitHub #42" "admin"
```

### Scénario 3 : Gagnant de concours
Un photographe gagne un concours avec un an d'accès gratuit :
```bash
node grant-premium.js grant winner@photo.com "Gagnant concours Photo du Mois - Sept 2025" "admin"
```

## Notes importantes

1. **L'accès manuel est PERMANENT** : Il ne sera jamais révoqué automatiquement
2. **Compatible avec Stripe** : Si l'utilisateur souscrit plus tard à un abonnement Stripe, les deux cohabiteront sans problème
3. **Pas de conflit** : Les webhooks Stripe peuvent modifier `subscriptionStatus` sans affecter `manualPremiumAccess`
4. **Audit trail** : Toutes les informations sont stockées pour traçabilité

## Migration des utilisateurs existants

Si vous avez déjà des utilisateurs avec `subscriptionStatus: 'premium'` forcé manuellement, vous devriez :

1. Identifier ces utilisateurs
2. Leur accorder un accès manuel
3. Restaurer leur `subscriptionStatus` réel dans Stripe (ou `free` s'ils n'ont pas d'abonnement)

Exemple :
```bash
# Accorder l'accès manuel
node grant-premium.js grant user@example.com "Migration ancien système premium manuel" "admin"

# Puis restaurer le statut Stripe réel (si nécessaire)
# Soit via l'API, soit en laissant le prochain webhook le mettre à jour
```

---

*Dernière mise à jour : 30/09/2025*
