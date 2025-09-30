/**
 * Configuration i18next pour traduction automatique
 * Utilise i18next avec détection automatique de langue
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Traductions françaises (langue source)
const fr = {
  translation: {
    // Navigation
    'nav.analyze': 'Analyser',
    'nav.gallery': 'Galerie',
    'nav.collections': 'Collections',
    'nav.pricing': 'Tarifs',
    'nav.blog': 'Blog',
    'nav.dashboard': 'Dashboard',
    'nav.settings': 'Paramètres',
    'nav.signIn': 'Connexion',
    'nav.signOut': 'Déconnexion',
    'nav.profile': 'Profil',
    'nav.back': 'Retour',
    'nav.backHome': 'Retour à l\'accueil',

    // Pricing
    'pricing.title': 'Tarifs',
    'pricing.subtitle': 'Choisissez le plan parfait pour',
    'pricing.subtitle2': 'analyser vos photos',
    'pricing.subtitle3': 'sans limites',
    'pricing.free': 'Gratuit',
    'pricing.starter': 'Starter Pack',
    'pricing.premium': 'Premium',
    'pricing.annual': 'Annuel',
    'pricing.discover': 'Découvrez JudgeMyJPEG',
    'pricing.forever': 'Pour toujours',
    'pricing.oneTime': 'Achat unique',
    'pricing.perMonth': 'par mois',
    'pricing.perYear': 'par an',
    'pricing.currentPlan': 'Plan actuel',
    'pricing.choosePlan': 'Choisir ce plan',
    'pricing.noCommitment': 'Sans engagement',
    'pricing.bestValue': 'MEILLEURE VALEUR',
    'pricing.popular': 'POPULAIRE',
    'pricing.limitedOffer': 'OFFRE LIMITÉE',

    // Features
    'features.analysesPerMonth': 'analyses par mois',
    'features.unlimitedAnalyses': 'Analyses illimitées',
    'features.modes': 'Mode Pro, Cassant & Expert',
    'features.basicAdvice': 'Score + conseils de base',
    'features.shareableImages': 'Images partageables',
    'features.advancedInsights': 'Insights IA avancés',
    'features.storiesCards': 'Générateur d\'images Stories',
    'features.personalizedInsights': 'Insights IA personnalisés',
    'features.dataExport': 'Export de données',
    'features.prioritySupport': 'Support prioritaire',
    'features.allPremium': 'Tout du plan Premium',
    'features.annualCommitment': 'Engagement annuel',
    'features.annualBilling': 'Facturation annuelle',
    'features.multiLanguage': '6 langues disponibles',
    'features.bonusAnalyses': 'analyses bonus',
    'features.allModes': 'Tous les modes (Pro, Roast, Expert)',
    'features.socialShares': 'partages sociaux',
    'features.pdfExports': 'exports PDF',
    'features.limitedOne': 'Limité à 1 par compte',

    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.retry': 'Réessayer',
    'common.cancel': 'Annuler',
    'common.continue': 'Continuer',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.close': 'Fermer',
    'common.free': 'Gratuit',
    'common.upgrade': 'Passer Premium',

    // FAQ
    'faq.title': 'Questions Fréquentes',
    'faq.q1': 'Puis-je annuler mon abonnement ?',
    'faq.a1': 'Non ! L\'abonnement Premium est sans engagement. Vous pouvez annuler à tout moment depuis votre dashboard Stripe.',
    'faq.q2': 'Que se passe-t-il après avoir utilisé mes 3 analyses gratuites ?',
    'faq.a2': 'Vos analyses gratuites se réinitialisent automatiquement chaque mois. Ou vous pouvez passer Premium pour des analyses illimitées.',
    'faq.q3': 'Les paiements sont-ils sécurisés ?',
    'faq.a3': 'Absolument ! Tous les paiements sont traités par Stripe, leader mondial des paiements en ligne.',
    'faq.q4': 'Comment fonctionne le Starter Pack ?',
    'faq.a4': 'Le Starter Pack est un achat unique qui vous donne 10 analyses supplémentaires. Parfait si vous n\'avez besoin que de quelques analyses ponctuelles.',

    // Dashboard
    'dashboard.welcome': 'Bienvenue',
    'dashboard.myPhotos': 'Mes Photos',
    'dashboard.myCollections': 'Mes Collections',
    'dashboard.stats': 'Statistiques',
    'dashboard.subscription': 'Abonnement',
    'dashboard.accountSettings': 'Paramètres du compte',

    // Settings
    'settings.title': 'Paramètres',
    'settings.profile': 'Profil',
    'settings.language': 'Langue',
    'settings.theme': 'Thème',
    'settings.notifications': 'Notifications',
    'settings.privacy': 'Confidentialité',

    // Subscription status
    'subscription.free': 'Plan Gratuit',
    'subscription.premium': 'Plan Premium',
    'subscription.annual': 'Plan Annuel',
    'subscription.analysesRemaining': 'analyses restantes ce mois',
    'subscription.analysesUsed': 'Analyses utilisées',
    'subscription.resetIn': 'Réinitialisation dans',
    'subscription.days': 'jours',
    'subscription.limitReached': 'Limite atteinte ! Plus d\'analyses jusqu\'au',
    'subscription.lastAnalysis': 'Dernière analyse gratuite ! Pensez à passer Premium.',
  }
}

// Traductions anglaises
const en = {
  translation: {
    // Navigation
    'nav.analyze': 'Analyze',
    'nav.gallery': 'Gallery',
    'nav.collections': 'Collections',
    'nav.pricing': 'Pricing',
    'nav.blog': 'Blog',
    'nav.dashboard': 'Dashboard',
    'nav.settings': 'Settings',
    'nav.signIn': 'Sign In',
    'nav.signOut': 'Sign Out',
    'nav.profile': 'Profile',
    'nav.back': 'Back',
    'nav.backHome': 'Back to home',

    // Pricing
    'pricing.title': 'Pricing',
    'pricing.subtitle': 'Choose the perfect plan to',
    'pricing.subtitle2': 'analyze your photos',
    'pricing.subtitle3': 'without limits',
    'pricing.free': 'Free',
    'pricing.starter': 'Starter Pack',
    'pricing.premium': 'Premium',
    'pricing.annual': 'Annual',
    'pricing.discover': 'Discover JudgeMyJPEG',
    'pricing.testMore': 'Test more',
    'pricing.forPassionate': 'For enthusiasts',
    'pricing.bestValue2': 'Best value',
    'pricing.forever': 'Forever',
    'pricing.oneTime': 'one-time purchase',
    'pricing.uniquePurchase': 'ONE-TIME PURCHASE',
    'pricing.perMonth': 'per month',
    'pricing.perYear': 'per year',
    'pricing.currentPlan': 'Current plan',
    'pricing.choosePlan': 'Choose this plan',
    'pricing.subscribe': 'Subscribe now',
    'pricing.subscribeYear': 'Subscribe for 1 year',
    'pricing.buyNow': 'Buy now',
    'pricing.noCommitment': 'No commitment',
    'pricing.bestValue': 'BEST VALUE',
    'pricing.popular': 'POPULAR',
    'pricing.limitedOffer': 'LIMITED OFFER',
    'pricing.save33': 'Save 33% vs monthly',
    'pricing.save40': 'Save 40€/year',
    'pricing.reducedCommitment': 'Reduced commitment',

    // Features
    'features.analysesPerMonth': 'analyses per month',
    'features.unlimitedAnalyses': 'Unlimited analyses',
    'features.modes': 'Pro, Roast & Expert modes',
    'features.basicAdvice': 'Score + basic advice',
    'features.shareableImages': 'Shareable images',
    'features.advancedInsights': 'Advanced AI insights',
    'features.storiesCards': 'Stories image generator',
    'features.personalizedInsights': 'Personalized AI insights',
    'features.dataExport': 'Data export',
    'features.prioritySupport': 'Priority support',
    'features.allPremium': 'All Premium features',
    'features.annualCommitment': 'Annual commitment',
    'features.annualBilling': 'Annual billing',
    'features.multiLanguage': '6 languages available',
    'features.bonusAnalyses': 'bonus analyses',
    'features.allModes': 'All modes (Pro, Roast, Expert)',
    'features.socialShares': 'social shares',
    'features.pdfExports': 'PDF exports',
    'features.limitedOne': 'Limited to 1 per account',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.retry': 'Retry',
    'common.cancel': 'Cancel',
    'common.continue': 'Continue',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.free': 'Free',
    'common.upgrade': 'Upgrade to Premium',

    // FAQ
    'faq.title': 'Frequently Asked Questions',
    'faq.q1': 'Can I cancel my subscription?',
    'faq.a1': 'Yes! The Premium subscription has no commitment. You can cancel anytime from your Stripe dashboard.',
    'faq.q2': 'What happens after I use my 3 free analyses?',
    'faq.a2': 'Your free analyses reset automatically every month. Or you can upgrade to Premium for unlimited analyses.',
    'faq.q3': 'Are payments secure?',
    'faq.a3': 'Absolutely! All payments are processed by Stripe, the global leader in online payments.',
    'faq.q4': 'How does the Starter Pack work?',
    'faq.a4': 'The Starter Pack is a one-time purchase that gives you 10 additional analyses. Perfect if you only need a few spot analyses.',

    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.myPhotos': 'My Photos',
    'dashboard.myCollections': 'My Collections',
    'dashboard.stats': 'Statistics',
    'dashboard.subscription': 'Subscription',
    'dashboard.accountSettings': 'Account settings',

    // Settings
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.notifications': 'Notifications',
    'settings.privacy': 'Privacy',

    // Subscription status
    'subscription.free': 'Free Plan',
    'subscription.premium': 'Premium Plan',
    'subscription.annual': 'Annual Plan',
    'subscription.analysesRemaining': 'analyses remaining this month',
    'subscription.analysesUsed': 'Analyses used',
    'subscription.resetIn': 'Resets in',
    'subscription.days': 'days',
    'subscription.limitReached': 'Limit reached! No more analyses until',
    'subscription.lastAnalysis': 'Last free analysis! Consider upgrading to Premium.',
  }
}

// Initialisation i18next
i18n
  .use(LanguageDetector) // Détection automatique
  .use(initReactI18next) // Intégration React
  .init({
    resources: {
      fr,
      en,
      es: en, // Utiliser l'anglais comme fallback pour l'espagnol (à compléter)
      de: en, // Utiliser l'anglais comme fallback pour l'allemand (à compléter)
      it: en, // Utiliser l'anglais comme fallback pour l'italien (à compléter)
      pt: en, // Utiliser l'anglais comme fallback pour le portugais (à compléter)
    },
    fallbackLng: 'fr', // Langue par défaut
    supportedLngs: ['fr', 'en', 'es', 'de', 'it', 'pt'],

    detection: {
      // Ordre de détection
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false, // React échappe déjà
    },

    react: {
      useSuspense: false, // Pas de suspense pour éviter les flash
    },
  })

export default i18n