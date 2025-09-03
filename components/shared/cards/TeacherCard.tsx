'use client'

import { AcademicCapIcon, UserGroupIcon, StarIcon, PhoneIcon } from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'
import Link from 'next/link'

interface TeacherCardProps {
  teacher: {
    id: number
    employeeId: string
    firstName: string
    lastName: string
    phone: string
    email?: string
    classes?: Array<{
      id: number
      grade: number
      section: string
      _count: {
        students: number
      }
    }>
  }
  context?: 'default' | 'evaluation' | 'management' | 'schedule'
  showActions?: boolean
  additionalInfo?: {
    evaluationScore?: number
    totalStudents?: number
    activeClasses?: number
    performance?: 'excellent' | 'good' | 'needs_improvement'
  }
}

export default function TeacherCard({ 
  teacher, 
  context = 'default', 
  showActions = true,
  additionalInfo 
}: TeacherCardProps) {
  const getContextUrl = () => {
    const baseUrl = `/people/teachers/${teacher.id}`
    switch (context) {
      case 'evaluation': return `${baseUrl}?tab=evaluation`
      case 'management': return `${baseUrl}?tab=classes`
      case 'schedule': return `${baseUrl}?tab=schedule`
      default: return baseUrl
    }
  }

  const getContextIcon = () => {
    switch (context) {
      case 'evaluation': return StarIcon
      case 'management': return UserGroupIcon
      case 'schedule': return AcademicCapIcon
      default: return AcademicCapIcon
    }
  }

  const getContextColor = () => {
    switch (context) {
      case 'evaluation': return 'text-purple-600 bg-purple-100'
      case 'management': return 'text-green-600 bg-green-100'
      case 'schedule': return 'text-blue-600 bg-blue-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  const getPerformanceColor = (performance?: string) => {
    switch (performance) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'needs_improvement': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPerformanceText = (performance?: string) => {
    switch (performance) {
      case 'excellent': return 'عالی'
      case 'good': return 'خوب'
      case 'needs_improvement': return 'نیاز به بهبود'
      default: return 'نامشخص'
    }
  }

  const ContextIcon = getContextIcon()
  const totalStudents = teacher.classes?.reduce((sum, cls) => sum + cls._count.students, 0) || 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getContextColor()}`}>
            <ContextIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {teacher.firstName} {teacher.lastName}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>کد پرسنلی: {englishToPersianNumbers(teacher.employeeId)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <PhoneIcon className="h-3 w-3" />
              <span>{englishToPersianNumbers(teacher.phone)}</span>
            </div>
          </div>
        </div>

        <div className="text-left">
          {/* Context-specific additional info */}
          {context === 'evaluation' && additionalInfo?.evaluationScore !== undefined && (
            <div className="text-sm">
              <span className={`font-semibold ${
                additionalInfo.evaluationScore >= 90 ? 'text-green-600' : 
                additionalInfo.evaluationScore >= 75 ? 'text-blue-600' : 'text-yellow-600'
              }`}>
                {englishToPersianNumbers(additionalInfo.evaluationScore)}/۱۰۰
              </span>
              <p className="text-xs text-gray-500">امتیاز ارزیابی</p>
            </div>
          )}

          {context === 'management' && (
            <div className="text-sm">
              <span className="text-green-600 font-semibold">
                {englishToPersianNumbers(teacher.classes?.length || 0)} کلاس
              </span>
              <p className="text-xs text-gray-500">
                {englishToPersianNumbers(totalStudents)} دانش‌آموز
              </p>
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

      {/* Classes Summary */}
      {teacher.classes && teacher.classes.length > 0 && (
        <div className="border-t border-gray-200 pt-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2">کلاس‌های تحت مسئولیت:</h4>
          <div className="flex flex-wrap gap-2">
            {teacher.classes.slice(0, 3).map((cls) => (
              <span key={cls.id} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                پایه {englishToPersianNumbers(cls.grade)}{cls.section}
              </span>
            ))}
            {teacher.classes.length > 3 && (
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                +{englishToPersianNumbers(teacher.classes.length - 3)} کلاس دیگر
              </span>
            )}
          </div>
        </div>
      )}

      {/* Performance indicators */}
      {additionalInfo?.performance && (
        <div className="mt-3">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPerformanceColor(additionalInfo.performance)}`}>
            عملکرد: {getPerformanceText(additionalInfo.performance)}
          </span>
        </div>
      )}
    </div>
  )
}
