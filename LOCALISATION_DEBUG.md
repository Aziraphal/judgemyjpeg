# 🌍 Debug de la Détection de Localisation

## Problèmes identifiés

### 1. VPN en développement local
Lorsque tu utilises un VPN et changes de serveur (ex: France → États-Unis), la page d'accueil de JudgeMyJPEG reste en français au lieu de basculer en anglais.

### 2. Utilisateurs connectés avec compte existant
Quand un utilisateur se connecte avec un compte créé précédemment, le site reste en français même avec une IP US, car les préférences en base de données contenaient `language: "fr"` par défaut.

## Ordre de priorité des langues (NOUVEAU)

Le système utilise maintenant un ordre de priorité intelligent :

1. **Choix manuel explicite** (localStorage: `manual_language_choice`) → Priorité absolue
   - L'utilisateur a cliqué sur un sélecteur de langue
   - Son choix est respecté jusqu'à ce qu'il le change

2. **Détection géolocalisée haute confiance** (≥60%) → Priorité haute
   - Détecte automatiquement la langue via IP/géolocalisation
   - **Prend priorité sur les préférences BDD** (plus contextuel)
   - Exemple : Utilisateur FR en vacances aux US → voir en anglais

3. **Paramètre forceLanguage** (prop) → Utilisé par certaines pages

4. **Fallback français** → Dernier recours si aucune détection

⚠️ **Important** : Les préférences en base de données ne sont **plus prioritaires** sur la détection auto ! Cela permet aux utilisateurs de voir le site dans leur langue actuelle, même s'ils ont créé leur compte ailleurs.

## Pourquoi ça arrivait ?

### 1. **En développement local**
Quand le serveur Next.js tourne sur `localhost:3008`, l'API de détection reçoit :
- L'IP **locale** (`127.0.0.1` ou IP LAN)
- **PAS l'IP publique** de ton VPN

Résultat : La détection échoue et fallback sur France (FR) par défaut.

### 2. **Cache localStorage**
Une fois détectée, la langue est mise en cache pendant **24 heures** pour optimiser les performances.

### 3. **Choix manuel prioritaire**
Si tu as déjà sélectionné manuellement une langue dans l'app, ce choix est sauvegardé et prend priorité.

---

## Solutions

### ✅ Solution 1 : Outil de Debug intégré

Un composant `LanguageDebugger` a été ajouté en bas à droite de la page d'accueil (dev only).

**Utilisation :**
1. Va sur http://localhost:3008
2. Clique sur le bouton **🌍 Lang Debug**
3. Le panel affiche :
   - Langue détectée actuelle
   - Pays détecté
   - Niveau de confiance (%)
   - Cache localStorage
   - **Ton IP publique VPN réelle** avec détection
4. Clique sur **🔄 Reset** pour :
   - Effacer tout le cache
   - Forcer une nouvelle détection avec ton IP publique
   - Relancer la localisation

### ✅ Solution 2 : Test manuel avec IP

Tu peux tester avec n'importe quelle IP directement :

```bash
# Depuis ton terminal
curl "http://localhost:3008/api/detect-location?testIP=8.8.8.8"

# IP USA (Google DNS)
curl "http://localhost:3008/api/detect-location?testIP=8.8.8.8"

# IP France (Free)
curl "http://localhost:3008/api/detect-location?testIP=88.191.250.130"

# IP Allemagne
curl "http://localhost:3008/api/detect-location?testIP=46.4.88.1"
```

### ✅ Solution 3 : Effacer le cache navigateur

Dans la console du navigateur (F12) :

```javascript
// Effacer tout le cache de localisation
localStorage.removeItem('auto_detected_language')
localStorage.removeItem('auto_detected_country')
localStorage.removeItem('auto_detection_timestamp')
localStorage.removeItem('manual_language_choice')
localStorage.removeItem('manual_chosen_language')

// Recharger la page
location.reload()
```

---

## Comment ça fonctionne en production ?

### Sur judgemyjpeg.fr (production)

1. **Cloudflare** injecte automatiquement les headers :
   - `cf-ipcountry` : Code pays (US, FR, DE...)
   - `cf-ipcity` : Ville
   - `cf-region` : Région

2. Ces headers sont **fiables à 100%** car basés sur l'IP publique réelle vue par Cloudflare

3. Pas de problème VPN en production → détection instantanée et précise

### Ordre de détection

L'API `/api/detect-location` essaie dans l'ordre :

1. **Headers Cloudflare** (production) → Confiance 95%
2. **Headers X-Forwarded-For** (proxies) → Confiance 90%
3. **API ip-api.com** avec IP publique → Confiance 95%
4. **Langue du navigateur** (fallback) → Confiance 60%
5. **France par défaut** (erreur) → Confiance 20%

---

## Mapping Pays → Langue

Voici les pays détectés et leur langue associée :

| Pays | Code | Langue |
|------|------|--------|
| 🇫🇷 France, Belgique, Suisse | FR, BE, CH | **Français** |
| 🇺🇸 USA, UK, Australie | US, GB, AU | **Anglais** |
| 🇪🇸 Espagne, Mexique, Argentine | ES, MX, AR | **Espagnol** |
| 🇩🇪 Allemagne, Autriche | DE, AT | **Allemand** |
| 🇮🇹 Italie | IT | **Italien** |
| 🇵🇹 Portugal, Brésil | PT, BR | **Portugais** |

---

## Fichiers impliqués

### Hooks
- `src/hooks/useAutoLocalization.ts` - Détection automatique
- `src/hooks/useTranslation.ts` - Système de traduction

### APIs
- `src/pages/api/detect-location.ts` - API de géolocalisation

### Composants
- `src/components/LocalizedHero.tsx` - Hero localisé (page d'accueil)
- `src/components/LanguageDebugger.tsx` - Outil de debug (dev only)

---

## Logs utiles

Dans la console du serveur Next.js, tu verras :

```bash
# Détection réussie
[INFO] Auto-localization success: { country: 'United States', language: 'en', confidence: 95 }

# Détection via IP publique
[DEBUG] Trying IP geolocation for: 8.8.8.8 (test mode)

# Fallback navigateur
[INFO] Auto-localization fallback to browser: { language: 'fr', confidence: 60 }
```

---

## Test complet

Pour tester toutes les langues en local :

1. Ouvre http://localhost:3008
2. Clique sur **🌍 Lang Debug**
3. Note ton IP publique affichée
4. Teste avec différentes IPs :
   - USA : `8.8.8.8`
   - UK : `8.8.4.4`
   - Allemagne : `46.4.88.1`
   - Espagne : `88.24.100.1`
5. Clique sur **🔄 Reset** après chaque test
6. Vérifie que la page change de langue

---

## En résumé

✅ **En production** : Détection automatique précise via Cloudflare
✅ **En dev avec VPN** : Utilise le bouton **🔄 Reset** du debugger
✅ **Pour tester** : Utilise le paramètre `?testIP=x.x.x.x`

Le système fonctionne parfaitement en production ! 🎉