import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

interface Alert {
  type: string
  severity: 'high' | 'medium' | 'low'
  title: string
  message: string
  count: number
  details?: Array<{
    name: string
    overdueAmount?: number
    absenceCount?: number
  }>
}

interface AlertCardProps {
  alert: Alert
}

const severityStyles = {
  high: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: 'text-red-600'
  },
  medium: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: 'text-yellow-600'
  },
  low: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'text-blue-600'
  }
}

export default function AlertCard({ alert }: AlertCardProps) {
  const styles = severityStyles[alert.severity]
  const IconComponent = alert.severity === 'high' ? ExclamationTriangleIcon : InformationCircleIcon
  
  return (
    <div className={`
      flex items-start gap-3 p-3 rounded-lg border
      ${styles.bg} ${styles.border}
    `}>
      <IconComponent className={`w-5 h-5 mt-0.5 flex-shrink-0 ${styles.icon}`} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${styles.text}`}>{alert.title}</p>
        <p className={`text-xs ${styles.text.replace('800', '600')}`}>{alert.message}</p>
        
        {alert.details && alert.details.length > 0 && (
          <div className="mt-2">
            <details className="cursor-pointer">
              <summary className={`text-xs ${styles.text} hover:underline`}>
                مشاهده جزئیات
              </summary>
              <div className="mt-2 space-y-1">
                {alert.details.slice(0, 3).map((detail, index) => (
                  <div key={index} className={`text-xs ${styles.text.replace('800', '600')} pr-2`}>
                    • {detail.name}
                    {detail.overdueAmount && ` - مبلغ: ${detail.overdueAmount.toLocaleString()} تومان`}
                    {detail.absenceCount && ` - تعداد غیبت: ${detail.absenceCount}`}
                  </div>
                ))}
                {alert.details.length > 3 && (
                  <div className={`text-xs ${styles.text.replace('800', '600')} pr-2`}>
                    و {alert.details.length - 3} مورد دیگر...
                  </div>
                )}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}
