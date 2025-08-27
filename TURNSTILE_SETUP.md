# Configuration Cloudflare Turnstile

## 1. Créer le widget Turnstile

1. Aller sur [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Sélectionner "Turnstile" dans le menu latéral
3. Cliquer "Ajouter un widget"
4. Remplir le formulaire :

**Nom du widget :**
```
JudgeMyJPEG Production Signup
```

**Gestion des noms d'hôtes :**
Ajouter ton domaine :
```
judgemyjpeg.fr
```
(Tu peux ajouter jusqu'à 10 domaines)

**Mode Widget :** Choisir **"Géré"** ✅
- ✅ **Géré** : Cloudflare décide si challenge interactif nécessaire (checkbox simple)
- **Non interactif** : Barre de chargement sans interaction
- **Invisible** : Challenge complètement caché

**Pré-autorisation :** ❌ **Décocher** pour l'instant
> 💡 La pré-autorisation émet un cookie d'autorisation qui peut être réutilisé sur ton site. Utile si tu veux protéger plusieurs actions (signup + analyse photo) sans re-challenger l'utilisateur. À activer plus tard si besoin.

## 2. Récupérer les clés

Après création, noter :
- **Site Key** (publique) → `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY`
- **Secret Key** (privée) → `CLOUDFLARE_TURNSTILE_SECRET_KEY`

## 3. Configuration Railway

Ajouter dans les variables d'environnement Railway :

```bash
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=0x4AAAAAAA... (site key)
CLOUDFLARE_TURNSTILE_SECRET_KEY=0x4AAAAAAA...          (secret key)
```

## 4. Configuration de développement (optionnel)

Pour tester en local avec vraies clés :
```bash
# .env.local
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=0x4AAAAAAA...
CLOUDFLARE_TURNSTILE_SECRET_KEY=0x4AAAAAAA...
```

## 5. Clés de test Cloudflare

Pour développement sans vraie validation :
```bash
# Site key de test (toujours passe)
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
# Secret key de test (toujours passe)  
CLOUDFLARE_TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

## 6. Vérification

Une fois configuré :
1. Aller sur `/auth/signup`
2. Vérifier que le widget Turnstile s'affiche
3. Tester l'inscription complète
4. Vérifier les logs côté serveur

## 7. Turnstile Analytics (Monitoring)

Dans Cloudflare dashboard → Turnstile → Analytics :

**Métriques clés :**
- **Challenge Issued**: Nombre de défis générés
- **Challenge Solve Rate**: Taux de résolution (humains vs bots)
- **Widget Performance**: Latence et temps de réponse
- **Bot Detection**: Tentatives malveillantes bloquées

**Optimisations possibles :**
- Si solve rate < 95% → Widget trop agressif
- Si challenges issued trop élevé → Bots massifs détectés
- Ajuster le widget type selon les stats

**Alertes recommandées :**
- Spike anormal de challenges (attaque bot potentielle)
- Chute du solve rate (problème technique)
- Erreurs de validation côté serveur

## Sécurité

✅ **Bon :** Secret key stockée uniquement côté serveur  
✅ **Bon :** Validation hostname côté serveur  
✅ **Bon :** Bypass dev environment pour éviter les quotas  
✅ **Bon :** Gestion expiration token (300s)

---
Configuration terminée → **Bot protection active** 🛡️