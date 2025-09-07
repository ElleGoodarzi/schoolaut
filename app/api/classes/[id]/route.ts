import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

// GET /api/classes/[id] - Get individual class details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const classId = parseInt(params.id)
    
    if (isNaN(classId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid class ID' },
        { status: 400 }
      )
    }

    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true,
            phone: true,
            email: true
          }
        },
        students: {
          where: { isActive: true },
          select: {
            id: true,
            studentId: true,
            firstName: true,
            lastName: true,
            nationalId: true,
            phone: true
          }
        },
        attendances: {
          where: {
            date: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          },
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        _count: {
          select: {
            students: true,
            attendances: true
          }
        }
      }
    })

    if (!classData) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      )
    }

    // Calculate class statistics
    const recentAttendance = classData.attendances
    const attendanceStats = {
      totalDays: new Set(recentAttendance.map(a => a.date.toDateString())).size,
      presentCount: recentAttendance.filter(a => a.status === 'PRESENT').length,
      absentCount: recentAttendance.filter(a => a.status === 'ABSENT').length,
      lateCount: recentAttendance.filter(a => a.status === 'LATE').length,
      excusedCount: recentAttendance.filter(a => a.status === 'EXCUSED').length
    }

    const response = {
      id: classData.id,
      grade: classData.grade,
      section: classData.section,
      className: `پایه ${classData.grade} - شعبه ${classData.section}`,
      capacity: classData.capacity,
      currentStudents: classData._count.students,
      availableSpots: Math.max(0, classData.capacity - classData._count.students),
      isActive: classData.isActive,
      teacher: {
        name: `${classData.teacher.firstName} ${classData.teacher.lastName}`,
        employeeId: classData.teacher.employeeId,
        phone: classData.teacher.phone,
        email: classData.teacher.email
      },
      students: classData.students,
      attendanceStats,
      metadata: {
        totalStudents: classData._count.students,
        totalAttendanceRecords: classData._count.attendances,
        lastUpdated: new Date().toISOString()
      }
    }

    return NextResponse.json({
      success: true,
      data: response
    })

  } catch (error) {
    console.error('Error fetching class details:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch class details' },
      { status: 500 }
    )
  }
}

// PUT /api/classes/[id] - Update class details
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const classId = parseInt(params.id)
    const body = await request.json()
    
    if (isNaN(classId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid class ID' },
        { status: 400 }
      )
    }

    const { teacherId, capacity, isActive } = body

    // Verify class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: classId }
    })

    if (!existingClass) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      )
    }

    // Update class
    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: {
        ...(teacherId && { teacherId: parseInt(teacherId) }),
        ...(capacity && { capacity: parseInt(capacity) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) })
      },
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true
          }
        },
        _count: {
          select: {
            students: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: { class: updatedClass },
      message: 'اطلاعات کلاس با موفقیت به‌روزرسانی شد'
    })

  } catch (error) {
    console.error('Error updating class:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update class' },
      { status: 500 }
    )
  }
}

// DELETE /api/classes/[id] - Delete class (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const classId = parseInt(params.id)
    
    if (isNaN(classId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid class ID' },
        { status: 400 }
      )
    }

    // Check if class has active students
    const studentsCount = await prisma.student.count({
      where: { classId, isActive: true }
    })

    if (studentsCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete class with active students',
          message: 'نمی‌توان کلاسی را که دانش‌آموز فعال دارد حذف کرد'
        },
        { status: 400 }
      )
    }

    // Soft delete (set isActive to false)
    const deletedClass = await prisma.class.update({
      where: { id: classId },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      data: { class: deletedClass },
      message: 'کلاس با موفقیت غیرفعال شد'
    })

  } catch (error) {
    console.error('Error deleting class:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete class' },
      { status: 500 }
    )
  }
}
