import Head from 'next/head'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  ogType?: string
  canonicalUrl?: string
  jsonLd?: object | object[]
  locale?: string
}

/**
 * SEO Head Component - Optimized for AI Crawlers (ChatGPT, Perplexity, Gemini)
 * Includes structured data, meta tags, and LLM-friendly context
 */
export default function SEOHead({
  title = 'Analyser Photo IA Gratuit | Critique Photo Intelligence Artificielle - JudgeMyJPEG',
  description = 'Analysez vos photos gratuitement avec une IA experte ! 3 modes d\'analyse (Roast/Professional/Learning), notation détaillée, conseils techniques personnalisés. Intelligence artificielle spécialisée en photographie.',
  keywords = 'analyser photo IA, critique photo intelligence artificielle, analyse photo gratuit, améliorer photo IA, conseil photo automatique, note photo IA, composition photo IA, exposition photo analyse',
  ogImage = 'https://www.judgemyjpeg.fr/og-image.svg',
  ogType = 'website',
  canonicalUrl = 'https://www.judgemyjpeg.fr',
  jsonLd,
  locale = 'fr_FR'
}: SEOHeadProps) {
  // Base organization schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.judgemyjpeg.fr/#organization",
    "name": "JudgeMyJPEG",
    "url": "https://www.judgemyjpeg.fr",
    "logo": {
      "@type": "ImageObject",
      "url": "https://res.cloudinary.com/judgemyjpeg/image/upload/v1729082345/logo-cosmic.png",
      "width": 512,
      "height": 512
    },
    "description": "Plateforme SaaS d'analyse photo par intelligence artificielle avec 3 personnalités IA distinctes",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "9 Allée de la Meilleraie",
      "addressLocality": "Les Sables-d'Olonne",
      "postalCode": "85340",
      "addressCountry": "FR"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "contact.judgemyjpeg@gmail.com",
      "contactType": "customer service",
      "availableLanguage": ["fr", "en", "es", "de", "it", "pt"]
    },
    "sameAs": [
      "https://twitter.com/judgemyjpeg",
      "https://www.linkedin.com/company/judgemyjpeg"
    ]
  }

  // Base WebSite schema with enhanced AI context
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.judgemyjpeg.fr/#website",
    "name": "JudgeMyJPEG",
    "alternateName": ["Critique Photo IA", "Analyser Photo Intelligence Artificielle"],
    "description": "Service d'analyse photo par IA proposant 3 modes distincts : Roast (critique créative), Professional (conseils techniques), Learning (apprentissage pédagogique). Analyse gratuite avec notation sur 100.",
    "url": "https://www.judgemyjpeg.fr",
    "inLanguage": ["fr-FR", "en-US", "es-ES", "de-DE", "it-IT", "pt-PT"],
    "publisher": {
      "@id": "https://www.judgemyjpeg.fr/#organization"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.judgemyjpeg.fr/analyze?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  // SoftwareApplication schema for AI understanding
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "JudgeMyJPEG AI Photo Analyzer",
    "applicationCategory": "PhotographyApplication",
    "operatingSystem": "Web Browser",
    "description": "Application d'analyse photo par intelligence artificielle. Obtenez une critique détaillée de vos photos avec 3 personnalités IA : Roast (humoristique), Professional (technique), Learning (éducatif).",
    "url": "https://www.judgemyjpeg.fr",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150",
      "bestRating": "5",
      "worstRating": "1"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Plan Gratuit",
        "price": "0",
        "priceCurrency": "EUR",
        "description": "3 analyses photo par mois avec tous les modes IA"
      },
      {
        "@type": "Offer",
        "name": "Premium Monthly",
        "price": "9.99",
        "priceCurrency": "EUR",
        "description": "Analyses illimitées + toutes fonctionnalités"
      },
      {
        "@type": "Offer",
        "name": "Lifetime Access",
        "price": "99",
        "priceCurrency": "EUR",
        "description": "Accès à vie avec toutes les features"
      }
    ],
    "featureList": [
      "Analyse photo par IA en 3 modes (Roast/Professional/Learning)",
      "Notation sur 100 points avec détails par critère",
      "Support multilingue (6 langues)",
      "Export PDF et partage social",
      "Types spécialisés : Portrait, Paysage, Street, Macro, Architecture",
      "Collections personnalisées",
      "Dashboard avec statistiques"
    ]
  }

  // Combine all schemas
  const allSchemas: any[] = [organizationSchema, websiteSchema, softwareSchema]
  if (jsonLd) {
    if (Array.isArray(jsonLd)) {
      allSchemas.push(...jsonLd)
    } else {
      allSchemas.push(jsonLd)
    }
  }

  return (
    <Head>
      {/* Primary Meta Tags - LLM Optimized */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* AI-Friendly Context Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-image-preview:large" />
      <meta name="bingbot" content="index, follow, max-image-preview:large" />

      {/* Language & Locale */}
      <meta httpEquiv="content-language" content={locale.split('_')[0]} />
      <meta property="og:locale" content={locale} />
      <meta property="og:locale:alternate" content="en_US" />
      <meta property="og:locale:alternate" content="es_ES" />
      <meta property="og:locale:alternate" content="de_DE" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/svg+xml" />
      <meta property="og:site_name" content="JudgeMyJPEG" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:creator" content="@judgemyjpeg" />
      <meta name="twitter:site" content="@judgemyjpeg" />

      {/* Additional SEO Tags for AI Crawlers */}
      <meta name="author" content="JudgeMyJPEG - CodeCraft Plus" />
      <meta name="publisher" content="CodeCraft Plus" />
      <meta name="copyright" content="CodeCraft Plus" />
      <meta name="application-name" content="JudgeMyJPEG" />
      <meta name="apple-mobile-web-app-title" content="JudgeMyJPEG" />

      {/* Structured Data - JSON-LD for AI Understanding */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(allSchemas)
        }}
      />

      {/* AI Crawler Discovery */}
      <link rel="alternate" type="application/json+ai" href="https://www.judgemyjpeg.fr/ai.txt" />
    </Head>
  )
}
