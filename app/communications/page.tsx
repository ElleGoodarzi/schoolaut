'use client'

import MainLayout from '@/components/MainLayout'
import { ChatBubbleLeftRightIcon, PhoneIcon, EnvelopeIcon, BellIcon } from '@heroicons/react/24/outline'
import { useToast } from '@/lib/toast/ToastProvider'

export default function Communications() {
  const { info } = useToast()

  const handleComingSoon = () => {
    info('سیستم ارتباطات اولیا در دست توسعه است')
  }

  return (
    <MainLayout>
      <div className="fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">ارتباطات اولیا</h1>
        
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-dashed border-green-300 p-8 text-center">
          <div className="max-w-md mx-auto">
            <ChatBubbleLeftRightIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">سیستم ارتباطات اولیا</h2>
            <p className="text-gray-600 mb-6">
              پلتفرم جامع ارتباط با والدین شامل پیامک، ایمیل و اعلان‌های خودکار.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <PhoneIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">پیامک</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <EnvelopeIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">ایمیل</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <BellIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">اعلان‌ها</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">چت</p>
              </div>
            </div>
            
            <button 
              onClick={handleComingSoon}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              اطلاع از راه‌اندازی
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
