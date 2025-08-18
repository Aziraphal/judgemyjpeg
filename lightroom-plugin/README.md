# 📸 JudgeMyJPEG - Plugin Lightroom

Plugin officiel Adobe Lightroom Classic pour l'analyse IA de photos avec JudgeMyJPEG.

## 🚀 Fonctionnalités

- **Analyse individuelle** : Score sur 100 + conseils détaillés
- **Analyse par lot** : Traitement simultané de plusieurs photos
- **3 modes d'analyse** : Professionnel, Cassant, Expert
- **Support multilingue** : 6 langues disponibles
- **Métadonnées automatiques** : Scores sauvés dans Lightroom
- **Interface native** : Intégration complète au workflow

## 📋 Prérequis

- Adobe Lightroom Classic 6.0+ (CC recommandé)
- Compte JudgeMyJPEG avec clé API
- Connexion internet active

## 🔧 Installation

1. **Télécharger** le plugin (dossier `lightroom-plugin`)
2. **Lightroom** → `Fichier` → `Gestionnaire de modules externes`
3. **Ajouter** → Sélectionner le dossier du plugin
4. **Activer** le plugin JudgeMyJPEG

## ⚙️ Configuration

1. **Obtenir une clé API** sur [judgemyjpeg.fr](https://www.judgemyjpeg.fr)
2. **Menu Lightroom** → `Paramètres JudgeMyJPEG`
3. **Coller la clé API** et valider
4. **Configurer** les préférences (mode, langue, qualité)

## 📖 Utilisation

### Analyse Individuelle
1. Sélectionner une photo dans le catalogue
2. Menu `Bibliothèque` → `Analyser avec JudgeMyJPEG`
3. Consulter les résultats dans la boîte de dialogue

### Analyse par Lot
1. Sélectionner plusieurs photos (Ctrl/Cmd + clic)
2. Menu `Bibliothèque` → `Analyse par lot JudgeMyJPEG`
3. Configurer les paramètres et lancer
4. Les scores sont automatiquement sauvés

### Filtrage par Score
1. Panneau `Métadonnées` → Afficher `JudgeMyJPEG`
2. Filtrer par score, mode, date d'analyse
3. Créer des collections intelligentes

## 🎭 Modes d'Analyse

| Mode | Description | Usage |
|------|-------------|-------|
| 👔 **Professionnel** | Analyse technique constructive | Apprentissage, conseils |
| 🔥 **Cassant** | Critique brutalement honnête | Feedback sans langue de bois |
| 🎯 **Expert** | Analyse ultra-technique | Niveau professionnel |

## 🏷️ Métadonnées Ajoutées

- **Score JudgeMyJPEG** : Note globale /100
- **Score Composition** : Cadrage, règle des tiers /15
- **Score Éclairage** : Qualité lumière /15
- **Score Netteté** : Mise au point /15
- **Score Exposition** : Histogramme /15
- **Score Créativité** : Originalité /15
- **Score Émotion** : Impact visuel /15
- **Score Narration** : Storytelling /10
- **Mode analyse** : Pro/Cassant/Expert
- **Date analyse** : Horodatage

## 💡 Workflows Recommandés

### 📊 Tri des Photos
```
1. Importer les photos
2. Analyse par lot (Mode Pro)
3. Filtrer par Score ≥ 80
4. Créer collection "Meilleures photos"
```

### 🎯 Amélioration Technique
```
1. Filtrer Score Exposition < 10
2. Corriger en développement
3. Re-analyser pour mesurer progrès
```

### 🏆 Sélection Portfolio
```
1. Analyse Mode Expert
2. Filtrer Score ≥ 85
3. Vérifier estimation commerciale
4. Exporter pour portfolio
```

## 🔧 API et Paramètres

### Configuration Avancée
- **Analyses simultanées** : 1-5 (recommandé: 3)
- **Délai entre requêtes** : 500-3000ms
- **Qualité export** : 50-100% JPEG
- **Taille maximale** : 1024-4096px

### Endpoints API
- **Analyse simple** : `/api/photos/analyze`
- **Analyse par lot** : `/api/batch-analyze`
- **Status API** : `/api/status`

## 🚨 Limitations & Bonnes Pratiques

### Limitations
- **Taille fichier** : Max 10MB par photo
- **Formats supportés** : JPEG, PNG, TIFF
- **Rate limiting** : 5 analyses/minute par utilisateur
- **Analyses simultanées** : Max 5 en parallèle

### Bonnes Pratiques
- **Export qualité** : 90% minimum pour analyse précise
- **Taille optimale** : 2048px côté long
- **Batch analysis** : 20 photos max par lot
- **Délai réseau** : 2 secondes entre requêtes

## 🔍 Dépannage

### Erreurs Communes

| Erreur | Cause | Solution |
|--------|-------|---------|
| "API Key invalide" | Clé incorrecte | Vérifier sur judgemyjpeg.fr |
| "Fichier introuvable" | Photo hors ligne | Reconnecter le disque |
| "Erreur réseau" | Connexion coupée | Vérifier internet/firewall |
| "Timeout" | Surcharge API | Réduire analyses simultanées |

### Logs de Debug
```lua
-- Activer les logs dans LrLogger
local logger = LrLogger('JudgeMyJPEG')
logger:enable('print') -- Affiche dans console
```

## 📞 Support

- **Site** : [judgemyjpeg.fr](https://www.judgemyjpeg.fr)
- **Email** : contact@judgemyjpeg.com
- **Documentation** : Guide intégré au plugin
- **Version** : 1.0.0

## 🔄 Changelog

### v1.0.0 (2025-01-18)
- ✅ Première version stable
- ✅ Analyse individuelle et par lot
- ✅ 3 modes d'analyse complets
- ✅ Support métadonnées Lightroom
- ✅ Interface de configuration
- ✅ Guide utilisateur intégré

## 📄 Licence

Plugin développé par JudgeMyJPEG pour Adobe Lightroom Classic.
Utilisation soumise aux conditions de service JudgeMyJPEG.

---

**🎯 Développé avec passion pour améliorer votre workflow photo !**