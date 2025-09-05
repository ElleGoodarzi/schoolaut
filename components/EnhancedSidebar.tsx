'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  CogIcon, 
  CurrencyDollarIcon,
  TruckIcon,
  ClockIcon,
  StarIcon,
  GiftIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ChartBarIcon,
  AcademicCapIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'
import { useAlertSystem } from '@/lib/alerts/useAlertSystem'

interface MenuItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  alertTypes?: string[]
  description?: string
}

const menuItems: MenuItem[] = [
  {
    name: 'داشبورد',
    href: '/',
    icon: HomeIcon,
    description: 'خلاصه کلی وضعیت مدرسه'
  },
  {
    name: 'پنل مدیریت',
    href: '/management',
    icon: CogIcon,
    description: 'مدیریت کلاس‌ها، معلمان و تنظیمات'
  },
  {
    name: 'مدیریت مالی',
    href: '/financial',
    icon: CurrencyDollarIcon,
    alertTypes: ['financial'],
    description: 'شهریه، پرداخت‌ها و گزارشات مالی'
  },
  {
    name: 'سرویس و غذا',
    href: '/services',
    icon: TruckIcon,
    description: 'مدیریت سرویس‌ها و برنامه غذایی'
  },
  {
    name: 'حضور و غیاب',
    href: '/attendance',
    icon: ClockIcon,
    alertTypes: ['attendance'],
    description: 'ثبت و پیگیری حضور دانش‌آموزان'
  },
  {
    name: 'ارزیابی معلمان',
    href: '/evaluation',
    icon: StarIcon,
    alertTypes: ['academic'],
    description: 'ارزیابی عملکرد و بازخورد معلمان'
  },
  {
    name: 'مدیریت جوایز',
    href: '/rewards',
    icon: GiftIcon,
    description: 'سیستم امتیازدهی و جوایز'
  },
  {
    name: 'ارتباطات اولیا',
    href: '/communications',
    icon: ChatBubbleLeftRightIcon,
    alertTypes: ['communication'],
    description: 'پیام‌رسانی و ارتباط با والدین'
  },
  {
    name: 'بخش‌نامه‌ها',
    href: '/circulars',
    icon: DocumentTextIcon,
    description: 'اطلاعیه‌ها و بخش‌نامه‌های اداری'
  },
  {
    name: 'نظرسنجی‌ها',
    href: '/surveys',
    icon: ChartBarIcon,
    description: 'جمع‌آوری نظرات و بازخورد'
  },
  {
    name: 'دانش‌آموزان',
    href: '/students',
    icon: AcademicCapIcon,
    description: 'مدیریت اطلاعات دانش‌آموزان'
  },
  {
    name: 'معلمان',
    href: '/teachers',
    icon: UserGroupIcon,
    description: 'مدیریت اطلاعات کادر آموزشی'
  },
  {
    name: 'مدیریت سیستم',
    href: '/system',
    icon: WrenchScrewdriverIcon,
    alertTypes: ['system'],
    description: 'تنظیمات سیستم و دسترسی‌ها'
  }
]

interface AlertBadgeProps {
  count: number
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

function AlertBadge({ count, severity = 'medium' }: AlertBadgeProps) {
  if (count === 0) return null

  const getSeverityColor = () => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white animate-pulse'
      case 'high': return 'bg-red-500 text-white'
      case 'medium': return 'bg-yellow-500 text-white'
      case 'low': return 'bg-blue-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  return (
    <span className={`
      absolute -top-1 -left-1 min-w-[18px] h-[18px] 
      flex items-center justify-center text-xs font-bold rounded-full
      ${getSeverityColor()}
    `}>
      {count > 99 ? '99+' : englishToPersianNumbers(count)}
    </span>
  )
}

