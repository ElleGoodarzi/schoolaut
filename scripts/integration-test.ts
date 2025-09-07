#!/usr/bin/env tsx

// Integration Test Script
// Tests API endpoints end-to-end to ensure the platform works correctly

import fetch from 'node-fetch'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

interface TestResult {
  endpoint: string
  method: string
  success: boolean
  status: number
  details: string
  responseTime: number
}

class IntegrationTester {
  private results: TestResult[] = []

  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<TestResult> {
    const startTime = Date.now()
    
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      const responseTime = Date.now() - startTime
      const isSuccess = response.ok
      
      let responseData
      try {
        responseData = await response.json()
      } catch {
        responseData = await response.text()
      }

      const result: TestResult = {
        endpoint,
        method,
        success: isSuccess,
        status: response.status,
        details: isSuccess 
          ? `✅ ${response.status} - Success` 
          : `❌ ${response.status} - ${responseData.error || responseData.message || 'Failed'}`,
        responseTime
      }

      this.results.push(result)
      return result

    } catch (error) {
      const responseTime = Date.now() - startTime
      const result: TestResult = {
        endpoint,
        method,
        success: false,
        status: 0,
        details: `❌ Network Error: ${error.message}`,
        responseTime
      }

      this.results.push(result)
      return result
    }
  }

  async testAPIEndpoints() {
    console.log('🌐 Testing API Endpoints...')
    console.log(`Base URL: ${BASE_URL}`)
    
    // Test system health
    await this.makeRequest('/api/system/health')
    
    // Test student endpoints
    await this.makeRequest('/api/students')
    await this.makeRequest('/api/students/count')
    
    // Test teacher endpoints  
    await this.makeRequest('/api/teachers')
    await this.makeRequest('/api/teachers/active')
    
    // Test class endpoints
    await this.makeRequest('/api/classes')
    await this.makeRequest('/api/management/classes')
    await this.makeRequest('/api/management/classes/active')
    
    // Test attendance endpoints
    await this.makeRequest('/api/attendance/stats/today')
    
    // Test service endpoints
    await this.makeRequest('/api/services/active-count')
    await this.makeRequest('/api/services/meals/today-count')
    
    // Test financial endpoints
    await this.makeRequest('/api/financial/overdue-count')
    
    // Test dashboard
    await this.makeRequest('/api/dashboard/refresh')
    
    return this.results
  }

  async testDataCreation() {
    console.log('📝 Testing Data Creation...')
    
    let teacherId: number | null = null
    let classId: number | null = null
    let studentId: number | null = null

    // Create a teacher
    const teacherData = {
      firstName: 'معلم',
      lastName: 'تست یکپارچگی',
      nationalId: `${Date.now().toString().slice(-10)}`,
      phone: `094${Date.now().toString().slice(-8)}`,
      email: `integration.test.${Date.now()}@school.ir`,
      hireDate: new Date().toISOString()
    }

    const teacherResult = await this.makeRequest('/api/teachers', 'POST', teacherData)
    
    if (teacherResult.success) {
      // Extract teacher ID from response if possible
      console.log('✅ Teacher creation test passed')
    }

    // Create a student (this will require a class to exist)
    const studentData = {
      firstName: 'دانش‌آموز',
      lastName: 'تست یکپارچگی',
      fatherName: 'پدر تست',
      nationalId: `${Date.now().toString().slice(-10)}`,
      birthDate: '2015-01-01',
      grade: 1,
      section: 'الف',
      phone: `095${Date.now().toString().slice(-8)}`,
      email: `integration.student.${Date.now()}@example.com`,
      address: 'آدرس تست یکپارچگی'
    }

    // First check if there are any classes available
    const classesResult = await this.makeRequest('/api/management/classes')
    
    if (classesResult.success) {
      // Try to create a student (might fail if no classes exist)
      await this.makeRequest('/api/students', 'POST', studentData)
    }

    return this.results
  }

  generateReport() {
    console.log('\n' + '='.repeat(80))
    console.log('📊 INTEGRATION TEST REPORT')
    console.log('='.repeat(80))

    const passed = this.results.filter(r => r.success).length
    const failed = this.results.filter(r => !r.success).length
    const totalTime = this.results.reduce((sum, r) => sum + r.responseTime, 0)
    const avgResponseTime = totalTime / this.results.length

    console.log(`\n📈 SUMMARY:`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`📊 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`)
    console.log(`⏱️ Total Time: ${totalTime}ms`)
    console.log(`⚡ Average Response Time: ${avgResponseTime.toFixed(1)}ms`)

    console.log(`\n📋 DETAILED RESULTS:`)
    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌'
      console.log(`${index + 1}. ${status} ${result.method} ${result.endpoint}`)
      console.log(`   ${result.details} (${result.responseTime}ms)`)
    })

    if (failed === 0) {
      console.log(`\n🎉 ALL INTEGRATION TESTS PASSED!`)
      console.log(`🚀 The platform is ready for production use.`)
    } else {
      console.log(`\n⚠️ Some endpoints are not working properly.`)
      console.log(`🔧 Please check the failed endpoints before deploying.`)
    }

    return {
      passed,
      failed,
      successRate: (passed / this.results.length) * 100,
      totalTime,
      avgResponseTime
    }
  }
}

async function checkServerRunning(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/system/health`)
    return response.ok
  } catch {
    return false
  }
}

async function main() {
  console.log('='.repeat(80))
  console.log('🔄 INTEGRATION TEST SUITE')
  console.log('='.repeat(80))

  // Check if server is running
  console.log('🔍 Checking if development server is running...')
  
  const isRunning = await checkServerRunning()
  
  if (!isRunning) {
    console.log('❌ Development server is not running!')
    console.log('💡 Please start the server with: npm run dev')
    console.log('🌐 Then run this test again')
    process.exit(1)
  }

  console.log('✅ Server is running, proceeding with tests...\n')

  const tester = new IntegrationTester()
  
  try {
    await tester.testAPIEndpoints()
    await tester.testDataCreation()
    
    const summary = tester.generateReport()
    
    if (summary.failed > 0) {
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Integration test suite failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { IntegrationTester }