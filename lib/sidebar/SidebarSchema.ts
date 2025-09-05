import { 
  HomeIcon,
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  ClockIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ChartBarIcon,
  StarIcon,
  GiftIcon,
  CogIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'

export interface SidebarItem {
  id: string
  title: string
  icon: any
  path: string
  badge?: {
    text: string
    color: 'red' | 'blue' | 'green' | 'yellow'
  }
  children?: SidebarItem[]
  description?: string
  isActive?: boolean
}

export interface SidebarCategory {
  id: string
  title: string
  items: SidebarItem[]
  collapsible?: boolean
  defaultExpanded?: boolean
}

export const sidebarSchema: SidebarCategory[] = [
  {
    id: 'dashboard',
    title: 'داشبورد',
    items: [
      {
        id: 'dashboard',
        title: 'داشبورد اصلی',
        icon: HomeIcon,
        path: '/',
        description: 'نمای کلی از وضعیت مدرسه'
      }
    ]
  },
  {
    id: 'people',
    title: 'مدیریت اشخاص',
    collapsible: true,
    defaultExpanded: true,
    items: [
      {
        id: 'students',
        title: 'دانش‌آموزان',
        icon: AcademicCapIcon,
        path: '/people/students',
        description: 'مدیریت دانش‌آموزان و پروفایل‌ها',
        children: [
          {
            id: 'students-overview',
            title: 'فهرست دانش‌آموزان',
            icon: AcademicCapIcon,
            path: '/people/students'
          },
          {
            id: 'students-attendance',
            title: 'حضور و غیاب',
            icon: ClockIcon,
            path: '/people/students?tab=attendance'
          },
          {
            id: 'students-financial',
            title: 'وضعیت مالی',
            icon: CurrencyDollarIcon,
            path: '/people/students?tab=financial',
            badge: { text: '۱۸', color: 'red' }
          },
          {
            id: 'students-services',
            title: 'سرویس‌ها و غذا',
            icon: TruckIcon,
            path: '/people/students?tab=services'
          }
        ]
      },
      {
        id: 'teachers',
        title: 'معلمان',
        icon: UserGroupIcon,
        path: '/people/teachers',
        description: 'مدیریت معلمان و ارزیابی',
        children: [
          {
            id: 'teachers-overview',
            title: 'فهرست معلمان',
            icon: UserGroupIcon,
            path: '/people/teachers'
          },
          {
            id: 'teachers-evaluation',
            title: 'ارزیابی عملکرد',
            icon: StarIcon,
            path: '/people/teachers?tab=evaluation'
          },
          {
            id: 'teachers-classes',
            title: 'تخصیص کلاس‌ها',
            icon: BookOpenIcon,
            path: '/people/teachers?tab=classes'
          }
        ]
      }
    ]
  },
  {
    id: 'academic',
    title: 'مدیریت آموزشی',
    collapsible: true,
    defaultExpanded: true,
    items: [
      {
        id: 'classes',
        title: 'کلاس‌ها',
        icon: BookOpenIcon,
        path: '/academic/classes',
        description: 'مدیریت کلاس‌ها و دروس',
        children: [
          {
            id: 'classes-overview',
            title: 'فهرست کلاس‌ها',
            icon: BookOpenIcon,
            path: '/academic/classes'
          },
          {
            id: 'classes-schedule',
            title: 'برنامه کلاسی',
            icon: ClockIcon,
            path: '/academic/classes?tab=schedule'
          },
          {
            id: 'classes-attendance',
            title: 'حضور و غیاب کلاسی',
            icon: ClockIcon,
            path: '/academic/classes?tab=attendance'
          }
        ]
      },
      {
        id: 'attendance',
        title: 'حضور و غیاب',
        icon: ClockIcon,
        path: '/academic/attendance',
        description: 'مدیریت حضور و غیاب',
        children: [
          {
            id: 'attendance-today',
            title: 'حضور امروز',
            icon: ClockIcon,
            path: '/academic/attendance/today'
          },
          {
            id: 'attendance-reports',
            title: 'گزارش‌های حضور',
            icon: ChartBarIcon,
            path: '/academic/attendance/reports'
          },
          {
            id: 'attendance-alerts',
            title: 'هشدارهای غیبت',
            icon: ClockIcon,
            path: '/academic/attendance/alerts',
            badge: { text: '۵', color: 'yellow' }
          }
        ]
      }
    ]
  },
  {
    id: 'financial',
    title: 'مدیریت مالی',
    collapsible: true,
    defaultExpanded: true,
    items: [
      {
        id: 'financial',
        title: 'مدیریت مالی',
        icon: CurrencyDollarIcon,
        path: '/financial',
        description: 'مدیریت شهریه و پرداخت‌ها',
        badge: { text: '۱۸', color: 'red' },
        children: [
          {
            id: 'financial-overview',
            title: 'نمای کلی مالی',
            icon: CurrencyDollarIcon,
            path: '/financial'
          },
          {
            id: 'financial-overdue',
            title: 'شهریه‌های معوقه',
            icon: CurrencyDollarIcon,
            path: '/financial/overdue',
            badge: { text: '۱۸', color: 'red' }
          },
          {
            id: 'financial-payments',
            title: 'پرداخت‌ها',
            icon: CurrencyDollarIcon,
            path: '/financial/payments'
          },
          {
            id: 'financial-reports',
            title: 'گزارش‌های مالی',
            icon: ChartBarIcon,
            path: '/financial/reports'
          }
        ]
      }
    ]
  },
  {
    id: 'services',
    title: 'خدمات و سرویس‌ها',
    collapsible: true,
    defaultExpanded: false,
    items: [
      {
        id: 'services',
        title: 'سرویس‌ها و غذا',
        icon: TruckIcon,
        path: '/services',
        description: 'مدیریت سرویس و وعده‌های غذایی',
        children: [
          {
            id: 'services-meals',
            title: 'مدیریت غذا',
            icon: TruckIcon,
            path: '/services/meals'
          },
          {
            id: 'services-transport',
            title: 'سرویس مدرسه',
            icon: TruckIcon,
            path: '/services/transport'
          },
          {
            id: 'services-assignments',
            title: 'تخصیص سرویس‌ها',
            icon: TruckIcon,
            path: '/services/assignments'
          }
        ]
      }
    ]
  },
  {
    id: 'communications',
    title: 'ارتباطات',
    collapsible: true,
    defaultExpanded: false,
    items: [
      {
        id: 'communications',
        title: 'ارتباطات اولیا',
        icon: ChatBubbleLeftRightIcon,
        path: '/communications',
        description: 'ارتباط با والدین و اطلاع‌رسانی',
        children: [
          {
            id: 'communications-messages',
            title: 'پیام‌ها',
            icon: ChatBubbleLeftRightIcon,
            path: '/communications/messages'
          },
          {
            id: 'communications-notifications',
            title: 'اعلان‌ها',
            icon: ChatBubbleLeftRightIcon,
            path: '/communications/notifications'
          },
          {
            id: 'communications-meetings',
            title: 'جلسات والدین',
            icon: ChatBubbleLeftRightIcon,
            path: '/communications/meetings'
          }
        ]
      },
      {
        id: 'circulars',
        title: 'بخش‌نامه‌ها',
        icon: DocumentTextIcon,
        path: '/communications/circulars',
        description: 'مدیریت بخش‌نامه‌ها و اطلاعیه‌ها',
        children: [
          {
            id: 'circulars-active',
            title: 'بخش‌نامه‌های فعال',
            icon: DocumentTextIcon,
            path: '/communications/circulars/active'
          },
          {
            id: 'circulars-create',
            title: 'ایجاد بخش‌نامه',
            icon: DocumentTextIcon,
            path: '/communications/circulars/create'
          },
          {
            id: 'circulars-archive',
            title: 'آرشیو بخش‌نامه‌ها',
            icon: DocumentTextIcon,
            path: '/communications/circulars/archive'
          }
        ]
      }
    ]
  },
  {
    id: 'analytics',
    title: 'تحلیل و گزارش',
    collapsible: true,
    defaultExpanded: false,
    items: [
      {
        id: 'surveys',
        title: 'نظرسنجی‌ها',
        icon: ChartBarIcon,
        path: '/analytics/surveys',
        description: 'ایجاد و مدیریت نظرسنجی‌ها'
      },
      {
        id: 'rewards',
        title: 'مدیریت جوایز',
        icon: GiftIcon,
        path: '/analytics/rewards',
        description: 'سیستم امتیازدهی و جوایز'
      }
    ]
  },
  {
    id: 'management',
    title: 'مدیریت سیستم',
    collapsible: true,
    defaultExpanded: false,
    items: [
      {
        id: 'management',
        title: 'پنل مدیریت',
        icon: CogIcon,
        path: '/management',
        description: 'تنظیمات کلی مدرسه',
        children: [
          {
            id: 'management-classes',
            title: 'مدیریت کلاس‌ها',
            icon: BookOpenIcon,
            path: '/management?tab=classes'
          },
          {
            id: 'management-academic-year',
            title: 'سال تحصیلی',
            icon: BookOpenIcon,
            path: '/management?tab=school-years'
          },
          {
            id: 'management-calendar',
            title: 'تقویم مدرسه',
            icon: ClockIcon,
            path: '/management?tab=calendar'
          },
          {
            id: 'management-permissions',
            title: 'مدیریت دسترسی‌ها',
            icon: UserGroupIcon,
            path: '/management?tab=permissions'
          }
        ]
      },
      {
        id: 'system',
        title: 'تنظیمات سیستم',
        icon: WrenchScrewdriverIcon,
        path: '/system',
        description: 'تنظیمات فنی و پیکربندی'
      }
    ]
  }
]

// Helper functions for dynamic sidebar behavior
export function getBadgeCount(itemId: string): number {
  // This would be connected to real-time data
  const badgeCounts: Record<string, number> = {
    'students-financial': 18,
    'financial-overdue': 18,
    'attendance-alerts': 5
  }
  
  return badgeCounts[itemId] || 0
}

export function getActiveItems(currentPath: string): string[] {
  const activeItems: string[] = []
  
  // Recursive function to find active items
  function findActiveItems(items: SidebarItem[], path: string) {
    items.forEach(item => {
      if (path.startsWith(item.path) || path === item.path) {
        activeItems.push(item.id)
      }
      if (item.children) {
        findActiveItems(item.children, path)
      }
    })
  }
  
  sidebarSchema.forEach(category => {
    findActiveItems(category.items, currentPath)
  })
  
  return activeItems
}

export function shouldShowBadge(itemId: string): boolean {
  const count = getBadgeCount(itemId)
  return count > 0
}
