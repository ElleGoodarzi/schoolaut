'use client'

import { useState } from 'react'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'حذف',
  cancelText = 'لغو',
  type = 'danger'
}: Props) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const colorClasses = {
    danger: {
      bg: 'bg-red-50',
      icon: 'text-red-400',
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    },
    warning: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-400',
      button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
    },
    info: {
      bg: 'bg-blue-50',
      icon: 'text-blue-400',
      button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    }
  }

  const colors = colorClasses[type]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className={`flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full ${colors.bg}`}>
              <ExclamationTriangleIcon className={`w-6 h-6 ${colors.icon}`} />
            </div>
            <h3 className="mr-3 text-lg font-medium text-gray-900">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 space-x-reverse p-6 pt-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${colors.button}`}
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                در حال حذف...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
