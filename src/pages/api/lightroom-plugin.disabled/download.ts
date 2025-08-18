import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import { logger } from '@/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Chemin vers le dossier du plugin
    const pluginPath = path.join(process.cwd(), 'lightroom-plugin')
    
    // Vérifier que le dossier existe
    if (!fs.existsSync(pluginPath)) {
      logger.error('Plugin directory not found:', pluginPath)
      return res.status(404).json({ error: 'Plugin not found' })
    }

    // Configuration des headers pour le téléchargement
    const filename = 'JudgeMyJPEG-Lightroom-Plugin-v1.0.zip'
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Cache-Control', 'no-cache')

    // Créer l'archive ZIP
    const archive = archiver('zip', {
      zlib: { level: 9 } // Compression maximale
    })

    // Gérer les erreurs d'archivage
    archive.on('error', (err) => {
      logger.error('Archive error:', err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Archive creation failed' })
      }
    })

    // Pipe l'archive vers la réponse
    archive.pipe(res)

    // Ajouter tous les fichiers du plugin au ZIP
    const pluginFiles = [
      'Info.lua',
      'AnalyzePhoto.lua',
      'BatchAnalyze.lua', 
      'Settings.lua',
      'JudgeMyJPEGMetadata.lua',
      'JudgeMyJPEG.lua',
      'guide.html',
      'README.md'
    ]

    // Créer un dossier dans le ZIP pour organiser les fichiers
    const folderName = 'JudgeMyJPEG.lrplugin'

    for (const file of pluginFiles) {
      const filePath = path.join(pluginPath, file)
      
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: `${folderName}/${file}` })
        logger.info(`Added to archive: ${file}`)
      } else {
        logger.warn(`Plugin file not found: ${file}`)
      }
    }

    // Ajouter des métadonnées au ZIP
    const metaInfo = `# JudgeMyJPEG Lightroom Plugin v1.0
# Téléchargé le: ${new Date().toISOString()}
# Site: https://www.judgemyjpeg.fr
# Support: contact@judgemyjpeg.com

## Installation:
1. Dézippez ce fichier
2. Lightroom → Fichier → Gestionnaire de modules externes → Ajouter
3. Sélectionnez le dossier "JudgeMyJPEG.lrplugin"
4. Configurez votre clé API dans les paramètres

## Documentation complète:
Ouvrez guide.html dans le dossier du plugin
`

    archive.append(metaInfo, { name: `${folderName}/INSTALLATION.txt` })

    // Finaliser l'archive
    await archive.finalize()

    // Logger le téléchargement
    logger.info('Lightroom plugin downloaded', {
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Download error:', error)
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Download failed',
        message: 'Une erreur est survenue lors de la génération du plugin' 
      })
    }
  }
}