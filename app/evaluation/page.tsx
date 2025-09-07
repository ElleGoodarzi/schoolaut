'use client'

import MainLayout from '@/components/MainLayout'
import { StarIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { useToast } from '@/lib/toast/ToastProvider'

export default function Evaluation() {
  const { info } = useToast()

  const handleComingSoon = () => {
    info('این قابلیت در دست توسعه است و به زودی راه‌اندازی خواهد شد')
  }

  return (
    <MainLayout>
      <div className="fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">ارزیابی معلمان</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <StarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">ارزیابی‌های انجام شده</p>
                <p className="text-2xl font-bold text-yellow-600">۰</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">ارزیابی‌های در انتظار</p>
                <p className="text-2xl font-bold text-blue-600">۰</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">میانگین امتیاز</p>
                <p className="text-2xl font-bold text-green-600">-</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-dashed border-yellow-300 p-8 text-center">
          <div className="max-w-md mx-auto">
            <StarIcon className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">سیستم ارزیابی معلمان</h2>
            <p className="text-gray-600 mb-6">
              این قابلیت شامل ارزیابی عملکرد معلمان، بازخورد دانش‌آموزان و گزارش‌های تحلیلی خواهد بود.
            </p>
            
            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>ارزیابی ۳۶۰ درجه معلمان</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>بازخورد دانش‌آموزان و والدین</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>گزارش‌های تحلیلی و آماری</span>
              </div>
            </div>
            
            <button 
              onClick={handleComingSoon}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              اطلاع از راه‌اندازی
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
