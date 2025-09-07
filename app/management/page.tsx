'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/MainLayout'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'
import { useToast } from '@/lib/toast/ToastProvider'

interface Class {
  id: number
  grade: number
  section: string
  teacher: {
    firstName: string
    lastName: string
    employeeId: string
  }
  _count: {
    students: number
  }
}

export default function ManagementPanel() {
  const [activeTab, setActiveTab] = useState('classes')
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const { info, warning } = useToast()

  useEffect(() => {
    if (activeTab === 'classes') {
      fetchClasses()
    }
  }, [activeTab])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/management/classes')
      const result = await response.json()
      
      if (result.success && result.data.classes) {
        setClasses(result.data.classes)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for other sections (to be implemented later)
  const mockSchoolYears = [
    { id: 1, name: '۱۴۰۳-۱۴۰۴', startDate: '۱۴۰۳/۰۶/۳۱', endDate: '۱۴۰۴/۰۶/۳۰', isActive: true },
    { id: 2, name: '۱۴۰۲-۱۴۰۳', startDate: '۱۴۰۲/۰۶/۳۱', endDate: '۱۴۰۳/۰۶/۳۰', isActive: false },
  ]

  const mockCalendarEvents = [
    { id: 1, title: 'شروع سال تحصیلی', date: '۱۴۰۳/۰۶/۳۱', type: 'academic' },
    { id: 2, title: 'امتحانات میان‌ترم اول', date: '۱۴۰۳/۰۸/۱۵', type: 'exam' },
    { id: 3, title: 'تعطیلات زمستانی', date: '۱۴۰۳/۱۰/۲۰', type: 'holiday' },
    { id: 4, title: 'امتحانات نهایی', date: '۱۴۰۴/۰۳/۱۵', type: 'exam' },
  ]
  const [showAddModal, setShowAddModal] = useState(false)

  const tabs = [
    { id: 'classes', name: 'کلاس‌ها و معلمان', icon: AcademicCapIcon },
    { id: 'school-years', name: 'سال تحصیلی', icon: CalendarIcon },
    { id: 'calendar', name: 'تقویم مدرسه', icon: ClockIcon },
    { id: 'permissions', name: 'دسترسی‌ها', icon: UserGroupIcon },
  ]

  return (
    <MainLayout>
      <div className="fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">پنل مدیریت</h1>
          <p className="text-gray-600">مدیریت ساختار کلی مدرسه و تنظیمات سیستم</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl card-shadow border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" dir="rtl">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm
                      ${activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* School Years Tab */}
            {activeTab === 'school-years' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">مدیریت سال تحصیلی</h2>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    افزودن سال تحصیلی
                  </button>
                </div>

                <div className="grid gap-4">
                  {mockSchoolYears.map((year) => (
                    <div key={year.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">{year.name}</h3>
                            <p className="text-sm text-gray-600">
                              {year.startDate} تا {year.endDate}
                            </p>
                          </div>
                          {year.isActive && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              فعال
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => info('ویرایش سال تحصیلی در دست توسعه است')}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="ویرایش سال تحصیلی"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => warning('حذف سال تحصیلی در دست توسعه است')}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="حذف سال تحصیلی"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Class Levels Tab */}
            {activeTab === 'class-levels' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">مدیریت پایه‌ها و کلاس‌ها</h2>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                    <PlusIcon className="w-4 h-4" />
                    افزودن پایه
                  </button>
                </div>

                <div className="grid gap-4">
                  {mockClassLevels.map((level) => (
                    <div key={level.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">پایه {level.grade}</h3>
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">کلاس‌ها: </span>
                          <span className="font-medium">{level.sections.join('، ')}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">معلم مسئول: </span>
                          <span className="font-medium">{level.teacherName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">تعداد دانش‌آموزان: </span>
                          <span className="font-medium persian-numbers">{level.studentCount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">تقویم مدرسه (شمسی)</h2>
                  <button 
                    onClick={() => info('افزودن رویداد تقویم در دست توسعه است')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    افزودن رویداد
                  </button>
                </div>

                <div className="grid gap-4">
                  {mockCalendarEvents.map((event) => (
                    <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-3 h-3 rounded-full
                            ${event.type === 'academic' ? 'bg-blue-500' : 
                              event.type === 'exam' ? 'bg-red-500' : 'bg-green-500'}
                          `}></div>
                          <div>
                            <h3 className="font-medium text-gray-900">{event.title}</h3>
                            <p className="text-sm text-gray-600 persian-numbers">{event.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-2">راهنما:</h3>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-blue-800">رویدادهای آموزشی</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-blue-800">امتحانات</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-blue-800">تعطیلات</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Permissions Tab */}
            {activeTab === 'permissions' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">مدیریت دسترسی‌ها</h2>
                  <button 
                    onClick={() => info('تعریف نقش جدید در دست توسعه است')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    تعریف نقش جدید
                  </button>
                </div>

                <div className="grid gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">نقش‌های سیستم</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">مدیر سیستم</h4>
                          <p className="text-sm text-gray-600">دسترسی کامل به تمام بخش‌ها</p>
                        </div>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                          سطح ۱
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">معاون آموزشی</h4>
                          <p className="text-sm text-gray-600">دسترسی به بخش‌های آموزشی و ارزیابی</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          سطح ۲
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">معلم</h4>
                          <p className="text-sm text-gray-600">دسترسی به کلاس خود و حضور غیاب</p>
                        </div>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          سطح ۳
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">والدین</h4>
                          <p className="text-sm text-gray-600">مشاهده اطلاعات فرزند</p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          سطح ۴
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
