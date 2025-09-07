'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'
import MainLayout from './MainLayout'

interface Props {
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: string[]
}

export default function AuthenticatedLayout({ 
  children, 
  requireAuth = true, 
  allowedRoles = [] 
}: Props) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, checkAuth, logout } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      if (!isAuthenticated && requireAuth) {
        await checkAuth()
      }
      setIsChecking(false)
    }

    initAuth()
  }, [isAuthenticated, requireAuth, checkAuth])

  useEffect(() => {
    // Redirect to login if authentication is required but user is not authenticated
    if (!isChecking && requireAuth && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    // Check role-based access
    if (!isChecking && isAuthenticated && allowedRoles.length > 0) {
      if (!user || !allowedRoles.includes(user.role)) {
        router.push('/') // Redirect to dashboard or home
        return
      }
    }
  }, [isChecking, requireAuth, isAuthenticated, user, allowedRoles, router])

  // Show loading while checking authentication
  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  // If authentication is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null
  }

  // If role restriction exists and user doesn't have access, don't render children
  if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">دسترسی محدود</h3>
          <p className="text-gray-600 mb-4">شما مجوز دسترسی به این بخش را ندارید.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            بازگشت به صفحه اصلی
          </button>
        </div>
      </div>
    )
  }

  // Render with MainLayout if authenticated
  if (isAuthenticated) {
    return (
      <MainLayout>
        {children}
      </MainLayout>
    )
  }

  // Render without layout for public pages
  return <>{children}</>
}
