import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = parseInt(params.id)
    const body = await request.json()
    
    if (isNaN(studentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid student ID' },
        { status: 400 }
      )
    }

    // Check if student exists
    const existingStudent = await db.student.findUnique({
      where: { id: studentId }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    // Update student
    const updatedStudent = await db.student.update({
      where: { id: studentId },
      data: body,
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
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedStudent,
      message: 'اطلاعات دانش‌آموز با موفقیت به‌روزرسانی شد'
    })

  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update student'
      },
      { status: 500 }
    )
  }
}

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

    // Soft delete by setting isActive to false
    const updatedStudent = await db.student.update({
      where: { id: studentId },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      data: updatedStudent,
      message: 'دانش‌آموز با موفقیت آرشیو شد'
    })

  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete student'
      },
      { status: 500 }
    )
  }
}
