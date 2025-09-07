'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/MainLayout'
import { 
  CurrencyDollarIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'
import { useToast } from '@/lib/toast/ToastProvider'

interface OverdueStudent {
  id: number
  name: string
  studentId: string
  class: string
  overdueAmount: number
  overduePayments: number
}

interface FinancialData {
  overduePaymentsCount: number
  overdueStudentsCount: number
  overdueStudents: OverdueStudent[]
}

export default function Financial() {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)
  const { info, warning } = useToast()

  useEffect(() => {
    fetchFinancialData()
  }, [])

  const fetchFinancialData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/financial/overdue-count')
      const result = await response.json()
      
      if (result.success && result.data) {
        setFinancialData(result.data)
      }
    } catch (error) {
      console.error('Error fetching financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `${englishToPersianNumbers(amount.toLocaleString())} تومان`
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="fade-in">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6">
                  <div className="h-16 bg-gray-100 rounded mb-4"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">مدیریت مالی</h1>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">پرداخت‌های معوقه</p>
                <p className="text-2xl font-bold text-red-600">
                  {englishToPersianNumbers(financialData?.overduePaymentsCount || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">دانش‌آموزان بدهکار</p>
                <p className="text-2xl font-bold text-orange-600">
                  {englishToPersianNumbers(financialData?.overdueStudentsCount || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">مجموع بدهی</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(
                    financialData?.overdueStudents.reduce((sum, student) => sum + student.overdueAmount, 0) || 0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Overdue Students List */}
        <div className="bg-white rounded-xl card-shadow border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">دانش‌آموزان دارای شهریه معوقه</h2>
            {financialData && financialData.overdueStudentsCount > 0 && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {englishToPersianNumbers(financialData.overdueStudentsCount)} نفر
              </span>
            )}
          </div>
          
          {!financialData || financialData.overdueStudents.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">وضعیت مالی عالی!</h3>
              <p className="text-gray-600">همه شهریه‌ها پرداخت شده است.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {financialData.overdueStudents.map((student) => (
                <div key={student.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{student.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>شماره: {englishToPersianNumbers(student.studentId)}</span>
                          <span>کلاس: {student.class}</span>
                          <span className="text-red-600">
                            {englishToPersianNumbers(student.overduePayments)} قسط معوقه
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-bold text-red-600">
                        {formatCurrency(student.overdueAmount)}
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                        مشاهده جزئیات
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => info('قابلیت ثبت پرداخت در دست توسعه است')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors"
          >
            <CurrencyDollarIcon className="h-8 w-8 mx-auto mb-2" />
            <span className="block font-medium">ثبت پرداخت</span>
          </button>
          
          <button 
            onClick={() => info('قابلیت گزارش‌گیری پرداخت‌ها در دست توسعه است')}
            className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center transition-colors"
          >
            <CheckCircleIcon className="h-8 w-8 mx-auto mb-2" />
            <span className="block font-medium">گزارش پرداخت‌ها</span>
          </button>
          
          <button 
            onClick={() => info('قابلیت یادآوری پرداخت در دست توسعه است')}
            className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center transition-colors"
          >
            <ClockIcon className="h-8 w-8 mx-auto mb-2" />
            <span className="block font-medium">یادآوری پرداخت</span>
          </button>
          
          <button 
            onClick={() => info('قابلیت مدیریت شهریه در دست توسعه است')}
            className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-lg text-center transition-colors"
          >
            <UserIcon className="h-8 w-8 mx-auto mb-2" />
            <span className="block font-medium">مدیریت شهریه</span>
          </button>
        </div>
      </div>
    </MainLayout>
  )
}
