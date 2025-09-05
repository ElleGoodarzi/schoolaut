import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const grade = searchParams.get('grade')

    if (!grade) {
      return NextResponse.json(
        { success: false, message: 'Grade parameter is required' },
        { status: 400 }
      )
    }

    const gradeNumber = parseInt(grade)
    if (isNaN(gradeNumber) || gradeNumber < 1 || gradeNumber > 6) {
      return NextResponse.json(
        { success: false, message: 'Invalid grade number' },
        { status: 400 }
      )
    }

    // Fetch classes for the specified grade with student count
    const classes = await db.class.findMany({
      where: {
        grade: gradeNumber,
        isActive: true
      },
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        students: {
          where: {
            isActive: true
          },
          select: {
            id: true
          }
        }
      },
      orderBy: {
        section: 'asc'
      }
    })

    // Transform the data to include availability information
    const availableClasses = classes.map(cls => ({
      id: cls.id,
      grade: cls.grade,
      section: cls.section,
      teacherName: `${cls.teacher.firstName} ${cls.teacher.lastName}`,
      capacity: cls.capacity,
      currentStudents: cls.students.length,
      availableSpots: cls.capacity - cls.students.length,
      isAvailable: cls.students.length < cls.capacity
    }))

    // Filter to only show classes with available spots
    const classesWithSpots = availableClasses.filter(cls => cls.isAvailable)

    return NextResponse.json({
      success: true,
      data: classesWithSpots,
      total: classesWithSpots.length
    })

  } catch (error) {
    console.error('Error fetching available classes:', error)
    
    // Return fallback data in case of error
    const fallbackClasses = [
      {
        id: 1,
        grade: parseInt(request.nextUrl.searchParams.get('grade') || '1'),
        section: 'الف',
        teacherName: 'معلم موقت',
        capacity: 30,
        currentStudents: 0,
        availableSpots: 30,
        isAvailable: true
      }
    ]

    return NextResponse.json({
      success: false,
      data: fallbackClasses,
      message: 'خطا در دریافت اطلاعات کلاس‌ها، اطلاعات پیش‌فرض نمایش داده شد'
    }, { status: 500 })
  }
}
