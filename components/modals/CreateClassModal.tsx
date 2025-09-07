'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useDataStore } from '@/lib/stores/dataStore'
import { classSchema, ClassInput } from '@/lib/validation/schemas'
import { z } from 'zod'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function CreateClassModal({ isOpen, onClose, onSuccess }: Props) {
  const { teachers, addClass, fetchTeachers } = useDataStore()
  
  const [formData, setFormData] = useState({
    grade: 1,
    section: '',
    teacherId: 0,
    capacity: 30
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Fetch teachers if not already loaded
  useEffect(() => {
    if (isOpen && teachers.length === 0) {
      fetchTeachers()
    }
  }, [isOpen, teachers.length, fetchTeachers])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
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
      const validatedData = classSchema.parse(formData) as ClassInput

      // Send create request
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      })

      const result = await response.json()

      if (result.success) {
        // Add to local store
        addClass(result.data)
        
        // Reset form
        setFormData({
          grade: 1,
          section: '',
          teacherId: 0,
          capacity: 30
        })
        
        onSuccess?.()
        onClose()
      } else {
        setErrors({ general: result.error || 'خطا در ایجاد کلاس' })
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
        console.error('Create class error:', error)
        setErrors({ general: 'خطای داخلی سرور' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({
        grade: 1,
        section: '',
        teacherId: 0,
        capacity: 30
      })
      setErrors({})
      onClose()
    }
  }

  // Get available teachers (those without active classes or with capacity for more classes)
  const availableTeachers = teachers.filter(teacher => teacher.isActive)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            ایجاد کلاس جدید
          </h2>
          <button
            onClick={handleClose}
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

          {/* Class Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="مثال: الف، ب، ج"
              />
              {errors.section && <p className="text-red-500 text-xs mt-1">{errors.section}</p>}
            </div>
          </div>

          {/* Teacher Assignment */}
          <div>
            <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-2">
              معلم کلاس *
            </label>
            <select
              id="teacherId"
              name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.teacherId ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value={0}>انتخاب معلم</option>
              {availableTeachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName} ({teacher.employeeId})
                </option>
              ))}
            </select>
            {errors.teacherId && <p className="text-red-500 text-xs mt-1">{errors.teacherId}</p>}
            {availableTeachers.length === 0 && (
              <p className="text-amber-600 text-xs mt-1">
                هیچ معلم فعالی در دسترس نیست. لطفاً ابتدا معلم اضافه کنید.
              </p>
            )}
          </div>

          {/* Capacity */}
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
              ظرفیت کلاس *
            </label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min={1}
              max={50}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.capacity ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
              placeholder="30"
            />
            {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
            <p className="text-gray-500 text-xs mt-1">
              حداکثر تعداد دانش‌آموزان قابل پذیرش در این کلاس
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              لغو
            </button>
            <button
              type="submit"
              disabled={loading || availableTeachers.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'در حال ایجاد...' : 'ایجاد کلاس'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
