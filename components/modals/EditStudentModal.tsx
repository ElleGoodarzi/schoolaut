'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useDataStore } from '@/lib/stores/dataStore'
import { studentSchema, UpdateStudentInput } from '@/lib/validation/schemas'
import { z } from 'zod'

interface Props {
  isOpen: boolean
  onClose: () => void
  student: {
    id: number
    studentId: string
    firstName: string
    lastName: string
    fatherName: string
    nationalId: string
    birthDate: string
    grade: number
    section: string
    classId: number
    phone?: string
    email?: string
    address?: string
    isActive: boolean
  }
  onSuccess?: () => void
}

export default function EditStudentModal({ isOpen, onClose, student, onSuccess }: Props) {
  const { classes, updateStudent, fetchClasses } = useDataStore()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fatherName: '',
    nationalId: '',
    birthDate: '',
    grade: 1,
    section: '',
    classId: 0,
    phone: '',
    email: '',
    address: '',
    isActive: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Initialize form data when student changes
  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        fatherName: student.fatherName,
        nationalId: student.nationalId,
        birthDate: student.birthDate.split('T')[0], // Convert to YYYY-MM-DD format
        grade: student.grade,
        section: student.section,
        classId: student.classId,
        phone: student.phone || '',
        email: student.email || '',
        address: student.address || '',
        isActive: student.isActive
      })
    }
  }, [student])

  // Fetch classes if not already loaded
  useEffect(() => {
    if (isOpen && classes.length === 0) {
      fetchClasses()
    }
  }, [isOpen, classes.length, fetchClasses])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      // Validate form data
      const validatedData = studentSchema.partial().parse(formData) as UpdateStudentInput

      // Send update request
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      })

      const result = await response.json()

      if (result.success) {
        // Update local store
        updateStudent(student.id, result.data)
        
        onSuccess?.()
        onClose()
      } else {
        setErrors({ general: result.error || 'خطا در به‌روزرسانی دانش‌آموز' })
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(fieldErrors)
      } else {
        console.error('Update student error:', error)
        setErrors({ general: 'خطای داخلی سرور' })
      }
    } finally {
      setLoading(false)
    }
  }

  const availableClasses = classes.filter(cls => 
    cls.grade === formData.grade && cls.isActive
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            ویرایش دانش‌آموز
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                نام *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.firstName ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                نام خانوادگی *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.lastName ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>

            <div>
              <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700 mb-2">
                نام پدر *
              </label>
              <input
                type="text"
                id="fatherName"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.fatherName ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.fatherName && <p className="text-red-500 text-xs mt-1">{errors.fatherName}</p>}
            </div>

            <div>
              <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700 mb-2">
                کد ملی *
              </label>
              <input
                type="text"
                id="nationalId"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nationalId ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
                maxLength={10}
              />
              {errors.nationalId && <p className="text-red-500 text-xs mt-1">{errors.nationalId}</p>}
            </div>

            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                تاریخ تولد *
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.birthDate ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
            </div>

            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                پایه تحصیلی *
              </label>
              <select
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.grade ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                  <option key={grade} value={grade}>پایه {grade}</option>
                ))}
              </select>
              {errors.grade && <p className="text-red-500 text-xs mt-1">{errors.grade}</p>}
            </div>
          </div>

          {/* Class Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-2">
                بخش *
              </label>
              <input
                type="text"
                id="section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.section ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
                placeholder="مثال: الف"
              />
              {errors.section && <p className="text-red-500 text-xs mt-1">{errors.section}</p>}
            </div>

            <div>
              <label htmlFor="classId" className="block text-sm font-medium text-gray-700 mb-2">
                کلاس *
              </label>
              <select
                id="classId"
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.classId ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value={0}>انتخاب کلاس</option>
                {availableClasses.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.grade}-{cls.section} - {cls.teacher.firstName} {cls.teacher.lastName}
                  </option>
                ))}
              </select>
              {errors.classId && <p className="text-red-500 text-xs mt-1">{errors.classId}</p>}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                شماره تلفن
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
                placeholder="09123456789"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                ایمیل
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
                placeholder="example@email.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              آدرس
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.address ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
              placeholder="آدرس محل سکونت"
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          {/* Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={loading}
            />
            <label htmlFor="isActive" className="mr-2 text-sm font-medium text-gray-700">
              فعال
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              لغو
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
