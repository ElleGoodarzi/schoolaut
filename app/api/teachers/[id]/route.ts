import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

// GET /api/teachers/[id] - Get individual teacher
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teacherId = parseInt(params.id)
    
    if (isNaN(teacherId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid teacher ID' },
        { status: 400 }
      )
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
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

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: teacher.id,
        employeeId: teacher.employeeId,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        nationalId: teacher.nationalId,
        phone: teacher.phone,
        email: teacher.email,
        hireDate: teacher.hireDate,
        isActive: teacher.isActive,
        classes: teacher.classes.map(cls => ({
          id: cls.id,
          grade: cls.grade,
          section: cls.section,
          capacity: cls.capacity,
          studentCount: cls._count.students
        }))
      }
    })

  } catch (error) {
    console.error('Error fetching teacher:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch teacher' },
      { status: 500 }
    )
  }
}

// PUT /api/teachers/[id] - Update teacher
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teacherId = parseInt(params.id)
    
    if (isNaN(teacherId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid teacher ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      nationalId,
      phone,
      email,
      employeeId,
      hireDate
    } = body

    // Validate required fields
    const errors: Record<string, string> = {}

    if (!firstName?.trim()) errors.firstName = 'نام الزامی است'
    if (!lastName?.trim()) errors.lastName = 'نام خانوادگی الزامی است'
    if (!nationalId?.trim()) errors.nationalId = 'کد ملی الزامی است'
    if (!phone?.trim()) errors.phone = 'شماره تماس الزامی است'
    if (!email?.trim()) errors.email = 'ایمیل الزامی است'

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

    // Check if teacher exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id: teacherId }
    })

    if (!existingTeacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      )
    }

    // Check for duplicates (excluding current teacher)
    const duplicateChecks = await Promise.all([
      prisma.teacher.findFirst({ 
        where: { 
          nationalId,
          id: { not: teacherId }
        } 
      }),
      prisma.teacher.findFirst({ 
        where: { 
          phone,
          id: { not: teacherId }
        } 
      }),
      prisma.teacher.findFirst({ 
        where: { 
          email,
          id: { not: teacherId }
        } 
      }),
      employeeId ? prisma.teacher.findFirst({ 
        where: { 
          employeeId,
          id: { not: teacherId }
        } 
      }) : null
    ])

    if (duplicateChecks[0]) {
      errors.nationalId = 'معلم دیگری با این کد ملی وجود دارد'
    }
    if (duplicateChecks[1]) {
      errors.phone = 'معلم دیگری با این شماره تماس وجود دارد'
    }
    if (duplicateChecks[2]) {
      errors.email = 'معلم دیگری با این ایمیل وجود دارد'
    }
    if (duplicateChecks[3]) {
      errors.employeeId = 'معلم دیگری با این کد کارمندی وجود دارد'
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

    // Update teacher
    const updatedTeacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nationalId,
        phone,
        email,
        employeeId: employeeId || existingTeacher.employeeId,
        hireDate: hireDate ? new Date(hireDate) : existingTeacher.hireDate
      },
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

    console.log('✅ Teacher updated successfully:', {
      id: updatedTeacher.id,
      name: `${updatedTeacher.firstName} ${updatedTeacher.lastName}`,
      employeeId: updatedTeacher.employeeId
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedTeacher.id,
        employeeId: updatedTeacher.employeeId,
        firstName: updatedTeacher.firstName,
        lastName: updatedTeacher.lastName,
        nationalId: updatedTeacher.nationalId,
        phone: updatedTeacher.phone,
        email: updatedTeacher.email,
        hireDate: updatedTeacher.hireDate,
        isActive: updatedTeacher.isActive,
        classes: updatedTeacher.classes.map(cls => ({
          id: cls.id,
          grade: cls.grade,
          section: cls.section,
          capacity: cls.capacity,
          studentCount: cls._count.students
        }))
      },
      message: 'اطلاعات معلم با موفقیت بروزرسانی شد'
    })

  } catch (error) {
    console.error('Error updating teacher:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطا در بروزرسانی معلم',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}