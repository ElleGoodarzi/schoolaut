'use client'

import Sidebar from './Sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main content area */}
      <div className="lg:mr-88 transition-all duration-300">
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
