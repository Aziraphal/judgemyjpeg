# 🚨 Setup Monitoring JudgeMyJPEG

## ⚡ Quick Start (5 minutes)

### 1. Créer compte Sentry (GRATUIT)
```bash
# 1. Aller sur https://sentry.io/signup/
# 2. Créer un nouveau projet "Next.js"
# 3. Copier le DSN fourni
```

### 2. Variables d'environnement
```bash
# Dans .env.local (local) et Railway (prod)
NEXT_PUBLIC_SENTRY_DSN="https://your_dsn@sentry.io/project"
SENTRY_DSN="https://your_dsn@sentry.io/project"  
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### 3. Deploy sur Railway
```bash
railway login
railway link
railway variables set NEXT_PUBLIC_SENTRY_DSN='your_dsn'
railway variables set SENTRY_DSN='your_dsn'
railway variables set NEXT_PUBLIC_APP_VERSION='1.0.0'
```

### 4. Setup UptimeRobot (GRATUIT)
```bash
# 1. Aller sur https://uptimerobot.com/signUp
# 2. Créer un monitor:
#    - Type: HTTP(s)
#    - URL: https://www.judgemyjpeg.fr/api/health
#    - Interval: 5 minutes
#    - Alertes: Email + SMS
```

## 🎯 Ce que ça surveille

### 🔍 **Sentry Error Tracking**
- ✅ Erreurs JavaScript client-side
- ✅ Erreurs API serveur 
- ✅ Performance monitoring (10% traffic)
- ✅ Session replay sur erreurs (debug UX)
- ✅ Filtrage intelligent (ignore erreurs temporaires)

### 🏥 **Health Check `/api/health`**
- ✅ Status base de données (PostgreSQL)
- ✅ Status OpenAI API
- ✅ Métriques mémoire serveur
- ✅ Response time global

### 📊 **UptimeRobot Monitoring**
- ✅ Uptime 24/7 gratuit
- ✅ Alertes email/SMS en cas de panne
- ✅ Page status publique (optionnel)
- ✅ Monitoring multi-régions

## 🚨 Alertes Configurées

### 🔴 **Critiques (Action immédiate)**
- Database DOWN → 503 error
- Health check fail → SMS + Email
- Error rate >10% → Investigation

### 🟡 **Warnings (Surveillance)**
- Database slow >1s → Optimisation
- OpenAI rate limited → Queue système
- Memory usage >80% → Scale serveur

### 🟢 **Info (Monitoring)**
- Erreurs filtrées → Logs seulement
- Performance normale → Dashboard

## 📱 Accès Monitoring

### Sentry Dashboard
```
https://sentry.io/organizations/your-org/projects/judgemyjpeg/
```

### UptimeRobot Dashboard  
```
https://uptimerobot.com/dashboard
```

### Health Check Live
```
https://www.judgemyjpeg.fr/api/health
```

## 🛠️ Debug & Troubleshooting

### Test Error Tracking Local
```javascript
// Dans la console navigateur pour tester
throw new Error('Test Sentry tracking')
```

### Test Health Check
```bash
curl https://www.judgemyjpeg.fr/api/health
```

### Logs Sentry Local
```bash
# Les erreurs dev sont loggées en console seulement
# Aucun envoi vers Sentry en développement
```

## 📊 Métriques Business

### KPIs trackés automatiquement
- ✅ Uptime % (UptimeRobot)
- ✅ Error rate % (Sentry)  
- ✅ Response time avg (Health check)
- ✅ Database performance (Query time)

### Alertes Business Critical
- Uptime <99% → Investigation infrastructure
- Erreurs analyses IA → Backup system
- DB saturée → Scale immédiat

## 🎯 Next Steps

Une fois configuré:

1. **Baseline établie** → Métriques normales connues
2. **Load test** → `npm run load-test:prod`
3. **Stress test** → Identifier limites actuelles
4. **Scale triggers** → Seuils automatiques

## ✅ Checklist de Validation

- [ ] Sentry reçoit les erreurs (test manuel)
- [ ] Health check accessible publiquement
- [ ] UptimeRobot surveille et alerte
- [ ] Variables Railway configurées
- [ ] Monitoring dashboard accessible

**🚀 Une fois validé → Tranquillité d'esprit totale !**

---

*Monitoring configuré = App prête pour le scaling ! 📈*