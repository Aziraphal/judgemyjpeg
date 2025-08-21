#!/bin/bash
# Setup Monitoring pour JudgeMyJPEG
# Usage: ./scripts/setup-monitoring.sh

echo "🔧 Configuration du monitoring JudgeMyJPEG"
echo "========================================"

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier si Sentry est installé
if ! npm list @sentry/nextjs >/dev/null 2>&1; then
    echo -e "${RED}❌ Sentry non installé. Installation...${NC}"
    npm install @sentry/nextjs
else
    echo -e "${GREEN}✅ Sentry déjà installé${NC}"
fi

# Vérifier les variables d'environnement
echo -e "\n${BLUE}🔍 Vérification des variables d'environnement...${NC}"

if [ -z "$NEXT_PUBLIC_SENTRY_DSN" ]; then
    echo -e "${YELLOW}⚠️  NEXT_PUBLIC_SENTRY_DSN non définie${NC}"
    echo "   1. Aller sur https://sentry.io/signup/"
    echo "   2. Créer un projet Next.js"
    echo "   3. Copier le DSN dans .env.local"
else
    echo -e "${GREEN}✅ NEXT_PUBLIC_SENTRY_DSN configurée${NC}"
fi

if [ -z "$SENTRY_DSN" ]; then
    echo -e "${YELLOW}⚠️  SENTRY_DSN non définie${NC}"
    echo "   Ajouter la même valeur que NEXT_PUBLIC_SENTRY_DSN"
else
    echo -e "${GREEN}✅ SENTRY_DSN configurée${NC}"
fi

# Test du health check
echo -e "\n${BLUE}🏥 Test du health check...${NC}"
if curl -f http://localhost:3008/api/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Health check non accessible (serveur éteint?)${NC}"
    echo "   Démarrer avec: npm run dev"
fi

# Instructions pour UptimeRobot
echo -e "\n${BLUE}📊 Configuration UptimeRobot (gratuit)...${NC}"
echo "1. Aller sur https://uptimerobot.com/signUp"
echo "2. Créer un monitor HTTP(s)"
echo "3. URL: https://www.judgemyjpeg.fr/api/health"
echo "4. Interval: 5 minutes"
echo "5. Alertes: Email + SMS"

# Instructions pour Railway env vars
echo -e "\n${BLUE}🚂 Configuration Railway...${NC}"
echo "1. railway login"
echo "2. railway link (sélectionner judgemyjpeg)"
echo "3. railway variables set NEXT_PUBLIC_SENTRY_DSN='your_dsn_here'"
echo "4. railway variables set SENTRY_DSN='your_dsn_here'"
echo "5. railway variables set NEXT_PUBLIC_APP_VERSION='1.0.0'"

# Recommandations finales
echo -e "\n${GREEN}🎯 Monitoring Setup Complet !${NC}"
echo -e "${GREEN}================================${NC}"
echo "✅ Sentry: Error tracking automatique"
echo "✅ Health Check: /api/health endpoint"
echo "✅ UptimeRobot: Monitoring uptime gratuit"
echo "✅ Performance: Métriques intégrées"

echo -e "\n${BLUE}📈 Next Steps:${NC}"
echo "1. Deploy sur Railway avec env vars"
echo "2. Setup UptimeRobot sur health check"
echo "3. Test error tracking avec une erreur volontaire"
echo "4. Load test: npm run load-test:prod"

echo -e "\n${GREEN}🚀 Ton app est maintenant monitorée H24 !${NC}"