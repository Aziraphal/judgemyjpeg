import OpenAI from 'openai';
import { logger } from '@/lib/logger'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ModerationResult {
  flagged: boolean;
  categories: {
    hate: boolean;
    harassment: boolean;
    violence: boolean;
    selfHarm: boolean;
    sexual: boolean;
    sexualMinors: boolean;
    illicit: boolean;
  };
  categoryScores: {
    hate: number;
    harassment: number;
    violence: number;
    selfHarm: number;
    sexual: number;
    sexualMinors: number;
    illicit: number;
  };
  reason?: string;
}

// Mots-clés interdits en français
const BANNED_KEYWORDS = [
  // Violence
  'torture', 'meurtre', 'assassinat', 'violence', 'agression', 'coup', 'sang',
  'cadavre', 'mort', 'décès', 'suicide', 'automutilation', 'blessure',
  
  // Contenu sexuel
  'nu', 'nue', 'nudité', 'seins', 'sexe', 'pornographie', 'érotique',
  'génital', 'intime', 'obscène', 'lubrique',
  
  // Haine/Harcèlement  
  'nazi', 'hitler', 'raciste', 'xénophobe', 'antisémite', 'homophobe',
  'terroriste', 'extrémiste', 'discrimination',
  
  // Substances illicites
  'drogue', 'cannabis', 'cocaïne', 'héroïne', 'stupéfiant', 'narcotique',
  'trafic', 'dealer',
  
  // Contenu illégal
  'piratage', 'hack', 'fraude', 'contrefaçon', 'blanchiment',
];

/**
 * Modère le contenu d'un filename ou description
 */
export async function moderateText(text: string): Promise<ModerationResult> {
  try {
    // Vérification mots-clés interdits
    const lowerText = text.toLowerCase();
    const foundKeywords = BANNED_KEYWORDS.filter(keyword => 
      lowerText.includes(keyword)
    );
    
    if (foundKeywords.length > 0) {
      return {
        flagged: true,
        categories: {
          hate: foundKeywords.some(k => ['nazi', 'hitler', 'raciste'].includes(k)),
          harassment: foundKeywords.some(k => ['discrimination', 'xénophobe'].includes(k)),
          violence: foundKeywords.some(k => ['torture', 'meurtre', 'violence'].includes(k)),
          selfHarm: foundKeywords.some(k => ['suicide', 'automutilation'].includes(k)),
          sexual: foundKeywords.some(k => ['nu', 'sexe', 'pornographie'].includes(k)),
          sexualMinors: false,
          illicit: foundKeywords.some(k => ['drogue', 'trafic', 'piratage'].includes(k)),
        },
        categoryScores: {
          hate: foundKeywords.some(k => ['nazi', 'hitler'].includes(k)) ? 0.9 : 0.1,
          harassment: 0.1,
          violence: foundKeywords.some(k => ['torture', 'meurtre'].includes(k)) ? 0.8 : 0.1,
          selfHarm: foundKeywords.some(k => ['suicide'].includes(k)) ? 0.7 : 0.1,
          sexual: foundKeywords.some(k => ['pornographie'].includes(k)) ? 0.8 : 0.1,
          sexualMinors: 0.1,
          illicit: foundKeywords.some(k => ['drogue', 'trafic'].includes(k)) ? 0.7 : 0.1,
        },
        reason: `Mots-clés interdits détectés: ${foundKeywords.join(', ')}`
      };
    }

    // Modération OpenAI pour les cas plus subtils
    const moderation = await openai.moderations.create({
      input: text,
    });

    const result = moderation.results[0];
    
    return {
      flagged: result.flagged,
      categories: {
        hate: result.categories.hate,
        harassment: result.categories.harassment,
        violence: result.categories.violence,
        selfHarm: result.categories['self-harm'],
        sexual: result.categories.sexual,
        sexualMinors: result.categories['sexual/minors'],
        illicit: result.categories.illicit || false,
      },
      categoryScores: {
        hate: result.category_scores.hate,
        harassment: result.category_scores.harassment,
        violence: result.category_scores.violence,
        selfHarm: result.category_scores['self-harm'],
        sexual: result.category_scores.sexual,
        sexualMinors: result.category_scores['sexual/minors'],
        illicit: result.category_scores.illicit || 0,
      }
    };
  } catch (error) {
    logger.error('Erreur modération OpenAI:', error);
    
    // Fallback sur mots-clés seulement
    const lowerText = text.toLowerCase();
    const foundKeywords = BANNED_KEYWORDS.filter(keyword => 
      lowerText.includes(keyword)
    );
    
    return {
      flagged: foundKeywords.length > 0,
      categories: {
        hate: false,
        harassment: false,
        violence: foundKeywords.some(k => ['violence', 'torture'].includes(k)),
        selfHarm: false,
        sexual: foundKeywords.some(k => ['nu', 'sexe'].includes(k)),
        sexualMinors: false,
        illicit: false,
      },
      categoryScores: {
        hate: 0,
        harassment: 0,
        violence: 0.5,
        selfHarm: 0,
        sexual: 0.5,
        sexualMinors: 0,
        illicit: 0,
      }
    };
  }
}

