import MainLayout from '@/components/MainLayout'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export default function TodayAttendance() {
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

        <h1 className="text-2xl font-bold text-gray-900 mb-4">ثبت حضور و غیاب امروز</h1>
        
        <div className="bg-white rounded-xl card-shadow border border-gray-200 p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">سیستم حضور و غیاب</h2>
            <p className="text-gray-600 mb-6">
              این بخش برای ثبت حضور و غیاب روزانه دانش‌آموزان در حال توسعه می‌باشد.
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-right">
                <p className="text-sm text-blue-800">
                  <strong>ویژگی‌های آینده:</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• ثبت حضور و غیاب به تفکیک کلاس</li>
                  <li>• گزارش‌گیری روزانه و ماهانه</li>
                  <li>• اعلان خودکار به اولیا</li>
                  <li>• آمار غیبت‌های مکرر</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
