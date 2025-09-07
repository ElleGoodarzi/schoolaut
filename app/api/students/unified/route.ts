import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters for intelligent filtering and inclusion
    const include = searchParams.get('include')?.split(',') || []
    const grade = searchParams.get('grade') ? parseInt(searchParams.get('grade')!) : undefined
    const hasFinancialIssues = searchParams.get('hasFinancialIssues') === 'true'
    const hasAttendanceIssues = searchParams.get('hasAttendanceIssues') === 'true'
    const context = searchParams.get('context') || 'default'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    // Build dynamic include object based on requested modules
    const includeOptions: any = {
      class: {
        include: {
          teacher: true
        }
      }
    }

    // Add conditional includes based on context
    if (include.includes('financial') || context === 'financial' || hasFinancialIssues) {
      includeOptions.payments = {
        where: {
          status: 'PENDING'
        },
        orderBy: {
          dueDate: 'asc'
        }
      }
      includeOptions.tuitionSettings = true
    }

    if (include.includes('attendance') || context === 'attendance' || hasAttendanceIssues) {
      includeOptions.attendanceRecords = {
        where: {
          date: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)) // Last 30 days
          }
        }
      }
    }

    if (include.includes('services') || context === 'services') {
      includeOptions.mealSubscription = true
      includeOptions.transportSubscription = true
    }

    if (include.includes('parent') || context === 'communication') {
      includeOptions.parentInfo = true
    }

    // Build where clause with intelligent filtering
    const whereClause: any = {}

    if (grade) {
      whereClause.grade = grade
    }

    // Complex filtering for financial issues
    if (hasFinancialIssues) {
      whereClause.payments = {
        some: {
          status: 'PENDING',
          dueDate: {
            lt: new Date()
          }
        }
      }
    }

    // Complex filtering for attendance issues
    if (hasAttendanceIssues) {
      whereClause.attendanceRecords = {
        some: {
          status: 'ABSENT',
          date: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7)) // Recent absences
          }
        }
      }
    }

    // Fetch students with dynamic includes
    const students = await db.student.findMany({
      where: whereClause,
      include: includeOptions,
      orderBy: [
        { grade: 'asc' },
        { section: 'asc' },
        { lastName: 'asc' }
      ],
      take: limit
    })

    // Transform data to unified format with cross-module information
    const transformedStudents = students.map(student => {
      const transformed: any = {
        id: student.id,
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        grade: student.grade,
        section: student.section,
        class: student.class
      }

      // Add financial information if included
      if (student.payments && student.tuitionSettings) {
        const overduePayments = student.payments.filter(p => 
          p.status === 'PENDING' && new Date(p.dueDate) < new Date()
        )
        
        transformed.financialInfo = {
          overdueAmount: overduePayments.reduce((sum, p) => sum + p.amount, 0),
          overduePayments: overduePayments.length,
          lastPaymentDate: student.payments
            .filter(p => p.status === 'PAID')
            .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())[0]?.paidAt
        }
      }

      // Add attendance information if included
      if (student.attendanceRecords) {
        const totalRecords = student.attendanceRecords.length
        const presentCount = student.attendanceRecords.filter(r => r.status === 'PRESENT').length
        const absentCount = student.attendanceRecords.filter(r => r.status === 'ABSENT').length
        const lateCount = student.attendanceRecords.filter(r => r.status === 'LATE').length

        transformed.attendanceInfo = {
          attendanceRate: totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0,
          absenceCount: absentCount,
          lateCount: lateCount,
          lastAbsence: student.attendanceRecords
            .filter(r => r.status === 'ABSENT')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date
        }
      }

      // Add services information if included
      if (student.mealSubscription || student.transportSubscription) {
        transformed.servicesInfo = {
          mealPlan: student.mealSubscription?.planType,
          transportRoute: student.transportSubscription?.routeName,
          hasActiveMeal: student.mealSubscription?.status === 'ACTIVE',
          hasActiveTransport: student.transportSubscription?.status === 'ACTIVE'
        }
      }

      // Add parent information if included
      if (student.parentInfo) {
        transformed.parentInfo = {
          fatherName: student.parentInfo.fatherName,
          motherName: student.parentInfo.motherName,
          phone: student.parentInfo.primaryPhone,
          email: student.parentInfo.email
        }
      }

      return transformed
    })

    // Generate context-specific metadata
    const metadata = {
      totalCount: transformedStudents.length,
      context,
      filters: {
        grade,
        hasFinancialIssues,
        hasAttendanceIssues
      },
      summary: {
        withFinancialIssues: transformedStudents.filter(s => 
          s.financialInfo && s.financialInfo.overdueAmount > 0
        ).length,
        withAttendanceIssues: transformedStudents.filter(s => 
          s.attendanceInfo && s.attendanceInfo.attendanceRate < 75
        ).length
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        students: transformedStudents,
        metadata
      }
    })

  } catch (error) {
    console.error('Unified student API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت اطلاعات دانش‌آموزان',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}