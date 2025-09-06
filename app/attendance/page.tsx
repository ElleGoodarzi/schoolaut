'use client'

import MainLayout from '@/components/MainLayout'
import AttendanceDashboard from '@/components/attendance/AttendanceDashboard'

export default function AttendancePage() {
  return (
    <MainLayout>
      <div className="fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">حضور و غیاب</h1>
          <div className="text-sm text-gray-600">
            مدیریت متمرکز حضور و غیاب دانش‌آموزان
          </div>
        </div>

        <AttendanceDashboard />
      </div>
    </MainLayout>
  )
}