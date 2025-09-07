'use client'

import MainLayout from '@/components/MainLayout'
import { GiftIcon, TrophyIcon, StarIcon } from '@heroicons/react/24/outline'
import { useToast } from '@/lib/toast/ToastProvider'

export default function Rewards() {
  const { info } = useToast()

  const handleComingSoon = () => {
    info('سیستم جوایز و امتیازدهی در دست توسعه است')
  }

  return (
    <MainLayout>
      <div className="fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">مدیریت جوایز</h1>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-dashed border-purple-300 p-8 text-center">
          <div className="max-w-md mx-auto">
            <GiftIcon className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">سیستم جوایز و امتیازدهی</h2>
            <p className="text-gray-600 mb-6">
              سیستم جامع امتیازدهی به دانش‌آموزان و مدیریت جوایز تشویقی.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <TrophyIcon className="h-8 w-8 text-gold-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">جوایز ماهانه</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <StarIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">امتیازدهی رفتاری</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <GiftIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">جوایز تحصیلی</p>
              </div>
            </div>
            
            <button 
              onClick={handleComingSoon}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              اطلاع از راه‌اندازی
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
