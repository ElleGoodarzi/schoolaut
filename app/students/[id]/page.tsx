'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import { 
  ArrowRightIcon,
  PencilIcon,
  ArchiveBoxIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  TruckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'
import { useAppContext } from '@/lib/contexts/AppContext'

// Tab Components
import StudentProfileTab from '@/components/modules/StudentProfileTabs'

interface StudentFullData {
  id: number
  studentId: string
  firstName: string
  lastName: string
  fatherName: string
  nationalId: string
  birthDate: string
  grade: number
  section: string
  phone?: string
  address?: string
  enrollmentDate: string
  isActive: boolean
  class: {
    id: number
    grade: number
    section: string
    teacher: {
      firstName: string
      lastName: string
    }
  }
  attendances: Array<{
    id: number
    date: string
    status: string
    notes?: string
  }>
  payments: Array<{
    id: number
    amount: number
    dueDate: string
    paidDate?: string
    status: string
    type: string
    description?: string
  }>
  services: Array<{
    id: number
    type: string
    route?: string
    mealPlan?: string
    isActive: boolean
  }>
  classHistory: Array<{
    id: number
    className: string
    startDate: string
    endDate?: string
    teacher: string
  }>
}

const tabs = [
  { id: 'profile', label: 'مشخصات', icon: UserGroupIcon },
  { id: 'attendance', label: 'حضور و غیاب', icon: CalendarDaysIcon },
  { id: 'payments', label: 'پرداخت‌ها', icon: CurrencyDollarIcon },
  { id: 'services', label: 'سرویس‌ها و غذا', icon: TruckIcon },
  { id: 'classes', label: 'کلاس‌ها', icon: AcademicCapIcon },
]

export default function StudentProfile() {
  const params = useParams()
  const router = useRouter()
  const { addToRecentEntities } = useAppContext()
  
  const [student, setStudent] = useState<StudentFullData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [showEditModal, setShowEditModal] = useState(false)

  const studentId = params.id as string

  useEffect(() => {
    if (studentId) {
      fetchStudentData()
    }
  }, [studentId])

  const fetchStudentData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/students/${studentId}/full`)
      const result = await response.json()
      
      if (result.success && result.data) {
        setStudent(result.data)
        // Add to recent entities
        addToRecentEntities('student', {
          id: result.data.id,
          name: `${result.data.firstName} ${result.data.lastName}`
        })
      }
    } catch (error) {
      console.error('Error fetching student data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleArchiveStudent = async () => {
    if (!student) return
    
    const confirmed = confirm('آیا مطمئن هستید که می‌خواهید این دانش‌آموز را آرشیو کنید؟')
    if (!confirmed) return

    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: false })
      })

      if (response.ok) {
        setStudent(prev => prev ? { ...prev, isActive: false } : null)
        alert('دانش‌آموز با موفقیت آرشیو شد')
      }
    } catch (error) {
      console.error('Error archiving student:', error)
      alert('خطا در آرشیو کردن دانش‌آموز')
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="fade-in">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-xl p-6 space-y-4">
              <div className="h-20 bg-gray-100 rounded"></div>
              <div className="h-12 bg-gray-100 rounded"></div>
              <div className="h-96 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!student) {
    return (
      <MainLayout>
        <div className="fade-in">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">دانش‌آموز یافت نشد</h1>
            <button
              onClick={() => router.push('/students')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              بازگشت به فهرست دانش‌آموزان
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/students')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="بازگشت"
            >
              <ArrowRightIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {student.firstName} {student.lastName}
              </h1>
              <p className="text-gray-600">
                شماره دانش‌آموزی: {englishToPersianNumbers(student.studentId)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PencilIcon className="h-4 w-4" />
              ویرایش
            </button>
            {student.isActive && (
              <button
                onClick={handleArchiveStudent}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <ArchiveBoxIcon className="h-4 w-4" />
                آرشیو
              </button>
            )}
          </div>
        </div>

        {/* Status Badge */}
        {!student.isActive && (
          <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">این دانش‌آموز غیرفعال است</p>
          </div>
        )}

        {/* Quick Info Card */}
        <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">پایه تحصیلی</p>
              <p className="font-semibold">
                پایه {englishToPersianNumbers(student.class.grade)} - شعبه {student.class.section}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">معلم کلاس</p>
              <p className="font-semibold">
                {student.class.teacher.firstName} {student.class.teacher.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">تاریخ ثبت نام</p>
              <p className="font-semibold">
                {new Date(student.enrollmentDate).toLocaleDateString('fa-IR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">وضعیت</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                student.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {student.isActive ? 'فعال' : 'غیرفعال'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl card-shadow border border-gray-200">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" dir="rtl">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <StudentProfileTab
              activeTab={activeTab}
              student={student}
              onRefresh={fetchStudentData}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
