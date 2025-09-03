'use client'

import { AcademicCapIcon, UserGroupIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'
import Link from 'next/link'

interface ClassCardProps {
  classData: {
    id: number
    grade: number
    section: string
    capacity?: number
    teacher: {
      firstName: string
      lastName: string
      employeeId: string
    }
    _count: {
      students: number
    }
  }
  context?: 'default' | 'attendance' | 'services' | 'financial'
  showActions?: boolean
  additionalInfo?: {
    attendanceRate?: number
    presentToday?: number
    absentToday?: number
    mealOrders?: number
    overduePayments?: number
  }
}

export default function ClassCard({ 
  classData, 
  context = 'default', 
  showActions = true,
  additionalInfo 
}: ClassCardProps) {
  const getContextUrl = () => {
    const baseUrl = `/academic/classes/${classData.id}`
    switch (context) {
      case 'attendance': return `${baseUrl}?tab=attendance`
      case 'services': return `${baseUrl}?tab=services`
      case 'financial': return `${baseUrl}?tab=financial`
      default: return baseUrl
    }
  }

  const getContextIcon = () => {
    switch (context) {
      case 'attendance': return ClockIcon
      case 'services': return AcademicCapIcon
      case 'financial': return CurrencyDollarIcon
      default: return UserGroupIcon
    }
  }

  const getContextColor = () => {
    switch (context) {
      case 'attendance': return 'text-green-600 bg-green-100'
      case 'services': return 'text-purple-600 bg-purple-100'
      case 'financial': return 'text-red-600 bg-red-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  const ContextIcon = getContextIcon()

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getContextColor()}`}>
            <ContextIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              پایه {englishToPersianNumbers(classData.grade)} - شعبه {classData.section}
            </h3>
            <div className="text-sm text-gray-600">
              <p>معلم: {classData.teacher.firstName} {classData.teacher.lastName}</p>
              <p className="text-xs">
                کد پرسنلی: {englishToPersianNumbers(classData.teacher.employeeId)}
              </p>
            </div>
          </div>
        </div>

        <div className="text-left">
          {/* Context-specific metrics */}
          {context === 'attendance' && additionalInfo?.attendanceRate !== undefined && (
            <div className="text-sm">
              <span className={`font-semibold ${
                additionalInfo.attendanceRate >= 90 ? 'text-green-600' : 
                additionalInfo.attendanceRate >= 80 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {englishToPersianNumbers(additionalInfo.attendanceRate)}%
              </span>
              <p className="text-xs text-gray-500">حضور امروز</p>
            </div>
          )}

          {context === 'financial' && additionalInfo?.overduePayments !== undefined && (
            <div className="text-sm">
              <span className={`font-semibold ${
                additionalInfo.overduePayments === 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {englishToPersianNumbers(additionalInfo.overduePayments)}
              </span>
              <p className="text-xs text-gray-500">شهریه معوقه</p>
            </div>
          )}

          {context === 'services' && additionalInfo?.mealOrders !== undefined && (
            <div className="text-sm">
              <span className="text-purple-600 font-semibold">
                {englishToPersianNumbers(additionalInfo.mealOrders)}
              </span>
              <p className="text-xs text-gray-500">سفارش غذا</p>
            </div>
          )}

          {showActions && (
            <Link
              href={getContextUrl()}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors mt-2 block"
            >
              مدیریت کلاس
            </Link>
          )}
        </div>
      </div>

      {/* Student count and capacity */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-gray-600">
            دانش‌آموزان: {englishToPersianNumbers(classData._count.students)}
            {classData.capacity && (
              <span className="text-gray-400">
                /{englishToPersianNumbers(classData.capacity)}
              </span>
            )}
          </span>
        </div>

        {/* Capacity indicator */}
        {classData.capacity && (
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                (classData._count.students / classData.capacity) > 0.9 ? 'bg-red-500' :
                (classData._count.students / classData.capacity) > 0.8 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{
                width: `${Math.min((classData._count.students / classData.capacity) * 100, 100)}%`
              }}
            />
          </div>
        )}
      </div>

      {/* Context-specific additional details */}
      {context === 'attendance' && additionalInfo && (
        <div className="mt-3 flex gap-4 text-xs">
          {additionalInfo.presentToday !== undefined && (
            <span className="text-green-600">
              حاضر: {englishToPersianNumbers(additionalInfo.presentToday)}
            </span>
          )}
          {additionalInfo.absentToday !== undefined && (
            <span className="text-red-600">
              غایب: {englishToPersianNumbers(additionalInfo.absentToday)}
            </span>
          )}
        </div>
      )}

      {/* Alert indicators */}
      <div className="mt-3 flex gap-2">
        {additionalInfo?.overduePayments && additionalInfo.overduePayments > 0 && (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
            شهریه معوقه
          </span>
        )}
        {additionalInfo?.attendanceRate && additionalInfo.attendanceRate < 80 && (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
            حضور پایین
          </span>
        )}
        {classData.capacity && (classData._count.students / classData.capacity) > 0.9 && (
          <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
            ظرفیت تکمیل
          </span>
        )}
      </div>
    </div>
  )
}
