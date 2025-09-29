import { PhotoAnalysis } from '@/types/analysis'

export interface InstagramPost {
  caption: string
  hashtags: string[]
  storyText: string
  carouselSlides?: {
    title: string
    content: string
    emoji: string
  }[]
}

interface PhotoData {
  filename: string
  url: string
}

export class InstagramGenerator {
  
  static async generatePost(
    photo: PhotoData, 
    analysis: PhotoAnalysis,
    style: 'minimal' | 'tips' | 'storytelling' | 'professional' = 'tips'
  ): Promise<InstagramPost> {
    
    const score = analysis.score
    const topStrengths = this.getTopStrengths(analysis)
    const mainWeakness = this.getMainWeakness(analysis)
    const photoType = this.detectPhotoType(analysis, photo.filename)
    
    switch (style) {
      case 'minimal':
        return this.generateMinimalPost(score, photoType)
      
      case 'storytelling':
        return this.generateStorytellingPost(analysis, photoType)
      
      case 'professional':
        return this.generateProfessionalPost(analysis, photoType)
      
      case 'tips':
      default:
        return this.generateTipsPost(analysis, topStrengths, mainWeakness, photoType)
    }
  }

  private static getTopStrengths(analysis: PhotoAnalysis): string[] {
    const scores = analysis.partialScores
    const strengths = []
    
    if (scores.composition >= 12) strengths.push('composition')
    if (scores.lighting >= 12) strengths.push('lighting')  
    if (scores.focus >= 12) strengths.push('focus')
    if (scores.creativity >= 12) strengths.push('creativity')
    if (scores.emotion >= 12) strengths.push('emotion')
    
    return strengths.slice(0, 2) // Top 2 strengths
  }

  private static getMainWeakness(analysis: PhotoAnalysis): string {
    const scores = analysis.partialScores
    const weaknesses = [
      { name: 'composition', score: scores.composition, max: 15 },
      { name: 'lighting', score: scores.lighting, max: 15 },
      { name: 'focus', score: scores.focus, max: 15 },
      { name: 'exposure', score: scores.exposure, max: 15 },
      { name: 'creativity', score: scores.creativity, max: 15 }
    ]
    
    const mainWeakness = weaknesses.sort((a, b) => (a.score/a.max) - (b.score/b.max))[0]
    return mainWeakness.name
  }

  private static detectPhotoType(analysis: PhotoAnalysis, filename: string): string {
    const artistic = analysis.artistic
    const technical = analysis.technical
    
    // Simple heuristics based on analysis content
    if (artistic?.emotion?.toLowerCase().includes('portrait') || 
        technical?.composition?.toLowerCase().includes('portrait')) {
      return 'portrait'
    }
    if (artistic?.creativity?.toLowerCase().includes('paysage') ||
        technical?.composition?.toLowerCase().includes('paysage')) {
      return 'landscape'
    }
    if (artistic?.storytelling?.toLowerCase().includes('rue') ||
        technical?.composition?.toLowerCase().includes('street')) {
      return 'street'
    }
    if (filename.toLowerCase().includes('macro') ||
        technical?.focus?.toLowerCase().includes('macro')) {
      return 'macro'
    }
    
    return 'general'
  }

  private static generateMinimalPost(score: number, photoType: string): InstagramPost {
    const scoreEmoji = score >= 80 ? '🔥' : score >= 60 ? '✨' : '📸'
    
    return {
      caption: `${scoreEmoji} Score: ${score}/100`,
      hashtags: this.getHashtagsForType(photoType, 'minimal'),
      storyText: `📊 Analyse IA: ${score}/100\n${scoreEmoji} Évaluation automatique`,
      carouselSlides: [
        {
          title: 'Score IA',
          content: `${score}/100`,
          emoji: scoreEmoji
        }
      ]
    }
  }

