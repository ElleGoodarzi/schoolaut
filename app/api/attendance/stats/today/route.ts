import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTodayDate } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dateParam = searchParams.get('date') || getTodayDate()
    const todayDate = new Date(dateParam)
    todayDate.setHours(0, 0, 0, 0)
    
    // Get attendance stats for today
    const attendanceStats = await prisma.attendance.groupBy({
      by: ['status'],
      where: {
        date: todayDate
      },
      _count: {
        status: true
      }
    })

    // Process the stats
    const presentCount = attendanceStats.find(a => a.status === 'PRESENT')?._count.status || 0
    const absentCount = attendanceStats.find(a => a.status === 'ABSENT')?._count.status || 0
    const lateCount = attendanceStats.find(a => a.status === 'LATE')?._count.status || 0
    const excusedCount = attendanceStats.find(a => a.status === 'EXCUSED')?._count.status || 0

    const totalMarked = presentCount + absentCount + lateCount + excusedCount
    const totalStudents = await prisma.student.count({ where: { isActive: true } })
    const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0

    return NextResponse.json({
      success: true,
      data: {
        presentToday: presentCount,
        absentToday: absentCount,
        lateToday: lateCount,
        excusedToday: excusedCount,
        totalMarked,
        totalStudents,
        attendanceRate,
        date: dateParam,
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching attendance stats:', error)
    
    // Fallback data
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      data: {
        presentToday: 177,
        absentToday: 9,
        lateToday: 3,
        excusedToday: 0,
        totalMarked: 189,
        totalStudents: 186,
        attendanceRate: 95,
        date: getTodayDate(),
        lastUpdated: new Date().toISOString()
      }
    })
  }
}
