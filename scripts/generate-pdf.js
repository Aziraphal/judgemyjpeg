/**
 * Générateur PDF pour la documentation technique
 * Usage: node scripts/generate-pdf.js
 */

const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const MarkdownIt = require('markdown-it')

const md = new MarkdownIt({
  html: true,
  breaks: true,
  typographer: true
})

// Template HTML avec styles professionnels
const htmlTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>JudgeMyJPEG - Documentation Technique</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #1a202c;
            background: #ffffff;
            font-size: 11px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        h1 {
            color: #2d3748;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }
        
        h2 {
            color: #2d3748;
            font-size: 20px;
            font-weight: 600;
            margin: 25px 0 12px 0;
            border-left: 4px solid #667eea;
            padding-left: 12px;
        }
        
        h3 {
            color: #4a5568;
            font-size: 16px;
            font-weight: 600;
            margin: 20px 0 10px 0;
        }
        
        h4 {
            color: #4a5568;
            font-size: 14px;
            font-weight: 500;
            margin: 15px 0 8px 0;
        }
        
        p {
            margin-bottom: 12px;
            text-align: justify;
        }
        
        ul, ol {
            margin: 10px 0 10px 20px;
        }
        
        li {
            margin-bottom: 4px;
        }
        
        code {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 2px 6px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 10px;
        }
        
        pre {
            background: #1a202c;
            color: #f7fafc;
            border-radius: 6px;
            padding: 12px;
            margin: 12px 0;
            overflow-x: auto;
            font-size: 9px;
        }
        
        pre code {
            background: none;
            border: none;
            color: inherit;
            font-size: inherit;
            padding: 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 10px;
        }
        
        th, td {
            border: 1px solid #e2e8f0;
            padding: 8px;
            text-align: left;
        }
        
        th {
            background: #f7fafc;
            font-weight: 600;
            color: #2d3748;
        }
        
        .highlight {
            background: #e6fffa;
            border-left: 4px solid #38b2ac;
            padding: 12px;
            margin: 12px 0;
        }
        
        .success {
            color: #38a169;
            font-weight: 500;
        }
        
        .warning {
            color: #d69e2e;
            font-weight: 500;
        }
        
        .error {
            color: #e53e3e;
            font-weight: 500;
        }
        
        .badge {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: 500;
            margin-left: 8px;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #718096;
            font-size: 10px;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        /* Emojis styling */
        .emoji {
            font-family: 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif;
        }
        
        /* Status indicators */
        .status-good { color: #38a169; }
        .status-warning { color: #d69e2e; }
        .status-critical { color: #e53e3e; }
        
        @media print {
            body { font-size: 10px; }
            .container { padding: 15px; }
            pre { font-size: 8px; }
            table { font-size: 9px; }
        }
    </style>
</head>
<body>
    <div class="container">
        ${content}
        
        <div class="footer">
            <p><strong>JudgeMyJPEG - Documentation Technique Confidentielle</strong></p>
            <p>Généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} • Version 1.0</p>
            <p>© 2025 JudgeMyJPEG - Tous droits réservés</p>
        </div>
    </div>
</body>
</html>
`

async function generatePDF() {
    try {
        console.log('📄 Génération du PDF de documentation technique...')
        
        // Lire le fichier markdown
        const markdownPath = path.join(__dirname, '../TECHNICAL_OVERVIEW.md')
        const markdownContent = fs.readFileSync(markdownPath, 'utf8')
        
        // Convertir markdown en HTML
        const htmlContent = md.render(markdownContent)
        const fullHtml = htmlTemplate(htmlContent)
        
        // Lancer Puppeteer
        const browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
        
        const page = await browser.newPage()
        
        // Définir le contenu HTML
        await page.setContent(fullHtml, { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        })
        
        // Générer le PDF
        const pdfPath = path.join(__dirname, '../JudgeMyJPEG_Technical_Documentation.pdf')
        
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            },
            displayHeaderFooter: true,
            headerTemplate: `
                <div style="font-size: 10px; width: 100%; text-align: center; color: #718096; margin-top: 10px;">
                    <span>JudgeMyJPEG - Documentation Technique</span>
                </div>
            `,
            footerTemplate: `
                <div style="font-size: 10px; width: 100%; text-align: center; color: #718096; margin-bottom: 10px;">
                    <span>Page <span class="pageNumber"></span> sur <span class="totalPages"></span></span>
                </div>
            `
        })
        
        await browser.close()
        
        console.log('✅ PDF généré avec succès !')
        console.log('📍 Chemin:', pdfPath)
        
        // Statistiques du fichier
        const stats = fs.statSync(pdfPath)
        console.log('📊 Taille:', Math.round(stats.size / 1024), 'KB')
        
        return pdfPath
        
    } catch (error) {
        console.error('❌ Erreur lors de la génération PDF:', error)
        process.exit(1)
    }
}

// Exécuter si appelé directement
if (require.main === module) {
    generatePDF().then(pdfPath => {
        console.log('🎉 Documentation PDF prête pour présentation investisseurs !')
        console.log('   ', pdfPath)
    })
}

module.exports = generatePDF