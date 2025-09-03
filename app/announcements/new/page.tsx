import MainLayout from '@/components/MainLayout'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export default function NewAnnouncement() {
  return (
    <MainLayout>
      <div className="fade-in">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <ArrowRightIcon className="w-4 h-4" />
            بازگشت به داشبورد
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">ارسال اطلاعیه جدید</h1>
        
        <div className="bg-white rounded-xl card-shadow border border-gray-200 p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">سیستم اطلاعیه‌ها</h2>
            <p className="text-gray-600 mb-6">
              این بخش برای ایجاد و ارسال اطلاعیه‌های مدرسه در حال توسعه می‌باشد.
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-right">
                <p className="text-sm text-yellow-800">
                  <strong>ویژگی‌های آینده:</strong>
                </p>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                  <li>• ایجاد اطلاعیه با ویرایشگر متنی</li>
                  <li>• تعیین سطح اولویت (فوری، متوسط، عادی)</li>
                  <li>• انتخاب مخاطبان (اولیا، معلمان، همه)</li>
                  <li>• زمان‌بندی انتشار اطلاعیه</li>
                  <li>• ارسال پیامک و ایمیل خودکار</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
