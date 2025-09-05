'use client'

import { useParams } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import StudentProfileTabs from '@/components/modules/StudentProfileTabs'

export default function StudentProfilePage() {
  const params = useParams()
  const studentId = parseInt(params.id as string)

  if (isNaN(studentId)) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-gray-600">شناسه دانش‌آموز نامعتبر است.</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <StudentProfileTabs studentId={studentId} />
    </MainLayout>
  )
}
