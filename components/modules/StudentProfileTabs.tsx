'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  UserIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'
import AttendanceModule from './AttendanceModule'
import FinancialModule from './FinancialModule'
import ServicesModule from './ServicesModule'

interface Student {
  id: number
  studentId: string
  firstName: string
  lastName: string
  fatherName: string
  grade: number
  section: string
  birthDate: string
  class: {
    id: number
    grade: number
    section: string
    teacher: {
      firstName: string
      lastName: string
    }
  }
}

interface StudentProfileTabsProps {
  studentId: number
  initialTab?: string
  highlightField?: string
}

export default function StudentProfileTabs({ 
  studentId, 
  initialTab = 'overview',
  highlightField 
}: StudentProfileTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(initialTab)
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  const tabs = [
    { id: 'overview', name: 'اطلاعات کلی', icon: UserIcon },
    { id: 'attendance', name: 'حضور و غیاب', icon: ClockIcon },
    { id: 'financial', name: 'وضعیت مالی', icon: CurrencyDollarIcon },
    { id: 'services', name: 'سرویس‌ها', icon: TruckIcon },
    { id: 'communications', name: 'ارتباطات', icon: ChatBubbleLeftRightIcon },
    { id: 'academic', name: 'عملکرد تحصیلی', icon: AcademicCapIcon }
  ]

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && tabs.find(t => t.id === tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    fetchStudent()
  }, [studentId])

  const fetchStudent = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/students/${studentId}`)
      const result = await response.json()
      
      if (result.success) {
        setStudent(result.data.student)
      }
    } catch (error) {
      console.error('Error fetching student:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    const params = new URLSearchParams(searchParams.toString())
    if (tabId !== 'overview') {
      params.set('tab', tabId)
    } else {
      params.delete('tab')
    }
    
    // Remove highlight after tab change
    params.delete('highlight')
    
    const newUrl = `/people/students/${studentId}${params.toString() ? '?' + params.toString() : ''}`
    router.replace(newUrl)
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">دانش‌آموز یافت نشد.</p>
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* Student Header */}
      <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-10 h-10 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {student.firstName} {student.lastName}
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">شماره دانش‌آموزی:</span>
                <span className="font-medium mr-2 persian-numbers">
                  {englishToPersianNumbers(student.studentId)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">کلاس:</span>
                <span className="font-medium mr-2">
                  {englishToPersianNumbers(student.class.grade)}{student.class.section}
                </span>
              </div>
              <div>
                <span className="text-gray-500">معلم:</span>
                <span className="font-medium mr-2">
                  {student.class.teacher.firstName} {student.class.teacher.lastName}
                </span>
              </div>
              <div>
                <span className="text-gray-500">نام پدر:</span>
                <span className="font-medium mr-2">{student.fatherName}</span>
              </div>
            </div>
          </div>
        </div>
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
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors
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
          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">اطلاعات شخصی</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">نام و نام خانوادگی:</span>
                    <span className="font-medium">{student.firstName} {student.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">نام پدر:</span>
                    <span className="font-medium">{student.fatherName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">تاریخ تولد:</span>
                    <span className="font-medium persian-numbers">
                      {new Date(student.birthDate).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">اطلاعات تحصیلی</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">پایه تحصیلی:</span>
                    <span className="font-medium">پایه {englishToPersianNumbers(student.grade)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">شعبه:</span>
                    <span className="font-medium">{student.section}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">معلم کلاس:</span>
                    <span className="font-medium">
                      {student.class.teacher.firstName} {student.class.teacher.lastName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <AttendanceModule 
              studentId={studentId} 
              highlightField={highlightField === 'absences' ? 'absences' : undefined}
            />
          )}

          {activeTab === 'financial' && (
            <FinancialModule 
              studentId={studentId}
              highlightField={highlightField === 'overdue' ? 'overdue' : undefined}
            />
          )}

          {activeTab === 'services' && (
            <ServicesModule studentId={studentId} />
          )}

          {activeTab === 'communications' && (
            <div className="text-center py-8">
              <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">بخش ارتباطات در حال توسعه است.</p>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="text-center py-8">
              <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">بخش عملکرد تحصیلی در حال توسعه است.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
