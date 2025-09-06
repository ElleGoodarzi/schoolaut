import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { updates, date, classId } = body

    // Validation
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Updates array is required',
          message: 'آرایه به‌روزرسانی الزامی است'
        },
        { status: 400 }
      )
    }

    if (!date) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Date is required',
          message: 'تاریخ الزامی است'
        },
        { status: 400 }
      )
    }

    // Parse and normalize date
    const attendanceDate = new Date(date)
    attendanceDate.setHours(0, 0, 0, 0)

    // Validate all updates before processing
    const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']
    for (const update of updates) {
      if (!update.studentId || !update.status) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Each update must have studentId and status',
            message: 'هر به‌روزرسانی باید شناسه دانش‌آموز و وضعیت داشته باشد'
          },
          { status: 400 }
        )
      }

      if (!validStatuses.includes(update.status)) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Invalid status: ${update.status}`,
            message: `وضعیت نامعتبر: ${update.status}`
          },
          { status: 400 }
        )
      }
    }

    // Verify all students exist and are active
    const studentIds = updates.map(u => u.studentId)
    const students = await db.student.findMany({
      where: {
        id: { in: studentIds },
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true
      }
    })

    if (students.length !== studentIds.length) {
      const foundIds = students.map(s => s.id)
      const missingIds = studentIds.filter(id => !foundIds.includes(id))
      return NextResponse.json(
        { 
          success: false, 
          error: `Students not found or inactive: ${missingIds.join(', ')}`,
          message: `دانش‌آموزان یافت نشده یا غیرفعال: ${missingIds.join(', ')}`
        },
        { status: 404 }
      )
    }

    // Process bulk updates using transaction
    const results = await db.$transaction(
      updates.map(update => 
        db.attendance.upsert({
          where: {
            studentId_date: {
              studentId: update.studentId,
              date: attendanceDate
            }
          },
          update: {
            status: update.status,
            notes: update.notes || null,
            classId: update.classId || classId,
            createdAt: new Date()
          },
          create: {
            studentId: update.studentId,
            classId: update.classId || classId,
            date: attendanceDate,
            status: update.status,
            notes: update.notes || null,
            createdAt: new Date()
          }
        })
      )
    )

    console.log(`✅ Bulk attendance updated: ${results.length} records for ${date}`)

    // Return summary of updates
    const summary = {
      totalUpdated: results.length,
      byStatus: validStatuses.reduce((acc, status) => {
        acc[status] = updates.filter(u => u.status === status).length
        return acc
      }, {} as Record<string, number>)
    }

    return NextResponse.json({
      success: true,
      data: {
        summary,
        updatedRecords: results.map(record => ({
          id: record.id,
          studentId: record.studentId,
          status: record.status,
          date: record.date.toLocaleDateString('fa-IR'),
          notes: record.notes
        }))
      },
      message: `${results.length} رکورد حضور و غیاب با موفقیت به‌روزرسانی شد`
    })

  } catch (error) {
    console.error('Error in bulk attendance update:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update attendance records',
        message: 'خطا در به‌روزرسانی رکوردهای حضور و غیاب'
      },
      { status: 500 }
    )
  }
}