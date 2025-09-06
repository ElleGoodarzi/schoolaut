import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = parseInt(params.id)
    const searchParams = request.nextUrl.searchParams
    const dateParam = searchParams.get('date')
    
    if (isNaN(studentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid student ID' },
        { status: 400 }
      )
    }

    // Check if student exists
    const student = await db.student.findUnique({
      where: { id: studentId },
      select: { id: true, firstName: true, lastName: true, isActive: true }
    })

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    if (dateParam) {
      // Get attendance for specific date
      const date = new Date(dateParam)
      date.setHours(0, 0, 0, 0)

      const attendance = await db.attendance.findUnique({
        where: {
          studentId_date: {
            studentId,
            date
          }
        },
        include: {
          class: {
            select: {
              grade: true,
              section: true,
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

      if (attendance) {
        return NextResponse.json({
          success: true,
          data: {
            id: attendance.id,
            studentId: attendance.studentId,
            classId: attendance.classId,
            date: attendance.date.toLocaleDateString('fa-IR'),
            status: attendance.status,
            notes: attendance.notes,
            className: `پایه ${attendance.class.grade} - شعبه ${attendance.class.section}`,
            teacherName: `${attendance.class.teacher.firstName} ${attendance.class.teacher.lastName}`,
            createdAt: attendance.createdAt.toLocaleDateString('fa-IR')
          }
        })
      } else {
        return NextResponse.json({
          success: true,
          data: null,
          message: 'حضور و غیاب برای این تاریخ ثبت نشده است'
        })
      }
    } else {
      // Get recent attendance records
      const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())
      const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
      
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)

      const attendanceRecords = await db.attendance.findMany({
        where: {
          studentId,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          class: {
            select: {
              grade: true,
              section: true,
              teacher: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      })

      // Calculate stats
      const totalDays = attendanceRecords.length
      const presentDays = attendanceRecords.filter(r => r.status === 'PRESENT').length
      const absentDays = attendanceRecords.filter(r => r.status === 'ABSENT').length
      const lateDays = attendanceRecords.filter(r => r.status === 'LATE').length
      const excusedDays = attendanceRecords.filter(r => r.status === 'EXCUSED').length
      const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

      const formattedRecords = attendanceRecords.map(record => ({
        id: record.id,
        date: record.date.toLocaleDateString('fa-IR'),
        status: record.status,
        notes: record.notes,
        className: `پایه ${record.class.grade} - شعبه ${record.class.section}`,
        teacherName: `${record.class.teacher.firstName} ${record.class.teacher.lastName}`
      }))

      return NextResponse.json({
        success: true,
        data: {
          student: {
            id: student.id,
            name: `${student.firstName} ${student.lastName}`
          },
          records: formattedRecords,
          stats: {
            totalDays,
            presentDays,
            absentDays,
            lateDays,
            excusedDays,
            attendanceRate
          },
          period: {
            month,
            year,
            monthName: new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(startDate)
          }
        }
      })
    }

  } catch (error) {
    console.error('Error fetching student attendance:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch attendance data'
      },
      { status: 500 }
    )
  }
}
