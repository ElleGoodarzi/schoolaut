import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '@/lib/contexts/AppContext'
import { ToastProvider } from '@/lib/toast/ToastProvider'

export const metadata: Metadata = {
  title: 'دبستان مهرآیین - سیستم اتوماسیون مدرسه',
  description: 'سیستم اتوماسیون مدرسه دبستان مهرآیین',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="font-vazir bg-gray-50">
        <ToastProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
