# 📊 GUIDE CONFIGURATION SEO - JudgeMyJPEG

## 🚀 **ÉTAPES À SUIVRE MANUELLEMENT**

### **1️⃣ Google Search Console**
```
1. Va sur : https://search.google.com/search-console
2. Clique "Ajouter une propriété" → "Préfixe d'URL"
3. Saisis : https://www.judgemyjpeg.fr
4. Choisis "Balise HTML meta"
5. Copie le code : content="abc123def456..." 
6. Remplace dans src/pages/_app.tsx ligne 38 :
   AVANT: content="REMPLACE_PAR_TON_CODE_GOOGLE"
   APRÈS: content="ton-code-google-ici"
7. Push + redéploie Railway
8. Retourne Search Console → Clique "Vérifier"
```

**📤 Après vérification :**
- Soumets sitemap : `https://www.judgemyjpeg.fr/sitemap.xml`
- Demande indexation des pages principales
- Configure alertes (erreurs, Core Web Vitals)

---

### **2️⃣ Bing Webmaster Tools**
```
1. Va sur : https://www.bing.com/webmasters
2. Ajoute site : www.judgemyjpeg.fr
3. Choisis "Fichier XML" 
4. Télécharge BingSiteAuth.xml
5. Copie le code dedans
6. Remplace dans public/BingSiteAuth.xml ligne 3 :
   AVANT: REMPLACE_PAR_TON_CODE_BING
   APRÈS: ton-code-bing-ici
7. Push + redéploie
8. Clique "Vérifier" sur Bing
```

---

### **3️⃣ Google Analytics 4**
```
1. Va sur : https://analytics.google.com
2. Crée propriété "JudgeMyJPEG"
3. Configure flux données web
4. Copie ID mesure : G-XXXXXXXXXX
5. Ajoute dans Railway variables environnement :
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
6. Redéploie Railway
```

**Variables Railway à ajouter :**
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

### **4️⃣ Variables Environment Railway**
```
Dashboard Railway → judgemyjpeg → Variables
Ajoute ces variables :

NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX          # Google Analytics
NEXT_PUBLIC_GTAG_ID=G-XXXXXXXXXX        # Same as GA_ID
```

---

### **5️⃣ Verification Status**

**Page de tracking :** https://www.judgemyjpeg.fr/admin/seo-tracking

**Vérifications :**
- ✅ Google Search Console vérifié
- ✅ Sitemap soumis et indexé
- ✅ Bing Webmaster vérifié  
- ✅ Google Analytics fonctionnel
- ✅ Variables Railway configurées

---

### **6️⃣ KPIs à surveiller**

**Google Search Console :**
- Pages indexées / soumises
- Impressions / Clics / CTR  
- Position moyenne mots-clés
- Core Web Vitals mobile

**Google Analytics :**
- Sessions / Users / Bounce rate
- Pages populaires
- Conversions (inscriptions, analyses)
- Funnels d'acquisition

---

### **🔗 Liens Rapides**
- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster](https://www.bing.com/webmasters)  
- [Google Analytics](https://analytics.google.com)
- [Railway Dashboard](https://railway.app/dashboard)
- [Page Tracking](https://www.judgemyjpeg.fr/admin/seo-tracking)

---

### **📈 Résultats Attendus (7-14 jours)**
- **Indexation :** 100% pages soumises
- **Position :** Top 10 pour "analyse photo IA"
- **Trafic :** +200% visiteurs organiques
- **Core Web Vitals :** Toutes pages "Bon"

---

**⚠️ IMPORTANT :** Après chaque modification, attendre le redéploiement Railway avant de cliquer "Vérifier" sur les plateformes.