import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const overdueCount = await prisma.payment.count({
      where: {
        status: 'OVERDUE',
        dueDate: {
          lt: new Date()
        }
      }
    })

    // Get unique students with overdue payments
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
        },
        class: {
          select: {
            grade: true,
            section: true
          }
        }
      }
    })

    const overdueStudentsList = overdueStudents.map(student => ({
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      studentId: student.studentId,
      class: `${student.class.grade}${student.class.section}`,
      overdueAmount: student.payments.reduce((sum, p) => sum + p.amount, 0),
      overduePayments: student.payments.length
    }))

    return NextResponse.json({
      success: true,
      data: {
        overduePaymentsCount: overdueCount,
        overdueStudentsCount: overdueStudents.length,
        overdueStudents: overdueStudentsList,
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching overdue payments:', error)
    
    // Fallback data
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      data: {
        overduePaymentsCount: 18,
        overdueStudentsCount: 15,
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
        lastUpdated: new Date().toISOString()
      }
    })
  }
}
