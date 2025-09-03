import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Get students with overdue payments
    const overdueStudents = await prisma.student.findMany({
      where: {
        payments: {
          some: {
            status: 'OVERDUE',
            dueDate: {
              lt: new Date()
            }
          }
        }
      },
      include: {
        payments: {
          where: {
            status: 'OVERDUE'
          }
        }
      }
    })
    
    // Get students with frequent absences (more than 5 absences in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const frequentAbsentees = await prisma.student.findMany({
      where: {
        attendances: {
          some: {
            status: 'ABSENT',
            date: {
              gte: thirtyDaysAgo
            }
          }
        }
      },
      include: {
        attendances: {
          where: {
            status: 'ABSENT',
            date: {
              gte: thirtyDaysAgo
            }
          }
        }
      }
    })
    
    // Filter students with more than 5 absences
    const highAbsenteeStudents = frequentAbsentees.filter(
      student => student.attendances.length > 5
    )
    
    const alerts = []
    
    if (overdueStudents.length > 0) {
      alerts.push({
        type: 'overdue_payments',
        severity: 'high',
        title: 'شهریه معوقه',
        message: `${overdueStudents.length} دانش‌آموز شهریه معوقه دارند`,
        count: overdueStudents.length,
        details: overdueStudents.map(student => ({
          name: `${student.firstName} ${student.lastName}`,
          overdueAmount: student.payments.reduce((sum, p) => sum + Number(p.amount), 0)
        }))
      })
    }
    
    if (highAbsenteeStudents.length > 0) {
      alerts.push({
        type: 'frequent_absences',
        severity: 'medium',
        title: 'غیبت مکرر',
        message: `${highAbsenteeStudents.length} دانش‌آموز غیبت بالا دارند`,
        count: highAbsenteeStudents.length,
        details: highAbsenteeStudents.map(student => ({
          name: `${student.firstName} ${student.lastName}`,
          absenceCount: student.attendances.length
        }))
      })
    }
    
    return NextResponse.json({ alerts })
    
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}
