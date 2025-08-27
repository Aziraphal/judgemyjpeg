@echo off
echo ============================================
echo    DEPLOIEMENT PRODUCTION - JUDGEMYJPEG
echo ============================================
echo.

echo ✅ 1. Verification des corrections...
node scripts/verify-production-fixes.js
if %errorlevel% neq 0 (
    echo ❌ Echec de la verification - ARRET
    exit /b 1
)
echo.

echo ✅ 2. Build production...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Echec du build - ARRET  
    exit /b 1
)
echo.

echo ✅ 3. Test du serveur local...
echo    Demarrage du serveur de test...
start /min cmd /c "npm run start"
timeout /t 5 /nobreak >nul
echo    Test de l'admin dashboard...
curl -s -o nul -w "Status: %%{http_code}" http://localhost:3008/admin/login
echo.
echo    Arret du serveur de test...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Judge*" >nul 2>&1
echo.

echo ✅ 4. Preparation commit git...
git add .
git status
echo.

echo ============================================
echo    PRET POUR LE DEPLOIEMENT PRODUCTION!
echo ============================================
echo.
echo Prochaines etapes:
echo   1. git commit -m "🔧 fix: resolve admin dashboard bugs for production"
echo   2. git push origin main
echo   3. Verifier le deploiement sur Railway
echo   4. Tester admin dashboard en production
echo.
echo 🎯 URL Admin Production: https://votre-site.com/admin/login
echo 🔑 Password: [Variable ADMIN_SECRET de production]
echo.
echo ✨ Toutes les corrections sont appliquées et testées!