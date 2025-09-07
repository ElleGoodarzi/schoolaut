'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserGroupIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'
import { useToast } from '@/lib/toast/ToastProvider'

interface Student {
  id: number
  studentId: string
  name: string
  firstName: string
  lastName: string
  nationalId: string
  attendanceStatus?: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | null
  notes?: string
}

interface ClassData {
  classId: number
  className: string
  grade: number
  section: string
  teacherName: string
  students: Student[]
  totalStudents: number
}

interface AttendanceStats {
  presentToday: number
  absentToday: number
  lateToday: number
  excusedToday: number
  totalMarked: number
  totalStudents: number
  attendanceRate: number
}

interface AttendanceDashboardProps {
  initialDate?: string
}

export default function AttendanceDashboard({ initialDate }: AttendanceDashboardProps) {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date().toISOString().split('T')[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('all')
  const [expandedClasses, setExpandedClasses] = useState<Set<number>>(new Set())
  const [saving, setSaving] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const { success, error, info } = useToast()


  useEffect(() => {
    fetchAttendanceData()
  }, [selectedDate])

  const fetchAttendanceData = async () => {
    try {
      setLoading(true)
      
      const [classesRes, statsRes] = await Promise.all([
        fetch(`/api/classes/active-students?date=${selectedDate}`),
        fetch(`/api/attendance/stats/today?date=${selectedDate}`)
      ])
      
      const [classesResult, statsResult] = await Promise.all([
        classesRes.json(),
        statsRes.json()
      ])
      
      if (classesResult.success && classesResult.data) {
        const classesWithAttendance = classesResult.data.classes.map((classData: any) => ({
          classId: classData.classId,
          className: classData.className,
          grade: classData.grade,
          section: classData.section,
          teacherName: classData.teacher?.name || 'نامشخص',
          students: classData.students.map((student: any) => ({
            id: student.id,
            studentId: student.studentId,
            name: student.name,
            firstName: student.firstName,
            lastName: student.lastName,
            nationalId: student.nationalId,
            attendanceStatus: student.attendanceStatus,
            notes: student.attendanceNotes || ''
          })),
          totalStudents: classData.totalStudents || classData.students.length
        }))
        
        setClasses(classesWithAttendance)
        
        // Auto-expand classes with unmarked attendance
        const classesWithUnmarked = new Set<number>()
        classesWithAttendance.forEach((classData: ClassData) => {
          const hasUnmarked = classData.students.some(student => !student.attendanceStatus)
          if (hasUnmarked) {
            classesWithUnmarked.add(classData.classId)
          }
        })
        setExpandedClasses(classesWithUnmarked)
      }
      
      if (statsResult.success) {
        setAttendanceStats(statsResult.data)
      }
    } catch (err) {
      console.error('Error fetching attendance data:', err)
      error('خطا در بارگیری اطلاعات حضور و غیاب')
      setClasses([])
      setAttendanceStats(null)
    } finally {
      setLoading(false)
    }
  }

  const updateAttendance = async (studentId: number, classId: number, status: string, notes = '') => {
    try {
      setSaving(true)
      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          classId,
          date: selectedDate,
          status,
          notes
        })
      })

      if (response.ok) {
        // Update local state
        const student = classes.flatMap(c => c.students).find(s => s.id === studentId)
        const statusText = status === 'PRESENT' ? 'حاضر' : status === 'ABSENT' ? 'غایب' : status === 'LATE' ? 'تأخیر' : 'مرخصی'
        
        setClasses(prevClasses => 
          prevClasses.map(classData => ({
            ...classData,
            students: classData.students.map(student => 
              student.id === studentId 
                ? { ...student, attendanceStatus: status as any, notes }
                : student
            )
          }))
        )
        
        success(`حضور ثبت شد برای ${student?.firstName} ${student?.lastName} - ${statusText}`)
        
        // Refresh stats
        await fetchAttendanceStats()
      } else {
        throw new Error('Failed to update attendance')
      }
    } catch (err) {
      console.error('Error updating attendance:', err)
      error('خطا در ثبت حضور و غیاب')
    } finally {
      setSaving(false)
    }
  }

  const fetchAttendanceStats = async () => {
    try {
      const response = await fetch(`/api/attendance/stats/today?date=${selectedDate}`)
      const result = await response.json()
      if (result.success) {
        setAttendanceStats(result.data)
      }
    } catch (error) {
      console.error('Error fetching attendance stats:', error)
    }
  }

  const bulkUpdateAttendance = async (classId: number, students: Student[], status: string) => {
    try {
      setSaving(true)
      const updates = students.map(student => ({
        studentId: student.id,
        classId,
        status,
        notes: student.notes || ''
      }))

      const response = await fetch('/api/attendance/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updates,
          date: selectedDate,
          classId
        })
      })

      if (response.ok) {
        const statusText = status === 'PRESENT' ? 'حاضر' : 'غایب'
        
        // Update local state
        setClasses(prevClasses => 
          prevClasses.map(classData => 
            classData.classId === classId 
              ? {
                  ...classData,
                  students: classData.students.map(student => ({
                    ...student,
                    attendanceStatus: status as any
                  }))
                }
              : classData
          )
        )
        
        success(`تمامی دانش‌آموزان ${statusText} شدند`)
        await fetchAttendanceStats()
      }
    } catch (err) {
      console.error('Error in bulk update:', err)
      error('خطا در به‌روزرسانی گروهی')
    } finally {
      setSaving(false)
    }
  }

  const markAllPresent = (classId: number) => {
    const classData = classes.find(c => c.classId === classId)
    if (classData) {
      bulkUpdateAttendance(classId, classData.students, 'PRESENT')
    }
  }

  const markAllAbsent = (classId: number) => {
    const classData = classes.find(c => c.classId === classId)
    if (classData) {
      bulkUpdateAttendance(classId, classData.students, 'ABSENT')
    }
  }

  const clearAllAttendance = async (classId: number) => {
    try {
      setSaving(true)
      const response = await fetch('/api/attendance/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          date: selectedDate
        })
      })

      if (response.ok) {
        setClasses(prevClasses => 
          prevClasses.map(classData => 
            classData.classId === classId 
              ? {
                  ...classData,
                  students: classData.students.map(student => ({
                    ...student,
                    attendanceStatus: null,
                    notes: ''
                  }))
                }
              : classData
          )
        )
        
        info('همه‌ی حضورها پاک شدند')
        await fetchAttendanceStats()
      }
    } catch (err) {
      console.error('Error clearing attendance:', err)
      error('خطا در پاک کردن حضور و غیاب')
    } finally {
      setSaving(false)
    }
  }

  const exportToExcel = async () => {
    try {
      const classIdParam = classFilter !== 'all' ? `&classId=${classFilter}` : ''
      const response = await fetch(`/api/attendance/export?date=${selectedDate}${classIdParam}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        
        // Enhanced filename with Persian date and class name
        const persianDate = englishToPersianNumbers(selectedDate.replace(/-/g, '/'))
        const className = classFilter !== 'all' ? classes.find(c => c.classId.toString() === classFilter)?.className : 'همه-کلاس‌ها'
        a.download = `حضور-غیاب-${persianDate}-${className || ''}.xlsx`
        
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        success('فایل اکسل با موفقیت دانلود شد')
      }
    } catch (err) {
      console.error('Error exporting to Excel:', err)
      error('خطا در خروجی گیری فایل اکسل')
    }
  }

  const toggleClassExpansion = (classId: number) => {
    setExpandedClasses(prev => {
      const newSet = new Set(prev)
      if (newSet.has(classId)) {
        newSet.delete(classId)
      } else {
        newSet.add(classId)
      }
      return newSet
    })
  }

  // Filter classes and students
  const filteredClasses = classes.filter(classData => {
    if (classFilter !== 'all' && classData.classId.toString() !== classFilter) {
      return false
    }
    
    const filteredStudents = classData.students.filter(student => {
      const matchesSearch = searchTerm === '' || 
        student.name.includes(searchTerm) || 
        student.studentId.includes(searchTerm) ||
        student.nationalId.includes(searchTerm)
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'unmarked' && !student.attendanceStatus) ||
        student.attendanceStatus === statusFilter
      
      return matchesSearch && matchesStatus
    })
    
    return filteredStudents.length > 0
  }).map(classData => ({
    ...classData,
    students: classData.students.filter(student => {
      const matchesSearch = searchTerm === '' || 
        student.name.includes(searchTerm) || 
        student.studentId.includes(searchTerm) ||
        student.nationalId.includes(searchTerm)
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'unmarked' && !student.attendanceStatus) ||
        student.attendanceStatus === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }))

  const getStatusIcon = (status: string | null | undefined) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'ABSENT':
        return <XCircleIcon className="h-5 w-5 text-red-600" />
      case 'LATE':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />
      case 'EXCUSED':
        return <ExclamationTriangleIcon className="h-5 w-5 text-blue-600" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusBadge = (status: string | null | undefined) => {
    switch (status) {
      case 'PRESENT':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">حاضر</span>
      case 'ABSENT':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">غایب</span>
      case 'LATE':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 gap-1">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          تأخیر
        </span>
      case 'EXCUSED':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">مرخصی</span>
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">ثبت نشده</span>
    }
  }

  if (loading) {
    return (
      <div className="fade-in">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {attendanceStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4 shadow-lg border border-green-200">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="mr-4">
                <p className="text-sm font-medium text-green-600">حاضر</p>
                <p className="text-2xl font-bold text-green-900">
                  {englishToPersianNumbers(attendanceStats.presentToday)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4 shadow-lg border border-red-200">
            <div className="flex items-center">
              <XCircleIcon className="h-8 w-8 text-red-600" />
              <div className="mr-4">
                <p className="text-sm font-medium text-red-600">غایب</p>
                <p className="text-2xl font-bold text-red-900">
                  {englishToPersianNumbers(attendanceStats.absentToday)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4 shadow-lg border border-yellow-200">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="mr-4">
                <p className="text-sm font-medium text-yellow-600">تأخیر</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {englishToPersianNumbers(attendanceStats.lateToday)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 shadow-lg border border-blue-200">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-blue-600" />
              <div className="mr-4">
                <p className="text-sm font-medium text-blue-600">مرخصی</p>
                <p className="text-2xl font-bold text-blue-900">
                  {englishToPersianNumbers(attendanceStats.excusedToday || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4">
        {/* Mobile Filter Toggle */}
        <div className="flex items-center justify-between md:hidden mb-4">
          <h3 className="text-lg font-semibold text-gray-900">فیلترها و جستجو</h3>
          <button 
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          >
            <Bars3Icon className="h-5 w-5 inline ml-1" />
            {mobileFiltersOpen ? 'بستن' : 'باز کردن'}
          </button>
        </div>

        {/* Filters Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-5 gap-4 ${mobileFiltersOpen ? 'block' : 'hidden md:grid'}`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ</label>
            <div className="relative">
              <CalendarIcon className="h-5 w-5 absolute right-3 top-3 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="انتخاب تاریخ"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">کلاس</label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="انتخاب کلاس"
            >
              <option value="all">همه کلاس‌ها</option>
              {classes.map(classData => (
                <option key={classData.classId} value={classData.classId}>
                  {classData.className}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">وضعیت حضور</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="فیلتر وضعیت حضور"
            >
              <option value="all">همه</option>
              <option value="unmarked">ثبت نشده</option>
              <option value="PRESENT">حاضر</option>
              <option value="ABSENT">غایب</option>
              <option value="LATE">تأخیر</option>
              <option value="EXCUSED">مرخصی</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">جستجو</label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute right-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="نام، شماره دانش‌آموزی یا کد ملی"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">عملیات</label>
            <button
              onClick={exportToExcel}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              خروجی اکسل
            </button>
          </div>
        </div>
      </div>

      {/* Classes */}
      <div className="space-y-4">
        {filteredClasses.map((classData) => {
          const isExpanded = expandedClasses.has(classData.classId)
          const unmarkedCount = classData.students.filter(s => !s.attendanceStatus).length
          
          return (
            <div key={classData.classId} className="bg-white rounded-xl shadow-xl border border-gray-200">
              {/* Class Header */}
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleClassExpansion(classData.classId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${isExpanded ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <UserGroupIcon className={`h-6 w-6 ${isExpanded ? 'text-blue-600' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{classData.className}</h3>
                      <p className="text-sm text-gray-600">معلم: {classData.teacherName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {englishToPersianNumbers(classData.totalStudents)} دانش‌آموز
                      </p>
                      {unmarkedCount > 0 && (
                        <p className="text-sm text-red-600">
                          {englishToPersianNumbers(unmarkedCount)} ثبت نشده
                        </p>
                      )}
                    </div>
                    
                    {isExpanded ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Class Content */}
              {isExpanded && (
                <div className="border-t border-gray-200">
                  {/* Batch Actions */}
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">عملیات گروهی:</span>
                        <button
                          onClick={() => markAllPresent(classData.classId)}
                          disabled={saving}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors disabled:opacity-50 gap-1"
                        >
                          <CheckIcon className="h-4 w-4" />
                          همه حاضر
                        </button>
                        <button
                          onClick={() => markAllAbsent(classData.classId)}
                          disabled={saving}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors disabled:opacity-50 gap-1"
                        >
                          <XMarkIcon className="h-4 w-4" />
                          همه غایب
                        </button>
                        <button
                          onClick={() => clearAllAttendance(classData.classId)}
                          disabled={saving}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors disabled:opacity-50 gap-1"
                        >
                          <ArrowPathIcon className="h-4 w-4" />
                          پاک کردن
                        </button>
                      </div>
                      
                      {saving && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm">در حال ذخیره...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Students Table */}
                  <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full">
                      <thead className="sticky top-0 z-10 bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نام دانش‌آموز</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">کد ملی</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">وضعیت حضور</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">یادداشت</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {classData.students.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {student.firstName} {student.lastName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {englishToPersianNumbers(student.studentId)}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {englishToPersianNumbers(student.nationalId)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col md:flex-row items-center justify-center gap-2">
                                {/* Status Buttons */}
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => updateAttendance(student.id, classData.classId, 'PRESENT', student.notes || '')}
                                    className={`p-2 rounded-lg transition-colors ${
                                      student.attendanceStatus === 'PRESENT'
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-600'
                                    }`}
                                    title="حاضر"
                                  >
                                    <CheckCircleIcon className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => updateAttendance(student.id, classData.classId, 'ABSENT', student.notes || '')}
                                    className={`p-2 rounded-lg transition-colors ${
                                      student.attendanceStatus === 'ABSENT'
                                        ? 'bg-red-100 text-red-600'
                                        : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600'
                                    }`}
                                    title="غایب"
                                  >
                                    <XCircleIcon className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => updateAttendance(student.id, classData.classId, 'LATE', student.notes || '')}
                                    className={`p-2 rounded-lg transition-colors ${
                                      student.attendanceStatus === 'LATE'
                                        ? 'bg-yellow-100 text-yellow-600'
                                        : 'bg-gray-100 text-gray-400 hover:bg-yellow-50 hover:text-yellow-600'
                                    }`}
                                    title="تأخیر"
                                  >
                                    <ClockIcon className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => updateAttendance(student.id, classData.classId, 'EXCUSED', student.notes || '')}
                                    className={`p-2 rounded-lg transition-colors ${
                                      student.attendanceStatus === 'EXCUSED'
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-600'
                                    }`}
                                    title="مرخصی"
                                  >
                                    <ExclamationTriangleIcon className="h-5 w-5" />
                                  </button>
                                </div>
                                
                                {/* Status Badge */}
                                <div className="mt-2 md:mt-0 md:ml-2">
                                  {getStatusBadge(student.attendanceStatus)}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                placeholder="یادداشت..."
                                value={student.notes || ''}
                                onChange={(e) => {
                                  const notes = e.target.value
                                  setClasses(prevClasses => 
                                    prevClasses.map(c => ({
                                      ...c,
                                      students: c.students.map(s => 
                                        s.id === student.id ? { ...s, notes } : s
                                      )
                                    }))
                                  )
                                }}
                                onBlur={() => {
                                  if (student.attendanceStatus) {
                                    updateAttendance(student.id, classData.classId, student.attendanceStatus, student.notes || '')
                                  }
                                }}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {classData.students.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-500">
                        دانش‌آموزی با فیلترهای انتخاب شده یافت نشد
                      </td>
                    </tr>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredClasses.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-xl border border-gray-200">
          <div className="p-8 text-center">
            <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">کلاسی یافت نشد</h3>
            <p className="text-gray-600">فیلترهای خود را تغییر دهید یا تاریخ دیگری انتخاب کنید</p>
          </div>
        </div>
      )}
    </div>
  )
}
