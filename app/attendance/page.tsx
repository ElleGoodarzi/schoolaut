'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/MainLayout'
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'

interface AttendanceStats {
  presentToday: number
  absentToday: number
  lateToday: number
  attendanceRate: number
  totalStudents: number
}

interface FrequentAbsentee {
  name: string
  studentId: string
  class: string
  absenceCount: number
}

export default function Attendance() {
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null)
  const [frequentAbsentees, setFrequentAbsentees] = useState<FrequentAbsentee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAttendanceData()
  }, [])

  const fetchAttendanceData = async () => {
    try {
      setLoading(true)
      
      // Fetch both attendance stats and frequent absentees
      const [statsRes, absenteesRes] = await Promise.all([
        fetch('/api/attendance/stats/today'),
        fetch('/api/attendance/frequent-absentees')
      ])
      
      const [statsResult, absenteesResult] = await Promise.all([
        statsRes.json(),
        absenteesRes.json()
      ])
      
      if (statsResult.success && statsResult.data) {
        setAttendanceStats(statsResult.data)
      }
      
      if (absenteesResult.success && absenteesResult.data) {
        setFrequentAbsentees(absenteesResult.data.frequentAbsentees || [])
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error)
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6">
                  <div className="h-16 bg-gray-100 rounded mb-4"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">حضور و غیاب</h1>

        {/* Today's Attendance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">حاضر امروز</p>
                <p className="text-2xl font-bold text-green-600">
                  {englishToPersianNumbers(attendanceStats?.presentToday || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">غایب امروز</p>
                <p className="text-2xl font-bold text-red-600">
                  {englishToPersianNumbers(attendanceStats?.absentToday || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">تأخیر امروز</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {englishToPersianNumbers(attendanceStats?.lateToday || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">درصد حضور</p>
                <p className="text-2xl font-bold text-blue-600">
                  {englishToPersianNumbers(attendanceStats?.attendanceRate || 0)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Frequent Absentees Alert */}
        {frequentAbsentees.length > 0 && (
          <div className="bg-white rounded-xl card-shadow border border-gray-200 mb-6">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
              <h2 className="font-semibold text-gray-900">دانش‌آموزان با غیبت مکرر</h2>
              <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {englishToPersianNumbers(frequentAbsentees.length)} نفر
              </span>
            </div>
            
            <div className="divide-y divide-gray-200">
              {frequentAbsentees.map((student, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{student.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>شماره: {englishToPersianNumbers(student.studentId)}</span>
                          <span>کلاس: {student.class}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-bold text-amber-600">
                        {englishToPersianNumbers(student.absenceCount)} غیبت
                      </div>
                      <div className="text-sm text-gray-500">در ۳۰ روز اخیر</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors">
            <CheckCircleIcon className="h-8 w-8 mx-auto mb-2" />
            <span className="block font-medium">ثبت حضور امروز</span>
          </button>
          
          <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center transition-colors">
            <ChartBarIcon className="h-8 w-8 mx-auto mb-2" />
            <span className="block font-medium">گزارش حضور</span>
          </button>
          
          <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center transition-colors">
            <ClockIcon className="h-8 w-8 mx-auto mb-2" />
            <span className="block font-medium">تاریخچه حضور</span>
          </button>
          
          <button className="bg-amber-600 hover:bg-amber-700 text-white p-4 rounded-lg text-center transition-colors">
            <ExclamationTriangleIcon className="h-8 w-8 mx-auto mb-2" />
            <span className="block font-medium">پیگیری غیبت‌ها</span>
          </button>
        </div>
      </div>
    </MainLayout>
  )
}
