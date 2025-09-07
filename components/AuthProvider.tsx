'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/authStore'
import { useDataStore } from '@/lib/stores/dataStore'

interface Props {
  children: React.ReactNode
}

export default function AuthProvider({ children }: Props) {
  const { checkAuth, isAuthenticated } = useAuthStore()
  const { refreshAll } = useDataStore()

  useEffect(() => {
    // Check authentication status on app load
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Load initial data if authenticated
    if (isAuthenticated) {
      refreshAll()
    }
  }, [isAuthenticated, refreshAll])

  return <>{children}</>
}
