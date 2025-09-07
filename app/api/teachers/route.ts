import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      where: { isActive: true },
      include: {
        classes: {
          where: { isActive: true },
          select: {
            id: true,
            grade: true,
            section: true,
            _count: {
              select: {
                students: true
              }
            }
          }
        }
      },
      orderBy: {
        lastName: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: { teachers }
    })

  } catch (error) {
    console.error('Error fetching teachers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch teachers' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      employeeId,
      firstName,
      lastName,
      nationalId,
      phone,
      email,
      hireDate
    } = body

    // Comprehensive validation
    const errors: Record<string, string> = {}

    if (!firstName?.trim()) errors.firstName = 'نام الزامی است'
    if (!lastName?.trim()) errors.lastName = 'نام خانوادگی الزامی است'
    if (!nationalId?.trim()) errors.nationalId = 'کد ملی الزامی است'
    if (!phone?.trim()) errors.phone = 'شماره تماس الزامی است'
    if (!email?.trim()) errors.email = 'ایمیل الزامی است'

    // Validate national ID format
    if (nationalId && !/^\d{10}$/.test(nationalId)) {
      errors.nationalId = 'کد ملی باید ۱۰ رقم باشد'
    }

    // Validate phone format  
    if (phone && !/^09\d{9}$/.test(phone)) {
      errors.phone = 'شماره تماس معتبر نیست'
    }

    // Validate email format
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

    // Check for duplicates
    const duplicateChecks = await Promise.all([
      prisma.teacher.findUnique({ where: { nationalId } }),
      prisma.teacher.findFirst({ where: { phone } }),
      email ? prisma.teacher.findFirst({ where: { email } }) : null,
      employeeId ? prisma.teacher.findFirst({ where: { employeeId } }) : null
    ])

    if (duplicateChecks[0]) {
      errors.nationalId = 'معلمی با این کد ملی قبلاً ثبت شده است'
    }
    if (duplicateChecks[1]) {
      errors.phone = 'معلمی با این شماره تماس قبلاً ثبت شده است'
    }
    if (duplicateChecks[2]) {
      errors.email = 'معلمی با این ایمیل قبلاً ثبت شده است'
    }
    if (duplicateChecks[3]) {
      errors.employeeId = 'معلمی با این کد کارمندی قبلاً ثبت شده است'
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

    // Generate employeeId if not provided
    const finalEmployeeId = employeeId || `T${new Date().getFullYear().toString().slice(-2)}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`

    const teacher = await prisma.teacher.create({
      data: {
        employeeId: finalEmployeeId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nationalId,
        phone,
        email,
        hireDate: new Date(hireDate || new Date()),
        isActive: true
      },
      include: {
        classes: {
          where: { isActive: true },
          select: {
            id: true,
            grade: true,
            section: true,
            _count: {
              select: {
                students: true
              }
            }
          }
        }
      }
    })

    console.log('✅ Teacher created successfully:', {
      id: teacher.id,
      name: `${teacher.firstName} ${teacher.lastName}`,
      employeeId: teacher.employeeId
    })

    return NextResponse.json({
      success: true,
      data: teacher,
      message: 'معلم با موفقیت ثبت شد'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating teacher:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطا در ایجاد معلم',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
