import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

// GET /api/classes - List all classes
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const grade = searchParams.get('grade')
    const includeStudents = searchParams.get('includeStudents') === 'true'

    let whereClause: any = { isActive: true }
    
    if (grade && grade !== 'all') {
      whereClause.grade = parseInt(grade)
    }

    const classes = await prisma.class.findMany({
      where: whereClause,
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
            students: true,
            attendances: true
          }
        },
        ...(includeStudents && {
          students: {
            where: { isActive: true },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              studentId: true
            }
          }
        })
      },
      orderBy: [
        { grade: 'asc' },
        { section: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: { classes },
      total: classes.length
    })

  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch classes' },
      { status: 500 }
    )
  }
}

// POST /api/classes - Create new class
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { grade, section, teacherId, capacity } = body

    // Validation
    if (!grade || !section || !teacherId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'پایه، شعبه و معلم الزامی است'
        },
        { status: 400 }
      )
    }

    // Check if class already exists
    const existingClass = await prisma.class.findUnique({
      where: { 
        grade_section: {
          grade: parseInt(grade),
          section: section
        }
      }
    })

    if (existingClass) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Class already exists',
          message: 'کلاس با این پایه و شعبه قبلاً ثبت شده است'
        },
        { status: 400 }
      )
    }

    // Verify teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: parseInt(teacherId) }
    })

    if (!teacher) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Teacher not found',
          message: 'معلم انتخاب شده یافت نشد'
        },
        { status: 400 }
      )
    }

    // Create class
    const newClass = await prisma.class.create({
      data: {
        grade: parseInt(grade),
        section: section,
        teacherId: parseInt(teacherId),
        capacity: capacity ? parseInt(capacity) : 30,
        isActive: true
      },
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: { class: newClass },
      message: 'کلاس با موفقیت ایجاد شد'
    })

  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create class' },
      { status: 500 }
    )
  }
}
