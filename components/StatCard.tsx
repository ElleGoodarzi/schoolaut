import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  subtitle?: string
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-200'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    border: 'border-green-200'
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
    border: 'border-yellow-200'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    border: 'border-red-200'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-200'
  }
}

export default function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  const classes = colorClasses[color]
  
  return (
    <div className={`
      bg-white rounded-xl p-6 card-shadow border ${classes.border}
      hover:shadow-lg transition-all duration-300 hover:scale-[1.02]
    `}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 persian-numbers">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`
          p-3 rounded-lg ${classes.bg}
        `}>
          <div className={`w-6 h-6 ${classes.icon}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}
