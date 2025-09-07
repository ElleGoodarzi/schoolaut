'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'
import { 
  UserIcon, 
  CogIcon, 
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export default function UserMenu() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  if (!user) return null

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      ADMIN: 'مدیر سیستم',
      VICE_PRINCIPAL: 'معاون',
      TEACHER: 'معلم',
      FINANCE: 'مسئول مالی'
    }
    return roleMap[role] || role
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <ShieldCheckIcon className="w-4 h-4 text-purple-600" />
      case 'VICE_PRINCIPAL':
        return <UserIcon className="w-4 h-4 text-blue-600" />
      case 'TEACHER':
        return <UserIcon className="w-4 h-4 text-green-600" />
      case 'FINANCE':
        return <UserIcon className="w-4 h-4 text-orange-600" />
      default:
        return <UserIcon className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center space-x-2 space-x-reverse">
          {getRoleIcon(user.role)}
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {user.firstName || user.username} {user.lastName || ''}
            </div>
            <div className="text-xs text-gray-500">
              {getRoleDisplay(user.role)}
            </div>
          </div>
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                {getRoleIcon(user.role)}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {user.firstName || user.username} {user.lastName || ''}
                </div>
                <div className="text-xs text-gray-500">
                  {user.email || `@${user.username}`}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false)
                router.push('/profile')
              }}
              className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 space-x-reverse"
            >
              <UserIcon className="w-4 h-4" />
              <span>پروفایل کاربری</span>
            </button>

            {user.role === 'ADMIN' && (
              <button
                onClick={() => {
                  setIsOpen(false)
                  router.push('/system')
                }}
                className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 space-x-reverse"
              >
                <CogIcon className="w-4 h-4" />
                <span>تنظیمات سیستم</span>
              </button>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleLogout}
              className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 space-x-reverse"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
