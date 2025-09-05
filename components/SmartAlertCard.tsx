'use client'

import { 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'
import { useAppContext } from '@/lib/contexts/AppContext'

interface SmartAlert {
  id: string
  type: 'overdue_payments' | 'frequent_absences' | 'teacher_evaluation' | 'system' | 'communication'
  severity: 'high' | 'medium' | 'low' | 'critical'
  title: string
  message: string
  count: number
  details?: Array<{
    id: number
    name: string
    overdueAmount?: number
    absenceCount?: number
    [key: string]: any
  }>
  actionable: boolean
  source: string
}

interface SmartAlertCardProps {
  alert: SmartAlert
  onClick?: () => void
  showActions?: boolean
  compact?: boolean
}

export default function SmartAlertCard({ 
  alert, 
  onClick, 
  showActions = true,
  compact = false 
}: SmartAlertCardProps) {
  const { 
    navigateToFinancial, 
    navigateToAttendance, 
    navigateToStudent 
  } = useAppContext()

  const getSeverityColors = () => {
    switch (alert.severity) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-900'
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getAlertIcon = () => {
    switch (alert.type) {
      case 'overdue_payments':
        return <CurrencyDollarIcon className="w-5 h-5" />
      case 'frequent_absences':
        return <ClockIcon className="w-5 h-5" />
      case 'teacher_evaluation':
        return <UserIcon className="w-5 h-5" />
      case 'system':
        return <InformationCircleIcon className="w-5 h-5" />
      default:
        return <ExclamationTriangleIcon className="w-5 h-5" />
    }
  }

  const handlePrimaryAction = () => {
    switch (alert.type) {
      case 'overdue_payments':
        navigateToFinancial(undefined, 'overdue', 'dashboard-alert')
        break
      case 'frequent_absences':
        navigateToAttendance(undefined, 'frequent-absences', 'dashboard-alert')
        break
      case 'teacher_evaluation':
        // Navigate to teacher evaluation page
        window.location.href = '/people/teachers?tab=evaluation&filter=pending'
        break
      default:
        if (onClick) onClick()
        break
    }
  }

  const handleStudentClick = (student: any) => {
    switch (alert.type) {
      case 'overdue_payments':
        navigateToStudent(student.id, 'financial', 'overdue', 'financial-alert')
        break
      case 'frequent_absences':
        navigateToStudent(student.id, 'attendance', 'absences', 'attendance-alert')
        break
      default:
        navigateToStudent(student.id, 'overview', '', 'alert')
        break
    }
  }

  const getActionLabel = () => {
    switch (alert.type) {
      case 'overdue_payments':
        return 'مشاهده معوقات'
      case 'frequent_absences':
        return 'بررسی غیبت‌ها'
      case 'teacher_evaluation':
        return 'انجام ارزیابی'
      default:
        return 'مشاهده جزئیات'
    }
  }

  if (compact) {
    return (
      <button
        onClick={handlePrimaryAction}
        className={`w-full p-3 rounded-lg border transition-all hover:shadow-md ${getSeverityColors()}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getAlertIcon()}
            <span className="font-medium text-sm">{alert.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold persian-numbers">
              {englishToPersianNumbers(alert.count)}
            </span>
            <ChevronLeftIcon className="w-4 h-4" />
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className={`p-4 rounded-lg border transition-all ${getSeverityColors()}`}>
      {/* Alert Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getAlertIcon()}
          <h4 className="font-semibold text-sm">{alert.title}</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold persian-numbers">
            {englishToPersianNumbers(alert.count)}
          </span>
          {alert.severity === 'critical' && (
            <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
              فوری
            </span>
          )}
        </div>
      </div>

      {/* Alert Message */}
      <p className="text-sm opacity-90 mb-3">{alert.message}</p>

      {/* Alert Details (if available) */}
      {alert.details && alert.details.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-600 mb-2">موارد مرتبط:</div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {alert.details.slice(0, 3).map((detail) => (
              <button
                key={detail.id}
                onClick={() => handleStudentClick(detail)}
                className="w-full text-right p-2 rounded hover:bg-white hover:bg-opacity-50 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{detail.name}</span>
                  <span className="persian-numbers">
                    {detail.overdueAmount && englishToPersianNumbers(detail.overdueAmount.toLocaleString()) + ' تومان'}
                    {detail.absenceCount && englishToPersianNumbers(detail.absenceCount) + ' روز غیبت'}
                  </span>
                </div>
              </button>
            ))}
            {alert.details.length > 3 && (
              <div className="text-xs text-center text-gray-600 pt-1">
                و {englishToPersianNumbers(alert.details.length - 3)} مورد دیگر...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && alert.actionable && (
        <div className="flex gap-2">
          <button
            onClick={handlePrimaryAction}
            className="flex-1 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 py-2 px-3 rounded-md text-sm font-medium transition-colors border border-gray-300"
          >
            {getActionLabel()}
          </button>
          
          {alert.details && alert.details.length > 0 && (
            <button
              onClick={() => {
                // Navigate to first student in detail
                if (alert.details && alert.details[0]) {
                  handleStudentClick(alert.details[0])
                }
              }}
              className="bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 py-2 px-3 rounded-md text-sm font-medium transition-colors border border-gray-300"
            >
              اولین مورد
            </button>
          )}
        </div>
      )}

      {/* Smart Navigation Hint */}
      <div className="mt-2 text-xs text-gray-600 opacity-75">
        کلیک برای نمایش جزئیات با فیلتر اعمال شده
      </div>
    </div>
  )
}
