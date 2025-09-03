import type { Metadata } from 'next'
import './globals.css'

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
        {children}
      </body>
    </html>
  )
}
