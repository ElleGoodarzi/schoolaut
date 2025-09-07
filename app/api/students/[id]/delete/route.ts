import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateStudentDeletion } from '@/lib/validation/dataIntegrity'

export async function DELETE(
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

    // Validate deletion (check for dependencies)
    const validation = await validateStudentDeletion(studentId)
    
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete student',
          details: validation.errors,
          canDelete: false
        },
        { status: 400 }
      )
    }

    // Get student info before deletion
    const student = await db.student.findUnique({
      where: { id: studentId },
      include: {
        class: {
          select: {
            grade: true,
            section: true
          }
        },
        _count: {
          select: {
            attendances: true,
            payments: true
          }
        }
      }
    })

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    // Perform deletion (cascades to attendance and payments)
    await db.student.delete({
      where: { id: studentId }
    })

    return NextResponse.json({
      success: true,
      message: `دانش‌آموز ${student.firstName} ${student.lastName} با موفقیت حذف شد`,
      deletedStudent: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        studentId: student.studentId,
        class: `${student.class.grade}${student.class.section}`,
        attendanceRecords: student._count.attendances,
        paymentRecords: student._count.payments
      },
      warnings: validation.warnings
    })

  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete student',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
