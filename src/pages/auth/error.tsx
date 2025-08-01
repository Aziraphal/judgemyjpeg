import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function AuthError() {
  const router = useRouter()
  const { error } = router.query

  const getErrorMessage = (error: string | string[] | undefined) => {
    if (Array.isArray(error)) {
      error = error[0]
    }
    
    switch (error) {
      case 'CredentialsSignin':
        return 'Email ou mot de passe incorrect'
      case 'EmailNotVerified':
        return 'Veuillez vérifier votre email'
      case 'Signin':
        return 'Erreur lors de la connexion'
      case 'OAuthSignin':
        return 'Erreur lors de la connexion avec Google'
      case 'OAuthCallback':
        return 'Erreur de callback OAuth'
      case 'OAuthCreateAccount':
        return 'Impossible de créer le compte'
      case 'EmailCreateAccount':
        return 'Impossible de créer le compte avec cet email'
      case 'Callback':
        return 'Erreur de callback'
      case 'OAuthAccountNotLinked':
        return 'Un compte existe déjà avec cet email. Utilisez la méthode de connexion originale.'
      case 'EmailSignin':
        return 'Impossible d\'envoyer l\'email de connexion'
      case 'CredentialsSignup':
        return 'Erreur lors de la création du compte'
      case 'SessionRequired':
        return 'Vous devez être connecté pour accéder à cette page'
      default:
        return 'Une erreur inattendue s\'est produite'
    }
  }

  return (
    <>
      <Head>
        <title>Erreur d'authentification - JudgeMyJPEG</title>
        <meta name="description" content="Erreur lors de la connexion" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative flex items-center justify-center">
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-8 w-24 h-24 bg-glow-pink rounded-full blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-12 w-32 h-32 bg-glow-cyan rounded-full blur-xl opacity-15 animate-float" style={{animationDelay: '1.5s'}}></div>
        
        <div className="w-full max-w-md px-4 relative z-10">
          {/* Error Card */}
          <div className="glass-card p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              Erreur d'authentification
            </h1>
            
            <p className="text-text-gray mb-8">
              {getErrorMessage(error)}
            </p>

            <div className="space-y-4">
              <Link href="/auth/signin" className="btn-neon-pink w-full block">
                Réessayer la connexion
              </Link>
              
              <Link href="/auth/signup" className="btn-neon-secondary w-full block">
                Créer un nouveau compte
              </Link>
              
              <Link href="/" className="text-text-muted text-sm hover:text-neon-cyan transition-colors block">
                ← Retour à l'accueil
              </Link>
            </div>

            {/* Tips */}
            <div className="mt-8 p-4 bg-cosmic-glass/50 border border-cosmic-glassborder rounded-lg text-left">
              <h3 className="text-sm font-semibold text-neon-cyan mb-2">💡 Conseils :</h3>
              <ul className="space-y-1 text-xs text-text-gray">
                <li>• Vérifiez votre email et mot de passe</li>
                <li>• Assurez-vous d'avoir un compte existant</li>
                <li>• Essayez la connexion Google si vous l'avez utilisée</li>
                <li>• Videz le cache de votre navigateur</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}