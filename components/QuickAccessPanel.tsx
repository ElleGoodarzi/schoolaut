'use client'

import { useState, useEffect } from 'react'
import { 
  CommandLineIcon,
  ClockIcon,
  UserIcon,
  AcademicCapIcon,
  BookOpenIcon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { useAppContext } from '@/lib/contexts/AppContext'
import { englishToPersianNumbers } from '@/lib/utils'

interface QuickAction {
  id: string
  label: string
  shortcut: string
  action: () => void
  icon: any
  category: 'navigation' | 'data' | 'action'
}

export default function QuickAccessPanel() {
  const { 
    showQuickAccess, 
    setShowQuickAccess, 
    getRecentStudents, 
    getRecentTeachers,
    navigateToStudent,
    navigateToTeacher,
    navigateToFinancial,
    navigateToAttendance
  } = useAppContext()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredActions, setFilteredActions] = useState<QuickAction[]>([])

  const quickActions: QuickAction[] = [
    {
      id: 'financial-overdue',
      label: 'شهریه‌های معوقه',
      shortcut: 'Ctrl+F',
      action: () => navigateToFinancial(undefined, 'overdue', 'quick-access'),
      icon: CommandLineIcon,
      category: 'action'
    },
    {
      id: 'attendance-export',
      label: 'خروجی حضور امروز',
      shortcut: 'Ctrl+E',
      action: () => {
        const today = new Date().toISOString().split('T')[0]
        window.open(`/api/attendance/export?date=${today}`, '_blank')
      },
      icon: ClockIcon,
      category: 'action'
    },
    {
      id: 'mark-all-present',
      label: 'همه حاضر (کلاس فعال)',
      shortcut: 'Ctrl+P',
      action: () => {
        // This would need to be connected to current class context
        alert('برای استفاده از این قابلیت، ابتدا یک کلاس انتخاب کنید')
      },
      icon: UserIcon,
      category: 'action'
    },
    {
      id: 'daily-report',
      label: 'گزارش روزانه',
      shortcut: 'Ctrl+R',
      action: () => {
        window.open('/api/dashboard/refresh', '_blank')
      },
      icon: AcademicCapIcon,
      category: 'action'
    }
  ]

  useEffect(() => {
    // Filter actions based on search term
    if (searchTerm) {
      const filtered = quickActions.filter(action =>
        action.label.includes(searchTerm) ||
        action.shortcut.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredActions(filtered)
    } else {
      setFilteredActions(quickActions)
    }
  }, [searchTerm])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open quick access with Ctrl+K
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault()
        setShowQuickAccess(true)
        return
      }

      // Close with Escape
      if (e.key === 'Escape' && showQuickAccess) {
        setShowQuickAccess(false)
        return
      }

      // Execute shortcuts when quick access is not open
      if (!showQuickAccess && e.ctrlKey) {
        const action = quickActions.find(a => a.shortcut === `Ctrl+${e.key.toUpperCase()}`)
        if (action) {
          e.preventDefault()
          action.action()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showQuickAccess])

  if (!showQuickAccess) {
    return null
  }

  const recentStudents = getRecentStudents()
  const recentTeachers = getRecentTeachers()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <CommandLineIcon className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">دسترسی سریع</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Ctrl+K</span>
          </div>
          <button
            onClick={() => setShowQuickAccess(false)}
            className="text-gray-400 hover:text-gray-600"
            title="بستن"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="جستجو در عملیات..."
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {/* Quick Actions */}
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">عملیات سریع</h4>
            <div className="space-y-2">
              {filteredActions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      action.action()
                      setShowQuickAccess(false)
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-right"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">{action.label}</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {action.shortcut}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Recent Students */}
          {recentStudents.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">دانش‌آموزان اخیر</h4>
              <div className="space-y-2">
                {recentStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => {
                      navigateToStudent(student.id, 'overview', '', 'quick-access')
                      setShowQuickAccess(false)
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors text-right"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-900">{student.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {student.lastVisited.toLocaleTimeString('fa-IR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Teachers */}
          {recentTeachers.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">معلمان اخیر</h4>
              <div className="space-y-2">
                {recentTeachers.map((teacher) => (
                  <button
                    key={teacher.id}
                    onClick={() => {
                      navigateToTeacher(teacher.id, 'overview', 'quick-access')
                      setShowQuickAccess(false)
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors text-right"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <AcademicCapIcon className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm text-gray-900">{teacher.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {teacher.lastVisited.toLocaleTimeString('fa-IR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-600 space-y-1">
              <p><kbd className="bg-white px-1 rounded">Ctrl+K</kbd> دسترسی سریع</p>
              <p><kbd className="bg-white px-1 rounded">Ctrl+A</kbd> حضور امروز</p>
              <p><kbd className="bg-white px-1 rounded">Ctrl+F</kbd> شهریه‌های معوقه</p>
              <p><kbd className="bg-white px-1 rounded">Esc</kbd> بستن</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
