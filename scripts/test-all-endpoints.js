#!/usr/bin/env node

// Comprehensive API Endpoint Testing Script
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

// Find all API endpoints
function findAllEndpoints() {
  const apiDir = path.join(__dirname, '../app/api');
  const endpoints = [];
  
  function scanDirectory(dir, basePath = '') {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      if (item.isDirectory()) {
        // Handle dynamic routes like [id]
        const dirName = item.name.startsWith('[') && item.name.endsWith(']') 
          ? item.name.replace(/\[(\w+)\]/, '1') // Replace [id] with 1 for testing
          : item.name;
        
        scanDirectory(
          path.join(dir, item.name), 
          basePath + '/' + dirName
        );
      } else if (item.name === 'route.ts') {
        endpoints.push('/api' + basePath);
      }
    }
  }
  
  scanDirectory(apiDir);
  return endpoints.sort();
}

// Test individual endpoint
async function testEndpoint(endpoint) {
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  const results = {};
  
  for (const method of methods) {
  try {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      // Add test data for POST/PUT requests
      if (method === 'POST' || method === 'PUT') {
        if (endpoint.includes('/students')) {
          options.body = JSON.stringify({
            studentId: 'TEST001',
            firstName: 'تست',
            lastName: 'تستی',
            fatherName: 'پدر تست',
            nationalId: '0000000001',
            birthDate: '2015-01-01',
            grade: 1,
            section: 'الف',
            classId: 1,
            phone: '09123456789'
          });
        } else if (endpoint.includes('/teachers')) {
          options.body = JSON.stringify({
            employeeId: 'TEST001',
            firstName: 'تست',
            lastName: 'تستی',
            nationalId: '0000000002',
            phone: '09123456789'
          });
        } else if (endpoint.includes('/attendance/mark')) {
          options.body = JSON.stringify({
            studentId: 1,
            classId: 1,
            date: '2025-01-06',
            status: 'PRESENT'
          });
        }
      }
      
      const response = await fetch(BASE_URL + endpoint, options);
      const isSuccess = response.status < 400;
      
      results[method] = {
      status: response.status,
        working: isSuccess,
        response: isSuccess ? 'OK' : response.statusText
    };
  } catch (error) {
      results[method] = {
      status: 'ERROR',
      working: false,
        response: error.message
      };
    }
  }
  
  return results;
}

// Main testing function
async function testAllEndpoints() {
  console.log('='.repeat(80));
  console.log('🔍 COMPREHENSIVE API ENDPOINT TESTING');
  console.log('='.repeat(80));
  
  const endpoints = findAllEndpoints();
  console.log(`Found ${endpoints.length} API endpoints to test\n`);
  
  const results = {
    total: endpoints.length,
    working: 0,
    broken: 0,
    unimplemented: 0,
    details: {}
  };
  
  for (const endpoint of endpoints) {
    console.log(`Testing: ${endpoint}`);
    const endpointResults = await testEndpoint(endpoint);
    
    // Determine overall endpoint status
    const hasWorkingMethod = Object.values(endpointResults).some(r => r.working);
    const hasImplementedMethod = Object.values(endpointResults).some(r => r.status !== 'ERROR');
    
    let status = 'broken';
    if (hasWorkingMethod) {
      status = 'working';
      results.working++;
    } else if (hasImplementedMethod) {
      status = 'broken';
      results.broken++;
    } else {
      status = 'unimplemented';
      results.unimplemented++;
    }
    
    results.details[endpoint] = {
      status,
      methods: endpointResults
    };
    
    console.log(`  Status: ${status.toUpperCase()}`);
    console.log('');
  }
  
  // Summary
  console.log('='.repeat(80));
  console.log('📊 ENDPOINT TESTING SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total endpoints: ${results.total}`);
  console.log(`✅ Working: ${results.working}`);
  console.log(`❌ Broken: ${results.broken}`);
  console.log(`⚠️  Unimplemented: ${results.unimplemented}`);
  console.log(`Success rate: ${Math.round((results.working / results.total) * 100)}%`);
  console.log('='.repeat(80));
  
  return results;
}

// Run if called directly
if (require.main === module) {
  testAllEndpoints()
    .then(results => {
      // Write results to file
      fs.writeFileSync(
        path.join(__dirname, '../API_TEST_RESULTS.json'),
        JSON.stringify(results, null, 2)
      );
      console.log('Results saved to API_TEST_RESULTS.json');
    })
    .catch(console.error);
}

module.exports = { testAllEndpoints, findAllEndpoints };