import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTodayDate } from '@/lib/utils'

export async function GET() {
  try {
    const today = getTodayDate()
    const todayDate = new Date(today)
    
    // Get current month date range for frequent absentees
    const currentMonth = new Date()
    currentMonth.setDate(1) // First day of current month
    const nextMonth = new Date(currentMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    // Fetch all metrics in parallel for better performance
    const [
      totalStudents,
      activeClasses,
      activeTeachers,
      todayAttendance,
      overduePayments,
      todayMeals,
      activeServices,
      frequentAbsentees,
      recentAnnouncements
    ] = await Promise.all([
      // Total students count
      prisma.student.count({
        where: { isActive: true }
      }),

      // Active classes count
      prisma.class.count({
        where: { isActive: true }
      }),

      // Active teachers count (present teachers)
      prisma.teacher.count({
        where: { isActive: true }
      }),

      // Today's attendance breakdown
      prisma.attendance.groupBy({
        by: ['status'],
        where: {
          date: todayDate
        },
        _count: {
          status: true
        }
      }),

      // Overdue payments count
      prisma.payment.count({
        where: {
          status: 'OVERDUE',
          dueDate: {
            lt: new Date()
          }
        }
      }),

      // Today's meal orders
      prisma.mealService.aggregate({
        where: {
          date: todayDate,
          isActive: true
        },
        _sum: {
          totalOrders: true
        }
      }),

      // Active meal services count (bus services)
      prisma.mealService.count({
        where: {
          date: todayDate,
          isActive: true
        }
      }),

      // Students with frequent absences (>3 this month)
      prisma.student.findMany({
        where: {
          attendances: {
            some: {
              status: 'ABSENT',
              date: {
                gte: currentMonth,
                lt: nextMonth
              }
            }
          }
        },
        include: {
          attendances: {
            where: {
              status: 'ABSENT',
              date: {
                gte: currentMonth,
                lt: nextMonth
              }
            }
          }
        }
      }),

      // Recent announcements
      prisma.announcement.findMany({
        where: {
          isActive: true
        },
        orderBy: {
          publishDate: 'desc'
        },
        take: 3
      })
    ])

    // Process attendance data
    const presentCount = todayAttendance.find(a => a.status === 'PRESENT')?._count.status || 0
    const absentCount = todayAttendance.find(a => a.status === 'ABSENT')?._count.status || 0
    const lateCount = todayAttendance.find(a => a.status === 'LATE')?._count.status || 0

    // Filter students with more than 3 absences
    const highAbsenteeStudents = frequentAbsentees.filter(
      student => student.attendances.length > 3
    )

    // Format announcements
    const formattedAnnouncements = recentAnnouncements.map(announcement => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority.toLowerCase(),
      author: announcement.author,
      date: announcement.publishDate.toLocaleDateString('fa-IR'),
      targetAudience: announcement.targetAudience
    }))

    // Build comprehensive dashboard data
    const dashboardData = {
      success: true,
      data: {
        // Main statistics
        totalStudents,
        activeClasses,
        presentTeachers: activeTeachers,
        
        // Attendance metrics
        presentCountToday: presentCount,
        absentCountToday: absentCount,
        lateCountToday: lateCount,
        
        // Financial metrics
        overduePayments,
        
        // Service metrics
        foodMealsToday: todayMeals._sum.totalOrders || 0,
        activeServices,
        
        // Alert metrics
        frequentAbsentees: highAbsenteeStudents.length,
        
        // Additional calculated metrics
        attendanceRate: totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0,
        
        // Announcements
        announcements: formattedAnnouncements,
        
        // Alerts data
        alerts: [
          ...(overduePayments > 0 ? [{
            type: 'overdue_payments',
            severity: 'high' as const,
            title: 'شهریه معوقه',
            message: `${overduePayments} دانش‌آموز شهریه معوقه دارند`,
            count: overduePayments
          }] : []),
          
          ...(highAbsenteeStudents.length > 0 ? [{
            type: 'frequent_absences',
            severity: 'medium' as const,
            title: 'غیبت مکرر',
            message: `${highAbsenteeStudents.length} دانش‌آموز غیبت بالا دارند`,
            count: highAbsenteeStudents.length,
            details: highAbsenteeStudents.slice(0, 5).map(student => ({
              name: `${student.firstName} ${student.lastName}`,
              absenceCount: student.attendances.length
            }))
          }] : [])
        ],
        
        // Timestamp
        lastUpdated: new Date().toISOString(),
        
        // Summary for today
        todaySummary: {
          totalStudents,
          presentCount,
          absentCount,
          lateCount,
          activeClasses,
          activeTeachers,
          mealOrders: todayMeals._sum.totalOrders || 0,
          activeServices
        }
      }
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    
    // Return fallback data in case of database error
    const fallbackData = {
      success: false,
      error: 'Database connection failed',
      data: {
        totalStudents: 245,
        activeClasses: 12,
        presentTeachers: 24,
        presentCountToday: 232,
        absentCountToday: 13,
        lateCountToday: 3,
        overduePayments: 18,
        foodMealsToday: 215,
        activeServices: 8,
        frequentAbsentees: 5,
        attendanceRate: 95,
        announcements: [
          {
            id: 1,
            title: 'سیستم در حال راه‌اندازی',
            content: 'پایگاه داده در حال اتصال می‌باشد. لطفاً منتظر بمانید.',
            priority: 'medium',
            author: 'سیستم',
            date: new Date().toLocaleDateString('fa-IR'),
            targetAudience: 'all'
          }
        ],
        alerts: [],
        lastUpdated: new Date().toISOString(),
        todaySummary: {
          totalStudents: 245,
          presentCount: 232,
          absentCount: 13,
          lateCount: 3,
          activeClasses: 12,
          activeTeachers: 24,
          mealOrders: 215,
          activeServices: 8
        }
      }
    }

    return NextResponse.json(fallbackData, { status: 200 }) // Return 200 to allow frontend to handle gracefully
  }
}
