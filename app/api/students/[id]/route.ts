import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

// GET /api/students/[id] - Get individual student
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = parseInt(params.id)
    
    if (isNaN(studentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid student ID' },
        { status: 400 }
      )
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
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

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: student.id,
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        fatherName: student.fatherName,
        nationalId: student.nationalId,
        birthDate: student.birthDate,
        grade: student.grade,
        section: student.section,
        phone: student.phone,
        email: student.email,
        address: student.address,
        enrollmentDate: student.enrollmentDate,
        isActive: student.isActive,
        class: {
          id: student.class.id,
          grade: student.class.grade,
          section: student.class.section,
          teacher: {
            name: `${student.class.teacher.firstName} ${student.class.teacher.lastName}`
          }
        }
      }
    })

  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch student' },
      { status: 500 }
    )
  }
}

// PUT /api/students/[id] - Update student
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = parseInt(params.id)
    
    if (isNaN(studentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid student ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      fatherName,
      nationalId,
      birthDate,
      grade,
      section,
      classId,
      phone,
      email,
      address
    } = body

    // Validate required fields
    const errors: Record<string, string> = {}

    if (!firstName?.trim()) errors.firstName = 'نام الزامی است'
    if (!lastName?.trim()) errors.lastName = 'نام خانوادگی الزامی است'
    if (!fatherName?.trim()) errors.fatherName = 'نام پدر الزامی است'
    if (!nationalId?.trim()) errors.nationalId = 'کد ملی الزامی است'
    if (!birthDate) errors.birthDate = 'تاریخ تولد الزامی است'

    // Validate formats
    if (nationalId && !/^\d{10}$/.test(nationalId)) {
      errors.nationalId = 'کد ملی باید ۱۰ رقم باشد'
    }

    if (phone && !/^09\d{9}$/.test(phone)) {
      errors.phone = 'شماره تماس معتبر نیست'
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'ایمیل معتبر نیست'
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

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    // Check for duplicates (excluding current student)
    const duplicateChecks = await Promise.all([
      prisma.student.findFirst({ 
        where: { 
          nationalId,
          id: { not: studentId }
        } 
      }),
      phone ? prisma.student.findFirst({ 
        where: { 
          phone,
          id: { not: studentId }
        } 
      }) : null,
      email ? prisma.student.findFirst({ 
        where: { 
          email,
          id: { not: studentId }
        } 
      }) : null
    ])

    if (duplicateChecks[0]) {
      errors.nationalId = 'دانش‌آموز دیگری با این کد ملی وجود دارد'
    }
    if (duplicateChecks[1]) {
      errors.phone = 'دانش‌آموز دیگری با این شماره تماس وجود دارد'
    }
    if (duplicateChecks[2]) {
      errors.email = 'دانش‌آموز دیگری با این ایمیل وجود دارد'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          errors,
          message: 'اطلاعات تکراری'
        },
        { status: 400 }
      )
    }

    // Update student
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fatherName: fatherName.trim(),
        nationalId,
        birthDate: new Date(birthDate),
        grade,
        section,
        classId: classId || existingStudent.classId,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null
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

    console.log('✅ Student updated successfully:', {
      id: updatedStudent.id,
      name: `${updatedStudent.firstName} ${updatedStudent.lastName}`,
      studentId: updatedStudent.studentId
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedStudent.id,
        studentId: updatedStudent.studentId,
        firstName: updatedStudent.firstName,
        lastName: updatedStudent.lastName,
        fatherName: updatedStudent.fatherName,
        nationalId: updatedStudent.nationalId,
        birthDate: updatedStudent.birthDate,
        grade: updatedStudent.grade,
        section: updatedStudent.section,
        phone: updatedStudent.phone,
        email: updatedStudent.email,
        address: updatedStudent.address,
        enrollmentDate: updatedStudent.enrollmentDate,
        isActive: updatedStudent.isActive,
        class: {
          id: updatedStudent.class.id,
          grade: updatedStudent.class.grade,
          section: updatedStudent.class.section,
          teacher: {
            name: `${updatedStudent.class.teacher.firstName} ${updatedStudent.class.teacher.lastName}`
          }
        }
      },
      message: 'اطلاعات دانش‌آموز با موفقیت بروزرسانی شد'
    })

  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطا در بروزرسانی دانش‌آموز',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}