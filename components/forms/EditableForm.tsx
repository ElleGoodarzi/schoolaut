'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, CheckIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { z } from 'zod'

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox'
  required?: boolean
  placeholder?: string
  options?: { value: string | number; label: string }[]
  validation?: z.ZodType<any>
  disabled?: boolean
  rows?: number // for textarea
  min?: number // for number inputs
  max?: number // for number inputs
  maxLength?: number // for text inputs
}

interface Props {
  title: string
  fields: FormField[]
  initialData?: Record<string, any>
  onSubmit: (data: Record<string, any>) => Promise<{ success: boolean; error?: string; data?: any }>
  onCancel: () => void
  submitText?: string
  cancelText?: string
  loading?: boolean
  className?: string
}

export default function EditableForm({
  title,
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  submitText = 'ذخیره',
  cancelText = 'لغو',
  loading = false,
  className = ''
}: Props) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // Initialize form data
  useEffect(() => {
    const initialFormData: Record<string, any> = {}
    fields.forEach(field => {
      initialFormData[field.name] = initialData[field.name] || 
        (field.type === 'checkbox' ? false : 
         field.type === 'number' ? 0 : '')
    })
    setFormData(initialFormData)
  }, [fields, initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    let processedValue: any = value
    
    if (type === 'number') {
      processedValue = value === '' ? 0 : parseFloat(value)
    } else if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const fieldErrors: Record<string, string> = {}
    
    fields.forEach(field => {
      const value = formData[field.name]
      
      // Required field validation
      if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        fieldErrors[field.name] = `${field.label} الزامی است`
        return
      }
      
      // Custom validation using Zod
      if (field.validation && value !== undefined && value !== '') {
        try {
          field.validation.parse(value)
        } catch (error) {
          if (error instanceof z.ZodError) {
            fieldErrors[field.name] = error.errors[0].message
          }
        }
      }
    })
    
    setErrors(fieldErrors)
    return Object.keys(fieldErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setSubmitting(true)
    setErrors({})

    try {
      const result = await onSubmit(formData)
      
      if (result.success) {
        // Success handled by parent component
      } else {
        setErrors({ general: result.error || 'خطا در انجام عملیات' })
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setErrors({ general: 'خطای داخلی سرور' })
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const value = formData[field.name] || ''
    const hasError = !!errors[field.name]
    const isDisabled = loading || submitting || field.disabled

    const baseClassName = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
      hasError ? 'border-red-300' : 'border-gray-300'
    } ${isDisabled ? 'bg-gray-50 cursor-not-allowed' : ''}`

    switch (field.type) {
      case 'select':
        return (
          <select
            name={field.name}
            value={value}
            onChange={handleChange}
            className={baseClassName}
            disabled={isDisabled}
            required={field.required}
          >
            <option value="">انتخاب کنید</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'textarea':
        return (
          <textarea
            name={field.name}
            value={value}
            onChange={handleChange}
            rows={field.rows || 3}
            className={baseClassName}
            disabled={isDisabled}
            placeholder={field.placeholder}
            required={field.required}
            maxLength={field.maxLength}
          />
        )

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              name={field.name}
              checked={value}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isDisabled}
            />
            <label className="mr-2 text-sm font-medium text-gray-700">
              {field.label}
            </label>
          </div>
        )

      case 'number':
        return (
          <input
            type="number"
            name={field.name}
            value={value}
            onChange={handleChange}
            min={field.min}
            max={field.max}
            className={baseClassName}
            disabled={isDisabled}
            placeholder={field.placeholder}
            required={field.required}
          />
        )

      default:
        return (
          <input
            type={field.type}
            name={field.name}
            value={value}
            onChange={handleChange}
            className={baseClassName}
            disabled={isDisabled}
            placeholder={field.placeholder}
            required={field.required}
            maxLength={field.maxLength}
          />
        )
    }
  }

  return (
    <div className={`bg-white rounded-2xl shadow-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">
          {title}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          disabled={submitting}
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        {/* General Error */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <XCircleIcon className="w-5 h-5 text-red-400 ml-2" />
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Fields */}
        <div className="space-y-6">
          {fields.map(field => {
            if (field.type === 'checkbox') {
              return (
                <div key={field.name}>
                  {renderField(field)}
                  {errors[field.name] && (
                    <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
                  )}
                </div>
              )
            }

            return (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 mr-1">*</span>}
                </label>
                {renderField(field)}
                {errors[field.name] && (
                  <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
                )}
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 space-x-reverse pt-6 mt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={submitting}
          >
            {cancelText}
          </button>
          <button
            type="submit"
            disabled={submitting || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                در حال ذخیره...
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4 ml-2" />
                {submitText}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
