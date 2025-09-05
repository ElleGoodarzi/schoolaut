'use client'

import { useState, useEffect } from 'react'
import { 
  XMarkIcon, 
  UserIcon, 
  CalendarIcon,
  AcademicCapIcon,
  PhoneIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'

interface AddStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (student: any) => void
}

interface StudentFormData {
  firstName: string
  lastName: string
  fatherName: string
  nationalId: string
  birthDate: string
  grade: number
  section: string
  classId: number | null
  phone: string
  address: string
}

interface ClassOption {
  id: number
  grade: number
  section: string
  teacherName: string
  capacity: number
  currentStudents: number
}

export default function AddStudentModal({ isOpen, onClose, onSuccess }: AddStudentModalProps) {
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: '',
    lastName: '',
    fatherName: '',
    nationalId: '',
    birthDate: '',
    grade: 1,
    section: 'الف',
    classId: null,
    phone: '',
    address: ''
  })

  const [availableClasses, setAvailableClasses] = useState<ClassOption[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch available classes when grade changes
  useEffect(() => {
    if (formData.grade) {
      fetchAvailableClasses(formData.grade)
    }
  }, [formData.grade])

  const fetchAvailableClasses = async (grade: number) => {
    try {
      setLoadingClasses(true)
      const response = await fetch(`/api/classes/available?grade=${grade}`)
      if (response.ok) {
        const result = await response.json()
        const classes = result.success ? result.data : []
        setAvailableClasses(Array.isArray(classes) ? classes : [])
        
        // Auto-select first available class
        if (Array.isArray(classes) && classes.length > 0) {
          setFormData(prev => ({ ...prev, classId: classes[0].id, section: classes[0].section }))
        }
      } else {
        // Handle error case
        setAvailableClasses([])
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      setAvailableClasses([])
    } finally {
      setLoadingClasses(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'نام الزامی است'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'نام خانوادگی الزامی است'
    }

    if (!formData.fatherName.trim()) {
      newErrors.fatherName = 'نام پدر الزامی است'
    }

    if (!formData.nationalId.trim()) {
      newErrors.nationalId = 'کد ملی الزامی است'
    } else if (!/^\d{10}$/.test(formData.nationalId)) {
      newErrors.nationalId = 'کد ملی باید ۱۰ رقم باشد'
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'تاریخ تولد الزامی است'
    }

    if (!formData.classId) {
      newErrors.classId = 'انتخاب کلاس الزامی است'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'شماره تماس الزامی است'
    } else if (!/^09\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'شماره تماس معتبر نیست'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generateStudentId = (): string => {
    const year = new Date().getFullYear().toString().slice(-2)
    const grade = formData.grade.toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
    return `${year}${grade}${random}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const studentData = {
        ...formData,
        studentId: generateStudentId(),
        birthDate: new Date(formData.birthDate).toISOString(),
      }

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      })

      if (response.ok) {
        const newStudent = await response.json()
        onSuccess(newStudent)
        resetForm()
        onClose()
      } else {
        const errorData = await response.json()
        if (errorData.field && errorData.message) {
          setErrors({ [errorData.field]: errorData.message })
        } else {
          setErrors({ general: 'خطا در ایجاد دانش‌آموز' })
        }
      }
    } catch (error) {
      console.error('Error creating student:', error)
      setErrors({ general: 'خطا در ارتباط با سرور' })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      fatherName: '',
      nationalId: '',
      birthDate: '',
      grade: 1,
      section: 'الف',
      classId: null,
      phone: '',
      address: ''
    })
    setErrors({})
  }

  const handleInputChange = (field: keyof StudentFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">افزودن دانش‌آموز جدید</h3>
              <p className="text-sm text-gray-600">اطلاعات دانش‌آموز را وارد کنید</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="بستن"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}

            {/* Personal Information */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <IdentificationIcon className="w-5 h-5" />
                اطلاعات شخصی
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نام *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="نام دانش‌آموز"
                  />
                  {errors.firstName && (
                    <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نام خانوادگی *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="نام خانوادگی"
                  />
                  {errors.lastName && (
                    <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نام پدر *
                  </label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.fatherName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="نام پدر"
                  />
                  {errors.fatherName && (
                    <p className="text-red-600 text-xs mt-1">{errors.fatherName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    کد ملی *
                  </label>
                  <input
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => handleInputChange('nationalId', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.nationalId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="کد ملی ۱۰ رقمی"
                    dir="ltr"
                  />
                  {errors.nationalId && (
                    <p className="text-red-600 text-xs mt-1">{errors.nationalId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاریخ تولد *
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.birthDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                    title="تاریخ تولد"
                  />
                  {errors.birthDate && (
                    <p className="text-red-600 text-xs mt-1">{errors.birthDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    شماره تماس *
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    dir="ltr"
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  آدرس
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="آدرس محل سکونت"
                  title="آدرس محل سکونت"
                />
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AcademicCapIcon className="w-5 h-5" />
                اطلاعات تحصیلی
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    پایه تحصیلی *
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => handleInputChange('grade', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="انتخاب پایه تحصیلی"
                  >
                    {[1, 2, 3, 4, 5, 6].map(grade => (
                      <option key={grade} value={grade}>
                        پایه {englishToPersianNumbers(grade)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    کلاس *
                  </label>
                  <select
                    value={formData.classId || ''}
                    onChange={(e) => {
                      const classId = parseInt(e.target.value)
                      const selectedClass = availableClasses.find(c => c.id === classId)
                      setFormData(prev => ({
                        ...prev,
                        classId: classId,
                        section: selectedClass?.section || ''
                      }))
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.classId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    title="انتخاب کلاس"
                  >
                    <option value="">{loadingClasses ? 'در حال بارگذاری...' : 'انتخاب کلاس'}</option>
                    {Array.isArray(availableClasses) && availableClasses.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {englishToPersianNumbers(cls.grade)}{cls.section} - {cls.teacherName} 
                        ({englishToPersianNumbers(cls.currentStudents)}/{englishToPersianNumbers(cls.capacity)})
                      </option>
                    ))}
                  </select>
                  {errors.classId && (
                    <p className="text-red-600 text-xs mt-1">{errors.classId}</p>
                  )}
                </div>
              </div>

              {formData.classId && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    دانش‌آموز به کلاس {englishToPersianNumbers(formData.grade)}{formData.section} اضافه خواهد شد
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  در حال ایجاد...
                </>
              ) : (
                <>
                  <UserIcon className="w-4 h-4" />
                  ایجاد دانش‌آموز
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
