import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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

    // Validate required fields
    if (!employeeId || !firstName || !lastName || !nationalId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const teacher = await prisma.teacher.create({
      data: {
        employeeId,
        firstName,
        lastName,
        nationalId,
        phone,
        email,
        hireDate: new Date(hireDate || new Date())
      }
    })

    return NextResponse.json({
      success: true,
      data: { teacher },
      message: 'معلم با موفقیت ثبت شد'
    })

  } catch (error) {
    console.error('Error creating teacher:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create teacher' },
      { status: 500 }
    )
  }
}
