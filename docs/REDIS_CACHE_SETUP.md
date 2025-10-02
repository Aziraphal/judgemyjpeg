# 🚀 Redis Cache Setup (Upstash)

## 📖 Pourquoi Redis Cache ?

**Performance améliorée** :
- ⚡ **-500ms** par analyse (cache hit)
- 🧠 **Embeddings RAG** cachés (7 jours)
- 📊 **Analyses** cachées (24h)
- 🌍 **Edge-optimized** (Upstash serverless)

**Coût** : **Gratuit** (10,000 commandes/jour avec Upstash free tier)

---

## 🔧 Installation (5 minutes)

### 1. Créer un compte Upstash (gratuit)

1. Va sur **https://upstash.com/**
2. Sign up (gratuit, aucune carte requise)
3. Crée une database Redis :
   - Cliquez **Create Database**
   - Name: `judgemyjpeg-cache`
   - Region: **eu-west-1** (Europe) ou us-east-1
   - Type: **Regional** (free tier)

### 2. Récupérer les credentials

Dans le dashboard Upstash :
1. Cliquez sur ta database `judgemyjpeg-cache`
2. Onglet **REST API**
3. Copie :
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 3. Configurer les variables d'environnement

Ajoute dans `.env.local` :

```bash
# Upstash Redis (Cache serverless)
UPSTASH_REDIS_REST_URL="https://xxx-xxxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 4. Tester la connexion

```bash
npx tsx scripts/init-upstash.ts
```

Tu devrais voir :
```
✅ Connexion Upstash Redis réussie !
🧪 Test SET/GET...
   - SET test: OK
   - GET test: hello-upstash
🎉 Upstash Redis configuré et testé avec succès !
```

### 5. Lancer l'app

```bash
npm run dev
```

🎉 **C'est tout !** Le cache Redis est maintenant actif.

---

## 📊 Ce qui est caché

### 1. Analyses photo (24h TTL)
```typescript
// Cache key: analysis:{imageHash}:{tone}:{language}
// TTL: 86400s (24h)
await cacheAnalysis(imageHash, analysis, tone, language, 86400)
```

**Bénéfice** :
- Même photo réanalysée = résultat instantané
- Économie tokens OpenAI
- -500ms de latence

### 2. Embeddings RAG (7 jours TTL)
```typescript
// Cache key: embedding:{imageHash}
// TTL: 604800s (7 jours)
await cacheEmbedding(imageHash, embedding, 604800)
```

**Bénéfice** :
- Évite de regénérer l'embedding (coûteux)
- RAG plus rapide
- Économie OpenAI embeddings API

### 3. Suggestions autocomplete (1h TTL)
```typescript
// Cache key: suggestions:{category}
// TTL: 3600s (1h)
await cacheSuggestions('portrait', suggestions, 3600)
```

---

## 🔍 Monitoring

### Dashboard Upstash

1. Va sur https://console.upstash.com/
2. Sélectionne ta database
3. Onglet **Metrics** :
   - Commandes/sec
   - Hit rate
   - Memory usage

### Logs de l'app

Active les logs Redis :
```bash
DEBUG=redis:* npm run dev
```

Tu verras :
```
📦 Redis: Analyse cached (analysis:abc123:professional:fr, TTL: 86400s)
🎯 Redis: Cache hit (analysis:abc123:professional:fr)
📦 Redis: Embedding cached (embedding:def456)
```

### API stats

Endpoint admin (à créer) :
```typescript
GET /api/admin/cache-stats
{
  "type": "upstash",
  "dbsize": 127,
  "hit_rate": 0.73,  // 73% cache hit
  "memory_used": "N/A (serverless)"
}
```

---

## 💰 Limites Free Tier

### Upstash Free

- **10,000 commandes/jour** (largement suffisant)
- **256 MB storage**
- **1 database**
- **HTTP/S REST API**

### Usage réaliste

```
Analyses/jour : 100
Cache hits : 50 (50%)
Commands/jour :
  - 50 SET (analyses neuves)
  - 50 GET (cache hits)
  - 100 total

→ 1% de la limite gratuite ✅
```

### Si limite atteinte

L'app **continue de fonctionner** sans cache :
```typescript
const client = getRedis()
if (!client) return null // Fallback gracieux
```

---

## 🎯 Stratégies de Cache

### TTL optimisés

| Type | TTL | Raison |
|------|-----|--------|
| Analyse | 24h | Photos changent peu |
| Embedding | 7j | Coûteux à générer |
| Suggestions | 1h | Data quasi-statique |
| Counters | 24h | Analytics journaliers |

### Invalidation

**Manuel (admin)** :
```typescript
await invalidateUserCache(userId)
// Supprime toutes les clés de cet user
```

**Auto (TTL)** :
- Redis expire automatiquement après TTL
- Pas de gestion manuelle nécessaire

### Patterns de clés

```
analysis:{imageHash}:{tone}:{language}
embedding:{imageHash}
suggestions:{category}
counter:analyses:{date}
user:{userId}:keys  // Set de clés par user
```

---

## 🚨 Troubleshooting

### "Redis not configured"

➡️ Vérifie que `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN` sont dans `.env.local`

### "Fetch error"

➡️ Problème réseau. Vérifie l'URL Upstash (doit commencer par `https://`)

### "401 Unauthorized"

➡️ Token invalide. Re-copie le token depuis Upstash console

### Cache ne fonctionne pas

1. Check logs : `DEBUG=redis:* npm run dev`
2. Vérifie Upstash dashboard (commandes/sec)
3. Test manuel :
```bash
npx tsx scripts/init-upstash.ts
```

---

## 📈 Performance attendue

### Avant Redis

```
Analyse photo : ~3-5 secondes
- Upload Cloudinary : 500ms
- OpenAI analysis : 2-4s
- Save DB : 200ms
```

### Après Redis (cache hit)

```
Analyse photo : ~50ms ⚡
- Redis GET : 10-30ms
- Response : 20ms
```

**Amélioration : 50-100x plus rapide** sur cache hit ! 🚀

---

## 🔄 Migration de l'ancien cache

L'ancien `cache-service.ts` (memory cache) est **deprecated** mais toujours présent pour référence.

**Nouveau** : `redis-cache.ts` (Upstash serverless)

Pas de migration nécessaire - le nouveau cache démarre vide et se remplit au fur et à mesure.

---

## ✅ Checklist Déploiement

- [ ] Compte Upstash créé
- [ ] Database Redis créée (eu-west-1)
- [ ] Variables ajoutées dans `.env.local`
- [ ] Test connexion OK (`npx tsx scripts/init-upstash.ts`)
- [ ] App démarre sans erreurs
- [ ] Premier cache hit visible dans logs
- [ ] Monitoring Upstash configuré

**Cache Redis = Performance x50** 🎉