  private static generateTipsPost(
    analysis: PhotoAnalysis, 
    strengths: string[], 
    weakness: string, 
    photoType: string
  ): InstagramPost {
    
    const strengthsText = strengths.map(s => {
      switch (s) {
        case 'composition': return '📐 Composition maîtrisée'
        case 'lighting': return '💡 Belle gestion de la lumière'
        case 'focus': return '🎯 Netteté parfaite'
        case 'creativity': return '✨ Approche créative'
        case 'emotion': return '❤️ Impact émotionnel fort'
        default: return `✅ ${s}`
      }
    }).join('\n')

    const weaknessAdvice = this.getAdviceForWeakness(weakness)
    
    const caption = `📸 Analyse Photo IA\n\n✅ Points forts:\n${strengthsText}\n\n💡 Conseil d'amélioration:\n${weaknessAdvice}\n\n🎯 Score global: ${analysis.score}/100\n\n#PhotoTips #PhotographyAI #JudgeMyJPEG`

    return {
      caption,
      hashtags: this.getHashtagsForType(photoType, 'tips'),
      storyText: `📸 Analyse complète\n\n✅ Forces: ${strengths.join(', ')}\n💡 À améliorer: ${weakness}\n\n🎯 ${analysis.score}/100`,
      carouselSlides: [
        {
          title: 'Points forts',
          content: strengthsText,
          emoji: '✅'
        },
        {
          title: 'Conseil',
          content: weaknessAdvice,
          emoji: '💡'
        },
        {
          title: 'Score final',
          content: `${analysis.score}/100`,
          emoji: '🎯'
        }
      ]
    }
  }

  private static generateStorytellingPost(analysis: PhotoAnalysis, photoType: string): InstagramPost {
    const storyElements = [
      'Cette photo raconte une histoire...',
      'L\'émotion transparaît à travers',
      'La composition guide notre regard vers',
      'La lumière crée une atmosphère'
    ]
    
    const randomStoryStart = storyElements[Math.floor(Math.random() * storyElements.length)]
    
    const caption = `${randomStoryStart} ✨\n\n${analysis.artistic?.storytelling?.substring(0, 150) || 'Analyse créative indisponible'}...\n\n📊 Analyse IA: ${analysis.score}/100\n\n#Storytelling #Photography #VisualNarrative`

    return {
      caption,
      hashtags: this.getHashtagsForType(photoType, 'storytelling'),
      storyText: `📖 Histoire visuelle\n\n${analysis.artistic?.storytelling?.substring(0, 100) || 'Analyse créative indisponible'}...\n\n📊 ${analysis.score}/100`,
      carouselSlides: [
        {
          title: 'L\'histoire',
          content: (analysis.artistic?.storytelling?.substring(0, 80) || 'Analyse indisponible') + '...',
          emoji: '📖'
        },
        {
          title: 'Émotion',
          content: (analysis.artistic?.emotion?.substring(0, 80) || 'Analyse indisponible') + '...',
          emoji: '❤️'
        },
        {
          title: 'Score',
          content: `${analysis.score}/100`,
          emoji: '📊'
        }
      ]
    }
  }

  private static generateProfessionalPost(analysis: PhotoAnalysis, photoType: string): InstagramPost {
    const techHighlights = [
      `📐 Composition: ${analysis.partialScores.composition}/15`,
      `💡 Éclairage: ${analysis.partialScores.lighting}/15`,
      `🎯 Netteté: ${analysis.partialScores.focus}/15`
    ]

    const caption = `📊 ANALYSE TECHNIQUE\n\n${techHighlights.join('\n')}\n\n🎨 Créativité: ${analysis.partialScores.creativity}/15\n❤️ Impact: ${analysis.partialScores.emotion}/15\n\n🏆 Score global: ${analysis.score}/100\n\nAnalyse générée par IA #PhotographyAnalysis #TechnicalReview`

    return {
      caption,
      hashtags: this.getHashtagsForType(photoType, 'professional'),
      storyText: `📊 ANALYSE PRO\n\nTechnique: ${analysis.partialScores.composition + analysis.partialScores.lighting + analysis.partialScores.focus + analysis.partialScores.exposure}/60\n\nArt: ${analysis.partialScores.creativity + analysis.partialScores.emotion + analysis.partialScores.storytelling}/40\n\nTotal: ${analysis.score}/100`,
      carouselSlides: [
        {
          title: 'Technique',
          content: techHighlights.join('\n'),
          emoji: '🔧'
        },
        {
          title: 'Artistique',
          content: `✨ Créativité: ${analysis.partialScores.creativity}/15\n❤️ Émotion: ${analysis.partialScores.emotion}/15\n📖 Narration: ${analysis.partialScores.storytelling}/10`,
          emoji: '🎨'
        },
        {
          title: 'Résultat',
          content: `Score final: ${analysis.score}/100`,
          emoji: '🏆'
        }
      ]
    }
  }

