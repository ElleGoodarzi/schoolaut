import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dateParam = searchParams.get('date') || 'today'
    const classId = searchParams.get('classId')
    
    // Parse date parameter
    let targetDate: Date
    if (dateParam === 'today') {
      targetDate = new Date()
    } else {
      targetDate = new Date(dateParam)
      if (isNaN(targetDate.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid date format' },
          { status: 400 }
        )
      }
    }

    // Build where clause
    let whereClause: any = {
      isActive: true,
      startDate: { lte: targetDate },
      OR: [
        { endDate: null },
        { endDate: { gte: targetDate } }
      ]
    }

    // Filter by class if specified
    if (classId) {
      whereClause.classId = parseInt(classId)
    }

    // Fetch active class assignments for the specified date
    const activeAssignments = await db.studentClassAssignment.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            firstName: true,
            lastName: true,
            nationalId: true,
            phone: true,
            isActive: true
          }
        },
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
        { class: { grade: 'asc' } },
        { class: { section: 'asc' } },
        { student: { lastName: 'asc' } },
        { student: { firstName: 'asc' } }
      ]
    })

    // Group students by class
    const studentsByClass: Record<string, any> = {}
    
    activeAssignments.forEach(assignment => {
      const classKey = `${assignment.class.grade}-${assignment.class.section}`
      const className = `پایه ${assignment.class.grade} - شعبه ${assignment.class.section}`
      
      if (!studentsByClass[classKey]) {
        studentsByClass[classKey] = {
          classId: assignment.classId,
          className,
          grade: assignment.class.grade,
          section: assignment.class.section,
          teacher: {
            name: `${assignment.class.teacher.firstName} ${assignment.class.teacher.lastName}`
          },
          students: [],
          totalStudents: 0
        }
      }

      studentsByClass[classKey].students.push({
        id: assignment.student.id,
        studentId: assignment.student.studentId,
        name: `${assignment.student.firstName} ${assignment.student.lastName}`,
        firstName: assignment.student.firstName,
        lastName: assignment.student.lastName,
        nationalId: assignment.student.nationalId,
        phone: assignment.student.phone,
        isActive: assignment.student.isActive,
        assignmentId: assignment.id,
        startDate: assignment.startDate.toLocaleDateString('fa-IR'),
        endDate: assignment.endDate?.toLocaleDateString('fa-IR') || null
      })
      
      studentsByClass[classKey].totalStudents++
    })

    // Convert to array and sort by grade/section
    const classesList = Object.values(studentsByClass).sort((a: any, b: any) => {
      if (a.grade !== b.grade) return a.grade - b.grade
      return a.section.localeCompare(b.section)
    })

    // Calculate summary statistics
    const totalActiveStudents = activeAssignments.length
    const totalClasses = classesList.length
    const averageStudentsPerClass = totalClasses > 0 ? Math.round(totalActiveStudents / totalClasses) : 0

    return NextResponse.json({
      success: true,
      data: {
        date: targetDate.toLocaleDateString('fa-IR'),
        summary: {
          totalActiveStudents,
          totalClasses,
          averageStudentsPerClass
        },
        classes: classesList,
        // Flat list of all active students for easy processing
        allStudents: activeAssignments.map(assignment => ({
          id: assignment.student.id,
          studentId: assignment.student.studentId,
          name: `${assignment.student.firstName} ${assignment.student.lastName}`,
          firstName: assignment.student.firstName,
          lastName: assignment.student.lastName,
          classId: assignment.classId,
          className: `پایه ${assignment.class.grade} - شعبه ${assignment.class.section}`,
          grade: assignment.class.grade,
          section: assignment.class.section,
          teacherName: `${assignment.class.teacher.firstName} ${assignment.class.teacher.lastName}`,
          assignmentId: assignment.id,
          startDate: assignment.startDate.toLocaleDateString('fa-IR'),
          endDate: assignment.endDate?.toLocaleDateString('fa-IR') || null,
          isActive: assignment.student.isActive
        }))
      }
    })

  } catch (error) {
    console.error('Error fetching active students:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch active students'
      },
      { status: 500 }
    )
  }
}
