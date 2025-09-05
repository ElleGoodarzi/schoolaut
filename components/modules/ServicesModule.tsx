'use client'

import { useState, useEffect } from 'react'
import { 
  TruckIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'

interface ServiceAssignment {
  id: number
  type: 'MEAL' | 'TRANSPORT'
  isActive: boolean
  startDate: string
  endDate?: string
  details: {
    mealType?: 'BREAKFAST' | 'LUNCH' | 'SNACK'
    route?: string
    pickupTime?: string
    dropoffTime?: string
    pickupLocation?: string
    driverName?: string
    vehicleNumber?: string
  }
}

interface ServicesModuleProps {
  studentId: number
  showTitle?: boolean
  compact?: boolean
}

export default function ServicesModule({ 
  studentId, 
  showTitle = true,
  compact = false 
}: ServicesModuleProps) {
  const [services, setServices] = useState<ServiceAssignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServicesData()
  }, [studentId])

  const fetchServicesData = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/services/student/${studentId}/assignments`)
      
      if (response.ok) {
        const result = await response.json()
        setServices(result.data?.assignments || [])
      }
    } catch (error) {
      console.error('Error fetching services data:', error)
      // Mock data for development
      setServices([
        {
          id: 1,
          type: 'MEAL',
          isActive: true,
          startDate: '2024-01-01',
          details: {
            mealType: 'LUNCH'
          }
        },
        {
          id: 2,
          type: 'TRANSPORT',
          isActive: true,
          startDate: '2024-01-01',
          details: {
            route: 'مسیر شمال شهر',
            pickupTime: '07:30',
            dropoffTime: '13:30',
            pickupLocation: 'میدان آزادی',
            driverName: 'آقای احمدی',
            vehicleNumber: 'ایران ۱۲-۳۴۵ الف ۶۷'
          }
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getMealTypeText = (type?: string) => {
    switch (type) {
      case 'BREAKFAST': return 'صبحانه'
      case 'LUNCH': return 'ناهار'
      case 'SNACK': return 'میان‌وعده'
      default: return 'غذا'
    }
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'MEAL':
        return <ClockIcon className="w-8 h-8 text-green-600" />
      case 'TRANSPORT':
        return <TruckIcon className="w-8 h-8 text-blue-600" />
      default:
        return null
    }
  }

  const getServiceColor = (type: string) => {
    switch (type) {
      case 'MEAL': return 'bg-green-50 border-green-200'
      case 'TRANSPORT': return 'bg-blue-50 border-blue-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {services.filter(s => s.isActive).map((service) => (
          <div key={service.id} className={`border rounded-lg p-3 ${getServiceColor(service.type)}`}>
            <div className="flex items-center gap-2">
              {service.type === 'MEAL' ? (
                <ClockIcon className="w-5 h-5 text-green-600" />
              ) : (
                <TruckIcon className="w-5 h-5 text-blue-600" />
              )}
              <span className="text-sm font-medium">
                {service.type === 'MEAL' 
                  ? getMealTypeText(service.details.mealType)
                  : 'سرویس'
                }
              </span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-900">سرویس‌ها و خدمات</h3>
      )}

      {services.length === 0 ? (
        <div className="text-center py-8">
          <TruckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">هیچ سرویسی برای این دانش‌آموز ثبت نشده است.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div 
              key={service.id} 
              className={`border rounded-lg p-6 ${getServiceColor(service.type)} ${
                !service.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                {getServiceIcon(service.type)}
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {service.type === 'MEAL' ? 'سرویس غذا' : 'سرویس مدرسه'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {service.isActive ? 'فعال' : 'غیرفعال'} • 
                    از {new Date(service.startDate).toLocaleDateString('fa-IR')}
                    {service.endDate && ` تا ${new Date(service.endDate).toLocaleDateString('fa-IR')}`}
                  </p>
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-3">
                {service.type === 'MEAL' && service.details.mealType && (
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      نوع وعده: {getMealTypeText(service.details.mealType)}
                    </span>
                  </div>
                )}

                {service.type === 'TRANSPORT' && (
                  <>
                    {service.details.route && (
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">مسیر: {service.details.route}</span>
                      </div>
                    )}

                    {service.details.pickupLocation && (
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">محل سوار شدن: {service.details.pickupLocation}</span>
                      </div>
                    )}

                    {service.details.pickupTime && (
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm persian-numbers">
                          ساعت رفت: {englishToPersianNumbers(service.details.pickupTime)}
                        </span>
                      </div>
                    )}

                    {service.details.dropoffTime && (
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm persian-numbers">
                          ساعت برگشت: {englishToPersianNumbers(service.details.dropoffTime)}
                        </span>
                      </div>
                    )}

                    {service.details.driverName && (
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">راننده: {service.details.driverName}</span>
                      </div>
                    )}

                    {service.details.vehicleNumber && (
                      <div className="flex items-center gap-2">
                        <TruckIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm persian-numbers">
                          شماره خودرو: {englishToPersianNumbers(service.details.vehicleNumber)}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                <button className="flex-1 bg-white hover:bg-gray-50 text-gray-700 py-2 px-3 rounded-md text-sm font-medium transition-colors border border-gray-200">
                  ویرایش
                </button>
                <button className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  service.isActive 
                    ? 'bg-red-100 hover:bg-red-200 text-red-700'
                    : 'bg-green-100 hover:bg-green-200 text-green-700'
                }`}>
                  {service.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Service */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
        <TruckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h4 className="font-medium text-gray-900 mb-2">افزودن سرویس جدید</h4>
        <p className="text-sm text-gray-600 mb-4">
          سرویس غذا یا حمل و نقل جدیدی برای این دانش‌آموز اضافه کنید
        </p>
        <div className="flex gap-3 justify-center">
          <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
            افزودن سرویس غذا
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
            افزودن سرویس حمل و نقل
          </button>
        </div>
      </div>
    </div>
  )
}
