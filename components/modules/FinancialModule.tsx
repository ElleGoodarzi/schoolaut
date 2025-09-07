'use client'

import { useState, useEffect } from 'react'
import { 
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'
import { useToast } from '@/lib/toast/ToastProvider'

interface PaymentRecord {
  id: number
  amount: number
  dueDate: string
  paidDate?: string
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  type: 'TUITION' | 'MEAL' | 'TRANSPORT' | 'ACTIVITY' | 'OTHER'
  description: string
}

interface FinancialSummary {
  totalOwed: number
  totalPaid: number
  overdueAmount: number
  overdueCount: number
  nextDueDate?: string
  nextDueAmount?: number
}

interface FinancialModuleProps {
  studentId: number
  highlightField?: string
  showTitle?: boolean
  compact?: boolean
}

export default function FinancialModule({ 
  studentId, 
  highlightField,
  showTitle = true,
  compact = false 
}: FinancialModuleProps) {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAllPayments, setShowAllPayments] = useState(false)
  const { info } = useToast()

  useEffect(() => {
    fetchFinancialData()
  }, [studentId])

  const fetchFinancialData = async () => {
    try {
      setLoading(true)
      
      // Fetch payment records
      const paymentsResponse = await fetch(`/api/financial/student/${studentId}/payments`)
      
      // Fetch financial summary
      const summaryResponse = await fetch(`/api/financial/student/${studentId}/summary`)
      
      if (paymentsResponse.ok) {
        const paymentsResult = await paymentsResponse.json()
        setPayments(paymentsResult.data?.payments || [])
      }
      
      if (summaryResponse.ok) {
        const summaryResult = await summaryResponse.json()
        setSummary(summaryResult.data?.summary || null)
      }
    } catch (error) {
      console.error('Error fetching financial data:', error)
      // Mock data for development
      setSummary({
        totalOwed: 7500000,
        totalPaid: 5000000,
        overdueAmount: 2500000,
        overdueCount: 1,
        nextDueDate: '2024-02-01',
        nextDueAmount: 2500000
      })
      
      setPayments([
        {
          id: 1,
          amount: 2500000,
          dueDate: '2024-01-01',
          paidDate: '2024-01-15',
          status: 'PAID',
          type: 'TUITION',
          description: 'شهریه دی ماه'
        },
        {
          id: 2,
          amount: 2500000,
          dueDate: '2023-12-01',
          status: 'OVERDUE',
          type: 'TUITION',
          description: 'شهریه آذر ماه'
        },
        {
          id: 3,
          amount: 500000,
          dueDate: '2024-01-15',
          paidDate: '2024-01-10',
          status: 'PAID',
          type: 'MEAL',
          description: 'هزینه غذای دی ماه'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `${englishToPersianNumbers(amount.toLocaleString())} تومان`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case 'OVERDUE':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
      case 'PENDING':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />
      case 'CANCELLED':
        return <DocumentTextIcon className="w-5 h-5 text-gray-600" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID': return 'پرداخت شده'
      case 'OVERDUE': return 'معوقه'
      case 'PENDING': return 'در انتظار پرداخت'
      case 'CANCELLED': return 'لغو شده'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'text-green-600 bg-green-50 border-green-200'
      case 'OVERDUE': return 'text-red-600 bg-red-50 border-red-200'
      case 'PENDING': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'CANCELLED': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'TUITION': return 'شهریه'
      case 'MEAL': return 'غذا'
      case 'TRANSPORT': return 'سرویس'
      case 'ACTIVITY': return 'فعالیت'
      case 'OTHER': return 'سایر'
      default: return type
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  if (compact && summary) {
    return (
      <div className={`${highlightField === 'overdue' ? 'ring-2 ring-red-400 rounded-lg p-2' : ''}`}>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-red-600 persian-numbers">
              {formatCurrency(summary.overdueAmount)}
            </div>
            <div className="text-sm text-gray-600">بدهی معوقه</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600 persian-numbers">
              {formatCurrency(summary.totalPaid)}
            </div>
            <div className="text-sm text-gray-600">پرداخت شده</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${highlightField === 'overdue' ? 'ring-2 ring-red-400 rounded-lg p-4' : ''}`}>
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-900">وضعیت مالی</h3>
      )}

      {/* Financial Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <CurrencyDollarIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-blue-600 persian-numbers">
              {formatCurrency(summary.totalOwed)}
            </div>
            <div className="text-sm text-gray-600">کل بدهی</div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-green-600 persian-numbers">
              {formatCurrency(summary.totalPaid)}
            </div>
            <div className="text-sm text-gray-600">پرداخت شده</div>
          </div>

          <div className={`rounded-lg p-4 text-center border ${
            summary.overdueAmount > 0 
              ? 'bg-red-50 border-red-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <ExclamationTriangleIcon className={`w-8 h-8 mx-auto mb-2 ${
              summary.overdueAmount > 0 ? 'text-red-600' : 'text-gray-400'
            }`} />
            <div className={`text-lg font-bold persian-numbers ${
              summary.overdueAmount > 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {formatCurrency(summary.overdueAmount)}
            </div>
            <div className="text-sm text-gray-600">معوقه</div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <ClockIcon className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-yellow-600 persian-numbers">
              {summary.nextDueAmount ? formatCurrency(summary.nextDueAmount) : '---'}
            </div>
            <div className="text-sm text-gray-600">
              {summary.nextDueDate 
                ? `سررسید ${new Date(summary.nextDueDate).toLocaleDateString('fa-IR')}`
                : 'سررسید بعدی'
              }
            </div>
          </div>
        </div>
      )}

      {/* Overdue Alert */}
      {summary && summary.overdueAmount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-800">هشدار بدهی معوقه</h4>
              <p className="text-sm text-red-700">
                این دانش‌آموز {englishToPersianNumbers(summary.overdueCount)} فقره بدهی معوقه 
                به مبلغ {formatCurrency(summary.overdueAmount)} دارد.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Records */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">سوابق پرداخت</h4>
          {payments.length > 5 && (
            <button
              onClick={() => setShowAllPayments(!showAllPayments)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showAllPayments ? 'نمایش کمتر' : 'نمایش همه'}
            </button>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg overflow-hidden">
          {payments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <CurrencyDollarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p>سابقه پرداختی ثبت نشده است.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {(showAllPayments ? payments : payments.slice(0, 5)).map((payment) => (
                <div key={payment.id} className="p-4 hover:bg-white transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {payment.description}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getTypeText(payment.type)} • سررسید: {new Date(payment.dueDate).toLocaleDateString('fa-IR')}
                          {payment.paidDate && (
                            <span> • پرداخت: {new Date(payment.paidDate).toLocaleDateString('fa-IR')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 persian-numbers">
                        {formatCurrency(payment.amount)}
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button 
          onClick={() => info('ثبت پرداخت جدید در دست توسعه است')}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
        >
          ثبت پرداخت جدید
        </button>
        <button 
          onClick={() => info('گزارش مالی در دست توسعه است')}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
        >
          گزارش مالی
        </button>
      </div>
    </div>
  )
}
