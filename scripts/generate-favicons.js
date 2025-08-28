/**
 * Générateur de favicons PNG à partir du SVG
 * Crée tous les formats nécessaires pour Google Search
 */

const fs = require('fs')
const path = require('path')

// Favicon SVG optimisé pour Google
const faviconSVG = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <!-- Background rose magenta -->
  <rect width="32" height="32" rx="6" fill="#FF006E"/>
  
  <!-- Camera icon blanc -->
  <g fill="#ffffff">
    <!-- Camera body -->
    <rect x="6" y="12" width="20" height="12" rx="2"/>
    <!-- Lens outer -->
    <circle cx="16" cy="18" r="4"/>
    <!-- Lens inner -->
    <circle cx="16" cy="18" r="2.5" fill="#FF006E"/>
    <!-- Flash -->
    <rect x="22" y="14" width="2" height="2" rx="1"/>
  </g>
  
  <!-- AI indicator dots -->
  <g fill="#00F5FF" opacity="0.9">
    <circle cx="10" cy="8" r="0.8"/>
    <circle cx="16" cy="8" r="0.8"/>
    <circle cx="22" cy="8" r="0.8"/>
  </g>
</svg>`

// Apple Touch Icon (512x512 pour PWA)
const appleTouchIconSVG = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background avec gradient -->
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF006E;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8338EC;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="90" fill="url(#bg)"/>
  
  <!-- Camera scaled for 512px -->
  <g fill="#ffffff">
    <!-- Camera body -->
    <rect x="96" y="192" width="320" height="192" rx="32"/>
    <!-- Lens outer -->
    <circle cx="256" cy="288" r="64"/>
    <!-- Lens inner -->
    <circle cx="256" cy="288" r="40" fill="#FF006E"/>
    <!-- Flash -->
    <rect x="352" y="224" width="32" height="32" rx="16"/>
  </g>
  
  <!-- AI indicator dots -->
  <g fill="#00F5FF" opacity="0.9">
    <circle cx="160" cy="128" r="12"/>
    <circle cx="256" cy="128" r="12"/>
    <circle cx="352" cy="128" r="12"/>
  </g>
</svg>`

async function generateFavicons() {
    console.log('🎨 Génération des favicons optimisés pour Google...')
    
    const publicDir = path.join(__dirname, '../public')
    
    try {
        // 1. Favicon SVG principal
        fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSVG)
        console.log('✅ favicon.svg généré')
        
        // 2. Apple Touch Icon SVG
        fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.svg'), appleTouchIconSVG)
        console.log('✅ apple-touch-icon.svg généré')
        
        // 3. Créer des placeholders PNG (remplace les vrais par des services en ligne)
        const createPNGPlaceholder = (filename, size) => {
            const placeholder = `<!-- PNG ${size}x${size} généré depuis favicon.svg -->
            <!-- Utilise un service comme https://realfavicongenerator.net pour les vrais PNG -->
            <svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              ${faviconSVG.replace(/width="32" height="32"/, `width="${size}" height="${size}"`)}
            </svg>`
            
            // Pour l'instant, on crée des SVG qui seront remplacés par des PNG
            const svgFilename = filename.replace('.png', '.svg')
            fs.writeFileSync(path.join(publicDir, svgFilename), placeholder)
        }
        
        // Tailles standard pour Google
        createPNGPlaceholder('favicon-16x16.png', 16)
        createPNGPlaceholder('favicon-32x32.png', 32)
        createPNGPlaceholder('apple-touch-icon.png', 180)
        
        console.log('✅ Placeholders PNG créés')
        
        // 4. Mettre à jour le manifest.json
        const manifestPath = path.join(publicDir, 'manifest.json')
        let manifest = {}
        
        if (fs.existsSync(manifestPath)) {
            manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
        }
        
        manifest.icons = [
            {
                "src": "/favicon-16x16.png",
                "sizes": "16x16",
                "type": "image/png"
            },
            {
                "src": "/favicon-32x32.png", 
                "sizes": "32x32",
                "type": "image/png"
            },
            {
                "src": "/apple-touch-icon.png",
                "sizes": "180x180", 
                "type": "image/png"
            },
            {
                "src": "/favicon.svg",
                "sizes": "any",
                "type": "image/svg+xml"
            }
        ]
        
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
        console.log('✅ manifest.json mis à jour')
        
        console.log('\\n🎯 Instructions finales:')
        console.log('1. Va sur https://realfavicongenerator.net')
        console.log('2. Upload ton favicon.svg depuis /public')
        console.log('3. Télécharge le package et remplace les PNG placeholder')
        console.log('4. Google Search Console: demande une réindexation')
        console.log('\\n✨ Favicons prêts pour Google Search!')
        
    } catch (error) {
        console.error('❌ Erreur génération favicons:', error)
    }
}

// Exécuter si appelé directement
if (require.main === module) {
    generateFavicons()
}

module.exports = generateFavicons