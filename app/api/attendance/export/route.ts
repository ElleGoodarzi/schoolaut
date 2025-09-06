import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const classId = searchParams.get('classId')
    
    // Parse date
    const targetDate = new Date(dateParam)
    targetDate.setHours(0, 0, 0, 0)

    // Build where clause
    let whereClause: any = {
      isActive: true,
      startDate: { lte: targetDate },
      OR: [
        { endDate: null },
        { endDate: { gte: targetDate } }
      ]
    }

    if (classId) {
      whereClause.classId = parseInt(classId)
    }

    // Fetch active students with their attendance for the specified date
    const activeAssignments = await db.studentClassAssignment.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            attendances: {
              where: {
                date: targetDate
              }
            }
          }
        },
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
      orderBy: [
        { class: { grade: 'asc' } },
        { class: { section: 'asc' } },
        { student: { lastName: 'asc' } },
        { student: { firstName: 'asc' } }
      ]
    })

    // Prepare data for Excel export
    const excelData = activeAssignments.map(assignment => {
      const attendance = assignment.student.attendances[0] // Should be only one for the date
      
      let statusPersian = 'ثبت نشده'
      switch (attendance?.status) {
        case 'PRESENT':
          statusPersian = 'حاضر'
          break
        case 'ABSENT':
          statusPersian = 'غایب'
          break
        case 'LATE':
          statusPersian = 'تأخیر'
          break
        case 'EXCUSED':
          statusPersian = 'مرخصی'
          break
      }

      return {
        'نام دانش‌آموز': `${assignment.student.firstName} ${assignment.student.lastName}`,
        'شماره دانش‌آموزی': assignment.student.studentId,
        'کد ملی': assignment.student.nationalId,
        'کلاس': `پایه ${assignment.class.grade} - شعبه ${assignment.class.section}`,
        'معلم': `${assignment.class.teacher.firstName} ${assignment.class.teacher.lastName}`,
        'وضعیت حضور': statusPersian,
        'یادداشت': attendance?.notes || '',
        'تاریخ': targetDate.toLocaleDateString('fa-IR')
      }
    })

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    const colWidths = [
      { wch: 20 }, // نام دانش‌آموز
      { wch: 15 }, // شماره دانش‌آموزی
      { wch: 15 }, // کد ملی
      { wch: 15 }, // کلاس
      { wch: 20 }, // معلم
      { wch: 12 }, // وضعیت حضور
      { wch: 30 }, // یادداشت
      { wch: 12 }  // تاریخ
    ]
    worksheet['!cols'] = colWidths

    // Add worksheet to workbook
    const sheetName = classId 
      ? `کلاس-${activeAssignments[0]?.class.grade}${activeAssignments[0]?.class.section}`
      : 'همه-کلاس‌ها'
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Create filename
    const persianDate = targetDate.toLocaleDateString('fa-IR').replace(/\//g, '-')
    const filename = classId 
      ? `حضور-کلاس-${activeAssignments[0]?.class.grade}${activeAssignments[0]?.class.section}-${persianDate}.xlsx`
      : `حضور-همه-کلاس‌ها-${persianDate}.xlsx`

    // Return Excel file
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': excelBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Error exporting attendance:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to export attendance data',
        message: 'خطا در خروجی گیری اطلاعات حضور و غیاب'
      },
      { status: 500 }
    )
  }
}
