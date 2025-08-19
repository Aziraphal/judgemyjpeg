-- Migration pour corriger les champs Starter Pack manquants
-- À exécuter sur la base de données Neon

-- Mise à jour des utilisateurs existants qui n'ont pas les champs starter pack
UPDATE "User" 
SET 
  "starterPackPurchased" = false,
  "starterPackUsed" = false,
  "starterAnalysisCount" = 0,
  "starterSharesCount" = 0,
  "starterExportsCount" = 0,
  "starterPackActivated" = NULL
WHERE 
  "starterPackPurchased" IS NULL 
  OR "starterAnalysisCount" IS NULL 
  OR "starterSharesCount" IS NULL 
  OR "starterExportsCount" IS NULL;

-- Vérification des résultats
SELECT 
  email,
  "subscriptionStatus",
  "starterPackPurchased",
  "starterPackUsed",
  "starterAnalysisCount",
  "starterSharesCount",
  "starterExportsCount"
FROM "User" 
WHERE email IS NOT NULL
ORDER BY "createdAt" DESC
LIMIT 10;