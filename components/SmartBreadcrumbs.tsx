'use client'

import { ChevronLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { useAppContext } from '@/lib/contexts/AppContext'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface BreadcrumbItem {
  label: string
  url: string
  isActive: boolean
  context?: {
    module: string
    entity?: { type: string; id: number; name: string }
    filters?: any
  }
}

export default function SmartBreadcrumbs() {
  const { navigationContext, canGoBack, goBack } = useAppContext()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])

  useEffect(() => {
    generateBreadcrumbs()
  }, [pathname, searchParams])

  const generateBreadcrumbs = () => {
    const items: BreadcrumbItem[] = []
    const pathSegments = pathname.split('/').filter(Boolean)
    const params = new URLSearchParams(searchParams.toString())

    // Always start with dashboard
    items.push({
      label: 'داشبورد',
      url: '/',
      isActive: pathname === '/',
      context: { module: 'dashboard' }
    })

    // Parse path segments intelligently
    if (pathSegments.length > 0) {
      let currentPath = ''

      pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`
        
        switch (segment) {
          case 'people':
            items.push({
              label: 'مدیریت اشخاص',
              url: currentPath,
              isActive: false,
              context: { module: 'people' }
            })
            break

          case 'students':
            if (pathSegments[index - 1] === 'people') {
              const tab = params.get('tab')
              const studentId = pathSegments[index + 1]
              
              if (studentId && !isNaN(Number(studentId))) {
                items.push({
                  label: 'دانش‌آموزان',
                  url: '/people/students',
                  isActive: false,
                  context: { module: 'students' }
                })
              } else {
                const tabLabel = getTabLabel(tab)
                items.push({
                  label: tabLabel ? `دانش‌آموزان - ${tabLabel}` : 'دانش‌آموزان',
                  url: currentPath + (params.toString() ? `?${params.toString()}` : ''),
                  isActive: index === pathSegments.length - 1,
                  context: { module: 'students', filters: Object.fromEntries(params.entries()) }
                })
              }
            }
            break

          case 'teachers':
            if (pathSegments[index - 1] === 'people') {
              const tab = params.get('tab')
              const tabLabel = getTabLabel(tab)
              items.push({
                label: tabLabel ? `معلمان - ${tabLabel}` : 'معلمان',
                url: currentPath + (params.toString() ? `?${params.toString()}` : ''),
                isActive: index === pathSegments.length - 1,
                context: { module: 'teachers', filters: Object.fromEntries(params.entries()) }
              })
            }
            break

          case 'academic':
            items.push({
              label: 'مدیریت آموزشی',
              url: currentPath,
              isActive: false,
              context: { module: 'academic' }
            })
            break

          case 'classes':
            if (pathSegments[index - 1] === 'academic') {
              const classId = pathSegments[index + 1]
              if (classId && !isNaN(Number(classId))) {
                items.push({
                  label: 'کلاس‌ها',
                  url: '/academic/classes',
                  isActive: false,
                  context: { module: 'classes' }
                })
              } else {
                items.push({
                  label: 'کلاس‌ها',
                  url: currentPath,
                  isActive: index === pathSegments.length - 1,
                  context: { module: 'classes' }
                })
              }
            }
            break

          case 'attendance':
            if (pathSegments[index - 1] === 'academic') {
              const subPage = pathSegments[index + 1]
              const label = subPage === 'today' ? 'حضور امروز' : 
                           subPage === 'reports' ? 'گزارش‌های حضور' : 
                           subPage === 'alerts' ? 'هشدارهای غیبت' : 'حضور و غیاب'
              
              items.push({
                label,
                url: currentPath,
                isActive: index === pathSegments.length - 1 || (index === pathSegments.length - 2 && subPage),
                context: { module: 'attendance' }
              })
            }
            break

          case 'financial':
            const highlight = params.get('highlight')
            const studentParam = params.get('student')
            const label = highlight === 'overdue' ? 'مدیریت مالی - معوقات' : 
                         studentParam ? 'مدیریت مالی - دانش‌آموز' : 'مدیریت مالی'
            
            items.push({
              label,
              url: currentPath + (params.toString() ? `?${params.toString()}` : ''),
              isActive: index === pathSegments.length - 1,
              context: { module: 'financial', filters: Object.fromEntries(params.entries()) }
            })
            break

          case 'services':
            items.push({
              label: 'سرویس‌ها و غذا',
              url: currentPath,
              isActive: index === pathSegments.length - 1,
              context: { module: 'services' }
            })
            break

          case 'communications':
            items.push({
              label: 'ارتباطات',
              url: currentPath,
              isActive: index === pathSegments.length - 1,
              context: { module: 'communications' }
            })
            break

          case 'management':
            const managementTab = params.get('tab')
            const managementLabel = managementTab === 'classes' ? 'پنل مدیریت - کلاس‌ها' :
                                   managementTab === 'school-years' ? 'پنل مدیریت - سال تحصیلی' :
                                   managementTab === 'calendar' ? 'پنل مدیریت - تقویم' :
                                   managementTab === 'permissions' ? 'پنل مدیریت - دسترسی‌ها' : 'پنل مدیریت'
            
            items.push({
              label: managementLabel,
              url: currentPath + (params.toString() ? `?${params.toString()}` : ''),
              isActive: index === pathSegments.length - 1,
              context: { module: 'management', filters: Object.fromEntries(params.entries()) }
            })
            break

          // Handle dynamic routes (e.g., student ID)
          default:
            if (!isNaN(Number(segment))) {
              const entityType = pathSegments[index - 1]
              if (entityType === 'students') {
                const tab = params.get('tab')
                const highlight = params.get('highlight')
                const studentName = `دانش‌آموز #${segment}` // This could be fetched from API
                const tabLabel = getTabLabel(tab)
                
                items.push({
                  label: tabLabel ? `${studentName} - ${tabLabel}` : studentName,
                  url: currentPath + (params.toString() ? `?${params.toString()}` : ''),
                  isActive: true,
                  context: { 
                    module: 'student-profile', 
                    entity: { type: 'student', id: Number(segment), name: studentName },
                    filters: { tab, highlight }
                  }
                })
              }
              // Similar logic for teachers and classes...
            }
            break
        }
      })
    }

    setBreadcrumbs(items)
  }

  const getTabLabel = (tab?: string | null) => {
    switch (tab) {
      case 'overview': return 'اطلاعات کلی'
      case 'attendance': return 'حضور و غیاب'
      case 'financial': return 'وضعیت مالی'
      case 'services': return 'سرویس‌ها'
      case 'communications': return 'ارتباطات'
      case 'academic': return 'عملکرد تحصیلی'
      case 'evaluation': return 'ارزیابی عملکرد'
      case 'classes': return 'کلاس‌ها'
      case 'schedule': return 'برنامه کلاسی'
      default: return null
    }
  }

  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-4" dir="rtl">
      {/* Smart Back Button */}
      {canGoBack() && (
        <button
          onClick={goBack}
          className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors ml-2"
          title="بازگشت به صفحه قبل"
        >
          <ArrowRightIcon className="w-4 h-4" />
          <span className="text-xs">بازگشت</span>
        </button>
      )}

      {/* Breadcrumb Items */}
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronLeftIcon className="w-4 h-4 text-gray-400 mx-1" />
          )}
          
          {item.isActive ? (
            <span className="font-medium text-gray-900 px-2 py-1">
              {item.label}
            </span>
          ) : (
            <a
              href={item.url}
              className="hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors"
            >
              {item.label}
            </a>
          )}
          
          {/* Context indicators */}
          {item.context?.filters && Object.keys(item.context.filters).length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded-full mr-1">
              فیلتر
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
