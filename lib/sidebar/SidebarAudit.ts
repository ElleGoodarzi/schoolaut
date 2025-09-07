import { sidebarSchema, SidebarItem } from './SidebarSchema'

interface ButtonStatus {
  label: string
  implemented: boolean
  apiConnected: boolean
  remarks: string
  status: 'working' | 'development' | 'placeholder'
}

export function generateButtonStatusReport(): ButtonStatus[] {
  const report: ButtonStatus[] = []

  // Flatten all sidebar items
  const flattenItems = (items: SidebarItem[]): SidebarItem[] => {
    const flattened: SidebarItem[] = []
    items.forEach(item => {
      flattened.push(item)
      if (item.children) {
        flattened.push(...flattenItems(item.children))
      }
    })
    return flattened
  }

  const allItems = sidebarSchema.flatMap(category => flattenItems(category.items))

  // Define button status for each item
  const buttonStatuses: Record<string, ButtonStatus> = {
    'dashboard': {
      label: 'داشبورد اصلی',
      implemented: true,
      apiConnected: true,
      remarks: 'Fully functional with real-time stats',
      status: 'working'
    },
    'students': {
      label: 'دانش‌آموزان',
      implemented: true,
      apiConnected: true,
      remarks: 'Complete student management system',
      status: 'working'
    },
    'students-overview': {
      label: 'فهرست دانش‌آموزان',
      implemented: true,
      apiConnected: true,
      remarks: 'Working with search and filtering',
      status: 'working'
    },
    'students-attendance': {
      label: 'حضور و غیاب دانش‌آموزان',
      implemented: true,
      apiConnected: true,
      remarks: 'Individual student attendance modules',
      status: 'working'
    },
    'students-financial': {
      label: 'وضعیت مالی دانش‌آموزان',
      implemented: true,
      apiConnected: true,
      remarks: 'Financial status with overdue tracking',
      status: 'working'
    },
    'students-services': {
      label: 'سرویس‌های دانش‌آموزان',
      implemented: true,
      apiConnected: true,
      remarks: 'Service assignment interface',
      status: 'working'
    },
    'teachers': {
      label: 'معلمان',
      implemented: true,
      apiConnected: true,
      remarks: 'Teacher management system',
      status: 'working'
    },
    'attendance': {
      label: 'حضور و غیاب',
      implemented: true,
      apiConnected: true,
      remarks: 'Complete attendance system with 4 status options',
      status: 'working'
    },
    'attendance-overview': {
      label: 'نمای کلی حضور',
      implemented: true,
      apiConnected: true,
      remarks: 'Dashboard with stats and class overview',
      status: 'working'
    },
    'attendance-class-marking': {
      label: 'ثبت حضور کلاس',
      implemented: true,
      apiConnected: true,
      remarks: 'Class-specific attendance marking interface',
      status: 'working'
    },
    'financial': {
      label: 'مدیریت مالی',
      implemented: true,
      apiConnected: true,
      remarks: 'Payment tracking and overdue management',
      status: 'working'
    },
    'services': {
      label: 'سرویس‌ها و غذا',
      implemented: true,
      apiConnected: true,
      remarks: 'Meal service management with API integration',
      status: 'working'
    },
    'management': {
      label: 'پنل مدیریت',
      implemented: true,
      apiConnected: true,
      remarks: 'Class and teacher management',
      status: 'working'
    },
    'circulars': {
      label: 'بخش‌نامه‌ها',
      implemented: true,
      apiConnected: true,
      remarks: 'Announcement and circular management',
      status: 'working'
    },
    'communications': {
      label: 'ارتباطات اولیا',
      implemented: false,
      apiConnected: false,
      remarks: 'Placeholder page - در حال توسعه',
      status: 'development'
    },
    'surveys': {
      label: 'نظرسنجی‌ها',
      implemented: false,
      apiConnected: false,
      remarks: 'Placeholder page - در حال توسعه',
      status: 'development'
    },
    'rewards': {
      label: 'مدیریت جوایز',
      implemented: false,
      apiConnected: false,
      remarks: 'Placeholder page - در حال توسعه',
      status: 'development'
    },
    'system': {
      label: 'تنظیمات سیستم',
      implemented: false,
      apiConnected: false,
      remarks: 'Placeholder page - در حال توسعه',
      status: 'development'
    }
  }

  // Generate report for all items
  allItems.forEach(item => {
    const status = buttonStatuses[item.id]
    if (status) {
      report.push(status)
    } else {
      // Default status for items not explicitly defined
      report.push({
        label: item.title,
        implemented: !item.disabled,
        apiConnected: !item.disabled,
        remarks: item.disabled ? 'Disabled - در حال توسعه' : 'Working',
        status: item.status || 'working'
      })
    }
  })

  return report
}

export function logButtonStatusReport(): void {
  const report = generateButtonStatusReport()
  
  console.log('='.repeat(60))
  console.log('🔍 SIDEBAR BUTTON AUDIT REPORT')
  console.log('='.repeat(60))
  
  report.forEach(button => {
    console.log(`[${button.label}]: {`)
    console.log(`  implemented: ${button.implemented},`)
    console.log(`  apiConnected: ${button.apiConnected},`)
    console.log(`  remarks: "${button.remarks}"`)
    console.log(`}`)
    console.log('')
  })
  
  console.log('='.repeat(60))
  
  const summary = {
    total: report.length,
    working: report.filter(b => b.status === 'working').length,
    development: report.filter(b => b.status === 'development').length,
    placeholder: report.filter(b => b.status === 'placeholder').length
  }
  
  console.log('📊 SUMMARY:')
  console.log(`Total buttons: ${summary.total}`)
  console.log(`✅ Working: ${summary.working}`)
  console.log(`🚧 In development: ${summary.development}`)
  console.log(`❌ Placeholder: ${summary.placeholder}`)
  console.log('='.repeat(60))
}
