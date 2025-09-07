'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  FunnelIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'
import { useToast } from '@/lib/toast/ToastProvider'

interface Student {
  id: number
  studentId: string
  firstName: string
  lastName: string
  nationalId: string
  attendanceStatus?: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | null
  notes?: string
}

interface ClassInfo {
  classId: number
  className: string
  grade: number
  section: string
  teacherName: string
  capacity: number
  totalStudents: number
}

interface ClassAttendanceMarkingProps {
  classId: number
  initialDate?: string
  onBack?: () => void
}

export default function ClassAttendanceMarking({ 
  classId, 
  initialDate,
  onBack 
}: ClassAttendanceMarkingProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  
  const { success, error, info } = useToast()

  useEffect(() => {
    fetchClassData()
  }, [classId, selectedDate])

  const fetchClassData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/classes/active-students?date=${selectedDate}&classId=${classId}`)
      const result = await response.json()
      
      if (result.success && result.data?.classes?.[0]) {
        const classData = result.data.classes[0]
        
        setClassInfo({
          classId: classData.classId,
          className: classData.className,
          grade: classData.grade,
          section: classData.section,
          teacherName: classData.teacher?.name || 'نامشخص',
          capacity: classData.capacity || 30,
          totalStudents: classData.totalStudents || classData.students.length
        })
        
        const studentsData = classData.students.map((student: any) => ({
          id: student.id,
          studentId: student.studentId,
          firstName: student.firstName,
          lastName: student.lastName,
          nationalId: student.nationalId,
          attendanceStatus: student.attendanceStatus,
          notes: student.attendanceNotes || ''
        }))
        
        setStudents(studentsData)
      } else {
        error('خطا در بارگیری اطلاعات کلاس')
      }
    } catch (err) {
      console.error('Error fetching class data:', err)
      error('خطا در بارگیری اطلاعات')
    } finally {
      setLoading(false)
    }
  }

  const updateStudentAttendance = (studentId: number, status: string, notes = '') => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, attendanceStatus: status as any, notes }
        : student
    ))
    setHasUnsavedChanges(true)
  }

  const updateStudentNotes = (studentId: number, notes: string) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, notes }
        : student
    ))
    setHasUnsavedChanges(true)
  }

  const saveAllAttendance = async () => {
    try {
      setSaving(true)
      
      // Prepare bulk update data
      const updates = students
        .filter(student => student.attendanceStatus) // Only students with status
        .map(student => ({
          studentId: student.id,
          classId,
          status: student.attendanceStatus,
          notes: student.notes || ''
        }))

      if (updates.length === 0) {
        info('هیچ تغییری برای ذخیره وجود ندارد')
        return
      }

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
        setHasUnsavedChanges(false)
        success(`حضور و غیاب ${englishToPersianNumbers(updates.length)} دانش‌آموز ذخیره شد`)
      } else {
        throw new Error('Failed to save attendance')
      }
    } catch (err) {
      console.error('Error saving attendance:', err)
      error('خطا در ذخیره حضور و غیاب')
    } finally {
      setSaving(false)
    }
  }

  const bulkMarkAttendance = (status: string) => {
    const filteredStudents = getFilteredStudents()
    filteredStudents.forEach(student => {
      updateStudentAttendance(student.id, status, student.notes || '')
    })
    
    const statusText = status === 'PRESENT' ? 'حاضر' : 'غایب'
    info(`${englishToPersianNumbers(filteredStudents.length)} دانش‌آموز ${statusText} علامت‌گذاری شدند`)
  }

  const clearAllAttendance = () => {
    const filteredStudents = getFilteredStudents()
    filteredStudents.forEach(student => {
      updateStudentAttendance(student.id, '', '')
    })
    info(`حضور و غیاب ${englishToPersianNumbers(filteredStudents.length)} دانش‌آموز پاک شد`)
  }

  const exportToExcel = async () => {
    try {
      const response = await fetch(`/api/attendance/export?date=${selectedDate}&classId=${classId}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        
        const persianDate = englishToPersianNumbers(selectedDate.replace(/-/g, '/'))
        a.download = `حضور-غیاب-${classInfo?.className || 'کلاس'}-${persianDate}.xlsx`
        
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

  const getFilteredStudents = () => {
    return students.filter(student => {
      const matchesSearch = searchTerm === '' || 
        student.firstName.includes(searchTerm) || 
        student.lastName.includes(searchTerm) ||
        student.studentId.includes(searchTerm) ||
        student.nationalId.includes(searchTerm)
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'unmarked' && !student.attendanceStatus) ||
        student.attendanceStatus === statusFilter
      
      return matchesSearch && matchesStatus
    })
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

  const getRowColorClass = (status: string | null | undefined) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-50 hover:bg-green-100 border-r-4 border-green-400'
      case 'ABSENT':
        return 'bg-red-50 hover:bg-red-100 border-r-4 border-red-400'
      case 'LATE':
        return 'bg-yellow-50 hover:bg-yellow-100 border-r-4 border-yellow-400'
      case 'EXCUSED':
        return 'bg-blue-50 hover:bg-blue-100 border-r-4 border-blue-400'
      default:
        return 'bg-white hover:bg-gray-50'
    }
  }

  const filteredStudents = getFilteredStudents()
  const attendanceStats = {
    total: students.length,
    present: students.filter(s => s.attendanceStatus === 'PRESENT').length,
    absent: students.filter(s => s.attendanceStatus === 'ABSENT').length,
    late: students.filter(s => s.attendanceStatus === 'LATE').length,
    unmarked: students.filter(s => !s.attendanceStatus).length
  }

  if (loading) {
    return (
      <div className="fade-in">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="bg-white rounded-xl p-6 space-y-4 mb-6">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6">
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="بازگشت"
                aria-label="بازگشت به صفحه قبل"
              >
                <ArrowPathIcon className="h-5 w-5 text-gray-600" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              ثبت حضور و غیاب - {classInfo?.className}
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            معلم: {classInfo?.teacherName} • 
            {englishToPersianNumbers(classInfo?.totalStudents || 0)} دانش‌آموز
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="انتخاب تاریخ"
              aria-label="انتخاب تاریخ برای ثبت حضور"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <UserGroupIcon className="h-6 w-6 text-gray-600 mx-auto mb-1" />
          <p className="text-sm text-gray-600">کل</p>
          <p className="text-xl font-bold text-gray-900">
            {englishToPersianNumbers(attendanceStats.total)}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
          <CheckCircleIcon className="h-6 w-6 text-green-600 mx-auto mb-1" />
          <p className="text-sm text-green-600">حاضر</p>
          <p className="text-xl font-bold text-green-900">
            {englishToPersianNumbers(attendanceStats.present)}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
          <XCircleIcon className="h-6 w-6 text-red-600 mx-auto mb-1" />
          <p className="text-sm text-red-600">غایب</p>
          <p className="text-xl font-bold text-red-900">
            {englishToPersianNumbers(attendanceStats.absent)}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-200">
          <ClockIcon className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
          <p className="text-sm text-yellow-600">تأخیر</p>
          <p className="text-xl font-bold text-yellow-900">
            {englishToPersianNumbers(attendanceStats.late)}
          </p>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <ExclamationTriangleIcon className="h-6 w-6 text-gray-600 mx-auto mb-1" />
          <p className="text-sm text-gray-600">ثبت نشده</p>
          <p className="text-xl font-bold text-gray-900">
            {englishToPersianNumbers(attendanceStats.unmarked)}
          </p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        {/* Mobile Filter Toggle */}
        <div className="flex items-center justify-between md:hidden mb-4">
          <h3 className="text-lg font-semibold text-gray-900">فیلترها و عملیات</h3>
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FunnelIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className={`space-y-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
          {/* Search and Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">جستجو دانش‌آموز</label>
              <input
                type="text"
                placeholder="نام، شماره دانش‌آموزی یا کد ملی"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">فیلتر وضعیت</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="فیلتر وضعیت حضور"
                aria-label="انتخاب فیلتر وضعیت حضور"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">خروجی</label>
              <button
                onClick={exportToExcel}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                دانلود اکسل
              </button>
            </div>
          </div>

          {/* Batch Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-700">عملیات گروهی:</span>
            <button
              onClick={() => bulkMarkAttendance('PRESENT')}
              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors gap-1"
            >
              <CheckIcon className="h-4 w-4" />
              همه حاضر
            </button>
            <button
              onClick={() => bulkMarkAttendance('ABSENT')}
              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors gap-1"
            >
              <XMarkIcon className="h-4 w-4" />
              همه غایب
            </button>
            <button
              onClick={clearAllAttendance}
              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors gap-1"
            >
              <ArrowPathIcon className="h-4 w-4" />
              پاک کردن
            </button>
            
            {hasUnsavedChanges && (
              <button
                onClick={saveAllAttendance}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors gap-1 disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <BookmarkIcon className="h-4 w-4" />
                )}
                {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full">
            <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  شماره دانش‌آموزی
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نام و نام خانوادگی
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  وضعیت حضور
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  یادداشت
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr 
                  key={student.id} 
                  className={`transition-colors ${getRowColorClass(student.attendanceStatus)}`}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {englishToPersianNumbers(student.studentId)}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        کد ملی: {englishToPersianNumbers(student.nationalId)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-center gap-2">
                      {/* Status Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateStudentAttendance(student.id, 'PRESENT', student.notes || '')}
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
                          onClick={() => updateStudentAttendance(student.id, 'ABSENT', student.notes || '')}
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
                          onClick={() => updateStudentAttendance(student.id, 'LATE', student.notes || '')}
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
                          onClick={() => updateStudentAttendance(student.id, 'EXCUSED', student.notes || '')}
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
                      <div>
                        {getStatusBadge(student.attendanceStatus)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <textarea
                      placeholder="یادداشت..."
                      value={student.notes || ''}
                      onChange={(e) => updateStudentNotes(student.id, e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p>دانش‌آموزی با فیلترهای انتخاب شده یافت نشد</p>
          </div>
        )}
      </div>

      {/* Floating Save Button */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={saveAllAttendance}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <BookmarkIcon className="h-5 w-5" />
            )}
            {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </button>
        </div>
      )}
    </div>
  )
}
