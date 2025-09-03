'use client'

import { AcademicCapIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'
import Link from 'next/link'

interface StudentCardProps {
  student: {
    id: number
    studentId: string
    firstName: string
    lastName: string
    grade: number
    section: string
    class?: {
      grade: number
      section: string
      teacher: {
        firstName: string
        lastName: string
      }
    }
  }
  context?: 'default' | 'financial' | 'attendance' | 'services'
  showActions?: boolean
  additionalInfo?: {
    attendanceRate?: number
    overdueAmount?: number
    absenceCount?: number
    mealPlan?: string
  }
}

export default function StudentCard({ 
  student, 
  context = 'default', 
  showActions = true,
  additionalInfo 
}: StudentCardProps) {
  const getContextUrl = () => {
    const baseUrl = `/people/students/${student.id}`
    switch (context) {
      case 'financial': return `${baseUrl}?tab=financial`
      case 'attendance': return `${baseUrl}?tab=attendance`
      case 'services': return `${baseUrl}?tab=services`
      default: return baseUrl
    }
  }

  const getContextIcon = () => {
    switch (context) {
      case 'financial': return CurrencyDollarIcon
      case 'attendance': return ClockIcon
      case 'services': return AcademicCapIcon
      default: return AcademicCapIcon
    }
  }

  const getContextColor = () => {
    switch (context) {
      case 'financial': return 'text-red-600 bg-red-100'
      case 'attendance': return 'text-yellow-600 bg-yellow-100'
      case 'services': return 'text-green-600 bg-green-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  const ContextIcon = getContextIcon()

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getContextColor()}`}>
            <ContextIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {student.firstName} {student.lastName}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>شماره: {englishToPersianNumbers(student.studentId)}</span>
              <span>
                کلاس: {englishToPersianNumbers(student.class?.grade || student.grade)}{student.class?.section || student.section}
              </span>
            </div>
            {student.class?.teacher && (
              <p className="text-xs text-gray-500">
                معلم: {student.class.teacher.firstName} {student.class.teacher.lastName}
              </p>
            )}
          </div>
        </div>

        <div className="text-left">
          {/* Context-specific additional info */}
          {context === 'financial' && additionalInfo?.overdueAmount && (
            <div className="text-sm">
              <span className="text-red-600 font-semibold">
                {englishToPersianNumbers(additionalInfo.overdueAmount.toLocaleString())} تومان
              </span>
              <p className="text-xs text-gray-500">بدهی</p>
            </div>
          )}

          {context === 'attendance' && additionalInfo?.attendanceRate !== undefined && (
            <div className="text-sm">
              <span className={`font-semibold ${
                additionalInfo.attendanceRate >= 90 ? 'text-green-600' : 
                additionalInfo.attendanceRate >= 75 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {englishToPersianNumbers(additionalInfo.attendanceRate)}%
              </span>
              <p className="text-xs text-gray-500">حضور</p>
            </div>
          )}

          {context === 'services' && additionalInfo?.mealPlan && (
            <div className="text-sm">
              <span className="text-green-600 font-semibold">
                {additionalInfo.mealPlan}
              </span>
              <p className="text-xs text-gray-500">برنامه غذایی</p>
            </div>
          )}

          {showActions && (
            <Link
              href={getContextUrl()}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors mt-2 block"
            >
              مشاهده جزئیات
            </Link>
          )}
        </div>
      </div>

      {/* Alert indicators */}
      {additionalInfo && (
        <div className="mt-3 flex gap-2">
          {additionalInfo.overdueAmount && additionalInfo.overdueAmount > 0 && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              شهریه معوقه
            </span>
          )}
          {additionalInfo.absenceCount && additionalInfo.absenceCount > 3 && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
              غیبت مکرر
            </span>
          )}
          {additionalInfo.attendanceRate && additionalInfo.attendanceRate < 75 && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              حضور پایین
            </span>
          )}
        </div>
      )}
    </div>
  )
}
