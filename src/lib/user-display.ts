import { Session } from 'next-auth'

export interface UserPreferences {
  displayName?: string
  nickname?: string
  preferredAnalysisMode?: string
  defaultExportFormat?: string
  theme?: string
  language?: string
  shareAnalytics?: boolean
  publicProfile?: boolean
}

/**
 * Obtient le nom d'affichage de l'utilisateur selon l'ordre de priorité :
 * 1. displayName des préférences utilisateur
 * 2. nickname de la session
 * 3. name de la session
 * 4. "Utilisateur" par défaut
 */
export function getUserDisplayName(
  session: Session | null, 
  userPreferences?: UserPreferences | null
): string {
  return (
    userPreferences?.displayName ||
    session?.user?.nickname ||
    session?.user?.name ||
    'Utilisateur'
  )
}

/**
 * Obtient l'initiale pour l'avatar de l'utilisateur
 */
export function getUserInitial(
  session: Session | null, 
  userPreferences?: UserPreferences | null
): string {
  const displayName = getUserDisplayName(session, userPreferences)
  return displayName[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || 'U'
}

/**
 * Vérifie si l'utilisateur a un nom d'affichage personnalisé
 */
export function hasCustomDisplayName(
  session: Session | null, 
  userPreferences?: UserPreferences | null
): boolean {
  return !!(userPreferences?.displayName && userPreferences.displayName !== session?.user?.name)
}