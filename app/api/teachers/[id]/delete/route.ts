import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateTeacherDeletion } from '@/lib/validation/dataIntegrity'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teacherId = parseInt(params.id)
    
    if (isNaN(teacherId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid teacher ID' },
        { status: 400 }
      )
    }

    // Validate deletion (check for dependencies)
    const validation = await validateTeacherDeletion(teacherId)
    
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete teacher',
          details: validation.errors,
          canDelete: false
        },
        { status: 400 }
      )
    }

    // Get teacher info before deletion
    const teacher = await db.teacher.findUnique({
      where: { id: teacherId },
      include: {
        _count: {
          select: {
            classes: true
          }
        }
      }
    })

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      )
    }

    // Perform deletion
    await db.teacher.delete({
      where: { id: teacherId }
    })

    return NextResponse.json({
      success: true,
      message: `دبیر ${teacher.firstName} ${teacher.lastName} با موفقیت حذف شد`,
      deletedTeacher: {
        id: teacher.id,
        name: `${teacher.firstName} ${teacher.lastName}`,
        employeeId: teacher.employeeId,
        classCount: teacher._count.classes
      },
      warnings: validation.warnings
    })

  } catch (error) {
    console.error('Error deleting teacher:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete teacher',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
