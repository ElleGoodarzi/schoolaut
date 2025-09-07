'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import MainLayout from '@/components/MainLayout'
import ClassAttendanceMarking from '@/components/attendance/ClassAttendanceMarking'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface ClassInfo {
  id: number
  grade: number
  section: string
  teacherName: string
  capacity: number
  totalStudents: number
}

export default function ClassAttendancePage() {
  const params = useParams()
  const router = useRouter()
  const classId = parseInt(params.id as string)
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (classId) {
      fetchClassInfo()
    }
  }, [classId])

  const fetchClassInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/management/classes`)
      const result = await response.json()
      
      if (result.success) {
        const foundClass = result.data.classes.find((cls: any) => cls.id === classId)
        if (foundClass) {
          setClassInfo({
            id: foundClass.id,
            grade: foundClass.grade,
            section: foundClass.section,
            teacherName: `${foundClass.teacher.firstName} ${foundClass.teacher.lastName}`,
            capacity: foundClass.capacity,
            totalStudents: foundClass._count.students
          })
        }
      }
    } catch (error) {
      console.error('Error fetching class info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/attendance')
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="fade-in">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-xl p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!classInfo) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">کلاس یافت نشد</h1>
          <Link 
            href="/attendance"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowRightIcon className="w-4 h-4" />
            بازگشت به صفحه حضور و غیاب
          </Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="fade-in">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            href="/attendance" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <ArrowRightIcon className="w-4 h-4" />
            حضور و غیاب
          </Link>
        </div>

        <ClassAttendanceMarking 
          classId={classId}
          onBack={handleBack}
        />
      </div>
    </MainLayout>
  )
}
