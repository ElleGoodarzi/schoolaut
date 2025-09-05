import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    // Fetch complete student data with all related information
    const student = await db.student.findUnique({
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
        },
        attendances: {
          orderBy: {
            date: 'desc'
          },
          take: 50 // Last 50 attendance records
        },
        payments: {
          orderBy: {
            dueDate: 'desc'
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

    // Format dates to Persian
    const formatToPersianDate = (date: Date) => {
      return date.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }

    // Mock services data (in real app, this would come from a services table)
    const services = [
      {
        id: 1,
        type: 'سرویس مدرسه',
        route: 'مسیر شمال شهر',
        isActive: true
      },
      {
        id: 2,
        type: 'وعده غذایی',
        mealPlan: 'وعده کامل',
        isActive: true
      }
    ]

    // Mock class history (in real app, this would come from a class_assignments table)
    const classHistory = [
      {
        id: 1,
        className: `پایه ${student.class.grade} - شعبه ${student.class.section}`,
        startDate: formatToPersianDate(student.enrollmentDate),
        endDate: null,
        teacher: `${student.class.teacher.firstName} ${student.class.teacher.lastName}`
      }
    ]

    const studentData = {
      id: student.id,
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      fatherName: student.fatherName,
      nationalId: student.nationalId,
      birthDate: formatToPersianDate(student.birthDate),
      grade: student.grade,
      section: student.section,
      phone: student.phone,
      address: student.address,
      enrollmentDate: formatToPersianDate(student.enrollmentDate),
      isActive: student.isActive,
      class: {
        id: student.class.id,
        grade: student.class.grade,
        section: student.class.section,
        teacher: {
          firstName: student.class.teacher.firstName,
          lastName: student.class.teacher.lastName
        }
      },
      attendances: student.attendances.map(attendance => ({
        id: attendance.id,
        date: formatToPersianDate(attendance.date),
        status: attendance.status,
        notes: attendance.notes
      })),
      payments: student.payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        dueDate: formatToPersianDate(payment.dueDate),
        paidDate: payment.paidDate ? formatToPersianDate(payment.paidDate) : null,
        status: payment.status,
        type: payment.type,
        description: payment.description
      })),
      services,
      classHistory
    }

    return NextResponse.json({
      success: true,
      data: studentData
    })

  } catch (error) {
    console.error('Error fetching student full data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch student data'
      },
      { status: 500 }
    )
  }
}
