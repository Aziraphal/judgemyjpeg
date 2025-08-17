import { PhotoAnalysis } from './openai'
import { detectFamousPhoto, FamousPhotoInfo } from './famous-photo-detector'

export interface BatchPhoto {
  id: string
  filename: string
  analysis: PhotoAnalysis
  rank: number
  isFamous: boolean
  famousInfo?: FamousPhotoInfo
}

export interface BatchReport {
  totalPhotos: number
  avgScore: number
  bestPhoto: {
    id: string
    filename: string
    score: number
    reason: string
  }
  worstPhoto: {
    id: string
    filename: string
    score: number
    issues: string[]
  }
  categoryAverages: {
    composition: number
    lighting: number
    focus: number
    exposure: number
    creativity: number
    emotion: number
    storytelling: number
  }
  overallRecommendations: string[]
  photographyStyle: string
  improvementPriority: string
  famousPhotosCount: number
  ranking: BatchPhoto[]
}

export class BatchAnalyzer {
  
  async analyzeBatch(
    photos: { id: string; filename: string; analysis: PhotoAnalysis; imageBase64: string }[]
  ): Promise<BatchReport> {
    
    // 1. Détecter les photos célèbres
    const photosWithFamous = await Promise.all(
      photos.map(async (photo) => {
        const famousInfo = await detectFamousPhoto(
          photo.imageBase64,
          photo.filename,
          photo.analysis
        )
        
        return {
          id: photo.id,
          filename: photo.filename,
          analysis: photo.analysis,
          rank: 0, // Sera calculé après
          isFamous: famousInfo ? famousInfo.confidence > 50 : false,
          famousInfo: famousInfo || undefined
        }
      })
    )

    // 2. Calculer le classement (exclure les photos célèbres du ranking compétitif)
    const competitivePhotos = photosWithFamous.filter(p => !p.isFamous)
    const rankedPhotos = this.rankPhotos(competitivePhotos)
    
    // Ajouter les photos célèbres à la fin avec mention spéciale
    const famousPhotos = photosWithFamous.filter(p => p.isFamous)
    const allPhotos = [...rankedPhotos, ...famousPhotos.map(p => ({ ...p, rank: -1 }))]

    // 3. Analyser les catégories
    const categoryAverages = this.calculateCategoryAverages(competitivePhotos)
    
    // 4. Identifier la meilleure et pire photo
    const bestPhoto = this.findBestPhoto(competitivePhotos)
    const worstPhoto = this.findWorstPhoto(competitivePhotos)
    
    // 5. Analyser le style photographique dominant
    const photographyStyle = this.analyzePhotographyStyle(competitivePhotos)
    
    // 6. Déterminer la priorité d'amélioration
    const improvementPriority = this.findImprovementPriority(categoryAverages)
    
    // 7. Générer les recommandations globales
    const overallRecommendations = this.generateOverallRecommendations(
      categoryAverages,
      photographyStyle,
      competitivePhotos
    )

    const avgScore = competitivePhotos.reduce((sum, p) => sum + p.analysis.score, 0) / Math.max(competitivePhotos.length, 1)

    return {
      totalPhotos: photos.length,
      avgScore: Math.round(avgScore * 10) / 10,
      bestPhoto,
      worstPhoto,
      categoryAverages,
      overallRecommendations,
      photographyStyle,
      improvementPriority,
      famousPhotosCount: famousPhotos.length,
      ranking: allPhotos
    }
  }

  private rankPhotos(photos: BatchPhoto[]): BatchPhoto[] {
    // Classement selon le score global + critères secondaires
    return photos
      .sort((a, b) => {
        // Score principal
        if (b.analysis.score !== a.analysis.score) {
          return b.analysis.score - a.analysis.score
        }
        
        // Critères secondaires en cas d'égalité
        const aBonus = this.calculateBonusPoints(a.analysis)
        const bBonus = this.calculateBonusPoints(b.analysis)
        return bBonus - aBonus
      })
      .map((photo, index) => ({
        ...photo,
        rank: index + 1
      }))
  }

