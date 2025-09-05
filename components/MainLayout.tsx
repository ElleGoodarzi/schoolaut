'use client'

import ModularSidebar from './ModularSidebar'
import SmartBreadcrumbs from './SmartBreadcrumbs'
import { useAppContext } from '@/lib/contexts/AppContext'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { sidebarCollapsed } = useAppContext()

  return (
    <div className="min-h-screen bg-gray-50">
      <ModularSidebar />
      
      {/* Main content area */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:mr-20' : 'lg:mr-88'
      }`}>
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
