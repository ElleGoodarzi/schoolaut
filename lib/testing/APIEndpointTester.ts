// Comprehensive API Endpoint Testing Suite

interface EndpointTest {
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  testData?: any
  expectedStatus: number
  description: string
}

interface TestResult {
  endpoint: string
  method: string
  status: 'working' | 'failed' | 'unimplemented' | 'error'
  responseCode: number
  responseTime: number
  error?: string
  description: string
}

export class APIEndpointTester {
  private baseUrl = 'http://localhost:3000'
  
  private endpoints: EndpointTest[] = [
    // Student Management APIs
    { endpoint: '/api/students', method: 'GET', expectedStatus: 200, description: 'Get all students' },
    { endpoint: '/api/students/count', method: 'GET', expectedStatus: 200, description: 'Get student count' },
    { endpoint: '/api/students/unified', method: 'GET', expectedStatus: 200, description: 'Get unified student data' },
    { endpoint: '/api/students/1/full', method: 'GET', expectedStatus: 200, description: 'Get student full profile' },
    { endpoint: '/api/students/1', method: 'GET', expectedStatus: 200, description: 'Get individual student' },
    { endpoint: '/api/students/1/class-history', method: 'GET', expectedStatus: 200, description: 'Get student class history' },
    
    // Teacher Management APIs
    { endpoint: '/api/teachers', method: 'GET', expectedStatus: 200, description: 'Get all teachers' },
    { endpoint: '/api/teachers/active', method: 'GET', expectedStatus: 200, description: 'Get active teachers' },
    
    // Class Management APIs
    { endpoint: '/api/classes', method: 'GET', expectedStatus: 200, description: 'Get all classes' },
    { endpoint: '/api/classes/available', method: 'GET', expectedStatus: 200, description: 'Get available classes' },
    { endpoint: '/api/classes/active-students', method: 'GET', expectedStatus: 200, description: 'Get classes with students' },
    { endpoint: '/api/classes/1', method: 'GET', expectedStatus: 200, description: 'Get individual class' },
    { endpoint: '/api/management/classes', method: 'GET', expectedStatus: 200, description: 'Get management classes' },
    { endpoint: '/api/management/classes/active', method: 'GET', expectedStatus: 200, description: 'Get active management classes' },
    
    // Attendance APIs
    { endpoint: '/api/attendance/stats/today', method: 'GET', expectedStatus: 200, description: 'Get attendance stats' },
    { endpoint: '/api/attendance/student/1', method: 'GET', expectedStatus: 200, description: 'Get student attendance' },
    { endpoint: '/api/attendance/frequent-absentees', method: 'GET', expectedStatus: 200, description: 'Get frequent absentees' },
    { endpoint: '/api/attendance/export', method: 'GET', expectedStatus: 200, description: 'Export attendance data' },
    
    // Financial APIs
    { endpoint: '/api/financial/overdue-count', method: 'GET', expectedStatus: 200, description: 'Get overdue count' },
    
    // Services APIs
    { endpoint: '/api/services/active-count', method: 'GET', expectedStatus: 200, description: 'Get active services count' },
    { endpoint: '/api/services/meals/today-count', method: 'GET', expectedStatus: 200, description: 'Get meal count today' },
    
    // Communications APIs
    { endpoint: '/api/circulars/recent', method: 'GET', expectedStatus: 200, description: 'Get recent circulars' },
    
    // System APIs
    { endpoint: '/api/system/health', method: 'GET', expectedStatus: 200, description: 'System health check' },
    { endpoint: '/api/export', method: 'GET', expectedStatus: 200, description: 'Data export utility' },
    
    // Dashboard APIs
    { endpoint: '/api/dashboard/refresh', method: 'GET', expectedStatus: 200, description: 'Dashboard refresh' }
  ]

  async testEndpoint(test: EndpointTest): Promise<TestResult> {
    const startTime = Date.now()
    
    try {
      const url = `${this.baseUrl}${test.endpoint}`
      const options: RequestInit = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      }

      if (test.testData && test.method !== 'GET') {
        options.body = JSON.stringify(test.testData)
      }

      const response = await fetch(url, options)
      const responseTime = Date.now() - startTime
      
      let status: TestResult['status']
      if (response.status === test.expectedStatus) {
        status = 'working'
      } else if (response.status === 404) {
        status = 'unimplemented'
      } else {
        status = 'failed'
      }

      return {
        endpoint: test.endpoint,
        method: test.method,
        status,
        responseCode: response.status,
        responseTime,
        description: test.description
      }

    } catch (error) {
      return {
        endpoint: test.endpoint,
        method: test.method,
        status: 'error',
        responseCode: 0,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        description: test.description
      }
    }
  }

  async testAllEndpoints(): Promise<TestResult[]> {
    console.log('🧪 Starting comprehensive API endpoint testing...')
    console.log(`Testing ${this.endpoints.length} endpoints...`)
    
    const results: TestResult[] = []
    
    for (const test of this.endpoints) {
      const result = await this.testEndpoint(test)
      results.push(result)
      
      const statusEmoji = result.status === 'working' ? '✅' : 
                         result.status === 'failed' ? '❌' : 
                         result.status === 'unimplemented' ? '⚠️' : '🔥'
      
      console.log(`${statusEmoji} ${result.method} ${result.endpoint} - ${result.status} (${result.responseCode}) ${result.responseTime}ms`)
    }
    
    return results
  }

  generateReport(results: TestResult[]): any {
    const summary = {
      total: results.length,
      working: results.filter(r => r.status === 'working').length,
      failed: results.filter(r => r.status === 'failed').length,
      unimplemented: results.filter(r => r.status === 'unimplemented').length,
      error: results.filter(r => r.status === 'error').length,
      averageResponseTime: Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / results.length),
      healthScore: results.filter(r => r.status === 'working').length / results.length
    }

    const detailedResults = results.map(r => ({
      endpoint: r.endpoint,
      method: r.method,
      status: r.status,
      responseCode: r.responseCode,
      responseTime: r.responseTime,
      description: r.description,
      error: r.error
    }))

    return {
      summary,
      endpoints: detailedResults,
      timestamp: new Date().toISOString(),
      recommendations: this.generateRecommendations(summary)
    }
  }

  private generateRecommendations(summary: any): string[] {
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
    }

    return recommendations
  }
}

// Console logging function for development
export async function runAPIAudit(): Promise<void> {
  const tester = new APIEndpointTester()
  const results = await tester.testAllEndpoints()
  const report = tester.generateReport(results)
  
  console.log('='.repeat(80))
  console.log('📊 COMPREHENSIVE API ENDPOINT AUDIT REPORT')
  console.log('='.repeat(80))
  console.log(`Total Endpoints: ${report.summary.total}`)
  console.log(`✅ Working: ${report.summary.working}`)
  console.log(`❌ Failed: ${report.summary.failed}`)
  console.log(`⚠️ Unimplemented: ${report.summary.unimplemented}`)
  console.log(`🔥 Error: ${report.summary.error}`)
  console.log(`⚡ Average Response Time: ${report.summary.averageResponseTime}ms`)
  console.log(`💚 Health Score: ${Math.round(report.summary.healthScore * 100)}%`)
  console.log('='.repeat(80))
  
  if (report.recommendations.length > 0) {
    console.log('🎯 RECOMMENDATIONS:')
    report.recommendations.forEach(rec => console.log(`- ${rec}`))
    console.log('='.repeat(80))
  }
}
