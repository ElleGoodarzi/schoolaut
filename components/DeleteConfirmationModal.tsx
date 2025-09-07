'use client'

import { useState } from 'react'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title: string
  message: string
  itemName: string
  warnings?: string[]
  destructiveData?: {
    attendanceRecords?: number
    paymentRecords?: number
    classCount?: number
  }
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  warnings = [],
  destructiveData
}: DeleteConfirmationModalProps) {
  const [loading, setLoading] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleConfirm = async () => {
    if (confirmText !== 'حذف') {
      return
    }

    try {
      setLoading(true)
      await onConfirm()
      onClose()
      setConfirmText('')
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      setConfirmText('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 ml-2" />
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-2">{message}</p>
            <p className="font-medium text-gray-900">"{itemName}"</p>
          </div>

          {/* Show destructive data impact */}
          {destructiveData && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-red-800 mb-2">⚠️ داده‌های مرتبط که حذف خواهند شد:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {destructiveData.attendanceRecords && (
                  <li>• {destructiveData.attendanceRecords} رکورد حضور و غیاب</li>
                )}
                {destructiveData.paymentRecords && (
                  <li>• {destructiveData.paymentRecords} رکورد مالی</li>
                )}
                {destructiveData.classCount && (
                  <li>• {destructiveData.classCount} کلاس تحت مدیریت</li>
                )}
              </ul>
            </div>
          )}

          {/* Show warnings */}
          {warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ هشدارها:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-3">
              این عملیات قابل بازگشت نیست. برای تأیید حذف، کلمه "حذف" را تایپ کنید:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="حذف"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
              dir="rtl"
            />
          </div>

          <div className="flex justify-end space-x-3 space-x-reverse">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              لغو
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || confirmText !== 'حذف'}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent ml-2"></div>
                  در حال حذف...
                </>
              ) : (
                'حذف قطعی'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
