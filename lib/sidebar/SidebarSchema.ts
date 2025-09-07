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
  disabled?: boolean
  status?: 'working' | 'development' | 'placeholder'
  tooltip?: string
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
        description: 'نمای کلی از وضعیت مدرسه',
        status: 'working'
      }
    ]
  },
  {
    id: 'daily-operations',
    title: 'عملیات روزانه',
    collapsible: true,
    defaultExpanded: true,
    items: [
      {
        id: 'attendance',
        title: 'حضور و غیاب',
        icon: ClockIcon,
        path: '/attendance',
        description: 'مدیریت حضور و غیاب',
        status: 'working',
        children: [
          {
            id: 'attendance-overview',
            title: 'نمای کلی حضور',
            icon: ClockIcon,
            path: '/attendance'
          },
          {
            id: 'attendance-class-marking',
            title: 'ثبت حضور کلاس',
            icon: ClockIcon,
            path: '/attendance/select-class'
          }
        ]
      },
      {
        id: 'financial',
        title: 'مدیریت مالی',
        icon: CurrencyDollarIcon,
        path: '/financial',
        description: 'مدیریت شهریه و پرداخت‌ها',
        badge: { text: '۱۸', color: 'red' },
        status: 'working',
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
            path: '/financial/enhanced',
            badge: { text: '۱۸', color: 'red' }
          }
        ]
      }
    ]
  },
  {
    id: 'people-management',
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
        status: 'working',
        children: [
          {
            id: 'students-overview',
            title: 'فهرست دانش‌آموزان',
            icon: AcademicCapIcon,
            path: '/people/students'
          },
          {
            id: 'students-attendance',
            title: 'حضور و غیاب دانش‌آموزان',
            icon: ClockIcon,
            path: '/people/students?tab=attendance'
          },
          {
            id: 'students-financial',
            title: 'وضعیت مالی',
            icon: CurrencyDollarIcon,
            path: '/people/students?tab=financial',
            badge: { text: '۱۸', color: 'red' }
          }
        ]
      },
      {
        id: 'teachers',
        title: 'معلمان',
        icon: UserGroupIcon,
        path: '/teachers',
        description: 'مدیریت معلمان',
        status: 'working'
      }
    ]
  },
  {
    id: 'services',
    title: 'خدمات',
    collapsible: true,
    defaultExpanded: false,
    items: [
      {
        id: 'services',
        title: 'سرویس‌ها و غذا',
        icon: TruckIcon,
        path: '/services',
        description: 'مدیریت سرویس و وعده‌های غذایی',
        status: 'working'
      },
      {
        id: 'circulars',
        title: 'بخش‌نامه‌ها',
        icon: DocumentTextIcon,
        path: '/circulars',
        description: 'مدیریت بخش‌نامه‌ها و اطلاعیه‌ها',
        status: 'working'
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
        status: 'working'
      },
      {
        id: 'communications',
        title: 'ارتباطات اولیا',
        icon: ChatBubbleLeftRightIcon,
        path: '/communications',
        description: 'ارتباط با والدین و اطلاع‌رسانی',
        disabled: true,
        status: 'development',
        tooltip: 'در حال توسعه'
      },
      {
        id: 'surveys',
        title: 'نظرسنجی‌ها',
        icon: ChartBarIcon,
        path: '/surveys',
        description: 'ایجاد و مدیریت نظرسنجی‌ها',
        disabled: true,
        status: 'development',
        tooltip: 'در حال توسعه'
      },
      {
        id: 'rewards',
        title: 'مدیریت جوایز',
        icon: GiftIcon,
        path: '/rewards',
        description: 'سیستم امتیازدهی و جوایز',
        disabled: true,
        status: 'development',
        tooltip: 'در حال توسعه'
      },
      {
        id: 'evaluation',
        title: 'ارزیابی معلمان',
        icon: StarIcon,
        path: '/evaluation',
        description: 'ارزیابی عملکرد معلمان',
        disabled: true,
        status: 'development',
        tooltip: 'در حال توسعه'
      },
      {
        id: 'system',
        title: 'تنظیمات سیستم',
        icon: WrenchScrewdriverIcon,
        path: '/system',
        description: 'تنظیمات فنی و پیکربندی',
        disabled: true,
        status: 'development',
        tooltip: 'در حال توسعه'
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
