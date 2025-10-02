/**
 * Link component with intelligent preloading
 * Preloads critical routes for better performance
 */

import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

interface PreloadLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  preload?: boolean
  prefetch?: boolean
}

export default function PreloadLink({
  href,
  children,
  className = '',
  preload = true,
  prefetch = true
}: PreloadLinkProps) {
  const router = useRouter()

  // Preload on hover (aggressive)
  const handleMouseEnter = () => {
    if (preload) {
      router.prefetch(href)
    }
  }

  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      prefetch={prefetch}
    >
      {children}
    </Link>
  )
}

/**
 * Hook to preload critical routes on mount
 */
export function usePreloadRoutes(routes: string[]) {
  const router = useRouter()

  useEffect(() => {
    // Preload after initial render
    const timer = setTimeout(() => {
      routes.forEach(route => {
        router.prefetch(route)
      })
    }, 1000) // 1s delay to not block initial render

    return () => clearTimeout(timer)
  }, [router, routes])
}

/**
 * Critical routes à preloader sur la homepage
 */
export const CRITICAL_ROUTES = [
  '/analyze',
  '/pricing',
  '/dashboard',
  '/api/auth/signin'
]
