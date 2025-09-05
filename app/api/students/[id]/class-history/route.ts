import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = parseInt(params.id)
    
    if (isNaN(studentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid student ID' },
        { status: 400 }
      )
    }

    // Check if student exists
    const student = await db.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        firstName: true,
        lastName: true
      }
    })

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    // Fetch all class assignments for this student
    const classAssignments = await db.studentClassAssignment.findMany({
      where: { studentId },
      include: {
        class: {
          include: {
            teacher: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    // Format the response
    const classHistory = classAssignments.map(assignment => ({
      id: assignment.id,
      className: `پایه ${assignment.class.grade} - شعبه ${assignment.class.section}`,
      grade: assignment.class.grade,
      section: assignment.class.section,
      teacherName: `${assignment.class.teacher.firstName} ${assignment.class.teacher.lastName}`,
      startDate: assignment.startDate.toLocaleDateString('fa-IR'),
      endDate: assignment.endDate?.toLocaleDateString('fa-IR') || null,
      reason: assignment.reason || 'تخصیص اولیه',
      isActive: assignment.isActive,
      duration: assignment.endDate 
        ? `${assignment.startDate.toLocaleDateString('fa-IR')} - ${assignment.endDate.toLocaleDateString('fa-IR')}`
        : `${assignment.startDate.toLocaleDateString('fa-IR')} - ادامه دارد`,
      createdAt: assignment.createdAt.toLocaleDateString('fa-IR')
    }))

    // Separate current and past assignments
    const currentAssignment = classHistory.find(assignment => assignment.isActive)
    const pastAssignments = classHistory.filter(assignment => !assignment.isActive)

    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: student.id,
          name: `${student.firstName} ${student.lastName}`
        },
        currentAssignment,
        pastAssignments,
        totalAssignments: classHistory.length,
        history: classHistory
      }
    })

  } catch (error) {
    console.error('Error fetching student class history:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch class history'
      },
      { status: 500 }
    )
  }
}
