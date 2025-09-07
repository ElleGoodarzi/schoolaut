#!/usr/bin/env node

// Accurate API Endpoint Testing with Proper Test Data
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

// Comprehensive endpoint definitions with proper test data
const API_ENDPOINTS = [
  // Student APIs
  { path: '/api/students', methods: ['GET'], testData: null },
  { path: '/api/students', methods: ['POST'], testData: {
    studentId: 'TEST' + Date.now(),
    firstName: 'تست',
    lastName: 'تستی',
    fatherName: 'پدر تست',
    nationalId: Date.now().toString().slice(-10),
    birthDate: '2015-01-01',
    grade: 1,
    section: 'الف',
    classId: 1,
    phone: '09123456789'
  }},
  { path: '/api/students/1', methods: ['GET'], testData: null },
  { path: '/api/students/count', methods: ['GET'], testData: null },
  { path: '/api/students/unified', methods: ['GET'], testData: null },
  { path: '/api/students/1/full', methods: ['GET'], testData: null },
  { path: '/api/students/1/class-history', methods: ['GET'], testData: null },
  
  // Teacher APIs
  { path: '/api/teachers', methods: ['GET'], testData: null },
  { path: '/api/teachers', methods: ['POST'], testData: {
    employeeId: 'TEST' + Date.now(),
    firstName: 'تست',
    lastName: 'تستی',
    nationalId: Date.now().toString().slice(-10),
    phone: '09123456789',
    email: 'test@test.com'
  }},
  { path: '/api/teachers/active', methods: ['GET'], testData: null },
  
  // Class APIs
  { path: '/api/classes', methods: ['GET'], testData: null },
  { path: '/api/classes/available', methods: ['GET'], testData: null },
  { path: '/api/classes/active-students', methods: ['GET'], testData: null },
  { path: '/api/classes/1', methods: ['GET'], testData: null },
  { path: '/api/management/classes', methods: ['GET'], testData: null },
  { path: '/api/management/classes/active', methods: ['GET'], testData: null },
  
  // Attendance APIs
  { path: '/api/attendance/mark', methods: ['POST'], testData: {
    studentId: 1,
    classId: 1,
    date: '2025-01-06',
    status: 'PRESENT'
  }},
  { path: '/api/attendance/bulk', methods: ['POST'], testData: {
    updates: [{ studentId: 1, classId: 1, status: 'PRESENT' }],
    date: '2025-01-06',
    classId: 1
  }},
  { path: '/api/attendance/clear', methods: ['POST'], testData: {
    classId: 1,
    date: '2025-01-06'
  }},
  { path: '/api/attendance/stats/today', methods: ['GET'], testData: null },
  { path: '/api/attendance/student/1', methods: ['GET'], testData: null },
  { path: '/api/attendance/export', methods: ['GET'], testData: null },
  { path: '/api/attendance/frequent-absentees', methods: ['GET'], testData: null },
  
  // Financial APIs
  { path: '/api/financial/overdue-count', methods: ['GET'], testData: null },
  
  // Service APIs
  { path: '/api/services/active-count', methods: ['GET'], testData: null },
  { path: '/api/services/meals/today-count', methods: ['GET'], testData: null },
  
  // Circular APIs
  { path: '/api/circulars/recent', methods: ['GET'], testData: null },
  
  // System APIs
  { path: '/api/dashboard/refresh', methods: ['GET'], testData: null },
  { path: '/api/system/health', methods: ['GET'], testData: null },
  { path: '/api/export', methods: ['GET'], testData: null },
  { path: '/api/seed', methods: ['POST'], testData: { type: 'students', count: 1, clearFirst: false }}
];

async function testEndpoint(endpoint) {
  const results = {};
  
  for (const method of endpoint.methods) {
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (endpoint.testData && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(endpoint.testData);
      }
      
      const response = await fetch(BASE_URL + endpoint.path, options);
      const responseText = await response.text();
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }
      
      results[method] = {
        status: response.status,
        working: response.status < 400,
        success: responseData?.success || response.ok,
        message: responseData?.message || responseData?.error || 'OK'
      };
      
    } catch (error) {
      results[method] = {
        status: 'ERROR',
        working: false,
        success: false,
        message: error.message
      };
    }
  }
  
  return results;
}

async function runAccurateAPITest() {
  console.log('='.repeat(100));
  console.log('🔍 ACCURATE API ENDPOINT TESTING WITH PROPER TEST DATA');
  console.log('='.repeat(100));
  
  const results = {
    total: API_ENDPOINTS.length,
    working: 0,
    broken: 0,
    details: {}
  };
  
  for (const endpoint of API_ENDPOINTS) {
    console.log(`Testing: ${endpoint.path} [${endpoint.methods.join(', ')}]`);
    const endpointResults = await testEndpoint(endpoint);
    
    const isWorking = Object.values(endpointResults).every(r => r.working && r.success);
    
    if (isWorking) {
      results.working++;
      console.log(`  ✅ WORKING`);
    } else {
      results.broken++;
      console.log(`  ❌ BROKEN`);
      // Log specific issues
      Object.entries(endpointResults).forEach(([method, result]) => {
        if (!result.working) {
          console.log(`    ${method}: ${result.status} - ${result.message}`);
        }
      });
    }
    
    results.details[endpoint.path] = {
      status: isWorking ? 'working' : 'broken',
      methods: endpointResults
    };
    
    console.log('');
  }
  
  console.log('='.repeat(100));
  console.log('📊 ACCURATE API TESTING RESULTS');
  console.log('='.repeat(100));
  console.log(`Total endpoints tested: ${results.total}`);
  console.log(`✅ Working endpoints: ${results.working}`);
  console.log(`❌ Broken endpoints: ${results.broken}`);
  console.log(`Success rate: ${Math.round((results.working / results.total) * 100)}%`);
  console.log('='.repeat(100));
  
  // Save detailed results
  fs.writeFileSync(
    path.join(__dirname, '../ACCURATE_API_TEST_RESULTS.json'),
    JSON.stringify(results, null, 2)
  );
  
  return results;
}

// Run the test
runAccurateAPITest().catch(console.error);
