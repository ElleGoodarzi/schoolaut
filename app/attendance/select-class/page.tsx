'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import { 
  UserGroupIcon, 
  ChevronLeftIcon,
  ArrowRightIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'
import Link from 'next/link'

interface ClassData {
  id: number
  grade: number
  section: string
  teacherName: string
  capacity: number
  totalStudents: number
}

export default function SelectClassPage() {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/management/classes')
      const result = await response.json()
      
      if (result.success) {
        const classesData = result.data.classes.map((cls: any) => ({
          id: cls.id,
          grade: cls.grade,
          section: cls.section,
          teacherName: `${cls.teacher.firstName} ${cls.teacher.lastName}`,
          capacity: cls.capacity,
          totalStudents: cls._count.students
        }))
        setClasses(classesData)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClassSelect = (classId: number) => {
    router.push(`/attendance/class/${classId}`)
  }

  const filteredClasses = selectedGrade 
    ? classes.filter(cls => cls.grade === selectedGrade)
    : classes

  const availableGrades = [...new Set(classes.map(cls => cls.grade))].sort()

  if (loading) {
    return (
      <MainLayout>
        <div className="fade-in">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="mb-4">
            <Link 
              href="/attendance" 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <ArrowRightIcon className="w-4 h-4" />
              حضور و غیاب
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">انتخاب کلاس برای ثبت حضور</h1>
              <p className="text-gray-600 mt-1">
                کلاس مورد نظر خود را انتخاب کنید تا حضور و غیاب دانش‌آموزان را ثبت کنید
              </p>
            </div>
            
            {/* Grade Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">فیلتر پایه:</label>
              <select
                value={selectedGrade || ''}
                onChange={(e) => setSelectedGrade(e.target.value ? parseInt(e.target.value) : null)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="انتخاب پایه تحصیلی"
                aria-label="فیلتر کلاس‌ها بر اساس پایه تحصیلی"
              >
                <option value="">همه پایه‌ها</option>
                {availableGrades.map(grade => (
                  <option key={grade} value={grade}>
                    پایه {englishToPersianNumbers(grade)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classData) => (
            <div
              key={classData.id}
              onClick={() => handleClassSelect(classData.id)}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      پایه {englishToPersianNumbers(classData.grade)} - {classData.section}
                    </h3>
                    <p className="text-sm text-gray-600">
                      معلم: {classData.teacherName}
                    </p>
                  </div>
                </div>
                
                <ChevronLeftIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UserGroupIcon className="h-4 w-4" />
                  <span>
                    {englishToPersianNumbers(classData.totalStudents)} از {englishToPersianNumbers(classData.capacity)} دانش‌آموز
                  </span>
                </div>
                
                <div className="text-xs text-gray-500">
                  ظرفیت: {englishToPersianNumbers(Math.round((classData.totalStudents / classData.capacity) * 100))}%
                </div>
              </div>

              {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((classData.totalStudents / classData.capacity) * 100, 100)}%` 
                      }}
                      role="progressbar"
                      aria-valuenow={classData.totalStudents}
                      aria-valuemin={0}
                      aria-valuemax={classData.capacity}
                      aria-label={`${classData.totalStudents} از ${classData.capacity} دانش‌آموز`}
                    ></div>
                  </div>
                </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors group-hover:bg-blue-700">
                  ثبت حضور و غیاب
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredClasses.length === 0 && !loading && (
          <div className="text-center py-12">
            <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">کلاسی یافت نشد</h3>
            <p className="text-gray-600">
              {selectedGrade 
                ? `کلاسی در پایه ${englishToPersianNumbers(selectedGrade)} وجود ندارد`
                : 'هیچ کلاس فعالی در سیستم ثبت نشده است'
              }
            </p>
            {selectedGrade && (
              <button
                onClick={() => setSelectedGrade(null)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                نمایش همه کلاس‌ها
              </button>
            )}
          </div>
        )}

        {/* Quick Stats */}
        {!loading && classes.length > 0 && (
          <div className="bg-gradient-to-l from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-900">
                  {englishToPersianNumbers(classes.length)}
                </p>
                <p className="text-sm text-blue-700">کل کلاس‌ها</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">
                  {englishToPersianNumbers(availableGrades.length)}
                </p>
                <p className="text-sm text-blue-700">پایه تحصیلی</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">
                  {englishToPersianNumbers(classes.reduce((sum, cls) => sum + cls.totalStudents, 0))}
                </p>
                <p className="text-sm text-blue-700">کل دانش‌آموزان</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">
                  {englishToPersianNumbers(Math.round(classes.reduce((sum, cls) => sum + (cls.totalStudents / cls.capacity), 0) / classes.length * 100))}%
                </p>
                <p className="text-sm text-blue-700">میانگین ظرفیت</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
