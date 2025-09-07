import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

export async function GET() {
  try {
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
      },
      orderBy: [
        { grade: 'asc' },
        { section: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: { classes }
    })

  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch classes' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { grade, section, teacherId, capacity } = body

    // Validate required fields
    if (!grade || !section || !teacherId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const classData = await prisma.class.create({
      data: {
        grade,
        section,
        teacherId,
        capacity: capacity || 30
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
      data: { class: classData },
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
