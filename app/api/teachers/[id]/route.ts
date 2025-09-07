import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { updateTeacherSchema } from '@/lib/validation/schemas'
import { AuthService } from '@/lib/auth/auth'
import { AuditService, extractRequestInfo } from '@/lib/audit/auditService'
import { z } from 'zod'

// GET /api/teachers/[id] - Get individual teacher
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await AuthService.getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const teacherId = parseInt(params.id)
    if (isNaN(teacherId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid teacher ID' },
        { status: 400 }
      )
    }

    const teacher = await db.teacher.findUnique({
      where: { id: teacherId },
      include: {
        classes: {
          where: { isActive: true },
          include: {
            _count: {
              select: {
                students: true
              }
            }
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

    return NextResponse.json({
      success: true,
      data: teacher
    })

  } catch (error) {
    console.error('Error fetching teacher:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch teacher' },
      { status: 500 }
    )
  }
}

// PUT /api/teachers/[id] - Update teacher
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await AuthService.getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check permissions - Only ADMIN and VICE_PRINCIPAL can edit teachers
    if (!['ADMIN', 'VICE_PRINCIPAL'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const teacherId = parseInt(params.id)
    if (isNaN(teacherId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid teacher ID' },
        { status: 400 }
      )
    }

    // Get existing teacher for audit log
    const existingTeacher = await db.teacher.findUnique({
      where: { id: teacherId }
    })

    if (!existingTeacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updateTeacherSchema.parse(body)

    // Check for duplicate employee ID if it's being updated
    if (validatedData.employeeId && validatedData.employeeId !== existingTeacher.employeeId) {
      const existingEmployee = await db.teacher.findUnique({
        where: { employeeId: validatedData.employeeId }
      })

      if (existingEmployee) {
        return NextResponse.json(
          { success: false, error: 'معلمی با این شماره پرسنلی قبلاً ثبت شده است' },
          { status: 400 }
        )
      }
    }

    // Check for duplicate national ID if it's being updated
    if (validatedData.nationalId && validatedData.nationalId !== existingTeacher.nationalId) {
      const existingNationalId = await db.teacher.findUnique({
        where: { nationalId: validatedData.nationalId }
      })

      if (existingNationalId) {
        return NextResponse.json(
          { success: false, error: 'معلمی با این کد ملی قبلاً ثبت شده است' },
          { status: 400 }
        )
      }
    }

    // Check for duplicate phone if it's being updated
    if (validatedData.phone && validatedData.phone !== existingTeacher.phone) {
      const existingPhone = await db.teacher.findUnique({
        where: { phone: validatedData.phone }
      })

      if (existingPhone) {
        return NextResponse.json(
          { success: false, error: 'معلمی با این شماره تلفن قبلاً ثبت شده است' },
          { status: 400 }
        )
      }
    }

    // Update the teacher
    const updatedTeacher = await db.teacher.update({
      where: { id: teacherId },
      data: validatedData,
      include: {
        classes: {
          where: { isActive: true },
          include: {
            _count: {
              select: {
                students: true
              }
            }
          }
        }
      }
    })

    // Audit log
    const requestInfo = extractRequestInfo(request)
    await AuditService.logUpdate(
      'Teacher',
      teacherId,
      existingTeacher,
      updatedTeacher,
      user.id,
      requestInfo.ipAddress,
      requestInfo.userAgent
    )

    return NextResponse.json({
      success: true,
      data: updatedTeacher,
      message: 'معلم با موفقیت به‌روزرسانی شد'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error updating teacher:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update teacher' },
      { status: 500 }
    )
  }
}

// DELETE /api/teachers/[id] - Delete teacher
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await AuthService.getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check permissions - Only ADMIN can delete teachers
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Only administrators can delete teachers' },
        { status: 403 }
      )
    }

    const teacherId = parseInt(params.id)
    if (isNaN(teacherId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid teacher ID' },
        { status: 400 }
      )
    }

    // Get existing teacher for audit log and check classes
    const existingTeacher = await db.teacher.findUnique({
      where: { id: teacherId },
      include: {
        _count: {
          select: {
            classes: true
          }
        }
      }
    })

    if (!existingTeacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      )
    }

    // Check if teacher has active classes
    if (existingTeacher._count.classes > 0) {
      return NextResponse.json(
        { success: false, error: 'نمی‌توان معلمی را که کلاس فعال دارد حذف کرد' },
        { status: 400 }
      )
    }

    // Delete the teacher
    await db.teacher.delete({
      where: { id: teacherId }
    })

    // Audit log
    const requestInfo = extractRequestInfo(request)
    await AuditService.logDelete(
      'Teacher',
      teacherId,
      existingTeacher,
      user.id,
      requestInfo.ipAddress,
      requestInfo.userAgent
    )

    return NextResponse.json({
      success: true,
      message: 'معلم با موفقیت حذف شد'
    })

  } catch (error) {
    console.error('Error deleting teacher:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete teacher' },
      { status: 500 }
    )
  }
}
