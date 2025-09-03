import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTodayDate } from '@/lib/utils'

export async function GET() {
  try {
    const today = getTodayDate()
    
    // Get total students
    const totalStudents = await prisma.student.count({
      where: { isActive: true }
    })
    
    // Get today's attendance stats
    const todayAttendance = await prisma.attendance.groupBy({
      by: ['status'],
      where: {
        date: new Date(today)
      },
      _count: {
        status: true
      }
    })
    
    // Calculate present and absent counts
    const presentCount = todayAttendance.find(a => a.status === 'PRESENT')?._count.status || 0
    const absentCount = todayAttendance.find(a => a.status === 'ABSENT')?._count.status || 0
    const lateCount = todayAttendance.find(a => a.status === 'LATE')?._count.status || 0
    
    // Get overdue payments count
    const overduePayments = await prisma.payment.count({
      where: {
        status: 'OVERDUE',
        dueDate: {
          lt: new Date()
        }
      }
    })
    
    // Get active classes count
    const activeClasses = await prisma.class.count({
      where: { isActive: true }
    })
    
    // Get active teachers count
    const activeTeachers = await prisma.teacher.count({
      where: { isActive: true }
    })
    
    // Get today's meal orders
    const todayMeals = await prisma.mealService.aggregate({
      where: {
        date: new Date(today),
        isActive: true
      },
      _sum: {
        totalOrders: true
      }
    })
    
    // Get active meal services count
    const activeMealServices = await prisma.mealService.count({
      where: {
        date: new Date(today),
        isActive: true
      }
    })
    
    return NextResponse.json({
      totalStudents,
      presentToday: presentCount,
      absentToday: absentCount,
      lateToday: lateCount,
      overduePayments,
      activeClasses,
      activeTeachers,
      todayMealOrders: todayMeals._sum.totalOrders || 0,
      activeMealServices
    })
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}
