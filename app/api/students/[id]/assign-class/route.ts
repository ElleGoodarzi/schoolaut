import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
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

    const { classId, startDate, endDate, reason } = body

    // Validation
    if (!classId || !startDate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Class ID and start date are required',
          message: 'کلاس و تاریخ شروع الزامی است'
        },
        { status: 400 }
      )
    }

    // Check if student exists
    const student = await db.student.findUnique({
      where: { id: studentId }
    })

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    // Check if class exists and has capacity
    const targetClass = await db.class.findUnique({
      where: { id: classId },
      include: {
        classAssignments: {
          where: { 
            isActive: true,
            OR: [
              { endDate: null },
              { endDate: { gte: new Date() } }
            ]
          }
        },
        teacher: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    if (!targetClass) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Class not found',
          message: 'کلاس انتخاب شده موجود نیست'
        },
        { status: 404 }
      )
    }

    // Check class capacity
    if (targetClass.classAssignments.length >= targetClass.capacity) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Class is full',
          message: 'ظرفیت کلاس تکمیل است'
        },
        { status: 400 }
      )
    }

    // Check for existing active assignment for this student
    const existingActiveAssignment = await db.studentClassAssignment.findFirst({
      where: {
        studentId,
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ]
      },
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

    // If there's an active assignment, deactivate it
    if (existingActiveAssignment) {
      await db.studentClassAssignment.update({
        where: { id: existingActiveAssignment.id },
        data: {
          endDate: new Date(startDate),
          isActive: false,
          updatedAt: new Date()
        }
      })

      console.log(`✅ Deactivated previous assignment: Student ${studentId} from Class ${existingActiveAssignment.classId}`)
    }

    // Create new class assignment
    const newAssignment = await db.studentClassAssignment.create({
      data: {
        studentId,
        classId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        reason: reason || 'تخصیص جدید',
        isActive: true
      },
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
        },
        student: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // Also update the student's current classId field for backward compatibility
    await db.student.update({
      where: { id: studentId },
      data: {
        classId,
        grade: targetClass.grade,
        section: targetClass.section
      }
    })

    // Create attendance record for today if it's a school day and assignment starts today
    const assignmentStartDate = new Date(startDate)
    const today = new Date()
    const isToday = assignmentStartDate.toDateString() === today.toDateString()
    const dayOfWeek = today.getDay()
    
    if (isToday && dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
      // Check if attendance record already exists for today
      const existingAttendance = await db.attendance.findUnique({
        where: {
          studentId_date: {
            studentId,
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate())
          }
        }
      })

      if (!existingAttendance) {
        await db.attendance.create({
          data: {
            studentId,
            classId,
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            status: 'PRESENT',
            notes: `تخصیص به کلاس جدید: ${targetClass.grade}${targetClass.section}`,
            createdAt: new Date()
          }
        })
      }
    }

    const response = {
      id: newAssignment.id,
      studentId: newAssignment.studentId,
      classId: newAssignment.classId,
      className: `پایه ${newAssignment.class.grade} - شعبه ${newAssignment.class.section}`,
      teacherName: `${newAssignment.class.teacher.firstName} ${newAssignment.class.teacher.lastName}`,
      startDate: newAssignment.startDate.toLocaleDateString('fa-IR'),
      endDate: newAssignment.endDate?.toLocaleDateString('fa-IR') || null,
      reason: newAssignment.reason,
      isActive: newAssignment.isActive,
      createdAt: newAssignment.createdAt.toLocaleDateString('fa-IR')
    }

    console.log('✅ Student assigned to class successfully:', {
      studentId,
      studentName: `${newAssignment.student.firstName} ${newAssignment.student.lastName}`,
      className: response.className,
      startDate: response.startDate
    })

    return NextResponse.json({
      success: true,
      data: response,
      message: 'دانش‌آموز با موفقیت به کلاس تخصیص یافت'
    }, { status: 201 })

  } catch (error) {
    console.error('Error assigning student to class:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to assign student to class',
        message: 'خطا در تخصیص دانش‌آموز به کلاس'
      },
      { status: 500 }
    )
  }
}
