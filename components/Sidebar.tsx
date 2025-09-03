'use client'

import { useState } from 'react'
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
  UserCircleIcon
} from '@heroicons/react/24/outline'

const menuItems = [
  {
    name: 'داشبورد',
    href: '/',
    icon: HomeIcon
  },
  {
    name: 'پنل مدیریت',
    href: '/management',
    icon: CogIcon
  },
  {
    name: 'مدیریت مالی',
    href: '/financial',
    icon: CurrencyDollarIcon
  },
  {
    name: 'سرویس و غذا',
    href: '/services',
    icon: TruckIcon
  },
  {
    name: 'حضور و غیاب',
    href: '/attendance',
    icon: ClockIcon
  },
  {
    name: 'ارزیابی معلمان',
    href: '/evaluation',
    icon: StarIcon
  },
  {
    name: 'مدیریت جوایز',
    href: '/rewards',
    icon: GiftIcon
  },
  {
    name: 'ارتباطات اولیا',
    href: '/communications',
    icon: ChatBubbleLeftRightIcon
  },
  {
    name: 'بخش‌نامه‌ها',
    href: '/circulars',
    icon: DocumentTextIcon
  },
  {
    name: 'نظرسنجی‌ها',
    href: '/surveys',
    icon: ChartBarIcon
  },
  {
    name: 'دانش‌آموزان',
    href: '/students',
    icon: AcademicCapIcon
  },
  {
    name: 'معلمان',
    href: '/teachers',
    icon: UserGroupIcon
  },
  {
    name: 'مدیریت سیستم',
    href: '/system',
    icon: WrenchScrewdriverIcon
  }
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={toggleSidebar}
          className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {isOpen ? (
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-gray-600" />
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
        <div className="p-6 border-b border-gray-200 bg-gradient-to-l from-blue-600 to-blue-700 text-white">
          <div className="text-center">
            <h1 className="text-xl font-bold mb-1">دبستان مهرآیین</h1>
            <p className="text-blue-100 text-sm">سیستم اتوماسیون مدرسه</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                      hover:bg-gray-50 hover:scale-[1.02] group
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600 shadow-sm' 
                        : 'text-gray-700 hover:text-blue-600'
                      }
                    `}
                  >
                    <Icon className={`
                      w-5 h-5 transition-colors
                      ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-500'}
                    `} />
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
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
