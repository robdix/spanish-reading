'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth' // You'll need to create this
import { DefinitionSidebar } from '@/components/DefinitionSidebar'

export default function DefinitionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()

  const word = searchParams.get('word')
  const context = searchParams.get('context')

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user) {
      router.push('/login?returnTo=' + encodeURIComponent(window.location.pathname + window.location.search))
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }

  if (!user) {
    return <div className="p-4">Redirecting to login...</div>
  }

  return (
    <div className="h-screen w-screen">
      <DefinitionSidebar 
        word={word}
        context={context || ''}
        onClose={() => window.close()}
        isExtension={true}
      />
    </div>
  )
} 