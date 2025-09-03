'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/MainLayout'
import { 
  AcademicCapIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'

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

export default function Students() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrade, setSelectedGrade] = useState<string>('all')

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/students')
      const result = await response.json()
      
      if (result.success && result.data.students) {
        setStudents(result.data.students)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-2xl font-bold text-gray-900">دانش‌آموزان</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <PlusIcon className="h-5 w-5" />
            افزودن دانش‌آموز
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl card-shadow border border-gray-200 p-4 mb-6">
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
        <div className="bg-white rounded-xl card-shadow border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">
              فهرست دانش‌آموزان ({englishToPersianNumbers(filteredStudents.length)} نفر)
            </h2>
          </div>
          
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center">
              <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">دانش‌آموزی یافت نشد.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <div key={student.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {student.firstName} {student.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          شماره دانش‌آموزی: {englishToPersianNumbers(student.studentId)}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">
                        پایه {englishToPersianNumbers(student.class.grade)} - شعبه {student.class.section}
                      </div>
                      <div className="text-sm text-gray-600">
                        معلم: {student.class.teacher.firstName} {student.class.teacher.lastName}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
