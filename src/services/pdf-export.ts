import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { PhotoAnalysis } from './openai'

interface BatchPhoto {
  id: string
  file: File
  url: string
  analysis?: PhotoAnalysis
  status: 'pending' | 'analyzing' | 'completed' | 'error'
}

interface BatchReport {
  totalPhotos: number
  avgScore: number
  topPhoto: BatchPhoto | null
  worstPhoto: BatchPhoto | null
  categoryAnalysis: {
    composition: number
    lighting: number
    focus: number
    exposure: number
    creativity: number
    emotion: number
    storytelling: number
  }
  overallRecommendations: string[]
}

export class PDFExporter {
  private pdf: jsPDF
  private pageHeight: number = 297 // A4 height in mm
  private pageWidth: number = 210 // A4 width in mm
  private margin: number = 20
  private currentY: number = 20

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4')
  }

  async exportBatchReport(
    photos: BatchPhoto[], 
    report: BatchReport, 
    userEmail: string
  ): Promise<void> {
    // Page de garde
    await this.createCoverPage(report, userEmail)
    
    // Résumé exécutif
    this.createSummaryPage(report)
    
    // Analyse détaillée de chaque photo
    for (const photo of photos.filter(p => p.analysis)) {
      await this.createPhotoAnalysisPage(photo)
    }
    
    // Recommandations globales
    this.createRecommendationsPage(report)
    
    // Page de conclusions
    this.createConclusionPage(report)
    
    // Télécharger le PDF
    const timestamp = new Date().toISOString().split('T')[0]
    this.pdf.save(`JudgeMyJPEG_Rapport_${timestamp}.pdf`)
  }

  private async createCoverPage(report: BatchReport, userEmail: string) {
    this.pdf.setFillColor(15, 23, 42) // cosmic-dark
    this.pdf.rect(0, 0, this.pageWidth, this.pageHeight, 'F')
    
    // Titre principal
    this.pdf.setTextColor(236, 72, 153) // neon-pink
    this.pdf.setFontSize(32)
    this.pdf.setFont('helvetica', 'bold')
    
    const title = 'JudgeMyJPEG'
    const titleWidth = this.pdf.getTextWidth(title)
    this.pdf.text(title, (this.pageWidth - titleWidth) / 2, 60)
    
    // Sous-titre
    this.pdf.setTextColor(34, 211, 238) // neon-cyan
    this.pdf.setFontSize(18)
    this.pdf.setFont('helvetica', 'normal')
    
    const subtitle = 'Rapport d\'Analyse Photographique Professionnel'
    const subtitleWidth = this.pdf.getTextWidth(subtitle)
    this.pdf.text(subtitle, (this.pageWidth - subtitleWidth) / 2, 75)
    
    // Informations du rapport
    this.pdf.setTextColor(148, 163, 184) // text-gray
    this.pdf.setFontSize(12)
    
    const info = [
      `Date: ${new Date().toLocaleDateString('fr-FR')}`,
      `Client: ${userEmail}`,
      `Photos analysées: ${report.totalPhotos}`,
      `Score moyen: ${report.avgScore}/100`
    ]
    
    let infoY = 100
    info.forEach(line => {
      const lineWidth = this.pdf.getTextWidth(line)
      this.pdf.text(line, (this.pageWidth - lineWidth) / 2, infoY)
      infoY += 8
    })
    
    // Score global avec style
    this.pdf.setFillColor(34, 211, 238, 0.2) // neon-cyan bg
    this.pdf.roundedRect(50, 140, 110, 40, 5, 5, 'F')
    
    this.pdf.setTextColor(34, 211, 238)
    this.pdf.setFontSize(16)
    this.pdf.setFont('helvetica', 'bold')
    
    const scoreText = `Score Global: ${report.avgScore}/100`
    const scoreWidth = this.pdf.getTextWidth(scoreText)
    this.pdf.text(scoreText, (this.pageWidth - scoreWidth) / 2, 165)
    
    // Footer
    this.pdf.setTextColor(100, 116, 139)
    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'italic')
    
    const footer = 'Analyse réalisée par Intelligence Artificielle OpenAI GPT-4o-mini'
    const footerWidth = this.pdf.getTextWidth(footer)
    this.pdf.text(footer, (this.pageWidth - footerWidth) / 2, 280)
  }

  private createSummaryPage(report: BatchReport) {
    this.addPage()
    
    // Titre de section
    this.addSectionTitle('📊 Résumé Exécutif')
    
    // Statistiques clés
    this.pdf.setTextColor(64, 64, 64)
    this.pdf.setFontSize(12)
    this.pdf.setFont('helvetica', 'normal')
    
    const stats = [
      `📸 Nombre total de photos analysées: ${report.totalPhotos}`,
      `⭐ Score moyen obtenu: ${report.avgScore}/100`,
      `🏆 Meilleure photo: ${report.topPhoto?.analysis?.score || 'N/A'}/100`,
      `💪 Photo à améliorer: ${report.worstPhoto?.analysis?.score || 'N/A'}/100`
    ]
    
    stats.forEach(stat => {
      this.pdf.text(stat, this.margin, this.currentY)
      this.currentY += 10
    })
    
    this.currentY += 10
    
    // Analyse par catégorie
    this.addSubTitle('Analyse par Catégorie')
    
    const categories = [
      { name: 'Composition', score: report.categoryAnalysis.composition, max: 15 },
      { name: 'Éclairage', score: report.categoryAnalysis.lighting, max: 15 },
      { name: 'Mise au point', score: report.categoryAnalysis.focus, max: 15 },
      { name: 'Exposition', score: report.categoryAnalysis.exposure, max: 15 },
      { name: 'Créativité', score: report.categoryAnalysis.creativity, max: 15 },
      { name: 'Émotion', score: report.categoryAnalysis.emotion, max: 15 },
      { name: 'Narration', score: report.categoryAnalysis.storytelling, max: 10 }
    ]
    
    categories.forEach(cat => {
      const percentage = Math.round((cat.score / cat.max) * 100)
      
      // Nom de catégorie
      this.pdf.setFont('helvetica', 'bold')
      this.pdf.text(`${cat.name}:`, this.margin, this.currentY)
      
      // Score
      this.pdf.setFont('helvetica', 'normal')
      this.pdf.text(`${cat.score}/${cat.max} (${percentage}%)`, this.margin + 50, this.currentY)
      
      // Barre de progression simple
      const barWidth = 80
      const fillWidth = (cat.score / cat.max) * barWidth
      
      // Fond de barre
      this.pdf.setFillColor(200, 200, 200)
      this.pdf.rect(this.margin + 100, this.currentY - 3, barWidth, 4, 'F')
      
      // Remplissage selon score
      const color = percentage >= 80 ? [34, 211, 238] : 
                    percentage >= 60 ? [255, 215, 0] : 
                    [236, 72, 153]
      
      this.pdf.setFillColor(color[0], color[1], color[2])
      this.pdf.rect(this.margin + 100, this.currentY - 3, fillWidth, 4, 'F')
      
      this.currentY += 12
    })
  }

  private async createPhotoAnalysisPage(photo: BatchPhoto) {
    this.addPage()
    
    if (!photo.analysis) return
    
    // Titre avec nom de fichier
    this.addSectionTitle(`📸 ${photo.file.name}`)
    
    // Score principal
    this.pdf.setFillColor(236, 72, 153, 0.1)
    this.pdf.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 20, 3, 3, 'F')
    
    this.pdf.setTextColor(236, 72, 153)
    this.pdf.setFontSize(16)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text(`Score: ${photo.analysis.score}/100`, this.margin + 5, this.currentY + 12)
    
    this.currentY += 30
    
    // Analyse technique
    this.addSubTitle('Analyse Technique')
    
    Object.entries(photo.analysis.technical).forEach(([key, value]) => {
      const title = key === 'composition' ? 'Composition' :
                    key === 'lighting' ? 'Éclairage' :
                    key === 'focus' ? 'Mise au point' : 'Exposition'
      
      this.pdf.setFont('helvetica', 'bold')
      this.pdf.text(`${title}:`, this.margin, this.currentY)
      this.currentY += 7
      
      this.pdf.setFont('helvetica', 'normal')
      const lines = this.pdf.splitTextToSize(value, this.pageWidth - 2 * this.margin)
      this.pdf.text(lines, this.margin + 5, this.currentY)
      this.currentY += lines.length * 6 + 5
    })
    
    // Analyse artistique
    this.addSubTitle('Analyse Artistique')
    
    Object.entries(photo.analysis.artistic).forEach(([key, value]) => {
      const title = key === 'creativity' ? 'Créativité' :
                    key === 'emotion' ? 'Émotion' : 'Narration'
      
      this.pdf.setFont('helvetica', 'bold')
      this.pdf.text(`${title}:`, this.margin, this.currentY)
      this.currentY += 7
      
      this.pdf.setFont('helvetica', 'normal')
      const lines = this.pdf.splitTextToSize(value, this.pageWidth - 2 * this.margin)
      this.pdf.text(lines, this.margin + 5, this.currentY)
      this.currentY += lines.length * 6 + 5
    })
    
    // Suggestions d'amélioration
    if (photo.analysis.suggestions.length > 0) {
      this.addSubTitle('Suggestions d\'amélioration')
      
      photo.analysis.suggestions.forEach((suggestion, index) => {
        this.pdf.text(`${index + 1}.`, this.margin, this.currentY)
        const lines = this.pdf.splitTextToSize(suggestion, this.pageWidth - 2 * this.margin - 10)
        this.pdf.text(lines, this.margin + 8, this.currentY)
        this.currentY += lines.length * 6 + 3
      })
    }
  }

  private createRecommendationsPage(report: BatchReport) {
    this.addPage()
    
    this.addSectionTitle('💡 Recommandations Globales')
    
    this.pdf.setTextColor(64, 64, 64)
    this.pdf.setFontSize(12)
    this.pdf.text('Basées sur l\'analyse de toutes vos photos:', this.margin, this.currentY)
    this.currentY += 15
    
    report.overallRecommendations.forEach((recommendation, index) => {
      this.pdf.setFont('helvetica', 'bold')
      this.pdf.text(`${index + 1}.`, this.margin, this.currentY)
      
      this.pdf.setFont('helvetica', 'normal')
      const lines = this.pdf.splitTextToSize(recommendation, this.pageWidth - 2 * this.margin - 10)
      this.pdf.text(lines, this.margin + 8, this.currentY)
      this.currentY += lines.length * 6 + 8
    })
    
    // Plan d'action suggéré
    this.currentY += 10
    this.addSubTitle('Plan d\'Action Suggéré')
    
    const actionPlan = [
      '1. Concentrez-vous sur les 2-3 points les plus faibles identifiés',
      '2. Pratiquez régulièrement en appliquant les conseils spécifiques',
      '3. Analysez vos nouvelles photos pour mesurer vos progrès', 
      '4. Étudiez le travail de photographes reconnus dans votre domaine',
      '5. Expérimentez de nouvelles techniques tout en consolidant les bases'
    ]
    
    actionPlan.forEach(step => {
      const lines = this.pdf.splitTextToSize(step, this.pageWidth - 2 * this.margin)
      this.pdf.text(lines, this.margin, this.currentY)
      this.currentY += lines.length * 6 + 5
    })
  }

  private createConclusionPage(report: BatchReport) {
    this.addPage()
    
    this.addSectionTitle('🎯 Conclusion')
    
    // Message personnalisé selon le niveau
    let conclusionMessage = ''
    if (report.avgScore >= 85) {
      conclusionMessage = 'Félicitations ! Vos photos démontrent un excellent niveau technique et artistique. Continuez à expérimenter pour développer davantage votre style personnel et maintenir cette qualité exceptionnelle.'
    } else if (report.avgScore >= 70) {
      conclusionMessage = 'Votre niveau photographique est très satisfaisant. En vous concentrant sur les points d\'amélioration identifiés, vous pourrez rapidement atteindre l\'excellence.'
    } else if (report.avgScore >= 55) {
      conclusionMessage = 'Vous montrez un potentiel intéressant. Un travail régulier sur les fondamentaux vous permettra de progresser significativement dans les prochains mois.'
    } else {
      conclusionMessage = 'Il y a beaucoup de marge de progression, ce qui est formidable ! Concentrez-vous sur les bases techniques et pratiquez régulièrement. Chaque photo est une opportunité d\'apprendre.'
    }
    
    const lines = this.pdf.splitTextToSize(conclusionMessage, this.pageWidth - 2 * this.margin)
    this.pdf.text(lines, this.margin, this.currentY)
    this.currentY += lines.length * 6 + 20
    
    // Contact et support
    this.addSubTitle('Support et Ressources')
    
    const supportInfo = [
      'Pour toute question sur ce rapport : contact@judgemyjpeg.com',
      'Analyses supplémentaires disponibles sur : https://judgemyjpeg.com',
      'Retrouvez vos photos et analyses dans votre galerie personnelle'
    ]
    
    supportInfo.forEach(info => {
      this.pdf.text(info, this.margin, this.currentY)
      this.currentY += 8
    })
    
    // Footer final
    this.pdf.setTextColor(100, 116, 139)
    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'italic')
    
    const finalFooter = `Rapport généré le ${new Date().toLocaleDateString('fr-FR')} par JudgeMyJPEG`
    this.pdf.text(finalFooter, this.margin, 280)
  }

  private addPage() {
    if (this.pdf.getNumberOfPages() > 0) {
      this.pdf.addPage()
    }
    this.currentY = this.margin
  }

  private addSectionTitle(title: string) {
    this.pdf.setTextColor(236, 72, 153) // neon-pink
    this.pdf.setFontSize(18)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text(title, this.margin, this.currentY)
    this.currentY += 15
    
    // Ligne décorative
    this.pdf.setDrawColor(236, 72, 153)
    this.pdf.setLineWidth(0.5)
    this.pdf.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)
    this.currentY += 10
  }

  private addSubTitle(title: string) {
    this.pdf.setTextColor(34, 211, 238) // neon-cyan
    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text(title, this.margin, this.currentY)
    this.currentY += 12
  }

  // Export d'une seule analyse
  async exportSingleAnalysis(
    photo: { filename: string, url: string },
    analysis: PhotoAnalysis,
    userEmail: string
  ): Promise<void> {
    // Page de garde pour analyse simple
    await this.createSingleCoverPage(photo, analysis, userEmail)
    
    // Analyse détaillée
    const mockPhoto: BatchPhoto = {
      id: '1',
      file: new File([], photo.filename),
      url: photo.url,
      analysis,
      status: 'completed'
    }
    
    await this.createPhotoAnalysisPage(mockPhoto)
    
    // Recommandations
    this.addPage()
    this.addSectionTitle('💡 Recommandations')
    
    if (analysis.suggestions.length > 0) {
      analysis.suggestions.forEach((suggestion, index) => {
        this.pdf.text(`${index + 1}.`, this.margin, this.currentY)
        const lines = this.pdf.splitTextToSize(suggestion, this.pageWidth - 2 * this.margin - 10)
        this.pdf.text(lines, this.margin + 8, this.currentY)
        this.currentY += lines.length * 6 + 3
      })
    }
    
    const timestamp = new Date().toISOString().split('T')[0]
    this.pdf.save(`JudgeMyJPEG_${photo.filename.replace(/\.[^/.]+$/, "")}_${timestamp}.pdf`)
  }

  private async createSingleCoverPage(
    photo: { filename: string, url: string },
    analysis: PhotoAnalysis,
    userEmail: string
  ) {
    this.pdf.setFillColor(15, 23, 42)
    this.pdf.rect(0, 0, this.pageWidth, this.pageHeight, 'F')
    
    // Titre
    this.pdf.setTextColor(236, 72, 153)
    this.pdf.setFontSize(28)
    this.pdf.setFont('helvetica', 'bold')
    
    const title = 'JudgeMyJPEG'
    const titleWidth = this.pdf.getTextWidth(title)
    this.pdf.text(title, (this.pageWidth - titleWidth) / 2, 50)
    
    // Sous-titre
    this.pdf.setTextColor(34, 211, 238)
    this.pdf.setFontSize(16)
    this.pdf.setFont('helvetica', 'normal')
    
    const subtitle = 'Analyse Photographique Détaillée'
    const subtitleWidth = this.pdf.getTextWidth(subtitle)
    this.pdf.text(subtitle, (this.pageWidth - subtitleWidth) / 2, 65)
    
    // Nom du fichier
    this.pdf.setTextColor(148, 163, 184)
    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'bold')
    
    const filename = photo.filename
    const filenameWidth = this.pdf.getTextWidth(filename)
    this.pdf.text(filename, (this.pageWidth - filenameWidth) / 2, 85)
    
    // Score
    this.pdf.setFillColor(34, 211, 238, 0.2)
    this.pdf.roundedRect(60, 100, 90, 30, 5, 5, 'F')
    
    this.pdf.setTextColor(34, 211, 238)
    this.pdf.setFontSize(20)
    
    const scoreText = `${analysis.score}/100`
    const scoreWidth = this.pdf.getTextWidth(scoreText)
    this.pdf.text(scoreText, (this.pageWidth - scoreWidth) / 2, 120)
    
    // Info
    this.pdf.setTextColor(148, 163, 184)
    this.pdf.setFontSize(10)
    this.pdf.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, this.margin, 160)
    this.pdf.text(`Client: ${userEmail}`, this.margin, 170)
  }
}