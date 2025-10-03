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
    }
  }
}

// Hook pour utiliser les traductions
export function useTranslation(language: AnalysisLanguage) {
  return translations[language] || translations.fr
}