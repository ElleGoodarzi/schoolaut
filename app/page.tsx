'use client'

import MainLayout from '@/components/MainLayout'
import StatCard from '@/components/StatCard'
import AnnouncementCard from '@/components/AnnouncementCard'
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

// Mock data - in a real app, this would come from an API
const mockAnnouncements = [
  {
    id: 1,
    title: 'تعطیلات نوروزی',
    content: 'با عرض تبریک سال نو، اطلاع می‌رساند که تعطیلات نوروزی از تاریخ ۲۹ اسفند آغاز می‌شود.',
    date: '۱۴۰۳/۱۲/۲۵',
    priority: 'high' as const,
    author: 'مدیریت مدرسه'
  },
  {
    id: 2,
    title: 'برنامه امتحانات پایان ترم',
    content: 'برنامه امتحانات نهایی ترم دوم از تاریخ ۱۵ خرداد شروع خواهد شد. دانش‌آموزان می‌توانند برنامه کامل را از سایت مدرسه دریافت کنند.',
    date: '۱۴۰۳/۱۲/۲۰',
    priority: 'medium' as const,
    author: 'معاونت آموزشی'
  },
  {
    id: 3,
    title: 'جلسه اولیا و مربیان',
    content: 'جلسه اولیا و مربیان کلاس‌های سوم و چهارم روز پنج‌شنبه ساعت ۱۶ برگزار خواهد شد.',
    date: '۱۴۰۳/۱۲/۱۸',
    priority: 'low' as const,
    author: 'مسئول روابط اولیا'
  }
]

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">داشبورد مدیریت</h1>
          <p className="text-gray-600">خلاصه‌ای از وضعیت فعلی مدرسه دبستان مهرآیین</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="کل دانش‌آموزان"
            value="۲۴۵"
            icon={<AcademicCapIcon className="w-6 h-6" />}
            color="blue"
            subtitle="در ۱۲ کلاس"
          />
          
          <StatCard
            title="حضور امروز"
            value="۲۳۲"
            icon={<UserGroupIcon className="w-6 h-6" />}
            color="green"
            subtitle="۹۴.۷٪ حضور"
          />
          
          <StatCard
            title="غیبت امروز"
            value="۱۳"
            icon={<ClockIcon className="w-6 h-6" />}
            color="yellow"
            subtitle="۵.۳٪ غیبت"
          />
          
          <StatCard
            title="شهریه معوقه"
            value="۱۸"
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
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  مشاهده همه
                </button>
              </div>
              
              <div className="space-y-4">
                {mockAnnouncements.map((announcement) => (
                  <AnnouncementCard 
                    key={announcement.id} 
                    announcement={announcement} 
                  />
                ))}
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
                  <span className="font-semibold text-gray-900">۱۲</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">معلمان حاضر</span>
                  <span className="font-semibold text-gray-900">۲۴</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">وعده‌های غذا</span>
                  <span className="font-semibold text-gray-900">۲۱۵</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">سرویس‌های فعال</span>
                  <span className="font-semibold text-gray-900">۸</span>
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">هشدارها</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">شهریه معوقه</p>
                    <p className="text-xs text-red-600">۱۸ دانش‌آموز شهریه معوقه دارند</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">غیبت مکرر</p>
                    <p className="text-xs text-yellow-600">۵ دانش‌آموز غیبت بالا دارند</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">دسترسی سریع</h3>
              
              <div className="space-y-3">
                <button className="w-full bg-white hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors border border-gray-200">
                  ثبت حضور و غیاب
                </button>
                
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                  ارسال اطلاعیه جدید
                </button>
                
                <button className="w-full bg-white hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors border border-gray-200">
                  گزارش مالی
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
