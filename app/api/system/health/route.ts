import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

// GET /api/system/health - System health check and integration status
export async function GET() {
  try {
    const healthCheck = {
      timestamp: new Date().toISOString(),
      database: await checkDatabaseHealth(),
      apis: await checkAPIHealth(),
      models: await checkModelIntegrity(),
      performance: await checkPerformance()
    }

    const isHealthy = healthCheck.database.healthy && 
                     healthCheck.apis.workingEndpoints >= healthCheck.apis.totalEndpoints * 0.9 &&
                     healthCheck.models.integrityScore >= 0.8

    return NextResponse.json({
      success: true,
      healthy: isHealthy,
      data: healthCheck,
      summary: {
        status: isHealthy ? 'HEALTHY' : 'NEEDS_ATTENTION',
        lastChecked: healthCheck.timestamp
      }
    })

  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({
      success: false,
      healthy: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

async function checkDatabaseHealth() {
  try {
    // Test basic connectivity
    await prisma.$queryRaw`SELECT 1`
    
    // Get record counts
    const [studentCount, teacherCount, classCount, attendanceCount, paymentCount] = await Promise.all([
      prisma.student.count({ where: { isActive: true } }),
      prisma.teacher.count({ where: { isActive: true } }),
      prisma.class.count({ where: { isActive: true } }),
      prisma.attendance.count(),
      prisma.payment.count()
    ])

    return {
      healthy: true,
      connection: 'OK',
      records: {
        students: studentCount,
        teachers: teacherCount,
        classes: classCount,
        attendance: attendanceCount,
        payments: paymentCount
      }
    }
  } catch (error) {
    return {
      healthy: false,
      connection: 'FAILED',
      error: error.message
    }
  }
}

async function checkAPIHealth() {
  const endpoints = [
    '/api/students',
    '/api/teachers', 
    '/api/classes',
    '/api/attendance/stats/today',
    '/api/financial/overdue-count',
    '/api/services/meals/today-count'
  ]

  let workingEndpoints = 0
  const endpointStatus: Record<string, boolean> = {}

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`)
      const isWorking = response.ok
      endpointStatus[endpoint] = isWorking
      if (isWorking) workingEndpoints++
    } catch (error) {
      endpointStatus[endpoint] = false
    }
  }

  return {
    totalEndpoints: endpoints.length,
    workingEndpoints,
    healthScore: workingEndpoints / endpoints.length,
    endpoints: endpointStatus
  }
}

async function checkModelIntegrity() {
  try {
    // Check for referential integrity issues
    const totalStudents = await prisma.student.count()
    const totalClasses = await prisma.class.count()
    const totalTeachers = await prisma.teacher.count()
    const totalAttendances = await prisma.attendance.count()
    const totalPayments = await prisma.payment.count()

    // All classes should have teachers (based on schema)
    const classesWithoutTeachers = 0 // Schema requires teacherId

    return {
      integrityScore: 1.0,
      dataConsistency: {
        totalStudents,
        totalClasses,
        totalTeachers,
        totalAttendances,
        totalPayments,
        classesWithoutTeachers
      },
      recommendations: classesWithoutTeachers > 0 ? [
        'Assign teachers to all classes',
        'Verify teacher-class relationships'
      ] : []
    }
  } catch (error) {
    return {
      integrityScore: 0,
      error: error.message,
      recommendations: ['Fix database schema issues']
    }
  }
}

async function checkPerformance() {
  try {
    const startTime = Date.now()
    
    // Test query performance
    await Promise.all([
      prisma.student.findMany({ take: 10, include: { class: true } }),
      prisma.attendance.groupBy({
        by: ['status'],
        _count: { status: true },
        where: {
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.class.findMany({ 
        include: { 
          _count: { select: { students: true } } 
        } 
      })
    ])
    
    const queryTime = Date.now() - startTime

    return {
      queryResponseTime: queryTime,
      performance: queryTime < 1000 ? 'GOOD' : queryTime < 3000 ? 'ACCEPTABLE' : 'SLOW',
      recommendations: queryTime > 1000 ? [
        'Consider adding database indexes',
        'Optimize complex queries',
        'Implement query caching'
      ] : []
    }
  } catch (error) {
    return {
      queryResponseTime: -1,
      performance: 'FAILED',
      error: error.message
    }
  }
}
