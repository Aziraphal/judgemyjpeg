# 🔥 Redis Cache Setup - JudgeMyJPEG

## 📋 Pourquoi Redis ?

**Problème actuel :** Le cache mémoire (Maps JavaScript) est perdu à chaque redémarrage de l'application, causant :
- 💸 Coûts API OpenAI inutiles (réanalyse de photos identiques)
- ⏱️ Temps de réponse plus longs pour les utilisateurs
- 📊 Pas de persistance entre instances (problème multi-container)

**Solution Redis :**
- ✅ Cache persistant entre redéploiements
- ✅ Partagé entre instances (scaling horizontal)
- ✅ -70% coûts OpenAI estimés
- ✅ Performances améliorées

---

## 🚀 Installation Railway (Production)

### Étape 1 : Ajouter le Plugin Redis

1. Connectez-vous à [Railway.app](https://railway.app)
2. Sélectionnez votre projet `judgemyjpeg`
3. Cliquez sur **"New" → "Plugin" → "Redis"**
4. Railway créera automatiquement une instance Redis

### Étape 2 : Configurer les Variables d'Environnement

Railway expose automatiquement `REDIS_URL` et `REDIS_PRIVATE_URL`. Ajoutez dans votre service :

```bash
# Variables Railway (auto-générées par le plugin)
REDIS_URL=${{Redis.REDIS_URL}}
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}  # Optionnel selon config
```

**Alternative manuelle :**
```bash
REDIS_URL=redis://default:password@redis.railway.internal:6379
```

### Étape 3 : Vérifier le Déploiement

```bash
# Les logs devraient afficher au démarrage :
✅ Cache Redis connecté
```

**Coût Railway Redis :** ~€5-10/mois (plan Hobby)

---

## 🧪 Installation Développement Local

### Option 1 : Docker (Recommandé)

```bash
# Lancer Redis avec Docker
docker run -d \
  --name redis-judgemyjpeg \
  -p 6379:6379 \
  redis:7-alpine

# Vérifier que Redis fonctionne
docker ps | grep redis
```

**Variables .env.local :**
```bash
REDIS_URL=redis://localhost:6379
# REDIS_PASSWORD=  # Pas de password en local
```

### Option 2 : Installation Native Windows

```powershell
# Télécharger Redis pour Windows (unofficial)
# https://github.com/microsoftarchive/redis/releases

# Ou utiliser WSL2
wsl --install
wsl
sudo apt update
sudo apt install redis-server
redis-server --daemonize yes

# Tester
redis-cli ping  # Doit retourner PONG
```

**Variables .env.local :**
```bash
REDIS_URL=redis://localhost:6379
```

### Option 3 : Cloud Redis Gratuit (Développement)

**Upstash** (10,000 commandes/jour gratuit) :
1. Créer compte sur [upstash.com](https://upstash.com)
2. Créer une base Redis
3. Copier `REDIS_URL` fournie

```bash
REDIS_URL=rediss://default:xxx@xxx.upstash.io:6379
```

---

## 🔧 Utilisation dans le Code

Le cache Redis est **déjà implémenté** dans `src/lib/cache-service.ts` avec fallback automatique vers mémoire.

### Exemple : Cache d'Analyse Photo

```typescript
import { cacheService } from '@/lib/cache-service'

// Générer hash unique de l'image
const imageHash = cacheService.generateImageHash(imageBuffer)

// Vérifier cache avant analyse
const cachedAnalysis = await cacheService.getCachedAnalysis(
  imageHash,
  'roast',      // tone
  'fr'          // language
)

if (cachedAnalysis) {
  console.log('🎯 Cache hit - analyse récupérée sans appel OpenAI')
  return cachedAnalysis
}

// Analyser avec OpenAI
const analysis = await analyzePhotoWithAI(imageBuffer, prompt)

// Sauver en cache (TTL: 24h = 86400 secondes)
await cacheService.cacheAnalysis(
  imageHash,
  analysis,
  'roast',
  'fr',
  86400  // 24 heures
)
```

### Vérifier le Type de Cache Utilisé

```typescript
const stats = await cacheService.getCacheStats()
console.log(stats)
// { type: 'redis', redis_info: {...} }
// ou
// { type: 'memory', memory_size: 42 }
```

### Invalidation du Cache

```typescript
// Invalider cache d'un utilisateur
await cacheService.invalidateUserCache(userId)

// Vider tout le cache (admin only)
await cacheService.clearCache()
```

---

## 📊 Monitoring Redis

### Via Redis CLI

```bash
# Connexion
redis-cli -h <host> -p 6379 -a <password>

# Voir toutes les clés
KEYS analysis:*

# Vérifier une clé spécifique
GET analysis:abc123:roast:fr

# Statistiques mémoire
INFO memory

# Nombre total de clés
DBSIZE

# Surveiller les commandes en temps réel
MONITOR
```

### Via Dashboard Railway

- **Metrics** : CPU, Memory, Network
- **Logs** : Accès temps réel aux logs Redis
- **Alerts** : Configuration alertes usage

### Endpoint Admin (À créer)

```typescript
// src/pages/api/admin/cache-stats.ts
import { cacheService } from '@/lib/cache-service'
import { withAdminAuth } from '@/lib/auth-middleware'

export default withAdminAuth(async (req, res) => {
  const stats = await cacheService.getCacheStats()
  res.json(stats)
})
```

---

## 🐛 Troubleshooting

### Redis ne se connecte pas

**Symptôme :** Logs affichent `📦 Cache: Utilisation mémoire locale (Redis non configuré)`

**Solutions :**
1. Vérifier que `REDIS_URL` est définie :
   ```bash
   echo $REDIS_URL
   ```

2. Tester connexion Redis :
   ```bash
   redis-cli -u $REDIS_URL ping
   ```

3. Vérifier firewall/network (Railway internal network)

### Erreur "Redis connection timeout"

**Solution :** Augmenter timeout dans `cache-service.ts` :
```typescript
socket: {
  connectTimeout: 10000  // 10 secondes au lieu de 5
}
```

### Cache hit rate faible

**Diagnostic :**
- Images différentes uploadées (hash différent)
- TTL trop court (augmenter à 48h)
- Utilisateurs changent souvent de mode/langue

**Solution :** Analyser les patterns d'usage :
```sql
-- Dans Prisma Studio ou DB direct
SELECT
  tone,
  language,
  COUNT(*) as analyses_count
FROM "Photo"
WHERE "createdAt" > NOW() - INTERVAL '7 days'
GROUP BY tone, language
ORDER BY analyses_count DESC
```

### Mémoire Redis pleine

**Railway Hobby Plan :** 512 MB RAM max

**Solutions :**
1. Réduire TTL (24h → 12h)
2. Implémenter LRU eviction :
   ```bash
   # Dans Railway Redis config
   CONFIG SET maxmemory-policy allkeys-lru
   ```
3. Upgrade plan Redis (€10 → €25 pour 2GB)

---

## 📈 Métriques de Succès

### KPIs à Tracker

| Métrique | Avant Redis | Après Redis | Objectif |
|----------|-------------|-------------|----------|
| **Cache Hit Rate** | 0% | ? | >40% |
| **Coût OpenAI/jour** | €X | ? | -70% |
| **Temps réponse avg** | 15s | ? | <10s |
| **Analyses/s max** | 5 | ? | 20+ |

### Calcul ROI Redis

```
Coût OpenAI par analyse : €0.002 (gpt-4o-mini)
Analyses/jour : 500
Taux cache hit estimé : 40%

Économie/jour = 500 × 0.40 × €0.002 = €0.40/jour
Économie/mois = €12/mois
Coût Redis = €5/mois

ROI = (€12 - €5) / €5 = +140% 💰
```

**+ Bénéfices secondaires :**
- UX améliorée (réponses instantanées)
- Scaling facilité (multi-instances)
- Résilience (redéploiements sans perte)

---

## 🔐 Sécurité Redis

### Best Practices

**✅ Production :**
- Utiliser `REDIS_PASSWORD` forte (32+ caractères)
- Connexions TLS uniquement (`rediss://`)
- Network isolé (Railway internal network)
- Pas d'exposition publique du port 6379

**✅ Développement :**
- Password optionnel (localhost only)
- Ne jamais commit `REDIS_URL` dans Git
- Utiliser `.env.local` (ignoré par Git)

### Audit Compliance

**RGPD :** Cache contient analyses photos (données personnelles)

**Actions requises :**
1. Documenter dans Privacy Policy
2. Implémenter "Right to Forget" :
   ```typescript
   // Supprimer cache utilisateur lors de suppression compte
   await cacheService.invalidateUserCache(userId)
   ```
3. Retention policy : TTL max 24-48h

---

## 🚀 Next Steps

### Priorité Immédiate (Aujourd'hui)

- [x] Redis déjà installé en dépendance (`package.json`)
- [x] Code cache déjà implémenté (`cache-service.ts`)
- [ ] **Configurer REDIS_URL sur Railway** (5 min)
- [ ] **Tester en production** (vérifier logs)
- [ ] **Monitorer hit rate** (premiers résultats après 24h)

### Améliorations Futures

- [ ] Dashboard admin cache stats
- [ ] Alerting si hit rate <20%
- [ ] Cache warmup stratégique (photos populaires)
- [ ] Compression valeurs Redis (gzip)
- [ ] Multi-region replication (Railway multi-zones)

---

## 📚 Resources

**Documentation :**
- [Redis Official Docs](https://redis.io/docs/)
- [node-redis Client](https://github.com/redis/node-redis)
- [Railway Redis Plugin](https://docs.railway.app/databases/redis)
- [Upstash Docs](https://docs.upstash.com/redis)

**Monitoring Tools :**
- [RedisInsight](https://redis.io/insight/) - GUI Redis
- [redis-commander](https://www.npmjs.com/package/redis-commander) - Web UI

**Support :**
- Railway Discord : [discord.gg/railway](https://discord.gg/railway)
- Redis Community : [redis.io/community](https://redis.io/community)

---

*Guide créé : 2025-09-29*
*Temps implémentation estimé : 15 minutes*
*ROI estimé : +140% (€7/mois économisés)*