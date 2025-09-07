'use client'

import MainLayout from '@/components/MainLayout'
import { WrenchScrewdriverIcon, ShieldCheckIcon, ServerIcon, DatabaseIcon } from '@heroicons/react/24/outline'
import { useToast } from '@/lib/toast/ToastProvider'

export default function System() {
  const { info } = useToast()

  const handleComingSoon = () => {
    info('تنظیمات سیستم در دست توسعه است')
  }

  return (
    <MainLayout>
      <div className="fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">مدیریت سیستم</h1>
        
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
          <div className="max-w-md mx-auto">
            <WrenchScrewdriverIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">تنظیمات سیستم</h2>
            <p className="text-gray-600 mb-6">
              پیکربندی سیستم، مدیریت امنیت، پشتیبان‌گیری و تنظیمات فنی.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <ShieldCheckIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">امنیت</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <DatabaseIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">پایگاه داده</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <ServerIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">سرور</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <WrenchScrewdriverIcon className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">تنظیمات</p>
              </div>
            </div>
            
            <button 
              onClick={handleComingSoon}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              اطلاع از راه‌اندازی
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
