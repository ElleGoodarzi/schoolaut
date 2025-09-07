import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

export async function GET() {
  try {
    // Get students with frequent absences (more than 3 absences in last 30 days)
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
        },
        class: {
          select: {
            grade: true,
            section: true
          }
        }
      }
    })

    // Filter students with more than 3 absences
    const highAbsenteeStudents = frequentAbsentees.filter(
      student => student.attendances.length > 3
    ).map(student => ({
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      studentId: student.studentId,
      class: `${student.class.grade}${student.class.section}`,
      absenceCount: student.attendances.length,
      grade: student.class.grade,
      section: student.class.section
    }))

    return NextResponse.json({
      success: true,
      data: {
        frequentAbsentees: highAbsenteeStudents,
        count: highAbsenteeStudents.length,
        threshold: 3,
        periodDays: 30,
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching frequent absentees:', error)
    
    // Fallback data
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      data: {
        frequentAbsentees: [
          {
            id: 1,
            name: 'احمد محمدی',
            studentId: '1001',
            class: '3الف',
            absenceCount: 5,
            grade: 3,
            section: 'الف'
          }
        ],
        count: 1,
        threshold: 3,
        periodDays: 30,
        lastUpdated: new Date().toISOString()
      }
    })
  }
}
