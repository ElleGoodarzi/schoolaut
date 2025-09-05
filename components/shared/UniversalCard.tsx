'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline'

export interface CardAction {
  label: string
  url?: string
  onClick?: () => void
  style: 'primary' | 'secondary' | 'danger' | 'success'
  disabled?: boolean
}

export interface CardAlert {
  type: 'warning' | 'error' | 'info' | 'success'
  message: string
  count?: number
}

export interface UniversalCardProps {
  title: string
  subtitle?: string
  description?: string
  icon?: ReactNode
  iconColor?: string
  iconBackground?: string
  actions?: CardAction[]
  alerts?: CardAlert[]
  stats?: Array<{
    label: string
    value: string | number
    color?: 'green' | 'red' | 'yellow' | 'blue' | 'gray'
    suffix?: string
  }>
  context?: 'student' | 'teacher' | 'class' | 'financial' | 'attendance' | 'service'
  metadata?: Record<string, any>
  hoverable?: boolean
  clickable?: boolean
  onClick?: () => void
}

export default function UniversalCard({
  title,
  subtitle,
  description,
  icon,
  iconColor = 'text-blue-600',
  iconBackground = 'bg-blue-100',
  actions = [],
  alerts = [],
  stats = [],
  context,
  metadata,
  hoverable = true,
  clickable = false,
  onClick
}: UniversalCardProps) {
  
  const getAlertIcon = (type: CardAlert['type']) => {
    switch (type) {
      case 'warning': return ExclamationTriangleIcon
      case 'error': return ExclamationTriangleIcon  
      case 'info': return InformationCircleIcon
      case 'success': return CheckCircleIcon
      default: return InformationCircleIcon
    }
  }

  const getAlertColors = (type: CardAlert['type']) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 text-yellow-800 border-yellow-200'
      case 'error': return 'bg-red-50 text-red-800 border-red-200'
      case 'info': return 'bg-blue-50 text-blue-800 border-blue-200'
      case 'success': return 'bg-green-50 text-green-800 border-green-200'
      default: return 'bg-gray-50 text-gray-800 border-gray-200'
    }
  }

  const getStatColor = (color?: string) => {
    switch (color) {
      case 'green': return 'text-green-600'
      case 'red': return 'text-red-600'
      case 'yellow': return 'text-yellow-600'
      case 'blue': return 'text-blue-600'
      default: return 'text-gray-900'
    }
  }

  const getActionStyles = (style: CardAction['style']) => {
    const baseClasses = 'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
    
    switch (style) {
      case 'primary': 
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white`
      case 'secondary': 
        return `${baseClasses} bg-gray-200 hover:bg-gray-300 text-gray-800`
      case 'danger': 
        return `${baseClasses} bg-red-600 hover:bg-red-700 text-white`
      case 'success': 
        return `${baseClasses} bg-green-600 hover:bg-green-700 text-white`
      default: 
        return `${baseClasses} bg-gray-200 hover:bg-gray-300 text-gray-800`
    }
  }

  const CardWrapper = clickable ? 'button' : 'div'

  return (
    <CardWrapper
      className={`
        bg-white rounded-xl border border-gray-200 p-4 w-full text-right
        ${hoverable ? 'hover:shadow-md' : ''} 
        ${clickable ? 'hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' : ''}
        transition-all duration-200
      `}
      onClick={clickable ? onClick : undefined}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBackground}`}>
                <div className={`w-5 h-5 ${iconColor}`}>
                  {icon}
                </div>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
              {subtitle && (
                <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          
          {description && (
            <p className="text-xs text-gray-500 mt-2 pr-13">{description}</p>
          )}
        </div>
      </div>

      {/* Stats Section */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-lg font-bold ${getStatColor(stat.color)}`}>
                {stat.value}{stat.suffix}
              </div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-2 mb-3">
          {alerts.map((alert, index) => {
            const AlertIcon = getAlertIcon(alert.type)
            return (
              <div key={index} className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${getAlertColors(alert.type)}`}>
                <AlertIcon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{alert.message}</span>
                {alert.count && (
                  <span className="font-semibold">{alert.count}</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Actions Section */}
      {actions.length > 0 && (
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          {actions.map((action, index) => {
            if (action.url) {
              return (
                <Link key={index} href={action.url} className={getActionStyles(action.style)}>
                  {action.label}
                </Link>
              )
            }
            
            return (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}
                className={getActionStyles(action.style)}
              >
                {action.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Context Badge */}
      {context && (
        <div className="absolute top-2 left-2">
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
            {context}
          </span>
        </div>
      )}
    </CardWrapper>
  )
}