export default function EnhancedSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showTooltips, setShowTooltips] = useState(false)
  const pathname = usePathname()
  const { getAlertCounts, getCriticalAlerts } = useAlertSystem()
  
  const alertCounts = getAlertCounts()
  const criticalAlerts = getCriticalAlerts()

  const toggleSidebar = () => setIsOpen(!isOpen)

  const getAlertCount = (alertTypes?: string[]) => {
    if (!alertTypes) return 0
    
    return alertTypes.reduce((total, type) => {
      return total + (alertCounts[type as keyof typeof alertCounts] || 0)
    }, 0)
  }

  const getHighestSeverity = (alertTypes?: string[]) => {
    if (!alertTypes) return 'low'
    
    const criticalCount = criticalAlerts.filter(alert => 
      alertTypes.includes(alert.type)
    ).length
    
    if (criticalCount > 0) return 'critical'
    
    const totalAlerts = getAlertCount(alertTypes)
    if (totalAlerts > 5) return 'high'
    if (totalAlerts > 2) return 'medium'
    return 'low'
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={toggleSidebar}
          className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors relative"
        >
          {isOpen ? (
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          ) : (
            <>
              <Bars3Icon className="w-6 h-6 text-gray-600" />
              {alertCounts.critical > 0 && (
                <span className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed right-0 top-0 h-full bg-white shadow-xl z-50 sidebar-transition
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        w-80 lg:w-88 flex flex-col
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-l from-blue-600 to-blue-700 text-white relative">
          <div className="text-center">
            <h1 className="text-xl font-bold mb-1">دبستان مهرآیین</h1>
            <p className="text-blue-100 text-sm">سیستم اتوماسیون مدرسه</p>
          </div>
          
          {/* Critical alerts indicator */}
          {alertCounts.critical > 0 && (
            <div className="absolute top-4 left-4">
              <div className="relative">
                <BellIcon className="w-6 h-6 text-white" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {/* Critical Alerts Summary */}
          {alertCounts.critical > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 text-sm font-medium mb-1">
                <BellIcon className="w-4 h-4" />
                <span>{englishToPersianNumbers(alertCounts.critical)} هشدار مهم</span>
              </div>
              <p className="text-xs text-red-600">موارد فوری نیاز به رسیدگی دارند</p>
            </div>
          )}

          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              const alertCount = getAlertCount(item.alertTypes)
              const alertSeverity = getHighestSeverity(item.alertTypes)
              
              return (
                <li key={item.name} className="relative">
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                      hover:bg-gray-50 hover:scale-[1.02] group relative
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600 shadow-sm' 
                        : 'text-gray-700 hover:text-blue-600'
                      }
                    `}
                    onMouseEnter={() => setShowTooltips(true)}
                    onMouseLeave={() => setShowTooltips(false)}
                  >
                    <div className="relative">
                      <Icon className={`
                        w-5 h-5 transition-colors
                        ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-500'}
                      `} />
                      
                      <AlertBadge count={alertCount} severity={alertSeverity} />
                    </div>
                    
                    <div className="flex-1">
                      <span className="font-medium text-sm">{item.name}</span>
                      {item.description && showTooltips && (
                        <p className="text-xs text-gray-500 mt-0.5 opacity-75">{item.description}</p>
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Alert Summary */}
          {alertCounts.total > 0 && (
            <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">خلاصه هشدارها</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">مالی:</span>
                  <span className="font-medium text-red-600">
                    {englishToPersianNumbers(alertCounts.financial)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">حضور:</span>
                  <span className="font-medium text-yellow-600">
                    {englishToPersianNumbers(alertCounts.attendance)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">آموزش:</span>
                  <span className="font-medium text-blue-600">
                    {englishToPersianNumbers(alertCounts.academic)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">سیستم:</span>
                  <span className="font-medium text-gray-600">
                    {englishToPersianNumbers(alertCounts.system)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm">
            <UserCircleIcon className="w-10 h-10 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900 text-sm">Admin User</p>
              <p className="text-xs text-gray-500">مدیر سیستم</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}