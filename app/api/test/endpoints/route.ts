import { NextResponse } from 'next/server'

// GET /api/test/endpoints - Comprehensive API endpoint testing
export async function GET() {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'API testing not allowed in production' },
        { status: 403 }
      )
    }

    const baseUrl = 'http://localhost:3000'
    const endpoints = [
      // Student Management APIs
      { path: '/api/students', method: 'GET', description: 'Get all students' },
      { path: '/api/students/count', method: 'GET', description: 'Get student count' },
      { path: '/api/students/unified', method: 'GET', description: 'Get unified student data' },
      { path: '/api/students/1/full', method: 'GET', description: 'Get student full profile' },
      { path: '/api/students/1', method: 'GET', description: 'Get individual student' },
      { path: '/api/students/1/class-history', method: 'GET', description: 'Get student class history' },
      { path: '/api/students/1/assign-class', method: 'POST', description: 'Assign student to class', 
        testData: { classId: 1, startDate: '2025-01-06' } },
      
      // Teacher Management APIs
      { path: '/api/teachers', method: 'GET', description: 'Get all teachers' },
      { path: '/api/teachers/active', method: 'GET', description: 'Get active teachers' },
      
      // Class Management APIs
      { path: '/api/classes', method: 'GET', description: 'Get all classes' },
      { path: '/api/classes/available?grade=1', method: 'GET', description: 'Get available classes' },
      { path: '/api/classes/active-students', method: 'GET', description: 'Get classes with students' },
      { path: '/api/classes/1', method: 'GET', description: 'Get individual class' },
      { path: '/api/management/classes', method: 'GET', description: 'Get management classes' },
      { path: '/api/management/classes/active', method: 'GET', description: 'Get active management classes' },
      
      // Attendance APIs
      { path: '/api/attendance/stats/today', method: 'GET', description: 'Get attendance stats' },
      { path: '/api/attendance/student/1', method: 'GET', description: 'Get student attendance' },
      { path: '/api/attendance/frequent-absentees', method: 'GET', description: 'Get frequent absentees' },
      { path: '/api/attendance/export', method: 'GET', description: 'Export attendance data' },
      { path: '/api/attendance/mark', method: 'POST', description: 'Mark attendance', 
        testData: { studentId: 1, classId: 1, date: '2025-01-06', status: 'PRESENT' } },
      { path: '/api/attendance/bulk', method: 'POST', description: 'Bulk attendance update',
        testData: { updates: [{ studentId: 1, classId: 1, status: 'PRESENT' }], date: '2025-01-06' } },
      { path: '/api/attendance/clear', method: 'POST', description: 'Clear attendance',
        testData: { classId: 1, date: '2025-01-06' } },
      
      // Financial APIs
      { path: '/api/financial/overdue-count', method: 'GET', description: 'Get overdue count' },
      
      // Services APIs
      { path: '/api/services/active-count', method: 'GET', description: 'Get active services count' },
      { path: '/api/services/meals/today-count', method: 'GET', description: 'Get meal count today' },
      
      // Communications APIs
      { path: '/api/circulars/recent', method: 'GET', description: 'Get recent circulars' },
      
      // System APIs
      { path: '/api/system/health', method: 'GET', description: 'System health check' },
      { path: '/api/export', method: 'GET', description: 'Data export utility' },
      { path: '/api/seed', method: 'POST', description: 'Development seeding', 
        testData: { type: 'students', count: 1, clearFirst: false } },
      
      // Dashboard APIs
      { path: '/api/dashboard/refresh', method: 'GET', description: 'Dashboard refresh' }
    ]

    const results: TestResult[] = []
    let totalResponseTime = 0

    console.log('🧪 Starting comprehensive API endpoint testing...')
    
    for (const test of endpoints) {
      const startTime = Date.now()
      
      try {
        const options: RequestInit = {
          method: test.method,
          headers: {
            'Content-Type': 'application/json'
          }
        }

        if (test.testData && test.method !== 'GET') {
          options.body = JSON.stringify(test.testData)
        }

        const response = await fetch(`${baseUrl}${test.path}`, options)
        const responseTime = Date.now() - startTime
        totalResponseTime += responseTime
        
      let status: TestResult['status']
      if (response.ok && response.status >= 200 && response.status < 300) {
        status = 'working'
      } else if (response.status === 404) {
        status = 'unimplemented'
      } else {
        status = 'failed'
      }

        results.push({
          endpoint: test.path,
          method: test.method,
          status,
          responseCode: response.status,
          responseTime,
          description: test.description
        })

      } catch (error) {
        results.push({
          endpoint: test.path,
          method: test.method,
          status: 'error',
          responseCode: 0,
          responseTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error',
          description: test.description
        })
      }
    }

    // Generate summary
    const summary = {
      totalEndpoints: results.length,
      working: results.filter(r => r.status === 'working').length,
      failed: results.filter(r => r.status === 'failed').length,
      unimplemented: results.filter(r => r.status === 'unimplemented').length,
      error: results.filter(r => r.status === 'error').length,
      averageResponseTime: Math.round(totalResponseTime / results.length),
      healthScore: results.filter(r => r.status === 'working').length / results.length
    }

    // Group results by status
    const groupedResults = {
      working: results.filter(r => r.status === 'working'),
      failed: results.filter(r => r.status === 'failed'),
      unimplemented: results.filter(r => r.status === 'unimplemented'),
      error: results.filter(r => r.status === 'error')
    }

    return NextResponse.json({
      success: true,
      data: {
        summary,
        results: groupedResults,
        allResults: results,
        timestamp: new Date().toISOString(),
        testDuration: totalResponseTime,
        recommendations: generateRecommendations(summary)
      }
    })

  } catch (error) {
    console.error('API testing failed:', error)
    return NextResponse.json(
      { success: false, error: 'API testing failed' },
      { status: 500 }
    )
  }
}

function generateRecommendations(summary: any): string[] {
  const recommendations: string[] = []
  
  if (summary.failed > 0) {
    recommendations.push(`Fix ${summary.failed} failed endpoints`)
  }
  
  if (summary.unimplemented > 0) {
    recommendations.push(`Implement ${summary.unimplemented} missing endpoints`)
  }
  
  if (summary.error > 0) {
    recommendations.push(`Debug ${summary.error} endpoints with errors`)
  }
  
  if (summary.averageResponseTime > 1000) {
    recommendations.push('Optimize slow endpoints (>1000ms)')
  }
  
  if (summary.healthScore < 0.9) {
    recommendations.push('Improve overall API health score')
  } else if (summary.healthScore === 1.0) {
    recommendations.push('Excellent! All endpoints are working properly')
  }

  return recommendations
}
