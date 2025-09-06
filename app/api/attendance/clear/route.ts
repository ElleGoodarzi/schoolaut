import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { classId, date } = body

    // Validation
    if (!classId || !date) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'اطلاعات الزامی کامل نیست'
        },
        { status: 400 }
      )
    }

    // Parse date
    const attendanceDate = new Date(date)
    attendanceDate.setHours(0, 0, 0, 0)

    // Get all students in the class for the specified date
    const activeAssignments = await db.studentClassAssignment.findMany({
      where: {
        classId,
        isActive: true,
        startDate: { lte: attendanceDate },
        OR: [
          { endDate: null },
          { endDate: { gte: attendanceDate } }
        ]
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    const studentIds = activeAssignments.map(assignment => assignment.student.id)

    // Delete all attendance records for these students on this date
    const result = await db.attendance.deleteMany({
      where: {
        studentId: { in: studentIds },
        date: attendanceDate
      }
    })

    console.log(`✅ Bulk attendance cleared: ${result.count} records for class ${classId} on ${date}`)

    return NextResponse.json({
      success: true,
      data: {
        classId,
        date: attendanceDate.toLocaleDateString('fa-IR'),
        studentsCleared: result.count,
        studentNames: activeAssignments.map(a => `${a.student.firstName} ${a.student.lastName}`)
      },
      message: `${result.count} رکورد حضور و غیاب پاک شد`
    })

  } catch (error) {
    console.error('Error clearing class attendance:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear class attendance',
        message: 'خطا در پاک کردن حضور و غیاب کلاس'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, date } = body

    // Validation
    if (!studentId || !date) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'اطلاعات الزامی کامل نیست'
        },
        { status: 400 }
      )
    }

    // Parse date
    const attendanceDate = new Date(date)
    attendanceDate.setHours(0, 0, 0, 0)

    // Check if attendance record exists
    const existingRecord = await db.attendance.findUnique({
      where: {
        studentId_date: {
          studentId,
          date: attendanceDate
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
    })

    if (!existingRecord) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Attendance record not found',
          message: 'رکورد حضور و غیاب یافت نشد'
        },
        { status: 404 }
      )
    }

    // Delete the attendance record
    await db.attendance.delete({
      where: {
        studentId_date: {
          studentId,
          date: attendanceDate
        }
      }
    })

    console.log(`✅ Attendance cleared: Student ${existingRecord.student.firstName} ${existingRecord.student.lastName} on ${date}`)

    return NextResponse.json({
      success: true,
      data: {
        studentId,
        date: attendanceDate.toLocaleDateString('fa-IR'),
        studentName: `${existingRecord.student.firstName} ${existingRecord.student.lastName}`
      },
      message: 'رکورد حضور و غیاب پاک شد'
    })

  } catch (error) {
    console.error('Error clearing attendance:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear attendance',
        message: 'خطا در پاک کردن حضور و غیاب'
      },
      { status: 500 }
    )
  }
}
