'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import AddStudentModal from '@/components/AddStudentModal'
import StudentCard from '@/components/shared/cards/StudentCard'
import AttendanceModule from '@/components/modules/AttendanceModule'
import FinancialModule from '@/components/modules/FinancialModule'
import ServicesModule from '@/components/modules/ServicesModule'
import { 
  AcademicCapIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TruckIcon
} from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'
import { useAppContext } from '@/lib/contexts/AppContext'

interface Student {
  id: number
  studentId: string
  firstName: string
  lastName: string
  grade: number
  section: string
  class: {
    grade: number
    section: string
    teacher: {
      firstName: string
      lastName: string
    }
  }
}

export default function StudentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setSelectedStudent, navigateToStudent } = useAppContext()
  
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrade, setSelectedGrade] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview')

  const tabs = [
    { id: 'overview', name: 'فهرست دانش‌آموزان', icon: AcademicCapIcon },
    { id: 'attendance', name: 'حضور و غیاب', icon: ClockIcon },
    { id: 'financial', name: 'وضعیت مالی', icon: CurrencyDollarIcon },
    { id: 'services', name: 'سرویس‌ها', icon: TruckIcon }
  ]

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && tabs.find(t => t.id === tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/students')
      const result = await response.json()
      
      if (result.success && result.data) {
        setStudents(result.data)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
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
    
    const newUrl = `/people/students${params.toString() ? '?' + params.toString() : ''}`
    router.replace(newUrl)
  }

  const handleStudentClick = (student: Student, context?: string) => {
    setSelectedStudent(student.id)
    const url = navigateToStudent(student.id, context)
    router.push(url)
  }

  const handleAddStudent = (newStudent: Student) => {
    // Add new student to the beginning of the list
    setStudents(prev => [newStudent, ...prev])
    
    // Show success message
    console.log('✅ Student added successfully:', newStudent)
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === '' || 
      student.firstName.includes(searchTerm) || 
      student.lastName.includes(searchTerm) ||
      student.studentId.includes(searchTerm)
    
    const matchesGrade = selectedGrade === 'all' || 
      student.grade.toString() === selectedGrade

    return matchesSearch && matchesGrade
  })

  if (loading) {
    return (
      <MainLayout>
        <div className="fade-in">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-xl p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">مدیریت دانش‌آموزان</h1>
            <p className="text-gray-600 mt-1">مدیریت جامع اطلاعات و خدمات دانش‌آموزان</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            افزودن دانش‌آموز
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl card-shadow border border-gray-200 overflow-hidden mb-6">
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
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Filters */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <MagnifyingGlassIcon className="h-5 w-5 absolute right-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="جستجو در نام، نام خانوادگی یا شماره دانش‌آموزی..."
                        className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                                    <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  title="فیلتر پایه تحصیلی"
                >
                      <option value="all">همه پایه‌ها</option>
                      <option value="1">پایه اول</option>
                      <option value="2">پایه دوم</option>
                      <option value="3">پایه سوم</option>
                      <option value="4">پایه چهارم</option>
                      <option value="5">پایه پنجم</option>
                      <option value="6">پایه ششم</option>
                    </select>
                  </div>
                </div>

                {/* Students List */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      فهرست دانش‌آموزان ({englishToPersianNumbers(filteredStudents.length)} نفر)
                    </h3>
                  </div>
                  
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">دانش‌آموزی یافت نشد.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredStudents.map((student) => (
                        <div key={student.id} onClick={() => handleStudentClick(student)}>
                          <StudentCard 
                            student={student}
                            context="default"
                            showActions={true}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">حضور و غیاب دانش‌آموزان</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredStudents.slice(0, 6).map((student) => (
                    <div key={student.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </h4>
                        <button 
                          onClick={() => handleStudentClick(student, 'attendance')}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          جزئیات
                        </button>
                      </div>
                      <AttendanceModule 
                        studentId={student.id} 
                        showTitle={false} 
                        compact={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Tab */}
            {activeTab === 'financial' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">وضعیت مالی دانش‌آموزان</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredStudents.slice(0, 6).map((student) => (
                    <div key={student.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </h4>
                        <button 
                          onClick={() => handleStudentClick(student, 'financial')}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          جزئیات
                        </button>
                      </div>
                      <FinancialModule 
                        studentId={student.id} 
                        showTitle={false} 
                        compact={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">سرویس‌های دانش‌آموزان</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredStudents.slice(0, 6).map((student) => (
                    <div key={student.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </h4>
                        <button 
                          onClick={() => handleStudentClick(student, 'services')}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          جزئیات
                        </button>
                      </div>
                      <ServicesModule 
                        studentId={student.id} 
                        showTitle={false} 
                        compact={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Student Modal */}
        <AddStudentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddStudent}
        />
      </div>
    </MainLayout>
  )
}