/**
 * Analyse les métadonnées EXIF pour détecter du contenu suspect
 */
export function analyzeImageMetadata(metadata: any): boolean {
  if (!metadata) return false;
  
  // Détection d'équipements suspects
  const suspiciousEquipment = [
    'surveillance camera',
    'hidden camera',
    'spy camera',
    'security camera'
  ];
  
  const cameraModel = (metadata.make + ' ' + metadata.model).toLowerCase();
  
  return suspiciousEquipment.some(equipment => 
    cameraModel.includes(equipment)
  );
}

/**
 * Valide les dimensions d'image pour éviter les contenus problématiques
 */
export function validateImageDimensions(width: number, height: number): boolean {
  // Rejeter images trop petites (potentiels pixels espions)
  if (width < 100 || height < 100) return false;
  
  // Rejeter ratios extrêmes (potentielles bannières inappropriées)
  const ratio = Math.max(width, height) / Math.min(width, height);
  if (ratio > 10) return false;
  
  return true;
}

/**
 * Fonction principale de modération d'image
 */
export async function moderateImage(
  filename: string,
  metadata?: any,
  width?: number,
  height?: number
): Promise<ModerationResult> {
  // 1. Modérer le nom de fichier
  const textResult = await moderateText(filename);
  if (textResult.flagged) {
    return textResult;
  }
  
  // 2. Vérifier métadonnées
  if (metadata && analyzeImageMetadata(metadata)) {
    return {
      flagged: true,
      categories: {
        hate: false,
        harassment: false,
        violence: false,
        selfHarm: false,
        sexual: false,
        sexualMinors: false,
        illicit: true,
      },
      categoryScores: {
        hate: 0,
        harassment: 0,
        violence: 0,
        selfHarm: 0,
        sexual: 0,
        sexualMinors: 0,
        illicit: 0.8,
      },
      reason: 'Équipement de surveillance détecté dans les métadonnées'
    };
  }
  
  // 3. Valider dimensions
  if (width && height && !validateImageDimensions(width, height)) {
    return {
      flagged: true,
      categories: {
        hate: false,
        harassment: false,
        violence: false,
        selfHarm: false,
        sexual: false,
        sexualMinors: false,
        illicit: true,
      },
      categoryScores: {
        hate: 0,
        harassment: 0,
        violence: 0,
        selfHarm: 0,
        sexual: 0,
        sexualMinors: 0,
        illicit: 0.6,
      },
      reason: 'Dimensions d\'image suspectes'
    };
  }
  
  return {
    flagged: false,
    categories: {
      hate: false,
      harassment: false,
      violence: false,
      selfHarm: false,
      sexual: false,
      sexualMinors: false,
      illicit: false,
    },
    categoryScores: {
      hate: 0,
      harassment: 0,
      violence: 0,
      selfHarm: 0,
      sexual: 0,
      sexualMinors: 0,
      illicit: 0,
    }
  };
}