import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '@/lib/contexts/AppContext'

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
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
