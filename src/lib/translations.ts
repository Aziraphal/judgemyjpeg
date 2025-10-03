/**
 * Système de traductions complètes pour l'interface
 * Support 6 langues : FR, EN, ES, DE, IT, PT
 */

import type { AnalysisLanguage } from '@/types/analysis'

export interface Translations {
  // Navigation
  nav: {
    analyze: string
    gallery: string
    collections: string
    pricing: string
    blog: string
    dashboard: string
    settings: string
    signIn: string
    signOut: string
    profile: string
  }
  
  // Tone Selector
  toneSelector: {
    title: string
    titleMobile: string
    help: string
    glossary: string
    faq: string
    contact: string
    customize: string
    selected: string

    // Modes
    professional: {
      label: string
      labelMobile: string
      description: string
      example: string
      exampleText: string
    }
    roast: {
      label: string
      labelMobile: string
      description: string
      example: string
      exampleText: string
    }
    learning: {
      label: string
      labelMobile: string
      description: string
      example: string
      exampleText: string
    }
  }

  // Analyze Page
  analyze: {
    title: string
    subtitle: string
    selectMode: string
    selectLanguage: string
    uploadPhoto: string
    uploading: string
    analyzing: string
    dragDrop: string
    fileFormats: string
    maxSize: string
    unlimitedPhotos: string
    invalidFile: string
    analysisError: string
    networkError: string

    // Loading states
    loadingRoast: string
    loadingLearning: string
    loadingProfessional: string
    loadingSubRoast: string
    loadingSubLearning: string
    loadingSubProfessional: string

    // Loading titles
    loadingTitleRoast: string
    loadingTitleLearning: string
    loadingTitleProfessional: string

    // Upload specs
    uploadSpecs: string
    uploadSpecsDescription: string
    poweredBy: string
    aiPowered: string
    photosUpTo: string
    qualityPreserved: string
    railwayPro: string
    recentActivity: string

    // Modes
    professional: string
    roast: string
    artcritic: string
    modeDescription: {
      professional: string
      roast: string
      artcritic: string
    }

    // Results
    globalScore: string
    technicalScore: string
    artisticScore: string
    strengths: string
    improvements: string
    retouchingPotential: string

    // Actions
    newAnalysis: string
    addToCollection: string
    exportPdf: string
    shareResults: string
  }
  
  // Social Sharing
  social: {
    title: string
    description: string
    hashtags: string
    copySuccess: string
    shareCaption: string
    downloadImage: string
    postToInstagram: string
    perfectInstaPost: string
    getExtension: string
    extensionDescription: string
  }
  
  // Common
  common: {
    loading: string
    error: string
    success: string
    retry: string
    cancel: string
    continue: string
    save: string
    delete: string
    edit: string
    close: string
    free: string
    premium: string
    upgrade: string
  }
  
  // Subscription
  subscription: {
    freeAnalyses: string
    upgradeNow: string
    starterPack: string
    monthly: string
    annual: string
    lifetime: string
    features: string
    noCard: string
  }

  // Footer
  footer: {
    tagline: string
    productTitle: string
    analyzePhoto: string
    topPhotos: string
    collections: string
    dashboard: string
    insights: string

    supportTitle: string
    faq: string
    contact: string
    pricing: string
    glossary: string

    resourcesTitle: string
    partnerships: string

    analysisTitle: string
    analyzeFree: string
    aiCritique: string
    batchAnalysis: string
    photoCollections: string
    allMyPhotos: string

    legalTitle: string
    terms: string
    privacy: string
    legalNotice: string
    cookies: string

    copyright: string
    allRightsReserved: string
    cookiePreferences: string
  }

  // Analysis Result
  result: {
    technicalTerms: string
    glossary: string
    analysisOf: string
    globalScore: string
    aiModeEnabled: string
    detailScores: string
    technical: string
    artistic: string
    analysisSummary: string
    strengths: string
    improvementPriority: string
    addToCollection: string
    exportPdf: string
    shareResults: string
    newAnalysis: string
    improvementTips: string
    forThisPhoto: string
    nextShot: string
    retouchTips: string
    retouchPotential: string
  }

  // Cookie Consent
  cookies: {
    title: string
    description: string
    customize: string
    necessaryOnly: string
    acceptAll: string
    settingsTitle: string

    necessary: string
    necessaryDesc: string
    necessaryAlways: string

    analytics: string
    analyticsDesc: string

    personalization: string
    personalizationDesc: string

    social: string
    socialDesc: string

    importantInfo: string
    save: string
    acceptSelected: string
  }

  // Analysis Counter
  counter: {
    monthlyAnalyses: string
    starterPack: string
    freePlan: string
    resetIn: string
    days: string
    upgrade: string
    unlimitedAnalyses: string
    currentPlan: string
  }

  // Onboarding Tutorial
  onboarding: {
    welcome: string
    welcomeDesc: string
    chooseMode: string
    chooseModeDesc: string
    uploadPhoto: string
    uploadDesc: string
    getAnalysis: string
    getAnalysisDesc: string
    skip: string
    previous: string
    next: string
    finish: string
    freeAnalyses: string
  }

  // Language Selector
  languageSelector: {
    title: string
    seeAll: string
    exampleIn: string
    aiWillRespond: string
    selected: string
  }

  // Photo Type Selector
  photoType: {
    select: string
    selectForAI: string
  }

  // Homepage
  home: {
    hello: string
    dashboard: string
    settings: string
    logout: string
    analyzePhoto: string
    batchAnalysis: string
    topPhotos: string
    guides: string
    upgradePro: string
    bestPhotos: string
    bestPhotosDesc: string
    seeAllPhotos: string
    startCollection: string
    analyzeFirstPhoto: string
    aiPhotoAnalysis: string
    aiPhotoAnalysisDesc: string
    instantCritique: string
    instantCritiqueDesc: string
    preciseAnalysis: string
    preciseAnalysisDesc: string
    whyAnalyze: string
    expertCritique: string
    expertCritiqueDesc: string
    improvePhotos: string
    improvePhotosDesc: string
  }
}

