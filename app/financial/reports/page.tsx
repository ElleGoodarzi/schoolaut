import MainLayout from '@/components/MainLayout'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export default function FinancialReports() {
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

        <h1 className="text-2xl font-bold text-gray-900 mb-4">گزارش‌های مالی</h1>
        
        <div className="bg-white rounded-xl card-shadow border border-gray-200 p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">سیستم گزارش‌های مالی</h2>
            <p className="text-gray-600 mb-6">
              این بخش برای تهیه گزارش‌های مالی و آمار پرداخت‌ها در حال توسعه می‌باشد.
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-right">
                <p className="text-sm text-green-800">
                  <strong>ویژگی‌های آینده:</strong>
                </p>
                <ul className="text-sm text-green-700 mt-2 space-y-1">
                  <li>• گزارش درآمد ماهانه و سالانه</li>
                  <li>• آمار شهریه‌های پرداخت شده و معوقه</li>
                  <li>• گزارش تفصیلی هر دانش‌آموز</li>
                  <li>• نمودارهای تحلیلی مالی</li>
                  <li>• خروجی PDF و Excel</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
