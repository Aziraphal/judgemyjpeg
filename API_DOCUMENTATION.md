# 📡 JudgeMyJPEG Public API v1.0

## 🚀 Introduction

L'API JudgeMyJPEG permet aux développeurs d'intégrer l'analyse photo IA dans leurs applications, sites web ou workflows.

**Base URL:** `https://www.judgemyjpeg.fr/api/v1`

**Caractéristiques:**
- ✅ Authentification par API Key
- ✅ 3 modes d'analyse (Roast/Professional/Learning)
- ✅ Support multilingue (6 langues)
- ✅ Rate limiting intelligent (100 req/h par défaut)
- ✅ Metered billing via Stripe (€0.10/analyse)
- ✅ Webhooks pour résultats asynchrones (coming soon)

---

## 🔑 Authentification

### Obtenir une API Key

1. Créer un compte sur [judgemyjpeg.fr](https://www.judgemyjpeg.fr)
2. Aller dans **Account → API Keys**
3. Cliquer sur **"Generate New API Key"**
4. Copier la clé (elle ne sera affichée qu'une fois!)

### Utiliser l'API Key

Inclure l'API Key dans le header `Authorization` de chaque requête :

```bash
Authorization: Bearer jmj_live_abc123xyz...
```

**⚠️ Sécurité :**
- Ne jamais commit vos API keys dans Git
- Stocker dans variables d'environnement
- Utiliser des clés différentes dev/prod
- Révoquer immédiatement si compromise

---

## 📋 Endpoints

### POST /api/v1/analyze

Analyse une photo avec l'IA JudgeMyJPEG.

**Rate Limit:** 100 requêtes/heure (configurable selon plan)

#### Request

```http
POST /api/v1/analyze
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "imageUrl": "https://example.com/photo.jpg",  // OU imageBase64
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQ...",  // OU imageUrl
  "tone": "professional",  // roast | professional | learning
  "language": "en",        // fr | en | es | de | it | pt
  "photoType": "portrait"  // general | portrait | landscape | street | macro...
}
```

**Paramètres :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `imageUrl` | string | Non* | URL publique de l'image à analyser |
| `imageBase64` | string | Non* | Image encodée en base64 (avec ou sans data URI) |
| `tone` | string | Non | Mode d'analyse (défaut: `professional`) |
| `language` | string | Non | Langue de l'analyse (défaut: `en`) |
| `photoType` | string | Non | Type de photo pour analyse spécialisée (défaut: `general`) |

*Fournir soit `imageUrl` SOIT `imageBase64`

**Tones disponibles :**
- `roast` : Critiques sarcastiques et créatives
- `professional` : Analyse technique constructive
- `learning` : Approche pédagogique progressive

**Languages supportées :**
`fr`, `en`, `es`, `de`, `it`, `pt`

**Photo Types :**
`general`, `portrait`, `landscape`, `street`, `macro`, `architecture`, `nature`, `sport`, `night`, `wedding`, `abstract`, `documentary`, `fashion`, `food`, `travel`

#### Response Success (200)

```json
{
  "success": true,
  "data": {
    "score": 78,
    "partialScores": {
      "composition": 82,
      "lighting": 75,
      "focus": 90,
      "exposure": 70,
      "creativity": 68,
      "emotion": 80,
      "storytelling": 72
    },
    "summary": "Great composition with interesting use of leading lines...",
    "suggestions": [
      "Increase exposure by +0.7 EV to brighten shadows",
      "Consider cropping slightly tighter on the subject",
      "Enhance saturation in post-processing for more vibrant colors"
    ],
    "improvements": [
      {
        "impact": "Increase shadows recovery",
        "description": "Use Lightroom shadows slider at +40 to reveal hidden details",
        "difficulty": "facile",
        "scoreGain": 5
      }
    ],
    "tone": "professional",
    "language": "en",
    "processingTime": 4532
  },
  "usage": {
    "creditsUsed": 1,
    "creditsRemaining": 999,
    "rateLimit": {
      "limit": 100,
      "remaining": 87,
      "resetAt": "2025-09-29T15:00:00.000Z"
    }
  },
  "metadata": {
    "apiVersion": "1.0",
    "timestamp": "2025-09-29T14:23:45.123Z"
  }
}
```

#### Response Errors

**401 Unauthorized**
```json
{
  "error": "Invalid or inactive API key",
  "message": "Get your API key at https://judgemyjpeg.fr/account/api"
}
```

**429 Rate Limit Exceeded**
```json
{
  "error": "Rate limit exceeded",
  "limit": 100,
  "resetAt": "2025-09-29T15:00:00.000Z"
}
```

**400 Bad Request**
```json
{
  "error": "Missing image data",
  "message": "Provide either 'imageUrl' or 'imageBase64'"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "OpenAI API timeout"
}
```

---

## 💡 Exemples de Code

### cURL

```bash
curl -X POST https://www.judgemyjpeg.fr/api/v1/analyze \
  -H "Authorization: Bearer jmj_live_abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/photo.jpg",
    "tone": "professional",
    "language": "en"
  }'
```

### JavaScript / Node.js

```javascript
const analyzePhoto = async (imageUrl) => {
  const response = await fetch('https://www.judgemyjpeg.fr/api/v1/analyze', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.JUDGEMYJPEG_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      imageUrl,
      tone: 'professional',
      language: 'en'
    })
  })

  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error)
  }

  return result.data
}

// Usage
analyzePhoto('https://example.com/photo.jpg')
  .then(analysis => {
    console.log(`Score: ${analysis.score}/100`)
    console.log(`Suggestions: ${analysis.suggestions.join(', ')}`)
  })
```

### Python

```python
import requests
import os

def analyze_photo(image_url: str, tone: str = 'professional') -> dict:
    url = 'https://www.judgemyjpeg.fr/api/v1/analyze'
    headers = {
        'Authorization': f"Bearer {os.getenv('JUDGEMYJPEG_API_KEY')}",
        'Content-Type': 'application/json'
    }
    payload = {
        'imageUrl': image_url,
        'tone': tone,
        'language': 'en'
    }

    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()

    result = response.json()
    if not result.get('success'):
        raise Exception(result.get('error'))

    return result['data']

# Usage
analysis = analyze_photo('https://example.com/photo.jpg')
print(f"Score: {analysis['score']}/100")
print(f"Processing time: {analysis['processingTime']}ms")
```

### PHP

```php
<?php

function analyzePhoto($imageUrl, $tone = 'professional') {
    $apiKey = getenv('JUDGEMYJPEG_API_KEY');

    $ch = curl_init('https://www.judgemyjpeg.fr/api/v1/analyze');

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer $apiKey",
            "Content-Type: application/json"
        ],
        CURLOPT_POSTFIELDS => json_encode([
            'imageUrl' => $imageUrl,
            'tone' => $tone,
            'language' => 'en'
        ])
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $result = json_decode($response, true);

    if ($httpCode !== 200 || !$result['success']) {
        throw new Exception($result['error'] ?? 'Unknown error');
    }

    return $result['data'];
}

// Usage
$analysis = analyzePhoto('https://example.com/photo.jpg');
echo "Score: " . $analysis['score'] . "/100\n";
?>
```

### Ruby

```ruby
require 'net/http'
require 'json'

def analyze_photo(image_url, tone: 'professional')
  uri = URI('https://www.judgemyjpeg.fr/api/v1/analyze')

  request = Net::HTTP::Post.new(uri)
  request['Authorization'] = "Bearer #{ENV['JUDGEMYJPEG_API_KEY']}"
  request['Content-Type'] = 'application/json'
  request.body = {
    imageUrl: image_url,
    tone: tone,
    language: 'en'
  }.to_json

  response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
    http.request(request)
  end

  result = JSON.parse(response.body)

  raise result['error'] unless result['success']

  result['data']
end

# Usage
analysis = analyze_photo('https://example.com/photo.jpg')
puts "Score: #{analysis['score']}/100"
```

---

## 💰 Pricing & Billing

### Plans API

| Plan | Prix | Inclus | Rate Limit |
|------|------|--------|------------|
| **Free** | €0 | 10 analyses/mois | 10 req/h |
| **Starter** | €29/mois | 300 analyses/mois | 50 req/h |
| **Professional** | €99/mois | 1000 analyses/mois | 100 req/h |
| **Enterprise** | Custom | Illimité | Custom |

### Metered Billing (Pay-as-you-go)

- **€0.10 par analyse** au-delà du quota inclus
- Facturation mensuelle automatique via Stripe
- Pas de surprise : alertes configurables avant dépassement

### Crédits

Chaque analyse consomme **1 crédit**.

Consulter votre solde actuel dans la réponse API :
```json
"usage": {
  "creditsUsed": 1,
  "creditsRemaining": 999
}
```

---

## 📊 Rate Limiting

### Limites par Défaut

- **Free:** 10 requêtes/heure
- **Starter:** 50 requêtes/heure
- **Professional:** 100 requêtes/heure
- **Enterprise:** Configurable

### Headers Rate Limit

Chaque réponse inclut les headers suivants :

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1738164000
```

### Gérer les Rate Limits

```javascript
const analyzeWithRetry = async (imageUrl, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('...', {...})

      if (response.status === 429) {
        const resetAt = response.headers.get('X-RateLimit-Reset')
        const waitMs = (parseInt(resetAt) * 1000) - Date.now()

        console.log(`Rate limited, waiting ${waitMs}ms...`)
        await new Promise(resolve => setTimeout(resolve, waitMs))
        continue
      }

      return await response.json()
    } catch (error) {
      if (i === maxRetries - 1) throw error
    }
  }
}
```

---

## 🔒 Sécurité

### Best Practices

1. **Stockage Sécurisé**
   - Variables d'environnement (`.env`, secrets manager)
   - Jamais hardcodé dans le code source

2. **Rotation Régulière**
   - Changer les clés tous les 3-6 mois
   - Révoquer immédiatement si compromise

3. **Clés Spécifiques**
   - Clés séparées dev/staging/prod
   - Permissions minimales (principe du moindre privilège)

4. **Monitoring**
   - Surveiller usage anormal
   - Alertes sur pics de requêtes

### HTTPS Obligatoire

Toutes les requêtes API doivent utiliser HTTPS. Les requêtes HTTP sont automatiquement rejetées.

---

## 🐛 Gestion des Erreurs

### Codes d'Erreur HTTP

| Code | Signification | Action Recommandée |
|------|---------------|-------------------|
| 200 | Succès | - |
| 400 | Requête invalide | Vérifier les paramètres |
| 401 | Non autorisé | Vérifier l'API key |
| 403 | Interdit | Permissions insuffisantes |
| 429 | Rate limit dépassé | Attendre reset ou upgrader plan |
| 500 | Erreur serveur | Réessayer avec backoff exponentiel |
| 503 | Service indisponible | Vérifier [status.judgemyjpeg.fr](https://status.judgemyjpeg.fr) |

### Retry Strategy

```javascript
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const analyzeWithBackoff = async (imageUrl, maxRetries = 5) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await analyzePhoto(imageUrl)
      return response
    } catch (error) {
      if (attempt === maxRetries - 1) throw error

      // Backoff exponentiel: 1s, 2s, 4s, 8s, 16s
      const waitMs = Math.pow(2, attempt) * 1000
      console.log(`Retry ${attempt + 1}/${maxRetries} after ${waitMs}ms`)
      await sleep(waitMs)
    }
  }
}
```

---

## 📈 Monitoring & Analytics

### Dashboard API

Accès à votre dashboard API : [judgemyjpeg.fr/account/api](https://judgemyjpeg.fr/account/api)

**Métriques disponibles :**
- Requêtes totales (jour/semaine/mois)
- Taux de succès
- Temps de réponse moyen
- Crédits consommés
- Top endpoints
- Erreurs par code

### Webhooks (Coming Soon)

Recevez des notifications en temps réel :
- Analyses terminées (mode async)
- Crédits faibles (<10%)
- Rate limit approché (>80%)
- Erreurs critiques

---

## 🚀 Roadmap API

### Q4 2024
- [x] API v1.0 MVP
- [ ] Webhooks pour résultats asynchrones
- [ ] Support batch analysis (multiple photos)
- [ ] Playground interactif (docs.judgemyjpeg.fr)

### Q1 2025
- [ ] API v1.1 avec streaming responses
- [ ] SDK officiels (JavaScript, Python, PHP)
- [ ] GraphQL endpoint
- [ ] Comparaison avant/après (2 images)

### Q2 2025
- [ ] Custom AI training endpoint
- [ ] White-label API pour agences
- [ ] SLA 99.9% garanti (Enterprise)

---

## 📞 Support

### Ressources

- **Documentation** : [docs.judgemyjpeg.fr](https://docs.judgemyjpeg.fr)
- **Status Page** : [status.judgemyjpeg.fr](https://status.judgemyjpeg.fr)
- **GitHub Samples** : [github.com/judgemyjpeg/api-examples](https://github.com/judgemyjpeg/api-examples)
- **Discord** : [discord.gg/judgemyjpeg](https://discord.gg/judgemyjpeg)

### Contact

- **Email API Support** : api@judgemyjpeg.fr
- **Bugs & Issues** : [GitHub Issues](https://github.com/judgemyjpeg/issues)
- **Feature Requests** : [Feature Voting](https://judgemyjpeg.canny.io)

### SLA (Enterprise)

- **Uptime** : 99.9% garanti
- **Support** : <1h response time
- **Dedicated** : Slack channel privé

---

## 🎓 Tutoriels & Use Cases

### 1. Intégration WordPress Plugin

Analysez automatiquement les photos uploadées dans WordPress Media Library.

[→ Voir le tutoriel complet](https://docs.judgemyjpeg.fr/tutorials/wordpress)

### 2. Bot Discord de Critique Photo

Créez un bot Discord qui analyse les photos partagées dans un channel.

[→ Voir le tutoriel complet](https://docs.judgemyjpeg.fr/tutorials/discord-bot)

### 3. Pipeline CI/CD pour Photographes

Automatisez l'analyse qualité des photos dans votre workflow de post-production.

[→ Voir le tutoriel complet](https://docs.judgemyjpeg.fr/tutorials/cicd-pipeline)

### 4. Application Mobile React Native

Intégrez JudgeMyJPEG dans votre app mobile photo.

[→ Voir le tutoriel complet](https://docs.judgemyjpeg.fr/tutorials/react-native)

---

## 📜 Changelog

### v1.0 (2025-09-29)
- 🎉 Initial public release
- ✨ 3 modes d'analyse (Roast/Professional/Learning)
- ✨ Support 6 langues
- ✨ 15 types de photos spécialisés
- ✨ Metered billing Stripe
- ✨ Rate limiting intelligent

---

*Made with ❤️ by [JudgeMyJPEG](https://www.judgemyjpeg.fr) - API v1.0*