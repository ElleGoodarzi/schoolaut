'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useDataStore } from '@/lib/stores/dataStore'
import { mealServiceSchema, updateMealServiceSchema, MealServiceInput, UpdateMealServiceInput } from '@/lib/validation/schemas'
import { z } from 'zod'

interface Props {
  isOpen: boolean
  onClose: () => void
  mealService?: {
    id: number
    date: string
    mealType: string
    menuItems: string
    price: number
    maxOrders: number
    isActive: boolean
  }
  onSuccess?: () => void
}

export default function MealServiceModal({ isOpen, onClose, mealService, onSuccess }: Props) {
  const { addMealService, updateMealService } = useDataStore()
  const isEdit = !!mealService
  
  const [formData, setFormData] = useState({
    date: '',
    mealType: 'LUNCH',
    menuItems: '',
    price: 0,
    maxOrders: 100,
    isActive: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Initialize form data
  useEffect(() => {
    if (mealService) {
      setFormData({
        date: mealService.date.split('T')[0], // Convert to YYYY-MM-DD format
        mealType: mealService.mealType,
        menuItems: mealService.menuItems,
        price: mealService.price,
        maxOrders: mealService.maxOrders,
        isActive: mealService.isActive
      })
    } else {
      // Reset for create mode
      setFormData({
        date: '',
        mealType: 'LUNCH',
        menuItems: '',
        price: 0,
        maxOrders: 100,
        isActive: true
      })
    }
  }, [mealService, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : 
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
      const schema = isEdit ? updateMealServiceSchema : mealServiceSchema
      const validatedData = schema.parse(formData) as MealServiceInput | UpdateMealServiceInput

      // Send request
      const url = isEdit ? `/api/meals/${mealService!.id}` : '/api/meals'
      const method = isEdit ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      })

      const result = await response.json()

      if (result.success) {
        // Update local store
        if (isEdit) {
          updateMealService(mealService!.id, result.data)
        } else {
          addMealService(result.data)
        }
        
        onSuccess?.()
        onClose()
      } else {
        setErrors({ general: result.error || 'خطا در انجام عملیات' })
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
        console.error('Meal service error:', error)
        setErrors({ general: 'خطای داخلی سرور' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setErrors({})
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? 'ویرایش سرویس غذا' : 'افزودن سرویس غذا'}
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

          {/* Date and Meal Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                تاریخ *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.date ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>

            <div>
              <label htmlFor="mealType" className="block text-sm font-medium text-gray-700 mb-2">
                نوع وعده *
              </label>
              <select
                id="mealType"
                name="mealType"
                value={formData.mealType}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.mealType ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="BREAKFAST">صبحانه</option>
                <option value="LUNCH">ناهار</option>
                <option value="SNACK">میان‌وعده</option>
              </select>
              {errors.mealType && <p className="text-red-500 text-xs mt-1">{errors.mealType}</p>}
            </div>
          </div>

          {/* Menu Items */}
          <div>
            <label htmlFor="menuItems" className="block text-sm font-medium text-gray-700 mb-2">
              آیتم‌های منو *
            </label>
            <textarea
              id="menuItems"
              name="menuItems"
              rows={3}
              value={formData.menuItems}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.menuItems ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
              placeholder="مثال: خورش قیمه با برنج، سالاد شیرازی، ماست، نوشیدنی"
            />
            {errors.menuItems && <p className="text-red-500 text-xs mt-1">{errors.menuItems}</p>}
          </div>

          {/* Price and Max Orders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                قیمت (تومان) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min={0}
                step={1000}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.price ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
                placeholder="0"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>

            <div>
              <label htmlFor="maxOrders" className="block text-sm font-medium text-gray-700 mb-2">
                حداکثر سفارش *
              </label>
              <input
                type="number"
                id="maxOrders"
                name="maxOrders"
                value={formData.maxOrders}
                onChange={handleChange}
                min={1}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.maxOrders ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
                placeholder="100"
              />
              {errors.maxOrders && <p className="text-red-500 text-xs mt-1">{errors.maxOrders}</p>}
            </div>
          </div>

          {/* Status (only for edit mode) */}
          {isEdit && (
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
          )}

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
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'در حال ذخیره...' : (isEdit ? 'ذخیره تغییرات' : 'ایجاد سرویس')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
