# 🌍 Système de Traduction Automatique i18next

## ✅ Implémentation

Le site utilise maintenant **i18next** pour la traduction automatique côté client avec détection géolocalisée.

### 📦 Packages installés

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

### 🗂️ Fichiers créés

1. **`src/i18n/config.ts`** - Configuration i18next
   - Traductions FR (langue source)
   - Traductions EN (complète)
   - Fallback EN pour ES, DE, IT, PT (à compléter)
   - Détection automatique avec LanguageDetector
   - Cache localStorage

2. **`src/hooks/useLanguageSync.ts`** - Hook synchronisation
   - Sync entre i18next et détection géo
   - Ordre priorité: choix manuel > géo (≥60%) > fallback
   - Fonction `changeLanguage()` pour choix manuel

3. **`src/components/LanguageSwitcher.tsx`** - Sélecteur langue
   - Dropdown avec 6 langues (FR, EN, ES, DE, IT, PT)
   - Drapeaux + noms
   - Indicateur langue active
   - Sauvegarde choix manuel

### 🔧 Intégration

**`src/pages/_app.tsx`**
```typescript
import '@/i18n/config' // Import configuration
```

**Pages modifiées** :
- `src/pages/pricing.tsx` - Exemple d'utilisation avec `t()`

### 📝 Comment utiliser

#### Dans un composant React :

```typescript
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('pricing.title')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  )
}
```

#### Avec le sélecteur de langue :

```typescript
import LanguageSwitcher from '@/components/LanguageSwitcher'

function Nav() {
  return <LanguageSwitcher />
}
```

### 🌐 Clés de traduction disponibles

#### Navigation
- `nav.analyze` - "Analyser" / "Analyze"
- `nav.gallery` - "Galerie" / "Gallery"
- `nav.pricing` - "Tarifs" / "Pricing"
- `nav.dashboard` - "Dashboard" / "Dashboard"
- `nav.backHome` - "Retour à l'accueil" / "Back to home"

#### Pricing
- `pricing.title` - "Tarifs" / "Pricing"
- `pricing.free` - "Gratuit" / "Free"
- `pricing.premium` - "Premium" / "Premium"
- `pricing.forever` - "Pour toujours" / "Forever"
- `pricing.perMonth` - "par mois" / "per month"

#### Features
- `features.analysesPerMonth` - "analyses par mois" / "analyses per month"
- `features.unlimitedAnalyses` - "Analyses illimitées" / "Unlimited analyses"
- `features.advancedInsights` - "Insights IA avancés" / "Advanced AI insights"

#### Common
- `common.loading` - "Chargement..." / "Loading..."
- `common.error` - "Erreur" / "Error"
- `common.success` - "Succès" / "Success"
- `common.save` - "Enregistrer" / "Save"

### 🎯 Ordre de priorité

1. **Choix manuel** (localStorage: `manual_language_choice`) → Priorité absolue
2. **Détection géo** (confidence ≥60%) → Via useAutoLocalization
3. **Langue navigateur** → Détection i18next automatique
4. **Fallback français** → Par défaut

### ➕ Ajouter de nouvelles traductions

#### 1. Ajouter dans `src/i18n/config.ts` :

```typescript
const fr = {
  translation: {
    'mySection.myKey': 'Mon texte en français',
  }
}

const en = {
  translation: {
    'mySection.myKey': 'My text in English',
  }
}
```

#### 2. Utiliser dans le composant :

```typescript
<p>{t('mySection.myKey')}</p>
```

### 🌍 Langues supportées

| Langue | Code | Statut | Fallback |
|--------|------|--------|----------|
| 🇫🇷 Français | `fr` | ✅ Complet | - |
| 🇺🇸 Anglais | `en` | ✅ Complet | - |
| 🇪🇸 Espagnol | `es` | ⚠️ Fallback EN | À compléter |
| 🇩🇪 Allemand | `de` | ⚠️ Fallback EN | À compléter |
| 🇮🇹 Italien | `it` | ⚠️ Fallback EN | À compléter |
| 🇵🇹 Portugais | `pt` | ⚠️ Fallback EN | À compléter |

### 📄 Pages à traduire

#### ✅ Traduites (partiellement) :
- `/` - Page d'accueil (via LocalizedHero)
- `/pricing` - Tarifs (en cours)

#### ❌ À traduire :
- `/analyze` - Page d'analyse (utilise son propre système)
- `/dashboard` - Dashboard utilisateur
- `/settings` - Paramètres
- `/gallery` - Galerie
- `/collections` - Collections
- Navigation globale
- Footer
- Modals & composants

### 🚀 Prochaines étapes

1. **Compléter les traductions ES, DE, IT, PT** dans `src/i18n/config.ts`
2. **Traduire les pages prioritaires** :
   - Dashboard
   - Settings
   - Navigation
3. **Fusionner avec système existant** (`src/lib/translations.ts`)
4. **Ajouter traductions pour composants** :
   - Footer
   - Modals
   - Boutons d'action

### 🔄 Synchronisation avec détection auto

Le hook `useLanguageSync` synchronise automatiquement i18next avec :
- Détection géolocalisée (useAutoLocalization)
- Choix manuel utilisateur
- Cache localStorage

**Exemple d'utilisation** :

```typescript
import { useLanguageSync } from '@/hooks/useLanguageSync'

function MyComponent() {
  const { currentLanguage, changeLanguage } = useLanguageSync()

  return (
    <div>
      <p>Langue actuelle : {currentLanguage}</p>
      <button onClick={() => changeLanguage('en')}>English</button>
    </div>
  )
}
```

### 💡 Notes importantes

- **Pas de recompilation** : Les traductions sont chargées côté client
- **Cache localStorage** : i18next met en cache la langue choisie
- **SSR compatible** : Fonctionne avec Next.js sans problème
- **Performance** : Légère (bundle ~20KB)
- **Gratuit** : Pas de coût API externe

### 🧪 Tests

#### Test en local :

1. Ouvrir http://localhost:3008/pricing
2. Cliquer sur le sélecteur de langue (en haut)
3. Changer la langue → le texte doit changer instantanément
4. Recharger → la langue doit persister

#### Test avec VPN :

1. Activer VPN US
2. Effacer cache : localStorage.clear()
3. Ouvrir http://localhost:3008
4. Page d'accueil en anglais
5. Aller sur /pricing → doit être en anglais

### 📚 Documentation i18next

- [i18next Docs](https://www.i18next.com/)
- [react-i18next Docs](https://react.i18next.com/)
- [LanguageDetector](https://github.com/i18next/i18next-browser-languageDetector)

---

**Implémenté le 30/09/2025** ✅