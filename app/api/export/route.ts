import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import * as XLSX from 'xlsx'

// GET /api/export - Comprehensive data export utility
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'students'
    const format = searchParams.get('format') || 'xlsx'
    const classId = searchParams.get('classId')
    const grade = searchParams.get('grade')
    const date = searchParams.get('date')

    let data: any[] = []
    let filename = ''

    switch (type) {
      case 'students':
        data = await exportStudents(classId, grade)
        filename = `students-${new Date().toISOString().split('T')[0]}`
        break
      
      case 'attendance':
        data = await exportAttendance(date, classId, grade)
        filename = `attendance-${date || new Date().toISOString().split('T')[0]}`
        break
      
      case 'financial':
        data = await exportFinancial(classId, grade)
        filename = `financial-${new Date().toISOString().split('T')[0]}`
        break
      
      case 'teachers':
        data = await exportTeachers()
        filename = `teachers-${new Date().toISOString().split('T')[0]}`
        break
      
      case 'classes':
        data = await exportClasses()
        filename = `classes-${new Date().toISOString().split('T')[0]}`
        break
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid export type' },
          { status: 400 }
        )
    }

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data,
        filename: `${filename}.json`,
        count: data.length
      })
    }

    // Create Excel file
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, type)
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}.xlsx"`
      }
    })

  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { success: false, error: 'Export failed' },
      { status: 500 }
    )
  }
}

async function exportStudents(classId?: string | null, grade?: string | null) {
  let whereClause: any = { isActive: true }
  
  if (classId) whereClause.classId = parseInt(classId)
  if (grade) whereClause.grade = parseInt(grade)

  const students = await prisma.student.findMany({
    where: whereClause,
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
      payments: {
        where: { status: 'OVERDUE' }
      },
      attendances: {
        where: {
          date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }
    }
  })

  return students.map(student => ({
    'شماره دانش‌آموزی': student.studentId,
    'نام': student.firstName,
    'نام خانوادگی': student.lastName,
    'نام پدر': student.fatherName,
    'کد ملی': student.nationalId,
    'تاریخ تولد': student.birthDate.toLocaleDateString('fa-IR'),
    'پایه': student.grade,
    'شعبه': student.section,
    'کلاس': `پایه ${student.grade} - شعبه ${student.section}`,
    'معلم': `${student.class.teacher.firstName} ${student.class.teacher.lastName}`,
    'تلفن': student.phone || '',
    'آدرس': student.address || '',
    'تاریخ ثبت‌نام': student.enrollmentDate.toLocaleDateString('fa-IR'),
    'وضعیت': student.isActive ? 'فعال' : 'غیرفعال',
    'شهریه معوقه': student.payments.reduce((sum, p) => sum + p.amount, 0),
    'نرخ حضور': student.attendances.length > 0 
      ? Math.round((student.attendances.filter(a => a.status === 'PRESENT').length / student.attendances.length) * 100)
      : 100
  }))
}

async function exportAttendance(date?: string | null, classId?: string | null, grade?: string | null) {
  const targetDate = date ? new Date(date) : new Date()
  targetDate.setHours(0, 0, 0, 0)

  let whereClause: any = { date: targetDate }
  
  if (classId) whereClause.classId = parseInt(classId)

  const attendances = await prisma.attendance.findMany({
    where: whereClause,
    include: {
      student: {
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
      }
    }
  })

  return attendances.map(attendance => ({
    'تاریخ': attendance.date.toLocaleDateString('fa-IR'),
    'شماره دانش‌آموزی': attendance.student.studentId,
    'نام دانش‌آموز': `${attendance.student.firstName} ${attendance.student.lastName}`,
    'پایه': attendance.student.grade,
    'شعبه': attendance.student.section,
    'کلاس': `پایه ${attendance.student.class.grade} - شعبه ${attendance.student.class.section}`,
    'معلم': `${attendance.student.class.teacher.firstName} ${attendance.student.class.teacher.lastName}`,
    'وضعیت حضور': attendance.status,
    'وضعیت (فارسی)': attendance.status === 'PRESENT' ? 'حاضر' : 
                      attendance.status === 'ABSENT' ? 'غایب' :
                      attendance.status === 'LATE' ? 'تأخیر' : 
                      attendance.status === 'EXCUSED' ? 'مرخصی' : attendance.status,
    'یادداشت': attendance.notes || ''
  }))
}

async function exportFinancial(classId?: string | null, grade?: string | null) {
  let whereClause: any = { isActive: true }
  
  if (classId) whereClause.classId = parseInt(classId)
  if (grade) whereClause.grade = parseInt(grade)

  const students = await prisma.student.findMany({
    where: whereClause,
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
      payments: {
        orderBy: { dueDate: 'desc' }
      }
    }
  })

  const financialData: any[] = []
  
  students.forEach(student => {
    const totalPayments = student.payments.reduce((sum, p) => sum + p.amount, 0)
    const overduePayments = student.payments
      .filter(p => p.status === 'OVERDUE' && p.dueDate < new Date())
      .reduce((sum, p) => sum + p.amount, 0)

    financialData.push({
      'شماره دانش‌آموزی': student.studentId,
      'نام دانش‌آموز': `${student.firstName} ${student.lastName}`,
      'پایه': student.grade,
      'شعبه': student.section,
      'کلاس': `پایه ${student.grade} - شعبه ${student.section}`,
      'کل پرداخت‌ها': totalPayments,
      'شهریه معوقه': overduePayments,
      'وضعیت مالی': overduePayments > 0 ? 'معوقه' : 'بدون بدهی',
      'تعداد پرداخت‌ها': student.payments.length
    })
  })

  return financialData
}

async function exportTeachers() {
  const teachers = await prisma.teacher.findMany({
    where: { isActive: true },
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

  return teachers.map(teacher => ({
    'کد کارمندی': teacher.employeeId,
    'نام': teacher.firstName,
    'نام خانوادگی': teacher.lastName,
    'کد ملی': teacher.nationalId,
    'تلفن': teacher.phone,
    'ایمیل': teacher.email || '',
    'تاریخ استخدام': teacher.hireDate.toLocaleDateString('fa-IR'),
    'تعداد کلاس‌ها': teacher.classes.length,
    'کل دانش‌آموزان': teacher.classes.reduce((sum, c) => sum + c._count.students, 0),
    'وضعیت': teacher.isActive ? 'فعال' : 'غیرفعال'
  }))
}

async function exportClasses() {
  const classes = await prisma.class.findMany({
    where: { isActive: true },
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

  return classes.map(cls => ({
    'شناسه کلاس': cls.id,
    'پایه': cls.grade,
    'شعبه': cls.section,
    'نام کلاس': `پایه ${cls.grade} - شعبه ${cls.section}`,
    'معلم': `${cls.teacher.firstName} ${cls.teacher.lastName}`,
    'کد معلم': cls.teacher.employeeId,
    'ظرفیت': cls.capacity,
    'تعداد دانش‌آموزان': cls._count.students,
    'ظرفیت باقی‌مانده': Math.max(0, cls.capacity - cls._count.students),
    'درصد پر بودن': Math.round((cls._count.students / cls.capacity) * 100),
    'وضعیت': cls.isActive ? 'فعال' : 'غیرفعال'
  }))
}
