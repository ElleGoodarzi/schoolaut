'use client'

import MainLayout from '@/components/MainLayout'
import { ChartBarIcon, ClipboardDocumentListIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { useToast } from '@/lib/toast/ToastProvider'

export default function Surveys() {
  const { info } = useToast()

  const handleComingSoon = () => {
    info('سیستم نظرسنجی در دست توسعه است')
  }

  return (
    <MainLayout>
      <div className="fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">نظرسنجی‌ها</h1>
        
        <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-xl border-2 border-dashed border-indigo-300 p-8 text-center">
          <div className="max-w-md mx-auto">
            <ChartBarIcon className="h-16 w-16 text-indigo-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">سیستم نظرسنجی</h2>
            <p className="text-gray-600 mb-6">
              ایجاد و مدیریت نظرسنجی‌های آموزشی، رضایت‌سنجی و جمع‌آوری بازخورد.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <ClipboardDocumentListIcon className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">ایجاد نظرسنجی</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <UserGroupIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">مدیریت پاسخ‌ها</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <ChartBarIcon className="h-8 w-8 text-cyan-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">گزارش‌های تحلیلی</p>
              </div>
            </div>
            
            <button 
              onClick={handleComingSoon}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              اطلاع از راه‌اندازی
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
