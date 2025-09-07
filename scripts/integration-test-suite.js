#!/usr/bin/env node

// Comprehensive Integration Test Suite
const BASE_URL = 'http://localhost:3000';

class IntegrationTestSuite {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  async test(name, testFunction) {
    this.results.total++;
    console.log(`Testing: ${name}`);
    
    try {
      const start = performance.now();
      await testFunction();
      const duration = performance.now() - start;
      
      this.results.passed++;
      this.results.tests.push({
        name,
        status: 'PASSED',
        duration: Math.round(duration),
        error: null
      });
      console.log(`  ✅ PASSED (${Math.round(duration)}ms)`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({
        name,
        status: 'FAILED',
        duration: null,
        error: error.message
      });
      console.log(`  ❌ FAILED: ${error.message}`);
    }
  }

  async apiCall(method, endpoint, data = null) {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(BASE_URL + endpoint, options);
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(`${response.status}: ${responseData.error || responseData.message || 'Unknown error'}`);
    }
    
    return responseData;
  }

  async runAllTests() {
    console.log('='.repeat(100));
  console.log('🧪 COMPREHENSIVE INTEGRATION TEST SUITE');
    console.log('='.repeat(100));
    
    await this.testStudentCRUD();
    await this.testTeacherCRUD();
    await this.testClassManagement();
    await this.testAttendanceSystem();
    await this.testFinancialSystem();
    await this.testExportSystem();
    await this.testSystemHealth();
    
    this.printSummary();
    this.saveResults();
  }

  async testStudentCRUD() {
    console.log('\n👨‍🎓 STUDENT CRUD TESTS');
    console.log('-'.repeat(50));
    
    let createdStudentId = null;
    
    // Test student creation
    await this.test('Create Student', async () => {
    const studentData = {
        studentId: 'INT_TEST_' + Date.now(),
      firstName: 'تست',
        lastName: 'یکپارچگی',
      fatherName: 'پدر تست',
        nationalId: Date.now().toString().slice(-10),
      birthDate: '2015-01-01',
      grade: 1,
      section: 'الف',
        classId: 1,
        phone: '09123456789'
      };
      
      const result = await this.apiCall('POST', '/api/students', studentData);
      if (!result.success) throw new Error('Student creation failed');
      createdStudentId = result.data.id;
    });
    
    // Test student retrieval
    await this.test('Get Student List', async () => {
      const result = await this.apiCall('GET', '/api/students');
      if (!result.success || !Array.isArray(result.data)) {
        throw new Error('Student list retrieval failed');
      }
    });
    
    // Test student profile
    if (createdStudentId) {
      await this.test('Get Student Profile', async () => {
        const result = await this.apiCall('GET', `/api/students/${createdStudentId}/full`);
        if (!result.success) throw new Error('Student profile retrieval failed');
      });
    }
  }

  async testTeacherCRUD() {
    console.log('\n👩‍🏫 TEACHER CRUD TESTS');
    console.log('-'.repeat(50));
    
    // Test teacher creation
    await this.test('Create Teacher', async () => {
    const teacherData = {
        employeeId: 'INT_TEST_' + Date.now(),
      firstName: 'تست',
        lastName: 'یکپارچگی',
        nationalId: Date.now().toString().slice(-10),
      phone: '09123456789',
        email: 'integration.test@school.ir'
      };
      
      const result = await this.apiCall('POST', '/api/teachers', teacherData);
      if (!result.success) throw new Error('Teacher creation failed');
    });
    
    // Test teacher listing
    await this.test('Get Teacher List', async () => {
      const result = await this.apiCall('GET', '/api/teachers');
      if (!result.success || !result.data.teachers) {
        throw new Error('Teacher list retrieval failed');
      }
    });
  }

  async testClassManagement() {
    console.log('\n📚 CLASS MANAGEMENT TESTS');
    console.log('-'.repeat(50));
    
    // Test class listing
    await this.test('Get Class List', async () => {
      const result = await this.apiCall('GET', '/api/management/classes');
      if (!result.success || !result.data.classes) {
        throw new Error('Class list retrieval failed');
      }
    });
    
    // Test class with students
    await this.test('Get Class with Students', async () => {
      const result = await this.apiCall('GET', '/api/classes/active-students');
      if (!result.success || !result.data.classes) {
        throw new Error('Class with students retrieval failed');
      }
    });
    
    // Test individual class
    await this.test('Get Individual Class', async () => {
      const result = await this.apiCall('GET', '/api/classes/1');
      if (!result.success) throw new Error('Individual class retrieval failed');
    });
  }

