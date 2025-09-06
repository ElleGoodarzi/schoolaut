import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, classId, date, status, notes } = body

    // Validation
    if (!studentId || !classId || !date || !status) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'اطلاعات الزامی کامل نیست'
        },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid status',
          message: 'وضعیت حضور معتبر نیست'
        },
        { status: 400 }
      )
    }

    // Check if student exists and is active
    const student = await db.student.findUnique({
      where: { id: studentId },
      select: { id: true, isActive: true, firstName: true, lastName: true }
    })

    if (!student || !student.isActive) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Student not found or inactive',
          message: 'دانش‌آموز یافت نشد یا غیرفعال است'
        },
        { status: 404 }
      )
    }

    // Check if class exists
    const classExists = await db.class.findUnique({
      where: { id: classId },
      select: { id: true, isActive: true }
    })

    if (!classExists || !classExists.isActive) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Class not found or inactive',
          message: 'کلاس یافت نشد یا غیرفعال است'
        },
        { status: 404 }
      )
    }

    // Parse date
    const attendanceDate = new Date(date)
    attendanceDate.setHours(0, 0, 0, 0) // Normalize to start of day

    // Upsert attendance record (create or update)
    const attendanceRecord = await db.attendance.upsert({
      where: {
        studentId_date: {
          studentId,
          date: attendanceDate
        }
      },
      update: {
        status,
        notes: notes || null,
        classId, // Update class in case student changed classes
        createdAt: new Date() // Update timestamp
      },
      create: {
        studentId,
        classId,
        date: attendanceDate,
        status,
        notes: notes || null,
        createdAt: new Date()
      }
    })

    console.log(`✅ Attendance marked: Student ${student.firstName} ${student.lastName} - ${status} on ${date}`)

    return NextResponse.json({
      success: true,
      data: {
        id: attendanceRecord.id,
        studentId: attendanceRecord.studentId,
        classId: attendanceRecord.classId,
        date: attendanceRecord.date.toLocaleDateString('fa-IR'),
        status: attendanceRecord.status,
        notes: attendanceRecord.notes,
        studentName: `${student.firstName} ${student.lastName}`
      },
      message: 'حضور و غیاب با موفقیت ثبت شد'
    })

  } catch (error) {
    console.error('Error marking attendance:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to mark attendance',
        message: 'خطا در ثبت حضور و غیاب'
      },
      { status: 500 }
    )
  }
}
