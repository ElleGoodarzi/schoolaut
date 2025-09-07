'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/MainLayout'
import AnnouncementCard from '@/components/AnnouncementCard'
import { 
  DocumentTextIcon,
  PlusIcon,
  MegaphoneIcon,
  UsersIcon,
  ClockIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { englishToPersianNumbers } from '@/lib/utils'
import { useToast } from '@/lib/toast/ToastProvider'

interface Announcement {
  id: number
  title: string
  content: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  author: string
  publishDate: string
  targetAudience: string
  isActive: boolean
}

export default function Circulars() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [activeTab, setActiveTab] = useState<'active' | 'draft' | 'archive' | 'create'>('active')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterAudience, setFilterAudience] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const { info, warning, success } = useToast()

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/circulars/recent')
      const result = await response.json()
      
      if (result.success && result.data.recentCirculars) {
        setAnnouncements(result.data.recentCirculars)
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
      // Fallback data for demonstration
      setAnnouncements([
        {
          id: 1,
          title: 'تغییر ساعت ورود مدرسه',
          content: 'با عنایت به شرایط آب و هوایی، ساعت ورود مدرسه از فردا ۸:۳۰ خواهد بود.',
          priority: 'HIGH' as const,
          author: 'مدیریت مدرسه',
          publishDate: '1403/08/15',
          targetAudience: 'all',
          isActive: true
        },
        {
          id: 2,
          title: 'برگزاری کلاس‌های تقویتی',
          content: 'کلاس‌های تقویتی ریاضی و علوم برای پایه‌های سوم تا ششم از هفته آینده آغاز می‌شود.',
          priority: 'MEDIUM' as const,
          author: 'معاونت آموزشی',
          publishDate: '1403/08/12',
          targetAudience: 'parents',
          isActive: true
        },
        {
          id: 3,
          title: 'نمایشگاه کارهای دستی',
          content: 'نمایشگاه کارهای دستی دانش‌آموزان روز پنج‌شنبه در سالن اصلی مدرسه برگزار می‌شود.',
          priority: 'LOW' as const,
          author: 'مسئول فرهنگی',
          publishDate: '1403/08/10',
          targetAudience: 'all',
          isActive: true
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'فوری'
      case 'MEDIUM': return 'متوسط'
      case 'LOW': return 'عادی'
      default: return priority
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-100'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100'
      case 'LOW': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case 'all': return 'همگانی'
      case 'teachers': return 'معلمان'
      case 'parents': return 'اولیاء'
      default: return audience
    }
  }

  const filteredAnnouncements = announcements.filter(announcement => {
    const priorityMatch = filterPriority === 'all' || announcement.priority === filterPriority
    const audienceMatch = filterAudience === 'all' || announcement.targetAudience === filterAudience
    return priorityMatch && audienceMatch
  })

  const tabs = [
    { id: 'active', name: 'اطلاعیه‌های فعال', icon: DocumentTextIcon, count: announcements.filter(a => a.isActive).length },
    { id: 'draft', name: 'پیش‌نویس‌ها', icon: ClockIcon, count: 2 },
    { id: 'archive', name: 'آرشیو', icon: UsersIcon, count: 15 },
    { id: 'create', name: 'ایجاد اطلاعیه', icon: PlusIcon, count: 0 },
  ]

  if (loading) {
    return (
      <MainLayout>
        <div className="fade-in">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6">
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">بخش‌نامه‌ها و اطلاعیه‌ها</h1>
          <button 
            onClick={() => setActiveTab('create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            اطلاعیه جدید
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">اطلاعیه‌های فعال</p>
                <p className="text-2xl font-bold text-blue-600">
                  {englishToPersianNumbers(announcements.filter(a => a.isActive).length)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <MegaphoneIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">اطلاعیه‌های فوری</p>
                <p className="text-2xl font-bold text-red-600">
                  {englishToPersianNumbers(announcements.filter(a => a.priority === 'HIGH').length)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UsersIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">مخاطبان امروز</p>
                <p className="text-2xl font-bold text-green-600">
                  {englishToPersianNumbers(450)} نفر
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl card-shadow border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">پیش‌نویس‌ها</p>
                <p className="text-2xl font-bold text-purple-600">
                  {englishToPersianNumbers(2)}
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
                    {tab.count > 0 && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {englishToPersianNumbers(tab.count)}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Active Announcements Tab */}
            {activeTab === 'active' && (
              <div>
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <FunnelIcon className="h-5 w-5 text-gray-400" />
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">همه اولویت‌ها</option>
                      <option value="HIGH">فوری</option>
                      <option value="MEDIUM">متوسط</option>
                      <option value="LOW">عادی</option>
                    </select>
                  </div>
                  
                  <select
                    value={filterAudience}
                    onChange={(e) => setFilterAudience(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">همه مخاطبان</option>
                    <option value="all">همگانی</option>
                    <option value="teachers">معلمان</option>
                    <option value="parents">اولیاء</option>
                  </select>
                </div>

                {/* Announcements List */}
                {filteredAnnouncements.length > 0 ? (
                  <div className="space-y-4">
                    {filteredAnnouncements.map((announcement) => (
                      <div key={announcement.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(announcement.priority)}`}>
                                {getPriorityLabel(announcement.priority)}
                              </span>
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                {getAudienceLabel(announcement.targetAudience)}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{announcement.content}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>نویسنده: {announcement.author}</span>
                              <span>تاریخ انتشار: {announcement.publishDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mr-4">
                            <button 
                              onClick={() => info('ویرایش اطلاعیه در دست توسعه است')}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              ویرایش
                            </button>
                            <button 
                              onClick={() => warning('حذف اطلاعیه در دست توسعه است')}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">اطلاعیه‌ای با این فیلتر یافت نشد.</p>
                  </div>
                )}
              </div>
            )}

            {/* Create Announcement Tab */}
            {activeTab === 'create' && (
              <div className="max-w-2xl">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">ایجاد اطلاعیه جدید</h2>
                
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عنوان اطلاعیه
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="عنوان اطلاعیه را وارد کنید..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      متن اطلاعیه
                    </label>
                    <textarea
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="متن کامل اطلاعیه را وارد کنید..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        اولویت
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="LOW">عادی</option>
                        <option value="MEDIUM">متوسط</option>
                        <option value="HIGH">فوری</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        مخاطبان
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="all">همگانی</option>
                        <option value="teachers">معلمان</option>
                        <option value="parents">اولیاء</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      onClick={(e) => {
                        e.preventDefault()
                        success('انتشار اطلاعیه در دست توسعه است')
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      انتشار اطلاعیه
                    </button>
                    <button
                      type="button"
                      onClick={() => info('ذخیره پیش‌نویس در دست توسعه است')}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      ذخیره پیش‌نویس
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Other tabs placeholder */}
            {(activeTab === 'draft' || activeTab === 'archive') && (
              <div className="text-center py-8">
                <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">این بخش در حال توسعه می‌باشد.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
