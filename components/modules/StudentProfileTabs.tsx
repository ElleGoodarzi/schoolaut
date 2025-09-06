'use client'

import { useState, useEffect } from 'react'
import { 
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BanknotesIcon,
  TruckIcon,
  CakeIcon,
  PlusIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'

interface StudentData {
  id: number
  studentId: string
  firstName: string
  lastName: string
  fatherName: string
  nationalId: string
  birthDate: string
  grade: number
  section: string
  phone?: string
  address?: string
  enrollmentDate: string
  isActive: boolean
  class: {
    id: number
    grade: number
    section: string
    teacher: {
      firstName: string
      lastName: string
    }
  }
  attendances: Array<{
    id: number
    date: string
    status: string
    notes?: string
  }>
  payments: Array<{
    id: number
    amount: number
    dueDate: string
    paidDate?: string
    status: string
    type: string
    description?: string
  }>
  services: Array<{
    id: number
    type: string
    route?: string
    mealPlan?: string
    isActive: boolean
  }>
  classHistory: Array<{
    id: number
    className: string
    startDate: string
    endDate?: string
    teacher: string
  }>
}

interface Props {
  activeTab: string
  student: StudentData
  onRefresh: () => void
}

export default function StudentProfileTab({ activeTab, student, onRefresh }: Props) {
  const [attendanceFilter, setAttendanceFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')

  const getStatusBadge = (status: string, type: 'attendance' | 'payment') => {
    if (type === 'attendance') {
      switch (status) {
        case 'PRESENT':
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              حاضر
            </span>
          )
        case 'ABSENT':
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <XCircleIcon className="h-3 w-3 mr-1" />
              غایب
            </span>
          )
        case 'LATE':
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <ClockIcon className="h-3 w-3 mr-1" />
              تاخیر
            </span>
          )
        default:
          return status
      }
    } else {
      switch (status) {
        case 'PAID':
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✅ پرداخت‌شده
            </span>
          )
        case 'PENDING':
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              ⏳ در انتظار
            </span>
          )
        case 'OVERDUE':
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              ❌ معوقه
            </span>
          )
        default:
          return status
      }
    }
  }

  const formatAmount = (amount: number) => {
    return `${englishToPersianNumbers(amount.toLocaleString())} تومان`
  }

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'TUITION':
        return 'شهریه'
      case 'TRANSPORT':
        return 'سرویس'
      case 'MEAL':
        return 'غذا'
      case 'BOOK':
        return 'کتاب'
      case 'ACTIVITY':
        return 'فعالیت'
      default:
        return type
    }
  }

  if (activeTab === 'profile') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              اطلاعات شخصی
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">نام و نام خانوادگی</label>
                <p className="font-medium">{student.firstName} {student.lastName}</p>
          </div>
              <div>
                <label className="text-sm text-gray-600">نام پدر</label>
                <p className="font-medium">{student.fatherName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">کد ملی</label>
                <p className="font-medium">{englishToPersianNumbers(student.nationalId)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 flex items-center gap-1">
                  <CakeIcon className="h-4 w-4" />
                  تاریخ تولد
                </label>
                <p className="font-medium">{student.birthDate}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PhoneIcon className="h-5 w-5" />
              اطلاعات تماس
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">شماره تماس</label>
                <p className="font-medium">
                  {student.phone ? englishToPersianNumbers(student.phone) : 'ثبت نشده'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4" />
                  آدرس
                </label>
                <p className="font-medium">
                  {student.address || 'ثبت نشده'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            اطلاعات تحصیلی
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600">شماره دانش‌آموزی</label>
              <p className="font-medium">{englishToPersianNumbers(student.studentId)}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">پایه و شعبه</label>
              <p className="font-medium">
                پایه {englishToPersianNumbers(student.class.grade)} - شعبه {student.class.section}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">تاریخ ثبت نام</label>
              <p className="font-medium">{student.enrollmentDate}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (activeTab === 'attendance') {
    const filteredAttendances = student.attendances.filter(attendance => {
      if (attendanceFilter === 'all') return true
      return attendance.status === attendanceFilter
    })

    const attendanceStats = {
      total: student.attendances.length,
      present: student.attendances.filter(a => a.status === 'PRESENT').length,
      absent: student.attendances.filter(a => a.status === 'ABSENT').length,
      late: student.attendances.filter(a => a.status === 'LATE').length
    }

    const attendanceRate = attendanceStats.total > 0 
      ? Math.round((attendanceStats.present / attendanceStats.total) * 100)
      : 100

              return (
      <div className="space-y-6">
        {/* Attendance Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{englishToPersianNumbers(attendanceStats.total)}</p>
            <p className="text-sm text-blue-600">کل روزها</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{englishToPersianNumbers(attendanceStats.present)}</p>
            <p className="text-sm text-green-600">حاضر</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{englishToPersianNumbers(attendanceStats.absent)}</p>
            <p className="text-sm text-red-600">غایب</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{englishToPersianNumbers(attendanceRate)}%</p>
            <p className="text-sm text-yellow-600">نرخ حضور</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">فیلتر:</label>
          <select
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="فیلتر وضعیت حضور"
          >
            <option value="all">همه</option>
            <option value="PRESENT">حاضر</option>
            <option value="ABSENT">غایب</option>
            <option value="LATE">تاخیر</option>
          </select>
        </div>

        {/* Attendance Records */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">سوابق حضور و غیاب</h3>
            <a 
              href="/attendance" 
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              مدیریت حضور و غیاب ←
            </a>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {filteredAttendances.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                رکوردی یافت نشد
              </div>
            ) : (
              filteredAttendances.map((attendance) => (
                <div key={attendance.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{attendance.date}</p>
                      {attendance.notes && (
                        <p className="text-sm text-gray-600">{attendance.notes}</p>
                      )}
                    </div>
              <div>
                      {getStatusBadge(attendance.status, 'attendance')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  if (activeTab === 'payments') {
    const filteredPayments = student.payments.filter(payment => {
      if (paymentFilter === 'all') return true
      return payment.status === paymentFilter
    })

    const paymentStats = {
      total: student.payments.reduce((sum, p) => sum + p.amount, 0),
      paid: student.payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0),
      pending: student.payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0),
      overdue: student.payments.filter(p => p.status === 'OVERDUE').reduce((sum, p) => sum + p.amount, 0)
    }

    return (
      <div className="space-y-6">
        {/* Payment Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-lg font-bold text-blue-600">{formatAmount(paymentStats.total)}</p>
            <p className="text-sm text-blue-600">کل مبلغ</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-lg font-bold text-green-600">{formatAmount(paymentStats.paid)}</p>
            <p className="text-sm text-green-600">پرداخت شده</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-lg font-bold text-yellow-600">{formatAmount(paymentStats.pending)}</p>
            <p className="text-sm text-yellow-600">در انتظار</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <p className="text-lg font-bold text-red-600">{formatAmount(paymentStats.overdue)}</p>
            <p className="text-sm text-red-600">معوقه</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">فیلتر:</label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="فیلتر وضعیت پرداخت"
          >
            <option value="all">همه</option>
            <option value="PAID">پرداخت شده</option>
            <option value="PENDING">در انتظار</option>
            <option value="OVERDUE">معوقه</option>
          </select>
        </div>

        {/* Payment Records */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">سوابق پرداخت</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {filteredPayments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                رکوردی یافت نشد
              </div>
            ) : (
              filteredPayments.map((payment) => (
                <div key={payment.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <BanknotesIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {getPaymentTypeLabel(payment.type)} - {formatAmount(payment.amount)}
                          </p>
                          <p className="text-sm text-gray-600">
                            سررسید: {payment.dueDate}
                            {payment.paidDate && ` | پرداخت: ${payment.paidDate}`}
                          </p>
                          {payment.description && (
                            <p className="text-sm text-gray-500">{payment.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(payment.status, 'payment')}
                  </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  if (activeTab === 'services') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {student.services.map((service) => (
            <div key={service.id} className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TruckIcon className="h-5 w-5" />
                  {service.type}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  service.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {service.isActive ? 'فعال' : 'غیرفعال'}
                </span>
              </div>
              
              <div className="space-y-2">
                {service.route && (
              <div>
                    <label className="text-sm text-gray-600">مسیر</label>
                    <p className="font-medium">{service.route}</p>
                  </div>
                )}
                {service.mealPlan && (
                  <div>
                    <label className="text-sm text-gray-600">برنامه غذایی</label>
                    <p className="font-medium">{service.mealPlan}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {student.services.length === 0 && (
          <div className="text-center py-12">
            <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">سرویسی ثبت نشده است</p>
            </div>
          )}
      </div>
    )
  }

  if (activeTab === 'classes') {
    return (
      <ClassAssignmentTab 
        student={student} 
        onRefresh={onRefresh}
      />
    )
  }

  return <div>تب انتخاب شده یافت نشد</div>
}

// Class Assignment Tab Component
function ClassAssignmentTab({ student, onRefresh }: { student: StudentData, onRefresh: () => void }) {
  const [classHistory, setClassHistory] = useState<any[]>([])
  const [availableClasses, setAvailableClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignmentForm, setAssignmentForm] = useState({
    classId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    reason: ''
  })

  // Fetch class history
  const fetchClassHistory = async () => {
    try {
      const response = await fetch(`/api/students/${student.id}/class-history`)
      const result = await response.json()
      if (result.success) {
        setClassHistory(result.data.history || [])
      }
    } catch (error) {
      console.error('Error fetching class history:', error)
    }
  }

  // Fetch available classes
  const fetchAvailableClasses = async () => {
    try {
      const response = await fetch('/api/classes/available')
      const result = await response.json()
      if (result.success) {
        setAvailableClasses(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching available classes:', error)
    }
  }

  // Handle class assignment
  const handleAssignClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignmentForm.classId || !assignmentForm.startDate) {
      alert('لطفاً کلاس و تاریخ شروع را انتخاب کنید')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/students/${student.id}/assign-class`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentForm)
      })

      const result = await response.json()
      if (result.success) {
        alert('دانش‌آموز با موفقیت به کلاس تخصیص یافت')
        setShowAssignModal(false)
        setAssignmentForm({
          classId: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          reason: ''
        })
        await fetchClassHistory()
        onRefresh() // Refresh parent component
      } else {
        alert(result.message || 'خطا در تخصیص به کلاس')
      }
    } catch (error) {
      console.error('Error assigning class:', error)
      alert('خطا در تخصیص به کلاس')
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchClassHistory()
    fetchAvailableClasses()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header with Assign Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">تخصیص کلاس‌ها</h3>
        <button
          onClick={() => setShowAssignModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          تخصیص به کلاس جدید
        </button>
      </div>

      {/* Current Active Class */}
      {classHistory.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">کلاس فعلی</h4>
          {(() => {
            const currentClass = classHistory.find(c => c.isActive)
            if (currentClass) {
              return (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">{currentClass.className}</p>
                    <p className="text-sm text-blue-700">معلم: {currentClass.teacherName}</p>
                    <p className="text-sm text-blue-600">از تاریخ: {currentClass.startDate}</p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    فعال
                  </span>
                </div>
              )
            } else {
              return (
                <p className="text-blue-700">دانش‌آموز در حال حاضر به کلاسی تخصیص نیافته است</p>
              )
            }
          })()}
            </div>
          )}

      {/* Class History */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">سابقه کلاس‌ها</h3>
        </div>
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {classHistory.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              سابقه کلاسی یافت نشد
            </div>
          ) : (
            classHistory.map((classRecord) => (
              <div key={classRecord.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{classRecord.className}</p>
                    <p className="text-sm text-gray-600">معلم: {classRecord.teacherName}</p>
                    <p className="text-sm text-gray-500">
                      {classRecord.duration}
                    </p>
                    {classRecord.reason && (
                      <p className="text-sm text-gray-500">دلیل: {classRecord.reason}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {classRecord.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        فعال
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <ArchiveBoxIcon className="h-3 w-3 mr-1" />
                        آرشیو شده
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">تخصیص به کلاس جدید</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAssignClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام کلاس
                </label>
                <select
                  value={assignmentForm.classId}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, classId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  title="انتخاب کلاس"
                >
                  <option value="">انتخاب کلاس</option>
                  {availableClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      پایه {englishToPersianNumbers(cls.grade)} - شعبه {cls.section} (معلم: {cls.teacher.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاریخ شروع
                </label>
                <input
                  type="date"
                  value={assignmentForm.startDate}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  title="انتخاب تاریخ شروع"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاریخ پایان (اختیاری)
                </label>
                <input
                  type="date"
                  value={assignmentForm.endDate}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="انتخاب تاریخ پایان (اختیاری)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  دلیل تغییر (اختیاری)
                </label>
                <textarea
                  value={assignmentForm.reason}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="دلیل تخصیص یا تغییر کلاس..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'در حال ثبت...' : 'تخصیص کلاس'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}