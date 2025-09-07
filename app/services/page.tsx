'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/MainLayout'
import StudentCard from '@/components/shared/cards/StudentCard'
import { 
  TruckIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'
import { useToast } from '@/lib/toast/ToastProvider'

interface ServiceData {
  totalMealsToday: number
  activeServicesCount: number
  mealServices: Array<{
    id: number
    mealType: string
    menuItems: string
    totalOrders: number
  }>
}

interface Student {
  id: number
  studentId: string
  firstName: string
  lastName: string
  grade: number
  section: string
  class: {
    grade: number
    section: string
    teacher: {
      firstName: string
      lastName: string
    }
  }
}

export default function Services() {
  const [serviceData, setServiceData] = useState<ServiceData | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'meals' | 'transport' | 'students'>('overview')
  const [loading, setLoading] = useState(true)
  const { info, warning } = useToast()

  useEffect(() => {
    fetchServiceData()
  }, [])

  const fetchServiceData = async () => {
    try {
      setLoading(true)
      
      const [mealsRes, studentsRes] = await Promise.all([
        fetch('/api/services/meals/today-count'),
        fetch('/api/students?limit=10') // Get sample students for service assignment
      ])
      
      const [mealsResult, studentsResult] = await Promise.all([
        mealsRes.json(),
        studentsRes.json()
      ])
      
      if (mealsResult.success && mealsResult.data) {
        setServiceData(mealsResult.data)
      }
      
      if (studentsResult.success && studentsResult.data.students) {
        setStudents(studentsResult.data.students)
      }
    } catch (error) {
      console.error('Error fetching service data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMealTypeLabel = (type: string) => {
    switch (type) {
      case 'BREAKFAST': return 'صبحانه'
      case 'LUNCH': return 'ناهار'
      case 'SNACK': return 'میان‌وعده'
      default: return type
    }
  }

  const tabs = [
    { id: 'overview', name: 'خلاصه سرویس‌ها', icon: ChartBarIcon },
    { id: 'meals', name: 'مدیریت غذا', icon: ClipboardDocumentListIcon },
    { id: 'transport', name: 'سرویس رفت و آمد', icon: TruckIcon },
    { id: 'students', name: 'تخصیص سرویس', icon: UserGroupIcon },
  ]

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
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">سرویس و غذا</h1>
          <button 
            onClick={() => info('قابلیت تخصیص سرویس در دست توسعه است')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            تخصیص سرویس جدید
          </button>
        </div>

        {/* Service Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ClipboardDocumentListIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">سفارش غذای امروز</p>
                <p className="text-2xl font-bold text-green-600">
                  {englishToPersianNumbers(serviceData?.totalMealsToday || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TruckIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">سرویس‌های فعال</p>
                <p className="text-2xl font-bold text-blue-600">
                  {englishToPersianNumbers(serviceData?.activeServicesCount || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">درآمد روزانه</p>
                <p className="text-2xl font-bold text-purple-600">
                  {englishToPersianNumbers((serviceData?.totalMealsToday || 0) * 15000)} تومان
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl card-shadow border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">خلاصه سرویس‌های امروز</h2>
                
                {serviceData?.mealServices && serviceData.mealServices.length > 0 ? (
                  <div className="grid gap-4">
                    {serviceData.mealServices.map((meal) => (
                      <div key={meal.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {getMealTypeLabel(meal.mealType)}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {meal.menuItems}
                            </p>
                          </div>
                          <div className="text-left">
                            <span className="text-lg font-bold text-green-600">
                              {englishToPersianNumbers(meal.totalOrders)}
                            </span>
                            <p className="text-xs text-gray-500">سفارش</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">سرویس غذایی برای امروز تعریف نشده است.</p>
                  </div>
                )}
              </div>
            )}

            {/* Meals Tab */}
            {activeTab === 'meals' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">مدیریت برنامه غذایی</h2>
                  <button 
                    onClick={() => info('قابلیت مدیریت منو در دست توسعه است')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    افزودن منو جدید
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">ویژگی‌های برنامه غذایی</h3>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>• تنظیم منوی روزانه و هفتگی</li>
                      <li>• مدیریت سفارشات دانش‌آموزان</li>
                      <li>• پیگیری پرداخت هزینه غذا</li>
                      <li>• گزارش‌گیری از مصرف غذا</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">عملکرد این هفته</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">میانگین سفارش روزانه:</span>
                        <span className="font-semibold text-green-600 mr-2">
                          {englishToPersianNumbers(180)} سفارش
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">رضایت دانش‌آموزان:</span>
                        <span className="font-semibold text-blue-600 mr-2">۸۵%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transport Tab */}
            {activeTab === 'transport' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">مدیریت سرویس رفت و آمد</h2>
                  <button 
                    onClick={() => info('قابلیت تعریف مسیر سرویس در دست توسعه است')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    تعریف مسیر جدید
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">مسیرهای فعال</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>مسیر شمال (ونک - نیاوران)</span>
                        <span className="text-blue-600 font-semibold">{englishToPersianNumbers(45)} دانش‌آموز</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>مسیر جنوب (تهرانپارس - تجریش)</span>
                        <span className="text-blue-600 font-semibold">{englishToPersianNumbers(38)} دانش‌آموز</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>مسیر غرب (اکباتان - فرشته)</span>
                        <span className="text-blue-600 font-semibold">{englishToPersianNumbers(52)} دانش‌آموز</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">آمار این ماه</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{englishToPersianNumbers(135)}</div>
                        <div className="text-gray-600">کل دانش‌آموزان</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{englishToPersianNumbers(3)}</div>
                        <div className="text-gray-600">مسیر فعال</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">۹۸%</div>
                        <div className="text-gray-600">نرخ حضور</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">تخصیص سرویس به دانش‌آموزان</h2>
                  <button 
                    onClick={() => info('قابلیت تخصیص گروهی سرویس در دست توسعه است')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    تخصیص گروهی
                  </button>
                </div>
                
                {students.length > 0 ? (
                  <div className="grid gap-4">
                    {students.slice(0, 6).map((student) => (
                      <StudentCard
                        key={student.id}
                        student={student}
                        context="services"
                        additionalInfo={{
                          mealPlan: Math.random() > 0.5 ? 'کامل' : 'ناهار'
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">دانش‌آموزی یافت نشد.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
