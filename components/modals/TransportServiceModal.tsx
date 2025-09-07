'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useDataStore } from '@/lib/stores/dataStore'
import { transportServiceSchema, updateTransportServiceSchema, TransportServiceInput, UpdateTransportServiceInput } from '@/lib/validation/schemas'
import { z } from 'zod'

interface Props {
  isOpen: boolean
  onClose: () => void
  transportService?: {
    id: number
    routeName: string
    driverName: string
    vehicleNumber: string
    capacity: number
    pickupTime: string
    dropoffTime: string
    pickupPoints: string
    monthlyFee: number
    isActive: boolean
  }
  onSuccess?: () => void
}

export default function TransportServiceModal({ isOpen, onClose, transportService, onSuccess }: Props) {
  const { addTransportService, updateTransportService } = useDataStore()
  const isEdit = !!transportService
  
  const [formData, setFormData] = useState({
    routeName: '',
    driverName: '',
    vehicleNumber: '',
    capacity: 20,
    pickupTime: '',
    dropoffTime: '',
    pickupPoints: '',
    monthlyFee: 0,
    isActive: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Initialize form data
  useEffect(() => {
    if (transportService) {
      setFormData({
        routeName: transportService.routeName,
        driverName: transportService.driverName,
        vehicleNumber: transportService.vehicleNumber,
        capacity: transportService.capacity,
        pickupTime: transportService.pickupTime,
        dropoffTime: transportService.dropoffTime,
        pickupPoints: transportService.pickupPoints,
        monthlyFee: transportService.monthlyFee,
        isActive: transportService.isActive
      })
    } else {
      // Reset for create mode
      setFormData({
        routeName: '',
        driverName: '',
        vehicleNumber: '',
        capacity: 20,
        pickupTime: '',
        dropoffTime: '',
        pickupPoints: '',
        monthlyFee: 0,
        isActive: true
      })
    }
  }, [transportService, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const schema = isEdit ? updateTransportServiceSchema : transportServiceSchema
      const validatedData = schema.parse(formData) as TransportServiceInput | UpdateTransportServiceInput

      // Send request
      const url = isEdit ? `/api/transport/${transportService!.id}` : '/api/transport'
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
          updateTransportService(transportService!.id, result.data)
        } else {
          addTransportService(result.data)
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
        console.error('Transport service error:', error)
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
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? 'ویرایش سرویس حمل‌ونقل' : 'افزودن سرویس حمل‌ونقل'}
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

          {/* Route Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="routeName" className="block text-sm font-medium text-gray-700 mb-2">
                نام مسیر *
              </label>
              <input
                type="text"
                id="routeName"
                name="routeName"
                value={formData.routeName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.routeName ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
                placeholder="مثال: مسیر شمال شهر"
              />
              {errors.routeName && <p className="text-red-500 text-xs mt-1">{errors.routeName}</p>}
            </div>

            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                ظرفیت *
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
                placeholder="20"
              />
              {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
            </div>
          </div>

          {/* Driver Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="driverName" className="block text-sm font-medium text-gray-700 mb-2">
                نام راننده *
              </label>
              <input
                type="text"
                id="driverName"
                name="driverName"
                value={formData.driverName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.driverName ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
                placeholder="نام و نام خانوادگی راننده"
              />
              {errors.driverName && <p className="text-red-500 text-xs mt-1">{errors.driverName}</p>}
            </div>

            <div>
              <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700 mb-2">
                شماره خودرو *
              </label>
              <input
                type="text"
                id="vehicleNumber"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.vehicleNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
                placeholder="مثال: 12ط345-14"
              />
              {errors.vehicleNumber && <p className="text-red-500 text-xs mt-1">{errors.vehicleNumber}</p>}
            </div>
          </div>

          {/* Time Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700 mb-2">
                زمان جمع‌آوری *
              </label>
              <input
                type="time"
                id="pickupTime"
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.pickupTime ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.pickupTime && <p className="text-red-500 text-xs mt-1">{errors.pickupTime}</p>}
            </div>

            <div>
              <label htmlFor="dropoffTime" className="block text-sm font-medium text-gray-700 mb-2">
                زمان رسیدن *
              </label>
              <input
                type="time"
                id="dropoffTime"
                name="dropoffTime"
                value={formData.dropoffTime}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.dropoffTime ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.dropoffTime && <p className="text-red-500 text-xs mt-1">{errors.dropoffTime}</p>}
            </div>
          </div>

          {/* Pickup Points */}
          <div>
            <label htmlFor="pickupPoints" className="block text-sm font-medium text-gray-700 mb-2">
              نقاط جمع‌آوری *
            </label>
            <textarea
              id="pickupPoints"
              name="pickupPoints"
              rows={3}
              value={formData.pickupPoints}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.pickupPoints ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
              placeholder="مثال: میدان آزادی، پارک شهر، مرکز خرید..."
            />
            {errors.pickupPoints && <p className="text-red-500 text-xs mt-1">{errors.pickupPoints}</p>}
          </div>

          {/* Monthly Fee */}
          <div>
            <label htmlFor="monthlyFee" className="block text-sm font-medium text-gray-700 mb-2">
              هزینه ماهانه (تومان) *
            </label>
            <input
              type="number"
              id="monthlyFee"
              name="monthlyFee"
              value={formData.monthlyFee}
              onChange={handleChange}
              min={0}
              step={10000}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.monthlyFee ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
              placeholder="0"
            />
            {errors.monthlyFee && <p className="text-red-500 text-xs mt-1">{errors.monthlyFee}</p>}
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