export const translations: Record<AnalysisLanguage, Translations> = {
  fr: {
    nav: {
      analyze: "Analyser",
      gallery: "Galerie",
      collections: "Collections",
      pricing: "Tarifs",
      blog: "Blog",
      dashboard: "Dashboard",
      settings: "Paramètres",
      signIn: "Connexion",
      signOut: "Déconnexion",
      profile: "Profil"
    },

    toneSelector: {
      title: "Choisissez le ton de l'analyse",
      titleMobile: "Ton d'analyse",
      help: "Aide",
      glossary: "Glossaire photographique",
      faq: "Questions fréquentes",
      contact: "Nous contacter",
      customize: "Personnaliser",
      selected: "Sélectionné",

      professional: {
        label: "Mode Pro",
        labelMobile: "Pro",
        description: "Analyse technique et constructive",
        example: "Exemple :",
        exampleText: "Excellente composition selon la règle des tiers. L'exposition pourrait être améliorée de +1 stop. Très bon travail sur la profondeur de champ."
      },
      roast: {
        label: "Mode Cassant",
        labelMobile: "Cassant",
        description: "Analyse brutalement honnête et fun",
        example: "Exemple :",
        exampleText: "Cette exposition ressemble à un vampire qui a peur de la lumière... +2 stops arrangeraient les choses. Le cadrage ? L'appareil a eu le hoquet ! 📸💀"
      },
      learning: {
        label: "Mode Apprentissage",
        labelMobile: "Formation",
        description: "Formation complète et pédagogique",
        example: "Exemple :",
        exampleText: "Excellente composition ! Voici pourquoi : la règle des tiers guide l'œil. Pour progresser, essaie f/8 pour plus de netteté. Exercice : varie tes angles de vue demain."
      }
    },

    analyze: {
      title: "Analyse Photo IA",
      subtitle: "Intelligence artificielle experte en photographie",
      selectMode: "Mode d'analyse",
      selectLanguage: "Langue de l'analyse",
      uploadPhoto: "Télécharger une photo",
      uploading: "Téléchargement...",
      analyzing: "Analyse en cours...",
      dragDrop: "Glissez votre photo ici ou cliquez pour parcourir",
      fileFormats: "Formats supportés : JPG, PNG, WEBP",
      maxSize: "Taille max : 10MB",
      unlimitedPhotos: "Photos illimitées",
      invalidFile: "Veuillez sélectionner un fichier image valide (JPG, PNG, WebP)",
      analysisError: "Erreur lors de l'analyse de la photo",
      networkError: "Erreur de connexion - vérifiez votre réseau",

      // Loading states
      loadingRoast: "Analyse critique en cours...",
      loadingLearning: "Formation pédagogique en cours...",
      loadingProfessional: "Analyse IA en cours...",
      loadingSubRoast: "L'IA prépare une critique sans concession",
      loadingSubLearning: "Apprentissage avec explications détaillées...",
      loadingSubProfessional: "GPT-4 Vision analyse votre photo avec précision",

      // Loading titles
      loadingTitleRoast: "🔥 Préparation du châtiment",
      loadingTitleLearning: "🎨 Vision artistique",
      loadingTitleProfessional: "⚡ Analyse en cours",

      // Upload specs
      uploadSpecs: "Spécifications techniques",
      uploadSpecsDescription: "Formats optimisés pour l'analyse IA : JPEG pour rapidité, PNG pour qualité, WebP pour compression avancée",
      poweredBy: "Powered by",
      aiPowered: "Intelligence Artificielle",
      photosUpTo: "📱 Photos jusqu'à 20MB",
      qualityPreserved: "Qualité originale préservée",
      railwayPro: "Railway Pro",
      recentActivity: "Activité récente",

      professional: "Professionnel",
      roast: "Cassant",
      artcritic: "Critique d'Art",
      modeDescription: {
        professional: "Analyse constructive et pédagogique",
        roast: "Critique sarcastique et créative",
        artcritic: "Vision artistique et culturelle"
      },

      globalScore: "Score global",
      technicalScore: "Technique",
      artisticScore: "Artistique",
      strengths: "Points forts",
      improvements: "Améliorations",
      retouchingPotential: "Potentiel de retouche",

      newAnalysis: "Nouvelle analyse",
      addToCollection: "Ajouter à collection",
      exportPdf: "Export PDF",
      shareResults: "Partager"
    },
    
    social: {
      title: "Partager votre analyse",
      description: "Montrez comme l'IA vous a grillé !",
      hashtags: "Hashtags suggérés",
      copySuccess: "Copié !",
      shareCaption: "Légende de partage",
      downloadImage: "Télécharger l'image",
      postToInstagram: "Poster sur Instagram",
      perfectInstaPost: "Perfect Insta Post",
      getExtension: "Obtenir l'extension",
      extensionDescription: "Extension Chrome pour créer des posts Instagram parfaits avec IA"
    },
    
    common: {
      loading: "Chargement...",
      error: "Erreur",
      success: "Succès",
      retry: "Réessayer", 
      cancel: "Annuler",
      continue: "Continuer",
      save: "Sauvegarder",
      delete: "Supprimer",
      edit: "Modifier",
      close: "Fermer",
      free: "Gratuit",
      premium: "Premium",
      upgrade: "Mettre à niveau"
    },
    
    subscription: {
      freeAnalyses: "analyses gratuites par mois",
      upgradeNow: "Passer Premium",
      starterPack: "Pack Démarrage",
      monthly: "Mensuel",
      annual: "Annuel",
      lifetime: "À vie",
      features: "Fonctionnalités",
      noCard: "Sans carte bancaire"
    },

    footer: {
      tagline: "Analyse IA pour photographes exigeants",
      productTitle: "Produit",
      analyzePhoto: "Analyser une photo",
      topPhotos: "Top photos",
      collections: "Collections",
      dashboard: "Tableau de bord",
      insights: "Insights",

      supportTitle: "Support",
      faq: "FAQ",
      contact: "Contact",
      pricing: "Tarifs",
      glossary: "Glossaire photo",

      resourcesTitle: "Ressources",
      partnerships: "Partenariats",

      analysisTitle: "Analyse",
      analyzeFree: "Analyser gratuitement",
      aiCritique: "Critique IA",
      batchAnalysis: "Analyse par lots",
      photoCollections: "Collections photo",
      allMyPhotos: "Toutes mes photos",

      legalTitle: "Légal",
      terms: "CGU",
      privacy: "Confidentialité",
      legalNotice: "Mentions légales",
      cookies: "Cookies",

      copyright: "© 2025 PhotoJudge",
      allRightsReserved: "Tous droits réservés",
      cookiePreferences: "Préférences cookies"
    },

    result: {
      technicalTerms: "Termes techniques",
      glossary: "Voir le glossaire",
      analysisOf: "Analyse de",
      globalScore: "Score global",
      aiModeEnabled: "Mode IA activé",
      detailScores: "Scores détaillés",
      technical: "Technique",
      artistic: "Artistique",
      analysisSummary: "Résumé de l'analyse",
      strengths: "Points forts",
      improvementPriority: "Priorité d'amélioration",
      addToCollection: "Ajouter à une collection",
      exportPdf: "Exporter en PDF",
      shareResults: "Partager les résultats",
      newAnalysis: "Nouvelle analyse",
      improvementTips: "Conseils d'amélioration",
      forThisPhoto: "Pour cette photo",
      nextShot: "Au prochain shooting",
      retouchTips: "Conseils de retouche",
      retouchPotential: "Potentiel de retouche"
    },

    cookies: {
      title: "Nous utilisons des cookies",
      description: "Nous utilisons des cookies pour améliorer votre expérience sur notre site. Vous pouvez accepter tous les cookies ou personnaliser vos préférences.",
      customize: "Personnaliser",
      necessaryOnly: "Nécessaires uniquement",
      acceptAll: "Tout accepter",
      settingsTitle: "Paramètres des cookies",

      necessary: "Cookies nécessaires",
      necessaryDesc: "Ces cookies sont essentiels au fonctionnement du site et ne peuvent pas être désactivés.",
      necessaryAlways: "Toujours actifs",

      analytics: "Cookies analytiques",
      analyticsDesc: "Ces cookies nous aident à comprendre comment vous utilisez notre site pour l'améliorer.",

      personalization: "Cookies de personnalisation",
      personalizationDesc: "Ces cookies nous permettent de mémoriser vos préférences et de personnaliser votre expérience.",

      social: "Cookies de réseaux sociaux",
      socialDesc: "Ces cookies permettent de partager du contenu sur les réseaux sociaux.",

      importantInfo: "Les cookies nécessaires ne peuvent pas être désactivés car ils sont essentiels au fonctionnement du site.",
      save: "Sauvegarder mes préférences",
      acceptSelected: "Accepter la sélection"
    },

    counter: {
      monthlyAnalyses: "analyses mensuelles",
      starterPack: "Pack Démarrage",
      freePlan: "Plan Gratuit",
      resetIn: "Réinitialisation dans",
      days: "jours",
      upgrade: "Passer Premium",
      unlimitedAnalyses: "Analyses illimitées",
      currentPlan: "Plan actuel"
    },

    onboarding: {
      welcome: "Bienvenue sur PhotoJudge",
      welcomeDesc: "Votre assistant IA pour améliorer vos photos. Découvrez comment ça fonctionne en 4 étapes simples.",
      chooseMode: "Choisissez votre mode d'analyse",
      chooseModeDesc: "Pro pour une analyse technique, Cassant pour une critique fun, ou Formation pour apprendre.",
      uploadPhoto: "Téléchargez votre photo",
      uploadDesc: "Glissez-déposez ou cliquez pour sélectionner une photo. Formats acceptés : JPG, PNG, WebP.",
      getAnalysis: "Recevez votre analyse détaillée",
      getAnalysisDesc: "L'IA analyse votre photo et vous donne des conseils personnalisés pour progresser.",
      skip: "Passer",
      previous: "Précédent",
      next: "Suivant",
      finish: "Commencer",
      freeAnalyses: "3 analyses gratuites par mois"
    },

    languageSelector: {
      title: "Langue de l'analyse",
      seeAll: "Voir toutes les langues",
      exampleIn: "Exemple en",
      aiWillRespond: "L'IA répondra dans cette langue",
      selected: "Sélectionné"
    },

    photoType: {
      select: "Type de photo",
      selectForAI: "Sélectionnez le type pour une analyse IA optimisée"
    },

    home: {
      hello: "Bonjour",
      dashboard: "Tableau de bord",
      settings: "Paramètres",
      logout: "Déconnexion",
      analyzePhoto: "Analyser une photo",
      batchAnalysis: "Analyse par lots",
      topPhotos: "Meilleures photos",
      guides: "Guides",
      upgradePro: "Passer Pro",
      bestPhotos: "Vos meilleures photos",
      bestPhotosDesc: "Les photos avec les meilleurs scores d'analyse",
      seeAllPhotos: "Voir toutes les photos",
      startCollection: "Créer votre première collection",
      analyzeFirstPhoto: "Analyser votre première photo",
      aiPhotoAnalysis: "Analyse photo IA",
      aiPhotoAnalysisDesc: "Obtenez une analyse détaillée de vos photos en quelques secondes",
      instantCritique: "Critique instantanée",
      instantCritiqueDesc: "Téléchargez et recevez des retours immédiats",
      preciseAnalysis: "Analyse précise",
      preciseAnalysisDesc: "Des scores détaillés pour chaque aspect de votre photo",
      whyAnalyze: "Pourquoi analyser vos photos ?",
      expertCritique: "Critique d'expert",
      expertCritiqueDesc: "Bénéficiez de retours professionnels sur chaque photo",
      improvePhotos: "Améliorez vos photos",
      improvePhotosDesc: "Des conseils personnalisés pour progresser rapidement"
    }
  },

  en: {
    nav: {
      analyze: "Analyze",
      gallery: "Gallery",
      collections: "Collections",
      pricing: "Pricing",
      blog: "Blog",
      dashboard: "Dashboard",
      settings: "Settings",
      signIn: "Sign In",
      signOut: "Sign Out",
      profile: "Profile"
    },

    toneSelector: {
      title: "Choose your analysis tone",
      titleMobile: "Analysis tone",
      help: "Help",
      glossary: "Photography glossary",
      faq: "Frequently asked questions",
      contact: "Contact us",
      customize: "Customize",
      selected: "Selected",

      professional: {
        label: "Pro Mode",
        labelMobile: "Pro",
        description: "Technical and constructive analysis",
        example: "Example:",
        exampleText: "Excellent composition following the rule of thirds. Exposure could be improved by +1 stop. Great work on depth of field."
      },
      roast: {
        label: "Roast Mode",
        labelMobile: "Roast",
        description: "Brutally honest and fun analysis",
        example: "Example:",
        exampleText: "This exposure looks like a vampire afraid of light... +2 stops would fix things. The framing? Your camera had the hiccups! 📸💀"
      },
      learning: {
        label: "Learning Mode",
        labelMobile: "Learning",
        description: "Complete and educational training",
        example: "Example:",
        exampleText: "Excellent composition! Here's why: the rule of thirds guides the eye. To improve, try f/8 for more sharpness. Exercise: vary your shooting angles tomorrow."
      }
    },

    analyze: {
      title: "AI Photo Analysis",
      subtitle: "Expert artificial intelligence for photography",
      selectMode: "Analysis mode",
      selectLanguage: "Analysis language",
      uploadPhoto: "Upload a photo",
      uploading: "Uploading...",
      analyzing: "Analyzing...",
      dragDrop: "Drop your photo here or click to browse",
      fileFormats: "Supported formats: JPG, PNG, WEBP",
      maxSize: "Max size: 10MB",
      unlimitedPhotos: "Unlimited photos",
      invalidFile: "Please select a valid image file (JPG, PNG, WebP)",
      analysisError: "Error analyzing the photo",
      networkError: "Connection error - check your network",

      // Loading states
      loadingRoast: "Critical analysis in progress...",
      loadingLearning: "Educational training in progress...",
      loadingProfessional: "AI analysis in progress...",
      loadingSubRoast: "AI is preparing a brutally honest critique",
      loadingSubLearning: "Learning with detailed explanations...",
      loadingSubProfessional: "GPT-4 Vision is analyzing your photo with precision",

      // Loading titles
      loadingTitleRoast: "🔥 Preparing the roast",
      loadingTitleLearning: "🎨 Artistic vision",
      loadingTitleProfessional: "⚡ Analysis in progress",

      // Upload specs
      uploadSpecs: "Technical specifications",
      uploadSpecsDescription: "Optimized formats for AI analysis: JPEG for speed, PNG for quality, WebP for advanced compression",
      poweredBy: "Powered by",
      aiPowered: "Artificial Intelligence",
      photosUpTo: "📱 Photos up to 20MB",
      qualityPreserved: "Original quality preserved",
      railwayPro: "Railway Pro",
      recentActivity: "Recent activity",

      professional: "Professional",
      roast: "Roast",
      artcritic: "Art Critic",
      modeDescription: {
        professional: "Constructive and educational analysis",
        roast: "Sarcastic and creative critique",
        artcritic: "Artistic and cultural vision"
      },

      globalScore: "Global score",
      technicalScore: "Technical",
      artisticScore: "Artistic",
      strengths: "Strengths",
      improvements: "Improvements",
      retouchingPotential: "Retouching potential",

      newAnalysis: "New analysis",
      addToCollection: "Add to collection",
      exportPdf: "Export PDF",
      shareResults: "Share"
    },
    
    social: {
      title: "Share your analysis",
      description: "Show how AI roasted you!",
      hashtags: "Suggested hashtags",
      copySuccess: "Copied!",
      shareCaption: "Share caption",
      downloadImage: "Download image", 
      postToInstagram: "Post to Instagram",
      perfectInstaPost: "Perfect Insta Post",
      getExtension: "Get Extension",
      extensionDescription: "Chrome extension to create perfect Instagram posts with AI"
    },
    
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      retry: "Retry",
      cancel: "Cancel", 
      continue: "Continue",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
      free: "Free",
      premium: "Premium",
      upgrade: "Upgrade"
    },
    
    subscription: {
      freeAnalyses: "free analyses per month",
      upgradeNow: "Upgrade Now",
      starterPack: "Starter Pack",
      monthly: "Monthly",
      annual: "Annual",
      lifetime: "Lifetime",
      features: "Features",
      noCard: "No credit card required"
    },

    footer: {
      tagline: "AI Analysis for Demanding Photographers",
      productTitle: "Product",
      analyzePhoto: "Analyze a photo",
      topPhotos: "Top photos",
      collections: "Collections",
      dashboard: "Dashboard",
      insights: "Insights",

      supportTitle: "Support",
      faq: "FAQ",
      contact: "Contact",
      pricing: "Pricing",
      glossary: "Photo glossary",

      resourcesTitle: "Resources",
      partnerships: "Partnerships",

      analysisTitle: "Analysis",
      analyzeFree: "Analyze for free",
      aiCritique: "AI Critique",
      batchAnalysis: "Batch analysis",
      photoCollections: "Photo collections",
      allMyPhotos: "All my photos",

      legalTitle: "Legal",
      terms: "Terms",
      privacy: "Privacy",
      legalNotice: "Legal notice",
      cookies: "Cookies",

      copyright: "© 2025 PhotoJudge",
      allRightsReserved: "All rights reserved",
      cookiePreferences: "Cookie preferences"
    },

    result: {
      technicalTerms: "Technical terms",
      glossary: "See glossary",
      analysisOf: "Analysis of",
      globalScore: "Global score",
      aiModeEnabled: "AI mode enabled",
      detailScores: "Detailed scores",
      technical: "Technical",
      artistic: "Artistic",
      analysisSummary: "Analysis summary",
      strengths: "Strengths",
      improvementPriority: "Improvement priority",
      addToCollection: "Add to collection",
      exportPdf: "Export to PDF",
      shareResults: "Share results",
      newAnalysis: "New analysis",
      improvementTips: "Improvement tips",
      forThisPhoto: "For this photo",
      nextShot: "Next shoot",
      retouchTips: "Retouch tips",
      retouchPotential: "Retouch potential"
    },

    cookies: {
      title: "We use cookies",
      description: "We use cookies to improve your experience on our site. You can accept all cookies or customize your preferences.",
      customize: "Customize",
      necessaryOnly: "Necessary only",
      acceptAll: "Accept all",
      settingsTitle: "Cookie settings",

      necessary: "Necessary cookies",
      necessaryDesc: "These cookies are essential for the site to function and cannot be disabled.",
      necessaryAlways: "Always active",

      analytics: "Analytics cookies",
      analyticsDesc: "These cookies help us understand how you use our site to improve it.",

      personalization: "Personalization cookies",
      personalizationDesc: "These cookies allow us to remember your preferences and personalize your experience.",

      social: "Social media cookies",
      socialDesc: "These cookies enable sharing content on social networks.",

      importantInfo: "Necessary cookies cannot be disabled as they are essential for the site to function.",
      save: "Save my preferences",
      acceptSelected: "Accept selection"
    },

    counter: {
      monthlyAnalyses: "monthly analyses",
      starterPack: "Starter Pack",
      freePlan: "Free Plan",
      resetIn: "Reset in",
      days: "days",
      upgrade: "Upgrade to Premium",
      unlimitedAnalyses: "Unlimited analyses",
      currentPlan: "Current plan"
    },

    onboarding: {
      welcome: "Welcome to PhotoJudge",
      welcomeDesc: "Your AI assistant to improve your photos. Discover how it works in 4 simple steps.",
      chooseMode: "Choose your analysis mode",
      chooseModeDesc: "Pro for technical analysis, Roast for fun critique, or Learning to learn.",
      uploadPhoto: "Upload your photo",
      uploadDesc: "Drag and drop or click to select a photo. Accepted formats: JPG, PNG, WebP.",
      getAnalysis: "Get your detailed analysis",
      getAnalysisDesc: "The AI analyzes your photo and gives you personalized tips to improve.",
      skip: "Skip",
      previous: "Previous",
      next: "Next",
      finish: "Get started",
      freeAnalyses: "3 free analyses per month"
    },

    languageSelector: {
      title: "Analysis language",
      seeAll: "See all languages",
      exampleIn: "Example in",
      aiWillRespond: "AI will respond in this language",
      selected: "Selected"
    },

    photoType: {
      select: "Photo type",
      selectForAI: "Select type for optimized AI analysis"
    },

    home: {
      hello: "Hello",
      dashboard: "Dashboard",
      settings: "Settings",
      logout: "Logout",
      analyzePhoto: "Analyze a photo",
      batchAnalysis: "Batch analysis",
      topPhotos: "Top photos",
      guides: "Guides",
      upgradePro: "Upgrade to Pro",
      bestPhotos: "Your best photos",
      bestPhotosDesc: "Photos with the highest analysis scores",
      seeAllPhotos: "See all photos",
      startCollection: "Create your first collection",
      analyzeFirstPhoto: "Analyze your first photo",
      aiPhotoAnalysis: "AI photo analysis",
      aiPhotoAnalysisDesc: "Get detailed analysis of your photos in seconds",
      instantCritique: "Instant critique",
      instantCritiqueDesc: "Upload and receive immediate feedback",
      preciseAnalysis: "Precise analysis",
      preciseAnalysisDesc: "Detailed scores for every aspect of your photo",
      whyAnalyze: "Why analyze your photos?",
      expertCritique: "Expert critique",
      expertCritiqueDesc: "Get professional feedback on every photo",
      improvePhotos: "Improve your photos",
      improvePhotosDesc: "Personalized tips to improve quickly"
    }
  },

  es: {
    nav: {
      analyze: "Analizar",
      gallery: "Galería",
      collections: "Colecciones",
      pricing: "Precios",
      blog: "Blog",
      dashboard: "Panel",
      settings: "Configuración",
      signIn: "Iniciar sesión",
      signOut: "Cerrar sesión",
      profile: "Perfil"
    },

    toneSelector: {
      title: "Elige el tono del análisis",
      titleMobile: "Tono de análisis",
      help: "Ayuda",
      glossary: "Glosario fotográfico",
      faq: "Preguntas frecuentes",
      contact: "Contáctanos",
      customize: "Personalizar",
      selected: "Seleccionado",

      professional: {
        label: "Modo Pro",
        labelMobile: "Pro",
        description: "Análisis técnico y constructivo",
        example: "Ejemplo:",
        exampleText: "Excelente composición siguiendo la regla de los tercios. La exposición podría mejorarse en +1 stop. Gran trabajo en profundidad de campo."
      },
      roast: {
        label: "Modo Crítico",
        labelMobile: "Crítico",
        description: "Análisis brutalmente honesto y divertido",
        example: "Ejemplo:",
        exampleText: "Esta exposición parece un vampiro asustado de la luz... +2 stops arreglarían las cosas. ¿El encuadre? ¡Tu cámara tuvo un ataque de hipo! 📸💀"
      },
      learning: {
        label: "Modo Aprendizaje",
        labelMobile: "Aprendizaje",
        description: "Formación completa y educativa",
        example: "Ejemplo:",
        exampleText: "¡Excelente composición! Aquí está el porqué: la regla de los tercios guía la mirada. Para mejorar, prueba f/8 para más nitidez. Ejercicio: varía tus ángulos de toma mañana."
      }
    },

    analyze: {
      title: "Análisis Foto IA",
      subtitle: "Inteligencia artificial experta en fotografía",
      selectMode: "Modo de análisis",
      selectLanguage: "Idioma del análisis",
      uploadPhoto: "Subir una foto",
      uploading: "Subiendo...",
      analyzing: "Analizando...",
      dragDrop: "Arrastra tu foto aquí o haz clic para navegar",
      fileFormats: "Formatos soportados: JPG, PNG, WEBP",
      maxSize: "Tamaño máx: 10MB",
      unlimitedPhotos: "Fotos ilimitadas",
      invalidFile: "Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP)",
      analysisError: "Error al analizar la foto",
      networkError: "Error de conexión - verifica tu red",

      // Loading states
      loadingRoast: "Análisis crítico en progreso...",
      loadingLearning: "Formación educativa en progreso...",
      loadingProfessional: "Análisis IA en progreso...",
      loadingSubRoast: "IA está preparando una crítica brutalmente honesta",
      loadingSubLearning: "Aprendizaje con explicaciones detalladas...",
      loadingSubProfessional: "GPT-4 Vision está analizando tu foto con precisión",

      // Loading titles
      loadingTitleRoast: "🔥 Preparando la crítica",
      loadingTitleLearning: "🎨 Visión artística",
      loadingTitleProfessional: "⚡ Análisis en progreso",

      // Upload specs
      uploadSpecs: "Especificaciones técnicas",
      uploadSpecsDescription: "Formatos optimizados para análisis IA: JPEG para velocidad, PNG para calidad, WebP para compresión avanzada",
      poweredBy: "Powered by",
      aiPowered: "Inteligencia Artificial",
      photosUpTo: "📱 Fotos hasta 20MB",
      qualityPreserved: "Calidad original preservada",
      railwayPro: "Railway Pro",
      recentActivity: "Actividad reciente",

      professional: "Profesional",
      roast: "Sarcástico",
      artcritic: "Crítico de Arte",
      modeDescription: {
        professional: "Análisis constructivo y educativo",
        roast: "Crítica sarcástica y creativa",
        artcritic: "Visión artística y cultural"
      },

      globalScore: "Puntuación global",
      technicalScore: "Técnico",
      artisticScore: "Artístico",
      strengths: "Fortalezas",
      improvements: "Mejoras",
      retouchingPotential: "Potencial de retoque",

      newAnalysis: "Nuevo análisis",
      addToCollection: "Añadir a colección",
      exportPdf: "Exportar PDF",
      shareResults: "Compartir"
    },
    
    social: {
      title: "Comparte tu análisis",
      description: "¡Muestra cómo la IA te criticó!",
      hashtags: "Hashtags sugeridos",
      copySuccess: "¡Copiado!",
      shareCaption: "Leyenda para compartir",
      downloadImage: "Descargar imagen",
      postToInstagram: "Publicar en Instagram",
      perfectInstaPost: "Perfect Insta Post",
      getExtension: "Obtener Extensión",
      extensionDescription: "Extensión Chrome para crear posts perfectos de Instagram con IA"
    },
    
    common: {
      loading: "Cargando...",
      error: "Error",
      success: "Éxito",
      retry: "Reintentar",
      cancel: "Cancelar",
      continue: "Continuar", 
      save: "Guardar",
      delete: "Eliminar",
      edit: "Editar",
      close: "Cerrar",
      free: "Gratis",
      premium: "Premium",
      upgrade: "Mejorar"
    },
    
    subscription: {
      freeAnalyses: "análisis gratuitos por mes",
      upgradeNow: "Mejorar Ahora",
      starterPack: "Pack Inicial",
      monthly: "Mensual",
      annual: "Anual",
      lifetime: "De por vida",
      features: "Características",
      noCard: "Sin tarjeta de crédito"
    },

    footer: {
      tagline: "Análisis IA para fotógrafos exigentes",
      productTitle: "Producto",
      analyzePhoto: "Analizar una foto",
      topPhotos: "Mejores fotos",
      collections: "Colecciones",
      dashboard: "Panel",
      insights: "Insights",
      supportTitle: "Soporte",
      faq: "FAQ",
      contact: "Contacto",
      pricing: "Precios",
      glossary: "Glosario foto",
      resourcesTitle: "Recursos",
      partnerships: "Asociaciones",
      analysisTitle: "Análisis",
      analyzeFree: "Analizar gratis",
      aiCritique: "Crítica IA",
      batchAnalysis: "Análisis por lotes",
      photoCollections: "Colecciones de fotos",
      allMyPhotos: "Todas mis fotos",
      legalTitle: "Legal",
      terms: "Términos",
      privacy: "Privacidad",
      legalNotice: "Aviso legal",
      cookies: "Cookies",
      copyright: "© 2025 PhotoJudge",
      allRightsReserved: "Todos los derechos reservados",
      cookiePreferences: "Preferencias de cookies"
    },

    result: {
      technicalTerms: "Términos técnicos",
      glossary: "Ver glosario",
      analysisOf: "Análisis de",
      globalScore: "Puntuación global",
      aiModeEnabled: "Modo IA activado",
      detailScores: "Puntuaciones detalladas",
      technical: "Técnico",
      artistic: "Artístico",
      analysisSummary: "Resumen del análisis",
      strengths: "Fortalezas",
      improvementPriority: "Prioridad de mejora",
      addToCollection: "Añadir a colección",
      exportPdf: "Exportar a PDF",
      shareResults: "Compartir resultados",
      newAnalysis: "Nuevo análisis",
      improvementTips: "Consejos de mejora",
      forThisPhoto: "Para esta foto",
      nextShot: "Próxima sesión",
      retouchTips: "Consejos de retoque",
      retouchPotential: "Potencial de retoque"
    },

    cookies: {
      title: "Usamos cookies",
      description: "Usamos cookies para mejorar tu experiencia en nuestro sitio. Puedes aceptar todas las cookies o personalizar tus preferencias.",
      customize: "Personalizar",
      necessaryOnly: "Solo necesarias",
      acceptAll: "Aceptar todas",
      settingsTitle: "Configuración de cookies",
      necessary: "Cookies necesarias",
      necessaryDesc: "Estas cookies son esenciales para que el sitio funcione y no se pueden desactivar.",
      necessaryAlways: "Siempre activas",
      analytics: "Cookies analíticas",
      analyticsDesc: "Estas cookies nos ayudan a entender cómo usas nuestro sitio para mejorarlo.",
      personalization: "Cookies de personalización",
      personalizationDesc: "Estas cookies nos permiten recordar tus preferencias y personalizar tu experiencia.",
      social: "Cookies de redes sociales",
      socialDesc: "Estas cookies permiten compartir contenido en redes sociales.",
      importantInfo: "Las cookies necesarias no se pueden desactivar ya que son esenciales para el funcionamiento del sitio.",
      save: "Guardar mis preferencias",
      acceptSelected: "Aceptar selección"
    },

    counter: {
      monthlyAnalyses: "análisis mensuales",
      starterPack: "Pack Inicial",
      freePlan: "Plan Gratuito",
      resetIn: "Reinicio en",
      days: "días",
      upgrade: "Mejorar a Premium",
      unlimitedAnalyses: "Análisis ilimitados",
      currentPlan: "Plan actual"
    },

    onboarding: {
      welcome: "Bienvenido a PhotoJudge",
      welcomeDesc: "Tu asistente IA para mejorar tus fotos. Descubre cómo funciona en 4 pasos simples.",
      chooseMode: "Elige tu modo de análisis",
      chooseModeDesc: "Pro para análisis técnico, Crítico para crítica divertida, o Aprendizaje para aprender.",
      uploadPhoto: "Sube tu foto",
      uploadDesc: "Arrastra y suelta o haz clic para seleccionar una foto. Formatos aceptados: JPG, PNG, WebP.",
      getAnalysis: "Obtén tu análisis detallado",
      getAnalysisDesc: "La IA analiza tu foto y te da consejos personalizados para mejorar.",
      skip: "Saltar",
      previous: "Anterior",
      next: "Siguiente",
      finish: "Comenzar",
      freeAnalyses: "3 análisis gratis por mes"
    },

    languageSelector: {
      title: "Idioma del análisis",
      seeAll: "Ver todos los idiomas",
      exampleIn: "Ejemplo en",
      aiWillRespond: "La IA responderá en este idioma",
      selected: "Seleccionado"
    },

    photoType: {
      select: "Tipo de foto",
      selectForAI: "Selecciona el tipo para análisis IA optimizado"
    },

    home: {
      hello: "Hola",
      dashboard: "Panel",
      settings: "Configuración",
      logout: "Cerrar sesión",
      analyzePhoto: "Analizar una foto",
      batchAnalysis: "Análisis por lotes",
      topPhotos: "Mejores fotos",
      guides: "Guías",
      upgradePro: "Mejorar a Pro",
      bestPhotos: "Tus mejores fotos",
      bestPhotosDesc: "Fotos con las mejores puntuaciones de análisis",
      seeAllPhotos: "Ver todas las fotos",
      startCollection: "Crear tu primera colección",
      analyzeFirstPhoto: "Analizar tu primera foto",
      aiPhotoAnalysis: "Análisis de foto IA",
      aiPhotoAnalysisDesc: "Obtén análisis detallado de tus fotos en segundos",
      instantCritique: "Crítica instantánea",
      instantCritiqueDesc: "Sube y recibe comentarios inmediatos",
      preciseAnalysis: "Análisis preciso",
      preciseAnalysisDesc: "Puntuaciones detalladas para cada aspecto de tu foto",
      whyAnalyze: "¿Por qué analizar tus fotos?",
      expertCritique: "Crítica experta",
      expertCritiqueDesc: "Obtén comentarios profesionales en cada foto",
      improvePhotos: "Mejora tus fotos",
      improvePhotosDesc: "Consejos personalizados para mejorar rápidamente"
    }
  },

  de: {
    nav: {
      analyze: "Analysieren",
      gallery: "Galerie",
      collections: "Sammlungen",
      pricing: "Preise",
      blog: "Blog",
      dashboard: "Dashboard",
      settings: "Einstellungen",
      signIn: "Anmelden",
      signOut: "Abmelden",
      profile: "Profil"
    },

    toneSelector: {
      title: "Wählen Sie den Analyseton",
      titleMobile: "Analyseton",
      help: "Hilfe",
      glossary: "Fotografie-Glossar",
      faq: "Häufig gestellte Fragen",
      contact: "Kontaktieren Sie uns",
      customize: "Anpassen",
      selected: "Ausgewählt",

      professional: {
        label: "Pro-Modus",
        labelMobile: "Pro",
        description: "Technische und konstruktive Analyse",
        example: "Beispiel:",
        exampleText: "Ausgezeichnete Komposition nach der Drittelregel. Die Belichtung könnte um +1 Blende verbessert werden. Großartige Arbeit bei der Schärfentiefe."
      },
      roast: {
        label: "Kritik-Modus",
        labelMobile: "Kritik",
        description: "Brutal ehrliche und lustige Analyse",
        example: "Beispiel:",
        exampleText: "Diese Belichtung sieht aus wie ein Vampir mit Lichtangst... +2 Blenden würden helfen. Die Bildkomposition? Deine Kamera hatte Schluckauf! 📸💀"
      },
      learning: {
        label: "Lern-Modus",
        labelMobile: "Lernen",
        description: "Vollständige und lehrreiche Schulung",
        example: "Beispiel:",
        exampleText: "Ausgezeichnete Komposition! Hier ist warum: Die Drittelregel führt das Auge. Zur Verbesserung versuche f/8 für mehr Schärfe. Übung: Variiere morgen deine Aufnahmewinkel."
      }
    },

    analyze: {
      title: "KI-Fotoanalyse",
      subtitle: "Experten-KI für Fotografie",
      selectMode: "Analysemodus",
      selectLanguage: "Analysesprache",
      uploadPhoto: "Foto hochladen",
      uploading: "Hochladen...",
      analyzing: "Analysiere...",
      dragDrop: "Foto hierher ziehen oder klicken zum Durchsuchen",
      fileFormats: "Unterstützte Formate: JPG, PNG, WEBP",
      maxSize: "Max. Größe: 10MB",
      unlimitedPhotos: "Unbegrenzte Fotos",
      invalidFile: "Bitte wählen Sie eine gültige Bilddatei (JPG, PNG, WebP)",
      analysisError: "Fehler bei der Fotoanalyse",
      networkError: "Verbindungsfehler - überprüfen Sie Ihr Netzwerk",

      // Loading states
      loadingRoast: "Kritische Analyse läuft...",
      loadingLearning: "Pädagogische Schulung läuft...",
      loadingProfessional: "KI-Analyse läuft...",
      loadingSubRoast: "KI bereitet eine schonungslose Kritik vor",
      loadingSubLearning: "Lernen mit detaillierten Erklärungen...",
      loadingSubProfessional: "GPT-4 Vision analysiert Ihr Foto präzise",

      // Loading titles
      loadingTitleRoast: "🔥 Kritik wird vorbereitet",
      loadingTitleLearning: "🎨 Künstlerische Vision",
      loadingTitleProfessional: "⚡ Analyse läuft",

      // Upload specs
      uploadSpecs: "Technische Spezifikationen",
      uploadSpecsDescription: "Optimierte Formate für KI-Analyse: JPEG für Geschwindigkeit, PNG für Qualität, WebP für fortgeschrittene Kompression",
      poweredBy: "Powered by",
      aiPowered: "Künstliche Intelligenz",
      photosUpTo: "📱 Fotos bis zu 20MB",
      qualityPreserved: "Originalqualität erhalten",
      railwayPro: "Railway Pro",
      recentActivity: "Letzte Aktivität",

      professional: "Professionell",
      roast: "Sarkastisch",
      artcritic: "Kunstkritiker",
      modeDescription: {
        professional: "Konstruktive und lehrreiche Analyse",
        roast: "Sarkastische und kreative Kritik",
        artcritic: "Künstlerische und kulturelle Vision"
      },

      globalScore: "Gesamtbewertung",
      technicalScore: "Technisch",
      artisticScore: "Künstlerisch",
      strengths: "Stärken",
      improvements: "Verbesserungen",
      retouchingPotential: "Retusche-Potential",

      newAnalysis: "Neue Analyse",
      addToCollection: "Zur Sammlung hinzufügen",
      exportPdf: "PDF exportieren",
      shareResults: "Teilen"
    },
    
    social: {
      title: "Analyse teilen",
      description: "Zeig wie die KI dich geröstet hat!",
      hashtags: "Vorgeschlagene Hashtags",
      copySuccess: "Kopiert!",
      shareCaption: "Share-Text",
      downloadImage: "Bild herunterladen",
      postToInstagram: "Auf Instagram posten",
      perfectInstaPost: "Perfect Insta Post",
      getExtension: "Erweiterung holen",
      extensionDescription: "Chrome-Erweiterung für perfekte Instagram-Posts mit KI"
    },
    
    common: {
      loading: "Laden...",
      error: "Fehler",
      success: "Erfolg",
      retry: "Wiederholen",
      cancel: "Abbrechen",
      continue: "Weiter",
      save: "Speichern",
      delete: "Löschen",
      edit: "Bearbeiten",
      close: "Schließen",
      free: "Kostenlos",
      premium: "Premium",
      upgrade: "Upgraden"
    },
    
    subscription: {
      freeAnalyses: "kostenlose Analysen pro Monat",
      upgradeNow: "Jetzt upgraden",
      starterPack: "Starter-Paket",
      monthly: "Monatlich",
      annual: "Jährlich",
      lifetime: "Lebenslang",
      features: "Features",
      noCard: "Keine Kreditkarte erforderlich"
    },

    footer: {
      tagline: "KI-Analyse für anspruchsvolle Fotografen",
      productTitle: "Produkt",
      analyzePhoto: "Foto analysieren",
      topPhotos: "Top-Fotos",
      collections: "Sammlungen",
      dashboard: "Dashboard",
      insights: "Insights",
      supportTitle: "Support",
      faq: "FAQ",
      contact: "Kontakt",
      pricing: "Preise",
      glossary: "Foto-Glossar",
      resourcesTitle: "Ressourcen",
      partnerships: "Partnerschaften",
      analysisTitle: "Analyse",
      analyzeFree: "Kostenlos analysieren",
      aiCritique: "KI-Kritik",
      batchAnalysis: "Stapelanalyse",
      photoCollections: "Fotosammlungen",
      allMyPhotos: "Alle meine Fotos",
      legalTitle: "Rechtliches",
      terms: "AGB",
      privacy: "Datenschutz",
      legalNotice: "Impressum",
      cookies: "Cookies",
      copyright: "© 2025 PhotoJudge",
      allRightsReserved: "Alle Rechte vorbehalten",
      cookiePreferences: "Cookie-Einstellungen"
    },

    result: {
      technicalTerms: "Technische Begriffe",
      glossary: "Glossar anzeigen",
      analysisOf: "Analyse von",
      globalScore: "Gesamtbewertung",
      aiModeEnabled: "KI-Modus aktiviert",
      detailScores: "Detaillierte Bewertungen",
      technical: "Technisch",
      artistic: "Künstlerisch",
      analysisSummary: "Analyse-Zusammenfassung",
      strengths: "Stärken",
      improvementPriority: "Verbesserungspriorität",
      addToCollection: "Zur Sammlung hinzufügen",
      exportPdf: "Als PDF exportieren",
      shareResults: "Ergebnisse teilen",
      newAnalysis: "Neue Analyse",
      improvementTips: "Verbesserungstipps",
      forThisPhoto: "Für dieses Foto",
      nextShot: "Nächstes Shooting",
      retouchTips: "Retusche-Tipps",
      retouchPotential: "Retusche-Potential"
    },

    cookies: {
      title: "Wir verwenden Cookies",
      description: "Wir verwenden Cookies, um Ihr Erlebnis auf unserer Website zu verbessern. Sie können alle Cookies akzeptieren oder Ihre Präferenzen anpassen.",
      customize: "Anpassen",
      necessaryOnly: "Nur notwendige",
      acceptAll: "Alle akzeptieren",
      settingsTitle: "Cookie-Einstellungen",
      necessary: "Notwendige Cookies",
      necessaryDesc: "Diese Cookies sind für die Funktion der Website unerlässlich und können nicht deaktiviert werden.",
      necessaryAlways: "Immer aktiv",
      analytics: "Analyse-Cookies",
      analyticsDesc: "Diese Cookies helfen uns zu verstehen, wie Sie unsere Website nutzen, um sie zu verbessern.",
      personalization: "Personalisierungs-Cookies",
      personalizationDesc: "Diese Cookies ermöglichen es uns, Ihre Präferenzen zu speichern und Ihr Erlebnis zu personalisieren.",
      social: "Social-Media-Cookies",
      socialDesc: "Diese Cookies ermöglichen das Teilen von Inhalten in sozialen Netzwerken.",
      importantInfo: "Notwendige Cookies können nicht deaktiviert werden, da sie für die Funktion der Website unerlässlich sind.",
      save: "Meine Präferenzen speichern",
      acceptSelected: "Auswahl akzeptieren"
    },

    counter: {
      monthlyAnalyses: "monatliche Analysen",
      starterPack: "Starter-Paket",
      freePlan: "Kostenloser Plan",
      resetIn: "Zurücksetzen in",
      days: "Tagen",
      upgrade: "Auf Premium upgraden",
      unlimitedAnalyses: "Unbegrenzte Analysen",
      currentPlan: "Aktueller Plan"
    },

    onboarding: {
      welcome: "Willkommen bei PhotoJudge",
      welcomeDesc: "Ihr KI-Assistent zur Verbesserung Ihrer Fotos. Entdecken Sie, wie es in 4 einfachen Schritten funktioniert.",
      chooseMode: "Wählen Sie Ihren Analysemodus",
      chooseModeDesc: "Pro für technische Analyse, Kritik für lustige Kritik oder Lernen zum Lernen.",
      uploadPhoto: "Laden Sie Ihr Foto hoch",
      uploadDesc: "Ziehen und ablegen oder klicken Sie, um ein Foto auszuwählen. Akzeptierte Formate: JPG, PNG, WebP.",
      getAnalysis: "Erhalten Sie Ihre detaillierte Analyse",
      getAnalysisDesc: "Die KI analysiert Ihr Foto und gibt Ihnen personalisierte Tipps zur Verbesserung.",
      skip: "Überspringen",
      previous: "Zurück",
      next: "Weiter",
      finish: "Loslegen",
      freeAnalyses: "3 kostenlose Analysen pro Monat"
    },

    languageSelector: {
      title: "Analysesprache",
      seeAll: "Alle Sprachen anzeigen",
      exampleIn: "Beispiel in",
      aiWillRespond: "Die KI wird in dieser Sprache antworten",
      selected: "Ausgewählt"
    },

    photoType: {
      select: "Fototyp",
      selectForAI: "Wählen Sie den Typ für optimierte KI-Analyse"
    },

    home: {
      hello: "Hallo",
      dashboard: "Dashboard",
      settings: "Einstellungen",
      logout: "Abmelden",
      analyzePhoto: "Foto analysieren",
      batchAnalysis: "Stapelanalyse",
      topPhotos: "Top-Fotos",
      guides: "Anleitungen",
      upgradePro: "Auf Pro upgraden",
      bestPhotos: "Ihre besten Fotos",
      bestPhotosDesc: "Fotos mit den höchsten Analysebewertungen",
      seeAllPhotos: "Alle Fotos anzeigen",
      startCollection: "Erstellen Sie Ihre erste Sammlung",
      analyzeFirstPhoto: "Analysieren Sie Ihr erstes Foto",
      aiPhotoAnalysis: "KI-Fotoanalyse",
      aiPhotoAnalysisDesc: "Erhalten Sie detaillierte Analysen Ihrer Fotos in Sekunden",
      instantCritique: "Sofortige Kritik",
      instantCritiqueDesc: "Hochladen und sofortiges Feedback erhalten",
      preciseAnalysis: "Präzise Analyse",
      preciseAnalysisDesc: "Detaillierte Bewertungen für jeden Aspekt Ihres Fotos",
      whyAnalyze: "Warum Ihre Fotos analysieren?",
      expertCritique: "Experten-Kritik",
      expertCritiqueDesc: "Erhalten Sie professionelles Feedback zu jedem Foto",
      improvePhotos: "Verbessern Sie Ihre Fotos",
      improvePhotosDesc: "Personalisierte Tipps zur schnellen Verbesserung"
    }
  },

  it: {
    nav: {
      analyze: "Analizza",
      gallery: "Galleria",
      collections: "Collezioni",
      pricing: "Prezzi",
      blog: "Blog",
      dashboard: "Dashboard",
      settings: "Impostazioni",
      signIn: "Accedi",
      signOut: "Esci",
      profile: "Profilo"
    },

    toneSelector: {
      title: "Scegli il tono dell'analisi",
      titleMobile: "Tono di analisi",
      help: "Aiuto",
      glossary: "Glossario fotografico",
      faq: "Domande frequenti",
      contact: "Contattaci",
      customize: "Personalizza",
      selected: "Selezionato",

      professional: {
        label: "Modalità Pro",
        labelMobile: "Pro",
        description: "Analisi tecnica e costruttiva",
        example: "Esempio:",
        exampleText: "Eccellente composizione seguendo la regola dei terzi. L'esposizione potrebbe essere migliorata di +1 stop. Ottimo lavoro sulla profondità di campo."
      },
      roast: {
        label: "Modalità Critica",
        labelMobile: "Critica",
        description: "Analisi brutalmente onesta e divertente",
        example: "Esempio:",
        exampleText: "Questa esposizione sembra un vampiro spaventato dalla luce... +2 stop sistemerebbero le cose. L'inquadratura? La tua fotocamera ha avuto il singhiozzo! 📸💀"
      },
      learning: {
        label: "Modalità Apprendimento",
        labelMobile: "Apprendimento",
        description: "Formazione completa ed educativa",
        example: "Esempio:",
        exampleText: "Eccellente composizione! Ecco perché: la regola dei terzi guida l'occhio. Per migliorare, prova f/8 per più nitidezza. Esercizio: varia gli angoli di ripresa domani."
      }
    },

    analyze: {
      title: "Analisi Foto IA",
      subtitle: "Intelligenza artificiale esperta in fotografia",
      selectMode: "Modalità di analisi",
      selectLanguage: "Lingua dell'analisi",
      uploadPhoto: "Carica una foto",
      uploading: "Caricamento...",
      analyzing: "Analizzando...",
      dragDrop: "Trascina la foto qui o clicca per sfogliare",
      fileFormats: "Formati supportati: JPG, PNG, WEBP",
      maxSize: "Dimensione max: 10MB",
      unlimitedPhotos: "Foto illimitate",
      invalidFile: "Seleziona un file immagine valido (JPG, PNG, WebP)",
      analysisError: "Errore durante l'analisi della foto",
      networkError: "Errore di connessione - controlla la tua rete",

      // Loading states
      loadingRoast: "Analisi critica in corso...",
      loadingLearning: "Formazione educativa in corso...",
      loadingProfessional: "Analisi IA in corso...",
      loadingSubRoast: "L'IA sta preparando una critica brutalmente onesta",
      loadingSubLearning: "Apprendimento con spiegazioni dettagliate...",
      loadingSubProfessional: "GPT-4 Vision sta analizzando la tua foto con precisione",

      // Loading titles
      loadingTitleRoast: "🔥 Preparazione della critica",
      loadingTitleLearning: "🎨 Visione artistica",
      loadingTitleProfessional: "⚡ Analisi in corso",

      // Upload specs
      uploadSpecs: "Specifiche tecniche",
      uploadSpecsDescription: "Formati ottimizzati per l'analisi IA: JPEG per velocità, PNG per qualità, WebP per compressione avanzata",
      poweredBy: "Powered by",
      aiPowered: "Intelligenza Artificiale",
      photosUpTo: "📱 Foto fino a 20MB",
      qualityPreserved: "Qualità originale preservata",
      railwayPro: "Railway Pro",
      recentActivity: "Attività recente",

      professional: "Professionale",
      roast: "Sarcastico",
      artcritic: "Critico d'Arte",
      modeDescription: {
        professional: "Analisi costruttiva ed educativa",
        roast: "Critica sarcastica e creativa",
        artcritic: "Visione artistica e culturale"
      },

      globalScore: "Punteggio globale",
      technicalScore: "Tecnico",
      artisticScore: "Artistico",
      strengths: "Punti di forza",
      improvements: "Miglioramenti",
      retouchingPotential: "Potenziale di ritocco",

      newAnalysis: "Nuova analisi",
      addToCollection: "Aggiungi alla collezione",
      exportPdf: "Esporta PDF",
      shareResults: "Condividi"
    },
    
    social: {
      title: "Condividi la tua analisi",
      description: "Mostra come l'IA ti ha criticato!",
      hashtags: "Hashtag suggeriti",
      copySuccess: "Copiato!",
      shareCaption: "Didascalia da condividere",
      downloadImage: "Scarica immagine",
      postToInstagram: "Posta su Instagram",
      perfectInstaPost: "Perfect Insta Post",
      getExtension: "Ottieni Estensione",
      extensionDescription: "Estensione Chrome per creare post Instagram perfetti con IA"
    },
    
    common: {
      loading: "Caricamento...",
      error: "Errore",
      success: "Successo",
      retry: "Riprova",
      cancel: "Annulla",
      continue: "Continua",
      save: "Salva",
      delete: "Elimina",
      edit: "Modifica",
      close: "Chiudi",
      free: "Gratis",
      premium: "Premium",
      upgrade: "Aggiorna"
    },
    
    subscription: {
      freeAnalyses: "analisi gratuite al mese",
      upgradeNow: "Aggiorna Ora",
      starterPack: "Pacchetto Starter",
      monthly: "Mensile",
      annual: "Annuale",
      lifetime: "A vita",
      features: "Caratteristiche",
      noCard: "Nessuna carta di credito richiesta"
    },

    footer: {
      tagline: "Analisi IA per fotografi esigenti",
      productTitle: "Prodotto",
      analyzePhoto: "Analizza una foto",
      topPhotos: "Migliori foto",
      collections: "Collezioni",
      dashboard: "Dashboard",
      insights: "Insights",
      supportTitle: "Supporto",
      faq: "FAQ",
      contact: "Contatto",
      pricing: "Prezzi",
      glossary: "Glossario foto",
      resourcesTitle: "Risorse",
      partnerships: "Partnership",
      analysisTitle: "Analisi",
      analyzeFree: "Analizza gratis",
      aiCritique: "Critica IA",
      batchAnalysis: "Analisi batch",
      photoCollections: "Collezioni foto",
      allMyPhotos: "Tutte le mie foto",
      legalTitle: "Legale",
      terms: "Termini",
      privacy: "Privacy",
      legalNotice: "Note legali",
      cookies: "Cookie",
      copyright: "© 2025 PhotoJudge",
      allRightsReserved: "Tutti i diritti riservati",
      cookiePreferences: "Preferenze cookie"
    },

    result: {
      technicalTerms: "Termini tecnici",
      glossary: "Vedi glossario",
      analysisOf: "Analisi di",
      globalScore: "Punteggio globale",
      aiModeEnabled: "Modalità IA attivata",
      detailScores: "Punteggi dettagliati",
      technical: "Tecnico",
      artistic: "Artistico",
      analysisSummary: "Riepilogo analisi",
      strengths: "Punti di forza",
      improvementPriority: "Priorità di miglioramento",
      addToCollection: "Aggiungi alla collezione",
      exportPdf: "Esporta in PDF",
      shareResults: "Condividi risultati",
      newAnalysis: "Nuova analisi",
      improvementTips: "Consigli di miglioramento",
      forThisPhoto: "Per questa foto",
      nextShot: "Prossimo scatto",
      retouchTips: "Consigli di ritocco",
      retouchPotential: "Potenziale di ritocco"
    },

    cookies: {
      title: "Utilizziamo i cookie",
      description: "Utilizziamo i cookie per migliorare la tua esperienza sul nostro sito. Puoi accettare tutti i cookie o personalizzare le tue preferenze.",
      customize: "Personalizza",
      necessaryOnly: "Solo necessari",
      acceptAll: "Accetta tutti",
      settingsTitle: "Impostazioni cookie",
      necessary: "Cookie necessari",
      necessaryDesc: "Questi cookie sono essenziali per il funzionamento del sito e non possono essere disattivati.",
      necessaryAlways: "Sempre attivi",
      analytics: "Cookie analitici",
      analyticsDesc: "Questi cookie ci aiutano a capire come utilizzi il nostro sito per migliorarlo.",
      personalization: "Cookie di personalizzazione",
      personalizationDesc: "Questi cookie ci permettono di ricordare le tue preferenze e personalizzare la tua esperienza.",
      social: "Cookie dei social media",
      socialDesc: "Questi cookie consentono di condividere contenuti sui social network.",
      importantInfo: "I cookie necessari non possono essere disattivati in quanto sono essenziali per il funzionamento del sito.",
      save: "Salva le mie preferenze",
      acceptSelected: "Accetta selezione"
    },

    counter: {
      monthlyAnalyses: "analisi mensili",
      starterPack: "Pacchetto Starter",
      freePlan: "Piano Gratuito",
      resetIn: "Ripristino tra",
      days: "giorni",
      upgrade: "Passa a Premium",
      unlimitedAnalyses: "Analisi illimitate",
      currentPlan: "Piano attuale"
    },

    onboarding: {
      welcome: "Benvenuto su PhotoJudge",
      welcomeDesc: "Il tuo assistente IA per migliorare le tue foto. Scopri come funziona in 4 semplici passaggi.",
      chooseMode: "Scegli la tua modalità di analisi",
      chooseModeDesc: "Pro per analisi tecnica, Critica per critica divertente o Apprendimento per imparare.",
      uploadPhoto: "Carica la tua foto",
      uploadDesc: "Trascina e rilascia o fai clic per selezionare una foto. Formati accettati: JPG, PNG, WebP.",
      getAnalysis: "Ottieni la tua analisi dettagliata",
      getAnalysisDesc: "L'IA analizza la tua foto e ti dà consigli personalizzati per migliorare.",
      skip: "Salta",
      previous: "Precedente",
      next: "Successivo",
      finish: "Inizia",
      freeAnalyses: "3 analisi gratuite al mese"
    },

    languageSelector: {
      title: "Lingua dell'analisi",
      seeAll: "Vedi tutte le lingue",
      exampleIn: "Esempio in",
      aiWillRespond: "L'IA risponderà in questa lingua",
      selected: "Selezionato"
    },

    photoType: {
      select: "Tipo di foto",
      selectForAI: "Seleziona il tipo per un'analisi IA ottimizzata"
    },

    home: {
      hello: "Ciao",
      dashboard: "Dashboard",
      settings: "Impostazioni",
      logout: "Esci",
      analyzePhoto: "Analizza una foto",
      batchAnalysis: "Analisi batch",
      topPhotos: "Migliori foto",
      guides: "Guide",
      upgradePro: "Passa a Pro",
      bestPhotos: "Le tue migliori foto",
      bestPhotosDesc: "Foto con i punteggi di analisi più alti",
      seeAllPhotos: "Vedi tutte le foto",
      startCollection: "Crea la tua prima collezione",
      analyzeFirstPhoto: "Analizza la tua prima foto",
      aiPhotoAnalysis: "Analisi foto IA",
      aiPhotoAnalysisDesc: "Ottieni analisi dettagliate delle tue foto in secondi",
      instantCritique: "Critica istantanea",
      instantCritiqueDesc: "Carica e ricevi feedback immediati",
      preciseAnalysis: "Analisi precisa",
      preciseAnalysisDesc: "Punteggi dettagliati per ogni aspetto della tua foto",
      whyAnalyze: "Perché analizzare le tue foto?",
      expertCritique: "Critica esperta",
      expertCritiqueDesc: "Ottieni feedback professionale su ogni foto",
      improvePhotos: "Migliora le tue foto",
      improvePhotosDesc: "Consigli personalizzati per migliorare rapidamente"
    }
  },

  pt: {
    nav: {
      analyze: "Analisar",
      gallery: "Galeria",
      collections: "Coleções",
      pricing: "Preços",
      blog: "Blog",
      dashboard: "Dashboard",
      settings: "Configurações",
      signIn: "Entrar",
      signOut: "Sair",
      profile: "Perfil"
    },

    toneSelector: {
      title: "Escolha o tom da análise",
      titleMobile: "Tom de análise",
      help: "Ajuda",
      glossary: "Glossário fotográfico",
      faq: "Perguntas frequentes",
      contact: "Entre em contato",
      customize: "Personalizar",
      selected: "Selecionado",

      professional: {
        label: "Modo Pro",
        labelMobile: "Pro",
        description: "Análise técnica e construtiva",
        example: "Exemplo:",
        exampleText: "Excelente composição seguindo a regra dos terços. A exposição poderia ser melhorada em +1 stop. Ótimo trabalho na profundidade de campo."
      },
      roast: {
        label: "Modo Crítico",
        labelMobile: "Crítico",
        description: "Análise brutalmente honesta e divertida",
        example: "Exemplo:",
        exampleText: "Esta exposição parece um vampiro com medo da luz... +2 stops resolveriam as coisas. O enquadramento? Sua câmera teve soluços! 📸💀"
      },
      learning: {
        label: "Modo Aprendizagem",
        labelMobile: "Aprendizagem",
        description: "Formação completa e educativa",
        example: "Exemplo:",
        exampleText: "Excelente composição! Aqui está o porquê: a regra dos terços guia o olhar. Para melhorar, tente f/8 para mais nitidez. Exercício: varie seus ângulos de captura amanhã."
      }
    },

    analyze: {
      title: "Análise Foto IA",
      subtitle: "Inteligência artificial especialista em fotografia",
      selectMode: "Modo de análise",
      selectLanguage: "Idioma da análise",
      uploadPhoto: "Enviar uma foto",
      uploading: "Enviando...",
      analyzing: "Analisando...",
      dragDrop: "Arraste sua foto aqui ou clique para navegar",
      fileFormats: "Formatos suportados: JPG, PNG, WEBP",
      maxSize: "Tamanho máx: 10MB",
      unlimitedPhotos: "Fotos ilimitadas",
      invalidFile: "Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP)",
      analysisError: "Erro ao analisar a foto",
      networkError: "Erro de conexão - verifique sua rede",

      // Loading states
      loadingRoast: "Análise crítica em andamento...",
      loadingLearning: "Formação educativa em andamento...",
      loadingProfessional: "Análise IA em andamento...",
      loadingSubRoast: "A IA está preparando uma crítica brutalmente honesta",
      loadingSubLearning: "Aprendizagem com explicações detalhadas...",
      loadingSubProfessional: "GPT-4 Vision está analisando sua foto com precisão",

      // Loading titles
      loadingTitleRoast: "🔥 Preparando a crítica",
      loadingTitleLearning: "🎨 Visão artística",
      loadingTitleProfessional: "⚡ Análise em andamento",

      // Upload specs
      uploadSpecs: "Especificações técnicas",
      uploadSpecsDescription: "Formatos otimizados para análise IA: JPEG para velocidade, PNG para qualidade, WebP para compressão avançada",
      poweredBy: "Powered by",
      aiPowered: "Inteligência Artificial",
      photosUpTo: "📱 Fotos até 20MB",
      qualityPreserved: "Qualidade original preservada",
      railwayPro: "Railway Pro",
      recentActivity: "Atividade recente",

      professional: "Profissional",
      roast: "Sarcástico",
      artcritic: "Crítico de Arte",
      modeDescription: {
        professional: "Análise construtiva e educativa",
        roast: "Crítica sarcástica e criativa",
        artcritic: "Visão artística e cultural"
      },

      globalScore: "Pontuação global",
      technicalScore: "Técnico",
      artisticScore: "Artístico",
      strengths: "Pontos fortes",
      improvements: "Melhorias",
      retouchingPotential: "Potencial de retoque",

      newAnalysis: "Nova análise",
      addToCollection: "Adicionar à coleção",
      exportPdf: "Exportar PDF",
      shareResults: "Compartilhar"
    },

    social: {
      title: "Compartilhe sua análise",
      description: "Mostre como a IA te criticou!",
      hashtags: "Hashtags sugeridas",
      copySuccess: "Copiado!",
      shareCaption: "Legenda para compartilhar",
      downloadImage: "Baixar imagem",
      postToInstagram: "Postar no Instagram",
      perfectInstaPost: "Perfect Insta Post",
      getExtension: "Obter Extensão",
      extensionDescription: "Extensão Chrome para criar posts perfeitos do Instagram com IA"
    },

    common: {
      loading: "Carregando...",
      error: "Erro",
      success: "Sucesso",
      retry: "Tentar novamente",
      cancel: "Cancelar",
      continue: "Continuar",
      save: "Salvar",
      delete: "Excluir",
      edit: "Editar",
      close: "Fechar",
      free: "Grátis",
      premium: "Premium",
      upgrade: "Atualizar"
    },

    subscription: {
      freeAnalyses: "análises gratuitas por mês",
      upgradeNow: "Atualizar Agora",
      starterPack: "Pacote Inicial",
      monthly: "Mensal",
      annual: "Anual",
      lifetime: "Vitalício",
      features: "Recursos",
      noCard: "Sem cartão de crédito necessário"
    },

    footer: {
      tagline: "Análise IA para fotógrafos exigentes",
      productTitle: "Produto",
      analyzePhoto: "Analisar uma foto",
      topPhotos: "Melhores fotos",
      collections: "Coleções",
      dashboard: "Dashboard",
      insights: "Insights",
      supportTitle: "Suporte",
      faq: "FAQ",
      contact: "Contato",
      pricing: "Preços",
      glossary: "Glossário foto",
      resourcesTitle: "Recursos",
      partnerships: "Parcerias",
      analysisTitle: "Análise",
      analyzeFree: "Analisar grátis",
      aiCritique: "Crítica IA",
      batchAnalysis: "Análise em lote",
      photoCollections: "Coleções de fotos",
      allMyPhotos: "Todas as minhas fotos",
      legalTitle: "Legal",
      terms: "Termos",
      privacy: "Privacidade",
      legalNotice: "Aviso legal",
      cookies: "Cookies",
      copyright: "© 2025 PhotoJudge",
      allRightsReserved: "Todos os direitos reservados",
      cookiePreferences: "Preferências de cookies"
    },

    result: {
      technicalTerms: "Termos técnicos",
      glossary: "Ver glossário",
      analysisOf: "Análise de",
      globalScore: "Pontuação global",
      aiModeEnabled: "Modo IA ativado",
      detailScores: "Pontuações detalhadas",
      technical: "Técnico",
      artistic: "Artístico",
      analysisSummary: "Resumo da análise",
      strengths: "Pontos fortes",
      improvementPriority: "Prioridade de melhoria",
      addToCollection: "Adicionar à coleção",
      exportPdf: "Exportar para PDF",
      shareResults: "Compartilhar resultados",
      newAnalysis: "Nova análise",
      improvementTips: "Dicas de melhoria",
      forThisPhoto: "Para esta foto",
      nextShot: "Próxima sessão",
      retouchTips: "Dicas de retoque",
      retouchPotential: "Potencial de retoque"
    },

    cookies: {
      title: "Usamos cookies",
      description: "Usamos cookies para melhorar sua experiência em nosso site. Você pode aceitar todos os cookies ou personalizar suas preferências.",
      customize: "Personalizar",
      necessaryOnly: "Apenas necessários",
      acceptAll: "Aceitar todos",
      settingsTitle: "Configurações de cookies",
      necessary: "Cookies necessários",
      necessaryDesc: "Estes cookies são essenciais para o funcionamento do site e não podem ser desativados.",
      necessaryAlways: "Sempre ativos",
      analytics: "Cookies analíticos",
      analyticsDesc: "Estes cookies nos ajudam a entender como você usa nosso site para melhorá-lo.",
      personalization: "Cookies de personalização",
      personalizationDesc: "Estes cookies nos permitem lembrar suas preferências e personalizar sua experiência.",
      social: "Cookies de mídia social",
      socialDesc: "Estes cookies permitem compartilhar conteúdo nas redes sociais.",
      importantInfo: "Os cookies necessários não podem ser desativados, pois são essenciais para o funcionamento do site.",
      save: "Salvar minhas preferências",
      acceptSelected: "Aceitar seleção"
    },

    counter: {
      monthlyAnalyses: "análises mensais",
      starterPack: "Pacote Inicial",
      freePlan: "Plano Gratuito",
      resetIn: "Reiniciar em",
      days: "dias",
      upgrade: "Atualizar para Premium",
      unlimitedAnalyses: "Análises ilimitadas",
      currentPlan: "Plano atual"
    },

    onboarding: {
      welcome: "Bem-vindo ao PhotoJudge",
      welcomeDesc: "Seu assistente IA para melhorar suas fotos. Descubra como funciona em 4 passos simples.",
      chooseMode: "Escolha seu modo de análise",
      chooseModeDesc: "Pro para análise técnica, Crítico para crítica divertida ou Aprendizagem para aprender.",
      uploadPhoto: "Envie sua foto",
      uploadDesc: "Arraste e solte ou clique para selecionar uma foto. Formatos aceitos: JPG, PNG, WebP.",
      getAnalysis: "Obtenha sua análise detalhada",
      getAnalysisDesc: "A IA analisa sua foto e dá conselhos personalizados para melhorar.",
      skip: "Pular",
      previous: "Anterior",
      next: "Próximo",
      finish: "Começar",
      freeAnalyses: "3 análises grátis por mês"
    },

    languageSelector: {
      title: "Idioma da análise",
      seeAll: "Ver todos os idiomas",
      exampleIn: "Exemplo em",
      aiWillRespond: "A IA responderá neste idioma",
      selected: "Selecionado"
    },

    photoType: {
      select: "Tipo de foto",
      selectForAI: "Selecione o tipo para análise IA otimizada"
    },

    home: {
      hello: "Olá",
      dashboard: "Dashboard",
      settings: "Configurações",
      logout: "Sair",
      analyzePhoto: "Analisar uma foto",
      batchAnalysis: "Análise em lote",
      topPhotos: "Melhores fotos",
      guides: "Guias",
      upgradePro: "Atualizar para Pro",
      bestPhotos: "Suas melhores fotos",
      bestPhotosDesc: "Fotos com as pontuações de análise mais altas",
      seeAllPhotos: "Ver todas as fotos",
      startCollection: "Criar sua primeira coleção",
      analyzeFirstPhoto: "Analisar sua primeira foto",
      aiPhotoAnalysis: "Análise de foto IA",
      aiPhotoAnalysisDesc: "Obtenha análise detalhada de suas fotos em segundos",
      instantCritique: "Crítica instantânea",
      instantCritiqueDesc: "Envie e receba feedback imediato",
      preciseAnalysis: "Análise precisa",
      preciseAnalysisDesc: "Pontuações detalhadas para cada aspecto da sua foto",
      whyAnalyze: "Por que analisar suas fotos?",
      expertCritique: "Crítica especializada",
      expertCritiqueDesc: "Obtenha feedback profissional em cada foto",
      improvePhotos: "Melhore suas fotos",
      improvePhotosDesc: "Dicas personalizadas para melhorar rapidamente"
    }
  },

  zh: {
    nav: {
      analyze: "Analyze",
      gallery: "Gallery",
      collections: "Collections",
      pricing: "Pricing",
      blog: "Blog",
      dashboard: "Dashboard",
      settings: "Settings",
      signIn: "Sign In",
      signOut: "Sign Out",
      profile: "Profile"
    },

    toneSelector: {
      title: "选择分析语气",
      titleMobile: "分析语气",
      help: "帮助",
      glossary: "摄影术语表",
      faq: "常见问题",
      contact: "联系我们",
      customize: "自定义",
      selected: "已选择",

      professional: {
        label: "专业模式",
        labelMobile: "专业",
        description: "技术性和建设性分析",
        example: "示例：",
        exampleText: "优秀的构图遵循三分法则。曝光可以提高+1档。景深工作出色。"
      },
      roast: {
        label: "犀利模式",
        labelMobile: "犀利",
        description: "直白有趣的分析",
        example: "示例：",
        exampleText: "这个曝光看起来像怕光的吸血鬼...+2档会解决问题。取景呢？你的相机打嗝了！📸💀"
      },
      learning: {
        label: "学习模式",
        labelMobile: "学习",
        description: "完整的教育培训",
        example: "示例：",
        exampleText: "优秀的构图！原因如下：三分法则引导视线。要改进，试试f/8以获得更多锐度。练习：明天变化拍摄角度。"
      }
    },

    analyze: {
      title: "AI照片分析",
      subtitle: "摄影专家人工智能",
      selectMode: "分析模式",
      selectLanguage: "分析语言",
      uploadPhoto: "上传照片",
      uploading: "上传中...",
      analyzing: "分析中...",
      dragDrop: "将照片拖到此处或点击浏览",
      fileFormats: "支持格式：JPG、PNG、WEBP",
      maxSize: "最大大小：10MB",
      unlimitedPhotos: "无限照片",
      invalidFile: "请选择有效的图像文件（JPG、PNG、WebP）",
      analysisError: "分析照片时出错",
      networkError: "连接错误 - 请检查您的网络",

      // Loading states
      loadingRoast: "批评分析进行中...",
      loadingLearning: "教育培训进行中...",
      loadingProfessional: "AI分析进行中...",
      loadingSubRoast: "AI正在准备直白的批评",
      loadingSubLearning: "详细讲解学习中...",
      loadingSubProfessional: "GPT-4 Vision正在精确分析您的照片",

      // Loading titles
      loadingTitleRoast: "🔥 准备批评",
      loadingTitleLearning: "🎨 艺术视野",
      loadingTitleProfessional: "⚡ 分析中",

      // Upload specs
      uploadSpecs: "技术规格",
      uploadSpecsDescription: "优化的AI分析格式：JPEG快速、PNG高质量、WebP高级压缩",
      poweredBy: "技术支持",
      aiPowered: "人工智能",
      photosUpTo: "📱 照片最大20MB",
      qualityPreserved: "保留原始质量",
      railwayPro: "Railway Pro",
      recentActivity: "最近活动",

      professional: "专业",
      roast: "犀利",
      artcritic: "艺术评论",
      modeDescription: {
        professional: "建设性和教育性分析",
        roast: "讽刺和创造性批评",
        artcritic: "艺术和文化视野"
      },

      globalScore: "总体评分",
      technicalScore: "技术",
      artisticScore: "艺术",
      strengths: "优点",
      improvements: "改进",
      retouchingPotential: "修图潜力",

      newAnalysis: "新分析",
      addToCollection: "添加到收藏",
      exportPdf: "导出PDF",
      shareResults: "分享"
    },

    social: {
      title: "Share your analysis",
      description: "Show how AI roasted you!",
      hashtags: "Suggested hashtags",
      copySuccess: "Copied!",
      shareCaption: "Share caption",
      downloadImage: "Download image",
      postToInstagram: "Post to Instagram",
      perfectInstaPost: "Perfect Insta Post",
      getExtension: "Get Extension",
      extensionDescription: "Chrome extension to create perfect Instagram posts with AI"
    },

    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      retry: "Retry",
      cancel: "Cancel",
      continue: "Continue",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
      free: "Free",
      premium: "Premium",
      upgrade: "Upgrade"
    },

    subscription: {
      freeAnalyses: "free analyses per month",
      upgradeNow: "Upgrade Now",
      starterPack: "Starter Pack",
      monthly: "Monthly",
      annual: "Annual",
      lifetime: "Lifetime",
      features: "Features",
      noCard: "No credit card required"
    },

    footer: {
      tagline: "AI分析为专业摄影师",
      productTitle: "产品",
      analyzePhoto: "分析照片",
      topPhotos: "最佳照片",
      collections: "收藏",
      dashboard: "仪表板",
      insights: "见解",
      supportTitle: "支持",
      faq: "常见问题",
      contact: "联系",
      pricing: "价格",
      glossary: "照片术语表",
      resourcesTitle: "资源",
      partnerships: "合作伙伴",
      analysisTitle: "分析",
      analyzeFree: "免费分析",
      aiCritique: "AI评论",
      batchAnalysis: "批量分析",
      photoCollections: "照片收藏",
      allMyPhotos: "我的所有照片",
      legalTitle: "法律",
      terms: "条款",
      privacy: "隐私",
      legalNotice: "法律声明",
      cookies: "Cookies",
      copyright: "© 2025 PhotoJudge",
      allRightsReserved: "保留所有权利",
      cookiePreferences: "Cookie偏好设置"
    },

    result: {
      technicalTerms: "技术术语",
      glossary: "查看术语表",
      analysisOf: "分析",
      globalScore: "总体评分",
      aiModeEnabled: "AI模式已启用",
      detailScores: "详细评分",
      technical: "技术",
      artistic: "艺术",
      analysisSummary: "分析摘要",
      strengths: "优势",
      improvementPriority: "改进优先级",
      addToCollection: "添加到收藏",
      exportPdf: "导出PDF",
      shareResults: "分享结果",
      newAnalysis: "新分析",
      improvementTips: "改进技巧",
      forThisPhoto: "针对这张照片",
      nextShot: "下次拍摄",
      retouchTips: "修图技巧",
      retouchPotential: "修图潜力"
    },

    cookies: {
      title: "我们使用Cookies",
      description: "我们使用cookies来改善您在我们网站上的体验。您可以接受所有cookies或自定义您的偏好。",
      customize: "自定义",
      necessaryOnly: "仅必要",
      acceptAll: "接受全部",
      settingsTitle: "Cookie设置",
      necessary: "必要cookies",
      necessaryDesc: "这些cookies对网站功能至关重要，无法禁用。",
      necessaryAlways: "始终启用",
      analytics: "分析cookies",
      analyticsDesc: "这些cookies帮助我们了解您如何使用我们的网站以进行改进。",
      personalization: "个性化cookies",
      personalizationDesc: "这些cookies使我们能够记住您的偏好并个性化您的体验。",
      social: "社交媒体cookies",
      socialDesc: "这些cookies允许在社交网络上分享内容。",
      importantInfo: "必要cookies无法禁用，因为它们对网站功能至关重要。",
      save: "保存我的偏好",
      acceptSelected: "接受选择"
    },

    counter: {
      monthlyAnalyses: "每月分析",
      starterPack: "入门包",
      freePlan: "免费计划",
      resetIn: "重置于",
      days: "天",
      upgrade: "升级到高级版",
      unlimitedAnalyses: "无限分析",
      currentPlan: "当前计划"
    },

    onboarding: {
      welcome: "欢迎来到PhotoJudge",
      welcomeDesc: "您的AI助手帮助改善您的照片。通过4个简单步骤了解其工作原理。",
      chooseMode: "选择您的分析模式",
      chooseModeDesc: "专业模式用于技术分析，犀利模式用于有趣的批评，或学习模式用于学习。",
      uploadPhoto: "上传您的照片",
      uploadDesc: "拖放或点击选择照片。接受的格式：JPG、PNG、WebP。",
      getAnalysis: "获取详细分析",
      getAnalysisDesc: "AI分析您的照片并提供个性化建议以改进。",
      skip: "跳过",
      previous: "上一步",
      next: "下一步",
      finish: "开始",
      freeAnalyses: "每月3次免费分析"
    },

    languageSelector: {
      title: "分析语言",
      seeAll: "查看所有语言",
      exampleIn: "示例",
      aiWillRespond: "AI将以此语言回复",
      selected: "已选择"
    },

    photoType: {
      select: "照片类型",
      selectForAI: "选择类型以优化AI分析"
    },

    home: {
      hello: "你好",
      dashboard: "仪表板",
      settings: "设置",
      logout: "登出",
      analyzePhoto: "分析照片",
      batchAnalysis: "批量分析",
      topPhotos: "最佳照片",
      guides: "指南",
      upgradePro: "升级到专业版",
      bestPhotos: "您的最佳照片",
      bestPhotosDesc: "分析得分最高的照片",
      seeAllPhotos: "查看所有照片",
      startCollection: "创建您的第一个收藏",
      analyzeFirstPhoto: "分析您的第一张照片",
      aiPhotoAnalysis: "AI照片分析",
      aiPhotoAnalysisDesc: "几秒钟内获得照片的详细分析",
      instantCritique: "即时评论",
      instantCritiqueDesc: "上传并立即获得反馈",
      preciseAnalysis: "精确分析",
      preciseAnalysisDesc: "照片每个方面的详细评分",
      whyAnalyze: "为什么要分析您的照片？",
      expertCritique: "专家评论",
      expertCritiqueDesc: "对每张照片获得专业反馈",
      improvePhotos: "改善您的照片",
      improvePhotosDesc: "快速改进的个性化建议"
    }
  }
}

// Hook pour utiliser les traductions
export function useTranslation(language: AnalysisLanguage) {
  return translations[language] || translations.fr
}