import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { studentSchema } from '@/lib/validation/schemas'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const grade = searchParams.get('grade')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let whereClause: any = {
      isActive: true
    }

    if (grade && grade !== 'all') {
      whereClause.grade = parseInt(grade)
    }

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } },
        { nationalId: { contains: search, mode: 'insensitive' } }
      ]
    }

    const students = await db.student.findMany({
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
          where: {
            status: 'OVERDUE'
          },
          select: {
            amount: true,
            dueDate: true
          }
        },
        attendances: {
          where: {
            date: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          },
          select: {
            status: true,
            date: true
          }
        }
      },
      orderBy: [
        { grade: 'asc' },
        { lastName: 'asc' },
        { firstName: 'asc' }
      ],
      take: limit,
      skip: offset
    })

    // Calculate additional info for each student
    const studentsWithInfo = students.map(student => {
      const overduePayments = student.payments.reduce((sum, payment) => sum + payment.amount, 0)
      const recentAttendance = student.attendances
      const attendanceRate = recentAttendance.length > 0 
        ? (recentAttendance.filter(a => a.status === 'PRESENT').length / recentAttendance.length) * 100 
        : 100

      return {
        id: student.id,
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        fatherName: student.fatherName,
        nationalId: student.nationalId,
        birthDate: student.birthDate,
        grade: student.grade,
        section: student.section,
        classId: student.classId,
        enrollmentDate: student.enrollmentDate,
        isActive: student.isActive,
        class: {
          id: student.class.id,
          grade: student.class.grade,
          section: student.class.section,
          teacher: {
            name: `${student.class.teacher.firstName} ${student.class.teacher.lastName}`
          }
        },
        financialStatus: {
          overdueAmount: overduePayments,
          hasOverdue: overduePayments > 0
        },
        attendanceStatus: {
          rate: Math.round(attendanceRate),
          recentAbsences: recentAttendance.filter(a => a.status === 'ABSENT').length
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: studentsWithInfo,
      pagination: {
        limit,
        offset,
        total: studentsWithInfo.length
      }
    })

  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch students',
        data: [] // Fallback empty array
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      studentId,
      firstName,
      lastName,
      fatherName,
      nationalId,
      birthDate,
      grade,
      section,
      classId,
      phone,
      address
    } = body

    // Basic field validation
    const errors: Record<string, string> = {}

    if (!firstName?.trim()) errors.firstName = 'نام الزامی است'
    if (!lastName?.trim()) errors.lastName = 'نام خانوادگی الزامی است'
    if (!fatherName?.trim()) errors.fatherName = 'نام پدر الزامی است'
    if (!nationalId?.trim()) errors.nationalId = 'کد ملی الزامی است'
    if (!birthDate) errors.birthDate = 'تاریخ تولد الزامی است'
    if (!classId) errors.classId = 'انتخاب کلاس الزامی است'
    if (!phone?.trim()) errors.phone = 'شماره تماس الزامی است'

    // Validate national ID format
    if (nationalId && !/^\d{10}$/.test(nationalId)) {
      errors.nationalId = 'کد ملی باید ۱۰ رقم باشد'
    }

    // Validate phone format
    if (phone && !/^09\d{9}$/.test(phone)) {
      errors.phone = 'شماره تماس معتبر نیست'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          errors,
          message: 'اطلاعات وارد شده صحیح نیست'
        },
        { status: 400 }
      )
    }

    // Generate studentId if not provided
    const finalStudentId = studentId || `${new Date().getFullYear().toString().slice(-2)}${grade.toString().padStart(2, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`

    // Check for duplicate nationalId
    const existingStudent = await db.student.findFirst({
      where: {
        OR: [
          { nationalId },
          { phone: phone || undefined }
        ]
      }
    })

    if (existingStudent) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'دانش‌آموزی با این کد ملی یا شماره تلفن قبلاً ثبت شده است'
        },
        { status: 400 }
      )
    }

    // Verify class exists and has capacity
    const targetClass = await db.class.findUnique({
      where: { id: classId },
      include: {
        students: { where: { isActive: true } },
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
          field: 'classId',
          message: 'کلاس انتخاب شده موجود نیست'
        },
        { status: 400 }
      )
    }

    if (targetClass.students.length >= targetClass.capacity) {
      return NextResponse.json(
        { 
          success: false, 
          field: 'classId',
          message: 'ظرفیت کلاس تکمیل است'
        },
        { status: 400 }
      )
    }

    // Create student
    const newStudent = await db.student.create({
      data: {
        studentId: finalStudentId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fatherName: fatherName.trim(),
        nationalId,
        birthDate: new Date(birthDate),
        grade,
        section,
        classId,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        enrollmentDate: new Date(),
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
        }
      }
    })

    // Create default financial record (initial tuition payment due)
    const currentDate = new Date()
    const dueDate = new Date(currentDate)
    dueDate.setMonth(dueDate.getMonth() + 1) // Due next month

    await db.payment.create({
      data: {
        studentId: newStudent.id,
        amount: 2500000, // Default tuition amount (2.5M Toman)
        dueDate,
        status: 'PENDING',
        type: 'TUITION',
        description: 'شهریه ماهانه - ثبت نام اولیه',
        createdAt: new Date()
      }
    })

    // Create initial attendance record for today (if not weekend)
    const today = new Date()
    const dayOfWeek = today.getDay()
    
    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
      // Check if attendance record already exists for today
      const existingAttendance = await db.attendance.findUnique({
        where: {
          studentId_date: {
            studentId: newStudent.id,
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate())
          }
        }
      })

      if (!existingAttendance) {
        await db.attendance.create({
          data: {
            studentId: newStudent.id,
            classId: newStudent.classId,
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            status: 'PRESENT', // Default to present for new student
            notes: 'ثبت نام جدید',
            createdAt: new Date()
          }
        })
      }
    }

    // Return complete student information
    const studentResponse = {
      id: newStudent.id,
      studentId: newStudent.studentId,
      firstName: newStudent.firstName,
      lastName: newStudent.lastName,
      fatherName: newStudent.fatherName,
      nationalId: newStudent.nationalId,
      birthDate: newStudent.birthDate,
      grade: newStudent.grade,
      section: newStudent.section,
      classId: newStudent.classId,
      enrollmentDate: newStudent.enrollmentDate,
      isActive: newStudent.isActive,
      phone,
      address,
      class: {
        id: newStudent.class.id,
        grade: newStudent.class.grade,
        section: newStudent.class.section,
        teacher: {
          name: `${newStudent.class.teacher.firstName} ${newStudent.class.teacher.lastName}`
        }
      },
      financialStatus: {
        overdueAmount: 0,
        hasOverdue: false
      },
      attendanceStatus: {
        rate: 100,
        recentAbsences: 0
      }
    }

    console.log('✅ Student created successfully:', {
      id: newStudent.id,
      name: `${newStudent.firstName} ${newStudent.lastName}`,
      class: `${newStudent.grade}${newStudent.section}`,
      studentId: newStudent.studentId
    })

    return NextResponse.json({
      success: true,
      data: studentResponse,
      message: 'دانش‌آموز با موفقیت ایجاد شد'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطا در ایجاد دانش‌آموز',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}