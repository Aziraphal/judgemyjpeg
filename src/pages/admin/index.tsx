/**
 * Admin Index Page - Redirect to unified dashboard
 */

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { withAdminProtection } from '@/lib/withAdminProtection'

export default function AdminIndex() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard immediately
    router.replace('/admin/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-cosmic-dark flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mx-auto mb-4"></div>
        <p className="text-text-white">Redirection vers le dashboard...</p>
      </div>
    </div>
  )
}

export const getServerSideProps = withAdminProtection()