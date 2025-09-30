-- Script SQL pour ajouter les colonnes manualPremium manuellement
-- À exécuter sur la base de données de production

-- Ajouter les colonnes si elles n'existent pas
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "manualPremiumAccess" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "manualPremiumReason" TEXT,
  ADD COLUMN IF NOT EXISTS "manualPremiumGrantedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "manualPremiumGrantedBy" TEXT;

-- Vérification
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'User'
  AND column_name LIKE 'manualPremium%'
ORDER BY column_name;

-- Mettre à jour le compte développeur
UPDATE "User"
SET
  "manualPremiumAccess" = true,
  "manualPremiumReason" = 'Compte développeur - accès lifetime',
  "manualPremiumGrantedAt" = NOW(),
  "manualPremiumGrantedBy" = 'admin'
WHERE email = 'cyril.paquier@gmail.com';

-- Vérifier l'utilisateur
SELECT
  email,
  "subscriptionStatus",
  "manualPremiumAccess",
  "manualPremiumReason",
  "manualPremiumGrantedAt"
FROM "User"
WHERE email = 'cyril.paquier@gmail.com';
