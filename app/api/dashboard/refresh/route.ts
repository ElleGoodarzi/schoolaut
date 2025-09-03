import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔄 Dashboard refresh: Starting to fetch all metrics...')
    
    // Call all internal APIs in parallel for better performance
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    const [
      studentsRes,
      attendanceRes,
      teachersRes,
      classesRes,
      financialRes,
      mealsRes,
      servicesRes,
      circularsRes,
      absenteesRes
    ] = await Promise.all([
      fetch(`${baseUrl}/api/students/count`),
      fetch(`${baseUrl}/api/attendance/stats/today`),
      fetch(`${baseUrl}/api/teachers/active`),
      fetch(`${baseUrl}/api/management/classes/active`),
      fetch(`${baseUrl}/api/financial/overdue-count`),
      fetch(`${baseUrl}/api/services/meals/today-count`),
      fetch(`${baseUrl}/api/services/active-count`),
      fetch(`${baseUrl}/api/circulars/recent`),
      fetch(`${baseUrl}/api/attendance/frequent-absentees`)
    ])

    // Parse all responses
    const [
      studentsData,
      attendanceData,
      teachersData,
      classesData,
      financialData,
      mealsData,
      servicesData,
      circularsData,
      absenteesData
    ] = await Promise.all([
      studentsRes.json(),
      attendanceRes.json(),
      teachersRes.json(),
      classesRes.json(),
      financialRes.json(),
      mealsRes.json(),
      servicesRes.json(),
      circularsRes.json(),
      absenteesRes.json()
    ])

    console.log('✅ Dashboard refresh: All APIs called successfully')

    // Build comprehensive dashboard response
    const dashboardData = {
      success: true,
      data: {
        // Core metrics
        totalStudents: studentsData.data?.totalStudents || 0,
        activeClasses: classesData.data?.activeClasses || 0,
        presentTeachers: teachersData.data?.activeTeachers || 0,
        
        // Attendance metrics
        presentCountToday: attendanceData.data?.presentToday || 0,
        absentCountToday: attendanceData.data?.absentToday || 0,
        lateCountToday: attendanceData.data?.lateToday || 0,
        attendanceRate: attendanceData.data?.attendanceRate || 0,
        
        // Financial metrics
        overduePayments: financialData.data?.overduePaymentsCount || 0,
        overdueStudents: financialData.data?.overdueStudents || [],
        
        // Service metrics
        foodMealsToday: mealsData.data?.totalMealsToday || 0,
        activeServices: servicesData.data?.activeServicesCount || 0,
        mealServices: mealsData.data?.mealServices || [],
        
        // Alert metrics
        frequentAbsentees: absenteesData.data?.count || 0,
        frequentAbsenteesList: absenteesData.data?.frequentAbsentees || [],
        
        // Announcements/Circulars
        announcements: circularsData.data?.recentCirculars || [],
        
        // Build alerts array
        alerts: [
          // Overdue payments alert
          ...(financialData.data?.overduePaymentsCount > 0 ? [{
            id: 'overdue-payments',
            type: 'overdue_payments',
            severity: 'high' as const,
            title: 'شهریه معوقه',
            message: `${financialData.data.overdueStudentsCount} دانش‌آموز شهریه معوقه دارند`,
            count: financialData.data.overdueStudentsCount,
            source: 'financial',
            actionUrl: '/financial',
            details: financialData.data.overdueStudents?.slice(0, 5) || []
          }] : []),
          
          // Frequent absentees alert
          ...(absenteesData.data?.count > 0 ? [{
            id: 'frequent-absences',
            type: 'frequent_absences',
            severity: 'medium' as const,
            title: 'غیبت مکرر',
            message: `${absenteesData.data.count} دانش‌آموز غیبت بالا دارند`,
            count: absenteesData.data.count,
            source: 'attendance',
            actionUrl: '/attendance',
            details: absenteesData.data.frequentAbsentees?.slice(0, 5) || []
          }] : [])
        ],
        
        // Summary for today
        todaySummary: {
          totalStudents: studentsData.data?.totalStudents || 0,
          presentCount: attendanceData.data?.presentToday || 0,
          absentCount: attendanceData.data?.absentToday || 0,
          lateCount: attendanceData.data?.lateToday || 0,
          activeClasses: classesData.data?.activeClasses || 0,
          activeTeachers: teachersData.data?.activeTeachers || 0,
          mealOrders: mealsData.data?.totalMealsToday || 0,
          activeServices: servicesData.data?.activeServicesCount || 0
        },
        
        // Metadata
        lastUpdated: new Date().toISOString(),
        academicYear: '1403-1404',
        
        // API Status
        apiStatus: {
          students: studentsData.success,
          attendance: attendanceData.success,
          teachers: teachersData.success,
          classes: classesData.success,
          financial: financialData.success,
          meals: mealsData.success,
          services: servicesData.success,
          circulars: circularsData.success,
          absentees: absenteesData.success
        }
      }
    }

    console.log('🎉 Dashboard refresh: Complete response built')
    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('❌ Dashboard refresh error:', error)
    
    // Comprehensive fallback data
    const fallbackData = {
      success: false,
      error: 'Some services unavailable',
      data: {
        totalStudents: 186,
        activeClasses: 8,
        presentTeachers: 24,
        presentCountToday: 177,
        absentCountToday: 9,
        lateCountToday: 3,
        attendanceRate: 95,
        overduePayments: 18,
        overdueStudents: [
          {
            id: 1,
            name: 'فاطمه احمدی',
            studentId: '1002',
            class: '2ب',
            overdueAmount: 2500000,
            overduePayments: 1
          }
        ],
        foodMealsToday: 177,
        activeServices: 3,
        mealServices: [
          {
            id: 1,
            mealType: 'LUNCH',
            menuItems: 'خورش قیمه با برنج، سالاد شیرازی، ماست',
            totalOrders: 177
          }
        ],
        frequentAbsentees: 1,
        frequentAbsenteesList: [
          {
            id: 1,
            name: 'احمد محمدی',
            studentId: '1001',
            class: '3الف',
            absenceCount: 5
          }
        ],
        announcements: [
          {
            id: 1,
            title: 'سیستم در حال راه‌اندازی',
            content: 'پایگاه داده در حال اتصال می‌باشد. داده‌های نمونه نمایش داده می‌شود.',
            priority: 'medium',
            author: 'سیستم',
            publishDate: new Date().toLocaleDateString('fa-IR'),
            targetAudience: 'all'
          }
        ],
        alerts: [
          {
            id: 'system-notice',
            type: 'system',
            severity: 'low' as const,
            title: 'اطلاعیه سیستم',
            message: 'سیستم با داده‌های نمونه کار می‌کند',
            count: 1,
            source: 'system'
          }
        ],
        todaySummary: {
          totalStudents: 186,
          presentCount: 177,
          absentCount: 9,
          lateCount: 3,
          activeClasses: 8,
          activeTeachers: 24,
          mealOrders: 177,
          activeServices: 3
        },
        lastUpdated: new Date().toISOString(),
        academicYear: '1403-1404',
        apiStatus: {
          students: false,
          attendance: false,
          teachers: false,
          classes: false,
          financial: false,
          meals: false,
          services: false,
          circulars: false,
          absentees: false
        }
      }
    }

    return NextResponse.json(fallbackData, { status: 200 })
  }
}