  private static getAdviceForWeakness(weakness: string): string {
    const advices = {
      composition: '📐 Essayez la règle des tiers et variez vos angles de vue',
      lighting: '💡 Profitez des golden hours ou diffusez la lumière dure',
      focus: '🎯 Vérifiez votre mise au point et utilisez le bon collimateur',
      exposure: '📊 Consultez l\'histogramme pour éviter la sur/sous-exposition',
      creativity: '✨ Explorez de nouveaux angles et perspectives originales',
      emotion: '❤️ Capturez l\'instant décisif et les expressions authentiques',
      storytelling: '📖 Réfléchissez au message que vous voulez transmettre'
    }

    return advices[weakness as keyof typeof advices] || '💡 Continuez à pratiquer et expérimenter'
  }

  private static getHashtagsForType(photoType: string, style: string): string[] {
    const commonHashtags = ['#Photography', '#PhotoTips', '#PhotographyAI', '#JudgeMyJPEG']
    
    const typeHashtags = {
      portrait: ['#PortraitPhotography', '#Portraits', '#PeoplePhotography'],
      landscape: ['#LandscapePhotography', '#Nature', '#Paysage'],
      street: ['#StreetPhotography', '#UrbanPhotography', '#PhotoDeRue'],
      macro: ['#MacroPhotography', '#CloseUp', '#MacroWorld'],
      general: ['#Photography', '#PhotoOfTheDay', '#InstagramPhotography']
    }

    const styleHashtags = {
      minimal: ['#Minimal', '#Clean', '#Simple'],
      tips: ['#PhotoTips', '#LearnPhotography', '#PhotographyEducation'],
      storytelling: ['#Storytelling', '#VisualNarrative', '#PhotoStory'],
      professional: ['#ProfessionalPhotography', '#TechnicalPhotography', '#PhotoAnalysis']
    }

    return [
      ...commonHashtags,
      ...(typeHashtags[photoType as keyof typeof typeHashtags] || typeHashtags.general),
      ...(styleHashtags[style as keyof typeof styleHashtags] || styleHashtags.tips)
    ].slice(0, 15) // Instagram limite à 30, on garde 15 pour laisser place aux hashtags persos
  }

  // Méthode pour générer plusieurs variantes d'un coup
  static async generateMultipleVariants(
    photo: PhotoData,
    analysis: PhotoAnalysis
  ): Promise<Record<string, InstagramPost>> {
    
    const variants: Record<string, InstagramPost> = {}
    const styles: ('minimal' | 'tips' | 'storytelling' | 'professional')[] = [
      'minimal', 'tips', 'storytelling', 'professional'
    ]
    
    for (const style of styles) {
      variants[style] = await this.generatePost(photo, analysis, style)
    }
    
    return variants
  }

  // Génération de contenu pour Stories Instagram
  static generateStoryContent(analysis: PhotoAnalysis): {
    slides: Array<{
      type: 'score' | 'tips' | 'breakdown'
      title: string
      content: string
      background: string
      textColor: string
    }>
  } {
    const scoreColor = analysis.score >= 80 ? '#10B981' : // vert
                       analysis.score >= 60 ? '#F59E0B' : // orange  
                       '#EF4444' // rouge

    return {
      slides: [
        // Slide 1: Score principal
        {
          type: 'score',
          title: 'Mon Score IA',
          content: `${analysis.score}/100`,
          background: scoreColor,
          textColor: '#FFFFFF'
        },
        
        // Slide 2: Points forts
        {
          type: 'tips',
          title: 'Points Forts',
          content: analysis.suggestions.slice(0, 2).join('\n\n'),
          background: '#1F2937',
          textColor: '#10B981'
        },
        
        // Slide 3: Breakdown technique
        {
          type: 'breakdown',
          title: 'Détail Technique',
          content: `Composition: ${analysis.partialScores.composition}/15\nLumière: ${analysis.partialScores.lighting}/15\nNetteté: ${analysis.partialScores.focus}/15`,
          background: '#111827',
          textColor: '#6B7280'
        }
      ]
    }
  }
}