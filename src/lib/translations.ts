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
  }
}

// Hook pour utiliser les traductions
export function useTranslation(language: AnalysisLanguage) {
  return translations[language] || translations.fr
}