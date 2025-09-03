import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const classId = searchParams.get('classId')
    const grade = searchParams.get('grade')
    
    const skip = (page - 1) * limit
    
    const where: any = { isActive: true }
    if (classId) where.classId = parseInt(classId)
    if (grade) where.grade = parseInt(grade)

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
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
        },
        orderBy: [
          { grade: 'asc' },
          { section: 'asc' },
          { lastName: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.student.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        students,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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
      classId
    } = body

    // Validate required fields
    if (!studentId || !firstName || !lastName || !nationalId || !classId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const student = await prisma.student.create({
      data: {
        studentId,
        firstName,
        lastName,
        fatherName,
        nationalId,
        birthDate: new Date(birthDate),
        grade,
        section,
        classId
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

    return NextResponse.json({
      success: true,
      data: { student },
      message: 'دانش‌آموز با موفقیت ثبت شد'
    })

  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create student' },
      { status: 500 }
    )
  }
}
