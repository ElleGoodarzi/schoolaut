'use client'

import MainLayout from '@/components/MainLayout'
import AttendanceDashboard from '@/components/attendance/AttendanceDashboard'
import Link from 'next/link'
import { AcademicCapIcon, ChartBarIcon } from '@heroicons/react/24/outline'

export default function AttendancePage() {
  return (
    <MainLayout>
      <div className="fade-in">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">حضور و غیاب</h1>
            <p className="text-sm text-gray-600 mt-1">
              مدیریت متمرکز حضور و غیاب دانش‌آموزان
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/attendance/select-class"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <AcademicCapIcon className="h-5 w-5" />
              ثبت حضور کلاس
            </Link>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Link
            href="/attendance/select-class"
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:scale-105 transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <AcademicCapIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">ثبت حضور کلاس</h3>
                <p className="text-sm text-gray-600">
                  ثبت سریع حضور و غیاب برای یک کلاس خاص
                </p>
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">نمای کلی حضور</h3>
                <p className="text-sm text-gray-600">
                  مشاهده وضعیت حضور همه کلاس‌ها در یک نگاه
                </p>
              </div>
            </div>
          </div>
        </div>

        <AttendanceDashboard />
      </div>
    </MainLayout>
  )
}