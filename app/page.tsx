'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import AnnouncementCard from '@/components/AnnouncementCard'
import { AcademicCapIcon, UserGroupIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'

interface DashboardStats {
  totalStudents: number
  presentToday: number
  absentToday: number
  lateToday: number
  overduePayments: number
  activeClasses: number
  activeTeachers: number
  todayMealOrders: number
  activeMealServices: number
}

interface Alert {
  type: string
  severity: 'high' | 'medium' | 'low'
  title: string
  message: string
  count: number
  details?: Array<{
    name: string
    overdueAmount?: number
    absenceCount?: number
  }>
}

interface Announcement {
  id: number
  title: string
  content: string
  priority: 'high' | 'medium' | 'low'
  author: string
  date: string
  targetAudience: string
}

// Helper Components
function StatCard({ title, value, icon, color, subtitle }: {
  title: string
  value: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'yellow' | 'red'
  subtitle?: string
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  }

  return (
    <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 persian-numbers">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function AlertCard({ alert }: { alert: Alert }) {
  const severityColors = {
    high: 'bg-red-50 border-red-200 text-red-800',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    low: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  return (
    <div className={`p-3 rounded-lg border ${severityColors[alert.severity]}`}>
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-medium text-sm">{alert.title}</h4>
        <span className="text-xs font-medium persian-numbers">
          {englishToPersianNumbers(alert.count)}
        </span>
      </div>
      <p className="text-xs opacity-90">{alert.message}</p>
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      console.log('🔄 Starting simple fetch...')
      const response = await fetch('/api/dashboard/refresh')
      console.log('📡 Response:', response.status, response.ok)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('📊 Result:', result)
      
      setData(result)
    } catch (err) {
      console.error('❌ Error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      console.log('✅ Finished')
      setLoading(false)
    }
  }

  // Extract data from API response
  const stats = data?.data || {}
  const alerts = data?.data?.alerts || []
  const announcements = data?.data?.recentAnnouncements || []

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'attendance':
        router.push('/attendance/today')
        break
      case 'announcement':
        setShowAnnouncementModal(true)
        break
      case 'financial':
        router.push('/financial/reports')
        break
      default:
        break
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="fade-in flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
          </div>
        </div>
      </MainLayout>
    )
  }
  return (
    <MainLayout>
      <div className="fade-in">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">داشبورد مدیریت</h1>
              <p className="text-gray-600">خلاصه‌ای از وضعیت فعلی مدرسه دبستان مهرآیین</p>
            </div>
            <button
              onClick={() => fetchDashboardData()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              بروزرسانی
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="کل دانش‌آموزان"
            value={englishToPersianNumbers(stats?.totalStudents || 0)}
            icon={<AcademicCapIcon className="w-6 h-6" />}
            color="blue"
            subtitle={`در ${englishToPersianNumbers(stats?.activeClasses || 0)} کلاس`}
          />
          
          <StatCard
            title="حضور امروز"
            value={englishToPersianNumbers(stats?.presentToday || 0)}
            icon={<UserGroupIcon className="w-6 h-6" />}
            color="green"
            subtitle={`${englishToPersianNumbers(
              stats?.totalStudents ? Math.round((stats.presentToday / stats.totalStudents) * 100) : 0
            )}٪ حضور`}
          />
          
          <StatCard
            title="غیبت امروز"
            value={englishToPersianNumbers(stats?.absentToday || 0)}
            icon={<ClockIcon className="w-6 h-6" />}
            color="yellow"
            subtitle={`${englishToPersianNumbers(stats?.lateToday || 0)} تأخیر`}
          />
          
          <StatCard
            title="شهریه معوقه"
            value={englishToPersianNumbers(stats?.overduePayments || 0)}
            icon={<CurrencyDollarIcon className="w-6 h-6" />}
            color="red"
            subtitle="نیاز به پیگیری"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Announcements */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">آخرین اطلاعیه‌ها</h2>
                <button 
                  onClick={() => router.push('/announcements')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  مشاهده همه
                </button>
              </div>
              
              <div className="space-y-4">
                {announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <AnnouncementCard 
                      key={announcement.id} 
                      announcement={announcement} 
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>هیچ اطلاعیه‌ای موجود نیست</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats & Actions */}
          <div className="space-y-6">
            {/* Today's Summary */}
            <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">خلاصه امروز</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">کلاس‌های فعال</span>
                  <span className="font-semibold text-gray-900 persian-numbers">
                    {englishToPersianNumbers(stats?.activeClasses || 0)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">معلمان حاضر</span>
                  <span className="font-semibold text-gray-900 persian-numbers">
                    {englishToPersianNumbers(stats?.activeTeachers || 0)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">وعده‌های غذا</span>
                  <span className="font-semibold text-gray-900 persian-numbers">
                    {englishToPersianNumbers(stats?.todayMealOrders || 0)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">سرویس‌های فعال</span>
                  <span className="font-semibold text-gray-900 persian-numbers">
                    {englishToPersianNumbers(stats?.activeMealServices || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">هشدارها</h3>
              
              <div className="space-y-3">
                {alerts.length > 0 ? (
                  alerts.map((alert, index) => (
                    <AlertCard key={index} alert={alert} />
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">هیچ هشداری موجود نیست</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">دسترسی سریع</h3>
              
              <div className="space-y-3">
                <button 
                  onClick={() => handleQuickAction('attendance')}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                >
                  ثبت حضور و غیاب
                </button>
                
                <button 
                  onClick={() => handleQuickAction('announcement')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  ارسال اطلاعیه جدید
                </button>
                
                <button 
                  onClick={() => handleQuickAction('financial')}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                >
                  گزارش مالی
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Announcement Modal */}
        {showAnnouncementModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">ارسال اطلاعیه جدید</h3>
                <button
                  onClick={() => setShowAnnouncementModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  title="بستن"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                این بخش در حال توسعه است. برای ارسال اطلاعیه جدید به بخش اطلاعیه‌ها مراجعه کنید.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAnnouncementModal(false)
                    router.push('/announcements/new')
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  رفتن به بخش اطلاعیه‌ها
                </button>
                <button
                  onClick={() => setShowAnnouncementModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
