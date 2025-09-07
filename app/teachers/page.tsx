'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/MainLayout'
import { 
  AcademicCapIcon, 
  PlusIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'
import { useToast } from '@/lib/toast/ToastProvider'

interface Teacher {
  id: number
  employeeId: string
  firstName: string
  lastName: string
  phone: string
  email?: string
  classes: Array<{
    id: number
    grade: number
    section: string
    _count: {
      students: number
    }
  }>
}

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const { info } = useToast()

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/teachers')
      const result = await response.json()
      
      if (result.success && result.data.teachers) {
        setTeachers(result.data.teachers)
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="fade-in">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 space-y-4">
                  <div className="h-16 bg-gray-100 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
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
          <h1 className="text-2xl font-bold text-gray-900">معلمان</h1>
          <button 
            onClick={() => info('قابلیت افزودن معلم در دست توسعه است')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            افزودن معلم
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">کل معلمان</p>
                <p className="text-2xl font-bold text-gray-900">
                  {englishToPersianNumbers(teachers.length)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">کلاس‌های فعال</p>
                <p className="text-2xl font-bold text-gray-900">
                  {englishToPersianNumbers(teachers.reduce((sum, t) => sum + t.classes.length, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">کل دانش‌آموزان</p>
                <p className="text-2xl font-bold text-gray-900">
                  {englishToPersianNumbers(
                    teachers.reduce((sum, t) => 
                      sum + t.classes.reduce((classSum, c) => classSum + c._count.students, 0), 0
                    )
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="bg-white rounded-xl card-shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {teacher.firstName} {teacher.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      کد پرسنلی: {englishToPersianNumbers(teacher.employeeId)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <PhoneIcon className="h-4 w-4" />
                  {englishToPersianNumbers(teacher.phone)}
                </div>
                {teacher.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <EnvelopeIcon className="h-4 w-4" />
                    {teacher.email}
                  </div>
                )}
              </div>

              {/* Classes */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-2">کلاس‌های تحت مسئولیت:</h4>
                {teacher.classes.length === 0 ? (
                  <p className="text-sm text-gray-500">کلاسی تعریف نشده</p>
                ) : (
                  <div className="space-y-1">
                    {teacher.classes.map((cls) => (
                      <div key={cls.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">
                          پایه {englishToPersianNumbers(cls.grade)} - شعبه {cls.section}
                        </span>
                        <span className="text-gray-500">
                          {englishToPersianNumbers(cls._count.students)} نفر
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {teachers.length === 0 && !loading && (
          <div className="bg-white rounded-xl card-shadow border border-gray-200 p-8 text-center">
            <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">معلمی یافت نشد.</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