  async testAttendanceSystem() {
    console.log('\n📝 ATTENDANCE SYSTEM TESTS');
    console.log('-'.repeat(50));
    
    // Test attendance marking
    await this.test('Mark Individual Attendance', async () => {
    const attendanceData = {
      studentId: 1,
      classId: 1,
        date: '2025-01-06',
      status: 'PRESENT',
        notes: 'Integration test'
    };
    
      const result = await this.apiCall('POST', '/api/attendance/mark', attendanceData);
      if (!result.success) throw new Error('Attendance marking failed');
  });
  
    // Test bulk attendance
    await this.test('Bulk Attendance Update', async () => {
    const bulkData = {
      updates: [
          { studentId: 1, classId: 1, status: 'PRESENT' },
          { studentId: 2, classId: 1, status: 'PRESENT' }
      ],
        date: '2025-01-06',
      classId: 1
    };
    
      const result = await this.apiCall('POST', '/api/attendance/bulk', bulkData);
      if (!result.success) throw new Error('Bulk attendance update failed');
    });
    
    // Test attendance statistics
    await this.test('Get Attendance Statistics', async () => {
      const result = await this.apiCall('GET', '/api/attendance/stats/today');
      if (!result.success || !result.data) {
        throw new Error('Attendance statistics retrieval failed');
      }
    });
    
    // Test attendance export
    await this.test('Export Attendance Data', async () => {
      const result = await this.apiCall('GET', '/api/attendance/export?date=2025-01-06');
      // Note: This returns Excel file, so we just check if it doesn't error
    });
  }

  async testFinancialSystem() {
    console.log('\n💰 FINANCIAL SYSTEM TESTS');
    console.log('-'.repeat(50));
    
    // Test overdue count
    await this.test('Get Overdue Count', async () => {
      const result = await this.apiCall('GET', '/api/financial/overdue-count');
      if (!result.success || typeof result.data.overdueCount !== 'number') {
        throw new Error('Overdue count retrieval failed');
      }
    });
  }

  async testExportSystem() {
    console.log('\n📤 EXPORT SYSTEM TESTS');
    console.log('-'.repeat(50));
    
    const exportTypes = ['students', 'teachers', 'classes', 'attendance', 'financial'];
    
    for (const type of exportTypes) {
      await this.test(`Export ${type.charAt(0).toUpperCase() + type.slice(1)}`, async () => {
        const result = await this.apiCall('GET', `/api/export?type=${type}&format=json`);
        if (!result.success || !Array.isArray(result.data)) {
          throw new Error(`${type} export failed`);
        }
      });
    }
  }

  async testSystemHealth() {
    console.log('\n🏥 SYSTEM HEALTH TESTS');
    console.log('-'.repeat(50));
    
    await this.test('System Health Check', async () => {
      const result = await this.apiCall('GET', '/api/system/health');
      if (!result.success || !result.healthy) {
        throw new Error('System health check failed');
      }
    });
  }

  printSummary() {
    console.log('\n='.repeat(100));
    console.log('📊 INTEGRATION TEST SUMMARY');
    console.log('='.repeat(100));
    console.log(`Total tests: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`Success rate: ${Math.round((this.results.passed / this.results.total) * 100)}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.tests.filter(t => t.status === 'FAILED').forEach(test => {
        console.log(`  ${test.name}: ${test.error}`);
      });
    }
    
    console.log('='.repeat(100));
  }

  saveResults() {
    const fs = require('fs');
    const path = require('path');
    
    fs.writeFileSync(
      path.join(__dirname, '../INTEGRATION_TEST_RESULTS.json'),
      JSON.stringify(this.results, null, 2)
    );
    console.log('Results saved to INTEGRATION_TEST_RESULTS.json');
  }
}

// Run the test suite
const testSuite = new IntegrationTestSuite();
testSuite.runAllTests().catch(console.error);