  private calculateBonusPoints(analysis: PhotoAnalysis): number {
    let bonus = 0
    
    // Bonus créativité élevée
    if (analysis.partialScores.creativity >= 13) bonus += 2
    
    // Bonus émotion forte
    if (analysis.partialScores.emotion >= 13) bonus += 2
    
    // Bonus technique parfaite
    const techAvg = (analysis.partialScores.composition + analysis.partialScores.lighting + 
                    analysis.partialScores.focus + analysis.partialScores.exposure) / 4
    if (techAvg >= 13) bonus += 1
    
    return bonus
  }

  private calculateCategoryAverages(photos: BatchPhoto[]) {
    if (photos.length === 0) {
      return {
        composition: 0, lighting: 0, focus: 0, exposure: 0,
        creativity: 0, emotion: 0, storytelling: 0
      }
    }

    const totals = photos.reduce((acc, photo) => {
      const scores = photo.analysis.partialScores
      return {
        composition: acc.composition + scores.composition,
        lighting: acc.lighting + scores.lighting,
        focus: acc.focus + scores.focus,
        exposure: acc.exposure + scores.exposure,
        creativity: acc.creativity + scores.creativity,
        emotion: acc.emotion + scores.emotion,
        storytelling: acc.storytelling + scores.storytelling
      }
    }, {
      composition: 0, lighting: 0, focus: 0, exposure: 0,
      creativity: 0, emotion: 0, storytelling: 0
    })

    return {
      composition: Math.round(totals.composition / photos.length * 10) / 10,
      lighting: Math.round(totals.lighting / photos.length * 10) / 10,
      focus: Math.round(totals.focus / photos.length * 10) / 10,
      exposure: Math.round(totals.exposure / photos.length * 10) / 10,
      creativity: Math.round(totals.creativity / photos.length * 10) / 10,
      emotion: Math.round(totals.emotion / photos.length * 10) / 10,
      storytelling: Math.round(totals.storytelling / photos.length * 10) / 10
    }
  }

  private findBestPhoto(photos: BatchPhoto[]) {
    if (photos.length === 0) {
      return { id: '', filename: '', score: 0, reason: 'Aucune photo analysée' }
    }

    const best = photos.reduce((best, current) => 
      current.analysis.score > best.analysis.score ? current : best
    )

    const reason = this.generateBestPhotoReason(best.analysis)

    return {
      id: best.id,
      filename: best.filename,
      score: best.analysis.score,
      reason
    }
  }

  private findWorstPhoto(photos: BatchPhoto[]) {
    if (photos.length === 0) {
      return { id: '', filename: '', score: 0, issues: ['Aucune photo analysée'] }
    }

    const worst = photos.reduce((worst, current) => 
      current.analysis.score < worst.analysis.score ? current : worst
    )

    const issues = this.generateWorstPhotoIssues(worst.analysis)

    return {
      id: worst.id,
      filename: worst.filename,
      score: worst.analysis.score,
      issues
    }
  }

  private generateBestPhotoReason(analysis: PhotoAnalysis): string {
    const scores = analysis.partialScores
    const strengths = []

    if (scores.composition >= 13) strengths.push('composition excellente')
    if (scores.lighting >= 13) strengths.push('éclairage maîtrisé')
    if (scores.creativity >= 13) strengths.push('créativité remarquable')
    if (scores.emotion >= 13) strengths.push('impact émotionnel fort')
    if (scores.storytelling >= 8) strengths.push('narration captivante')

    if (strengths.length === 0) {
      return 'Meilleur score global du lot'
    }

    return `Excellence en : ${strengths.join(', ')}`
  }

