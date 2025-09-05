'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import UniversalCard from '@/components/shared/UniversalCard'
import { useStudentData } from '@/lib/hooks/useStudentData'
import { useAlertSystem } from '@/lib/alerts/useAlertSystem'
import { ContextualNavigation } from '@/lib/navigation/contextualNavigation'
import { 
  CurrencyDollarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserIcon,
  PhoneIcon,
  DocumentIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'

interface FinancialSummary {
  totalOverdue: number
  overdueStudentsCount: number
  totalCollected: number
  paymentsToday: number
}

export default function EnhancedFinancial() {
  const router = useRouter()
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Use unified student data with financial context
  const { 
    students: overdueStudents, 
    loading: studentsLoading 
  } = useStudentData({
    context: 'financial',
    includeRelations: true,
    filters: { hasFinancialIssues: true }
  })

  const { createAlert } = useAlertSystem()

  useEffect(() => {
    fetchFinancialSummary()
  }, [])

  const fetchFinancialSummary = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/financial/summary')
      const result = await response.json()
      
      if (result.success && result.data) {
        setFinancialSummary(result.data)
      }
    } catch (error) {
      console.error('Error fetching financial summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `${englishToPersianNumbers(amount.toLocaleString())} تومان`
  }

  // Handle student card click with contextual navigation
  const handleStudentClick = (studentId: number) => {
    const navigation = ContextualNavigation.getFinancialIssueNavigation(studentId)
    router.push(navigation.studentProfile)
  }

  // Handle payment reminder
  const handlePaymentReminder = async (studentId: number) => {
    try {
      const response = await fetch('/api/communications/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          type: 'payment_reminder'
        })
      })

      if (response.ok) {
        // Create alert for successful reminder
        await createAlert({
          type: 'communication',
          severity: 'low',
          title: 'یادآوری ارسال شد',
          message: 'پیام یادآوری پرداخت برای والدین ارسال شد',
          count: 1,
          actionable: false
        })
      }
    } catch (error) {
      console.error('Error sending reminder:', error)
    }
  }

  if (loading || studentsLoading) {
    return (
      <MainLayout>
        <div className="fade-in">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6">
                  <div className="h-16 bg-gray-100 rounded mb-4"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                </div>
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
        {/* Header with contextual actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">مدیریت مالی</h1>
            <p className="text-gray-600 mt-1">
              مدیریت شهریه، پرداخت‌ها و ارتباط با والدین
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => router.push('/financial/reports')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              گزارش مالی
            </button>
            <button 
              onClick={() => router.push('/financial/payments/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              ثبت پرداخت جدید
            </button>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <UniversalCard
            title="کل مطالبات معوقه"
            subtitle={formatCurrency(financialSummary?.totalOverdue || 0)}
            icon={<ExclamationTriangleIcon className="w-6 h-6" />}
            iconColor="text-red-600"
            iconBackground="bg-red-100"
            stats={[{
              label: 'دانش‌آموزان بدهکار',
              value: overdueStudents.length,
              color: 'red'
            }]}
            context="financial"
          />

          <UniversalCard
            title="مبلغ دریافتی امروز"
            subtitle={formatCurrency(financialSummary?.totalCollected || 0)}
            icon={<CheckCircleIcon className="w-6 h-6" />}
            iconColor="text-green-600"
            iconBackground="bg-green-100"
            stats={[{
              label: 'پرداخت‌های امروز',
              value: financialSummary?.paymentsToday || 0,
              color: 'green'
            }]}
            context="financial"
          />

          <UniversalCard
            title="وضعیت کلی"
            subtitle={`${Math.round(((overdueStudents.length || 1) / (financialSummary?.overdueStudentsCount || 1)) * 100)}% پرداخت شده`}
            icon={<CurrencyDollarIcon className="w-6 h-6" />}
            iconColor="text-blue-600"
            iconBackground="bg-blue-100"
            alerts={overdueStudents.length > 10 ? [{
              type: 'warning',
              message: 'تعداد زیادی بدهکار',
              count: overdueStudents.length
            }] : []}
          />

          <UniversalCard
            title="عملکرد ماهانه"
            subtitle="۸۵% هدف"
            icon={<DocumentIcon className="w-6 h-6" />}
            iconColor="text-purple-600"
            iconBackground="bg-purple-100"
            actions={[{
              label: 'مشاهده گزارش',
              url: '/financial/reports/monthly',
              style: 'secondary'
            }]}
          />
        </div>

        {/* Students with Financial Issues */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              دانش‌آموزان دارای مطالبات معوقه
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {englishToPersianNumbers(overdueStudents.length)} نفر
              </span>
              <button 
                onClick={() => router.push('/students?filter=financial_issues')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                مشاهده همه
              </button>
            </div>
          </div>

          {overdueStudents.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">وضعیت مالی عالی!</h3>
              <p className="text-gray-600">همه شهریه‌ها پرداخت شده است.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {overdueStudents.slice(0, 6).map((student) => (
                <UniversalCard
                  key={student.id}
                  title={`${student.firstName} ${student.lastName}`}
                  subtitle={`شماره: ${englishToPersianNumbers(student.studentId)} • کلاس: ${englishToPersianNumbers(student.grade)}${student.section}`}
                  description={student.class?.teacher ? `معلم: ${student.class.teacher.firstName} ${student.class.teacher.lastName}` : undefined}
                  icon={<UserIcon className="w-6 h-6" />}
                  iconColor="text-red-600"
                  iconBackground="bg-red-100"
                  stats={[
                    {
                      label: 'مبلغ بدهی',
                      value: formatCurrency(student.financialInfo?.overdueAmount || 0),
                      color: 'red'
                    },
                    {
                      label: 'اقساط معوقه', 
                      value: student.financialInfo?.overduePayments || 0,
                      color: 'red'
                    }
                  ]}
                  alerts={[
                    ...(student.financialInfo?.overdueAmount && student.financialInfo.overdueAmount > 500000 ? [{
                      type: 'error' as const,
                      message: 'بدهی بالا',
                      count: 1
                    }] : []),
                    ...(student.attendanceInfo && student.attendanceInfo.attendanceRate < 75 ? [{
                      type: 'warning' as const,
                      message: 'مشکل حضور',
                      count: 1
                    }] : [])
                  ]}
                  actions={[
                    {
                      label: 'مشاهده پروفایل',
                      onClick: () => handleStudentClick(student.id),
                      style: 'primary'
                    },
                    {
                      label: 'ثبت پرداخت',
                      url: `/financial/payments/new?studentId=${student.id}`,
                      style: 'secondary'
                    },
                    {
                      label: 'یادآوری والدین',
                      onClick: () => handlePaymentReminder(student.id),
                      style: 'secondary'
                    }
                  ]}
                  clickable={true}
                  onClick={() => handleStudentClick(student.id)}
                  context="financial"
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <UniversalCard
            title="ثبت پرداخت"
            description="ثبت پرداخت جدید یا به‌روزرسانی وضعیت"
            icon={<CurrencyDollarIcon className="w-8 h-8" />}
            iconColor="text-blue-600"
            iconBackground="bg-blue-100"
            clickable={true}
            onClick={() => router.push('/financial/payments/new')}
          />
          
          <UniversalCard
            title="گزارش پرداخت‌ها"
            description="مشاهده گزارش‌های مالی و آماری"
            icon={<DocumentIcon className="w-8 h-8" />}
            iconColor="text-green-600"
            iconBackground="bg-green-100"
            clickable={true}
            onClick={() => router.push('/financial/reports')}
          />
          
          <UniversalCard
            title="یادآوری دسته‌ای"
            description="ارسال یادآوری به همه والدین بدهکار"
            icon={<PhoneIcon className="w-8 h-8" />}
            iconColor="text-purple-600"
            iconBackground="bg-purple-100"
            clickable={true}
            onClick={() => router.push('/communications/bulk?template=payment_reminder')}
          />
          
          <UniversalCard
            title="تنظیمات شهریه"
            description="مدیریت نرخ‌ها و تاریخ‌های سررسید"
            icon={<CogIcon className="w-8 h-8" />}
            iconColor="text-gray-600"
            iconBackground="bg-gray-100"
            clickable={true}
            onClick={() => router.push('/management?tab=tuition-settings')}
          />
        </div>
      </div>
    </MainLayout>
  )
}