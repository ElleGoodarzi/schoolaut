'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'

interface AttendanceRecord {
  id: number
  date: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
  notes?: string
}

interface AttendanceStats {
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  attendanceRate: number
}

interface AttendanceModuleProps {
  studentId: number
  classId?: number
  highlightField?: string
  showTitle?: boolean
  compact?: boolean
}

export default function AttendanceModule({ 
  studentId, 
  classId, 
  highlightField,
  showTitle = true,
  compact = false 
}: AttendanceModuleProps) {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchAttendanceData()
  }, [studentId, selectedMonth, selectedYear])

  const fetchAttendanceData = async () => {
    try {
      setLoading(true)
      
      // Fetch attendance records
      const recordsResponse = await fetch(
        `/api/attendance/student/${studentId}?month=${selectedMonth + 1}&year=${selectedYear}`
      )
      
      // Fetch attendance stats
      const statsResponse = await fetch(`/api/attendance/student/${studentId}/stats`)
      
      if (recordsResponse.ok) {
        const recordsResult = await recordsResponse.json()
        setAttendanceRecords(recordsResult.data?.records || [])
      }
      
      if (statsResponse.ok) {
        const statsResult = await statsResponse.json()
        setStats(statsResult.data?.stats || null)
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error)
      // Mock data for development
      setStats({
        totalDays: 45,
        presentDays: 42,
        absentDays: 2,
        lateDays: 1,
        attendanceRate: 93.3
      })
      
      setAttendanceRecords([
        { id: 1, date: '2024-01-15', status: 'PRESENT' },
        { id: 2, date: '2024-01-14', status: 'PRESENT' },
        { id: 3, date: '2024-01-13', status: 'LATE', notes: 'تأخیر ۱۰ دقیقه‌ای' },
        { id: 4, date: '2024-01-12', status: 'ABSENT', notes: 'مریضی' },
        { id: 5, date: '2024-01-11', status: 'PRESENT' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case 'ABSENT':
        return <XCircleIcon className="w-5 h-5 text-red-600" />
      case 'LATE':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />
      case 'EXCUSED':
        return <CheckCircleIcon className="w-5 h-5 text-blue-600" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'حاضر'
      case 'ABSENT': return 'غایب'
      case 'LATE': return 'تأخیر'
      case 'EXCUSED': return 'مرخصی'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'text-green-600 bg-green-50'
      case 'ABSENT': return 'text-red-600 bg-red-50'
      case 'LATE': return 'text-yellow-600 bg-yellow-50'
      case 'EXCUSED': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  if (compact && stats) {
    return (
      <div className={`${highlightField === 'absences' ? 'ring-2 ring-yellow-400 rounded-lg p-2' : ''}`}>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 persian-numbers">
              {englishToPersianNumbers(stats.attendanceRate.toFixed(1))}%
            </div>
            <div className="text-sm text-gray-600">نرخ حضور</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 persian-numbers">
              {englishToPersianNumbers(stats.absentDays)}
            </div>
            <div className="text-sm text-gray-600">روز غیبت</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${highlightField === 'absences' ? 'ring-2 ring-yellow-400 rounded-lg p-4' : ''}`}>
      {showTitle && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">حضور و غیاب</h3>
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i}>
                  {new Date(2024, i, 1).toLocaleDateString('fa-IR', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value={2024}>۱۴۰۳</option>
              <option value={2023}>۱۴۰۲</option>
            </select>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600 persian-numbers">
              {englishToPersianNumbers(stats.presentDays)}
            </div>
            <div className="text-sm text-gray-600">روز حضور</div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <XCircleIcon className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600 persian-numbers">
              {englishToPersianNumbers(stats.absentDays)}
            </div>
            <div className="text-sm text-gray-600">روز غیبت</div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <ClockIcon className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600 persian-numbers">
              {englishToPersianNumbers(stats.lateDays)}
            </div>
            <div className="text-sm text-gray-600">روز تأخیر</div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <CalendarIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600 persian-numbers">
              {englishToPersianNumbers(stats.attendanceRate.toFixed(1))}%
            </div>
            <div className="text-sm text-gray-600">نرخ حضور</div>
          </div>
        </div>
      )}

      {/* Attendance Records */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">سوابق حضور و غیاب</h4>
        <div className="bg-gray-50 rounded-lg overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {attendanceRecords.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p>سابقه حضور و غیابی برای این ماه ثبت نشده است.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {attendanceRecords.map((record) => (
                  <div key={record.id} className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(record.status)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString('fa-IR')}
                        </div>
                        {record.notes && (
                          <div className="text-sm text-gray-600">{record.notes}</div>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.status)}`}>
                      {getStatusText(record.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