  private generateWorstPhotoIssues(analysis: PhotoAnalysis): string[] {
    const scores = analysis.partialScores
    const issues = []

    if (scores.composition <= 8) issues.push('Composition à retravailler')
    if (scores.lighting <= 8) issues.push('Éclairage problématique')
    if (scores.focus <= 8) issues.push('Netteté insuffisante')
    if (scores.exposure <= 8) issues.push('Exposition mal gérée')
    if (scores.creativity <= 8) issues.push('Manque d\'originalité')
    if (scores.emotion <= 8) issues.push('Impact émotionnel faible')

    return issues.length > 0 ? issues : ['Score global à améliorer']
  }

  private analyzePhotographyStyle(photos: BatchPhoto[]): string {
    if (photos.length === 0) return 'Style indéterminé'

    // Analyser les tendances dominantes
    const avgScores = this.calculateCategoryAverages(photos)
    
    if (avgScores.emotion > 12 && avgScores.storytelling > 7) {
      return 'Photographie narrative et émotionnelle'
    } else if (avgScores.composition > 12 && avgScores.lighting > 12) {
      return 'Photographie technique et maîtrisée'
    } else if (avgScores.creativity > 12) {
      return 'Photographie créative et artistique'
    } else if (avgScores.focus > 12 && avgScores.exposure > 12) {
      return 'Photographie documentaire et précise'
    } else {
      return 'Style photographique en développement'
    }
  }

  private findImprovementPriority(categoryAverages: any): string {
    // Trouver la catégorie avec le score le plus bas
    const categories = [
      { name: 'Composition', score: categoryAverages.composition, advice: 'règle des tiers et équilibre visuel' },
      { name: 'Éclairage', score: categoryAverages.lighting, advice: 'gestion de la lumière naturelle et artificielle' },
      { name: 'Netteté', score: categoryAverages.focus, advice: 'mise au point et profondeur de champ' },
      { name: 'Exposition', score: categoryAverages.exposure, advice: 'contrôle de l\'exposition et des hautes lumières' },
      { name: 'Créativité', score: categoryAverages.creativity, advice: 'angles de vue originaux et perspectives créatives' },
      { name: 'Émotion', score: categoryAverages.emotion, advice: 'capture de moments expressifs et atmosphère' },
      { name: 'Narration', score: categoryAverages.storytelling, advice: 'storytelling visuel et message de l\'image' }
    ]

    const weakest = categories.reduce((min, cat) => cat.score < min.score ? cat : min)
    
    return `${weakest.name} : focus sur ${weakest.advice}`
  }

  private generateOverallRecommendations(
    categoryAverages: any,
    style: string,
    photos: BatchPhoto[]
  ): string[] {
    const recommendations = []

    // Recommandations basées sur les faiblesses
    if (categoryAverages.composition < 10) {
      recommendations.push('Étudiez la règle des tiers et les lignes directrices pour améliorer vos compositions')
    }
    
    if (categoryAverages.lighting < 10) {
      recommendations.push('Pratiquez la photographie aux heures dorées et apprenez à utiliser la lumière naturelle')
    }

    if (categoryAverages.creativity < 10) {
      recommendations.push('Expérimentez avec des angles de vue non conventionnels et des perspectives créatives')
    }

    // Recommandations basées sur le style
    if (style.includes('narrative')) {
      recommendations.push('Continuez à développer votre storytelling visuel, c\'est votre point fort')
    } else if (style.includes('technique')) {
      recommendations.push('Excellent niveau technique ! Travaillez maintenant l\'aspect créatif et émotionnel')
    }

    // Recommandation générale
    const avgScore = photos.reduce((sum, p) => sum + p.analysis.score, 0) / photos.length
    if (avgScore >= 75) {
      recommendations.push('Excellent niveau global ! Concentrez-vous sur la cohérence et l\'identité artistique')
    } else if (avgScore >= 60) {
      recommendations.push('Bon niveau de base. Focalisez sur 1-2 aspects techniques pour progresser rapidement')
    } else {
      recommendations.push('Continuez à pratiquer les fondamentaux : composition, exposition et mise au point')
    }

    return recommendations
  }
}