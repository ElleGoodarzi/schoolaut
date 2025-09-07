#!/usr/bin/env node

// Performance Benchmark Script for Database Operations
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:3000';

// Test queries that would benefit from indexes
const BENCHMARK_QUERIES = [
  {
    name: 'Student Search by Name',
    endpoint: '/api/students?search=احمد',
    description: 'Tests firstName/lastName index performance'
  },
  {
    name: 'Students by Grade',
    endpoint: '/api/students?grade=1',
    description: 'Tests grade index performance'
  },
  {
    name: 'Attendance by Date',
    endpoint: '/api/attendance/stats/today?date=2025-01-06',
    description: 'Tests date index performance'
  },
  {
    name: 'Class with Students',
    endpoint: '/api/classes/active-students?classId=1',
    description: 'Tests classId index performance'
  },
  {
    name: 'Financial Overdue',
    endpoint: '/api/financial/overdue-count',
    description: 'Tests payment status index performance'
  },
  {
    name: 'Student Full Profile',
    endpoint: '/api/students/1/full',
    description: 'Tests complex join performance'
  },
  {
    name: 'Export Students',
    endpoint: '/api/export?type=students&format=json&grade=1',
    description: 'Tests large data export performance'
  }
];

async function benchmarkQuery(query, iterations = 5) {
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    try {
      const response = await fetch(BASE_URL + query.endpoint);
      const data = await response.json();
      
      const end = performance.now();
      const duration = end - start;
      
      if (response.ok && data.success !== false) {
        times.push(duration);
      } else {
        console.warn(`Query failed: ${query.name} - ${data.error || 'Unknown error'}`);
        return null;
      }
    } catch (error) {
      console.warn(`Query error: ${query.name} - ${error.message}`);
      return null;
    }
  }
  
  if (times.length === 0) return null;
  
  return {
    name: query.name,
    description: query.description,
    endpoint: query.endpoint,
    iterations: times.length,
    avgTime: times.reduce((sum, time) => sum + time, 0) / times.length,
    minTime: Math.min(...times),
    maxTime: Math.max(...times),
    times: times
  };
}

async function runPerformanceBenchmark() {
  console.log('='.repeat(100));
  console.log('⚡ DATABASE PERFORMANCE BENCHMARK');
  console.log('='.repeat(100));
  console.log('Testing database query performance with current schema optimizations...\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    totalQueries: BENCHMARK_QUERIES.length,
    successful: 0,
    failed: 0,
    benchmarks: []
  };
  
  for (const query of BENCHMARK_QUERIES) {
    console.log(`Testing: ${query.name}`);
    console.log(`Endpoint: ${query.endpoint}`);
    
    const benchmark = await benchmarkQuery(query);
    
    if (benchmark) {
      results.successful++;
      results.benchmarks.push(benchmark);
      
      console.log(`✅ Average: ${benchmark.avgTime.toFixed(2)}ms`);
      console.log(`   Range: ${benchmark.minTime.toFixed(2)}ms - ${benchmark.maxTime.toFixed(2)}ms`);
      
      // Performance assessment
      let performance = 'EXCELLENT';
      if (benchmark.avgTime > 100) performance = 'GOOD';
      if (benchmark.avgTime > 500) performance = 'ACCEPTABLE';
      if (benchmark.avgTime > 1000) performance = 'SLOW';
      
      console.log(`   Performance: ${performance}`);
    } else {
      results.failed++;
      console.log(`❌ FAILED - Could not benchmark this query`);
    }
    
    console.log('');
  }
  
  // Overall performance summary
  const avgOverall = results.benchmarks.length > 0 
    ? results.benchmarks.reduce((sum, b) => sum + b.avgTime, 0) / results.benchmarks.length
    : 0;
  
  console.log('='.repeat(100));
  console.log('📊 PERFORMANCE SUMMARY');
  console.log('='.repeat(100));
  console.log(`Successful benchmarks: ${results.successful}/${results.totalQueries}`);
  console.log(`Overall average query time: ${avgOverall.toFixed(2)}ms`);
  
  let overallPerformance = 'EXCELLENT';
  if (avgOverall > 100) overallPerformance = 'GOOD';
  if (avgOverall > 500) overallPerformance = 'ACCEPTABLE';
  if (avgOverall > 1000) overallPerformance = 'SLOW';
  
  console.log(`Overall performance rating: ${overallPerformance}`);
  
  // Performance insights
  console.log('\n📈 PERFORMANCE INSIGHTS:');
  results.benchmarks.forEach(b => {
    console.log(`${b.name}: ${b.avgTime.toFixed(2)}ms (${b.description})`);
  });
  
  console.log('='.repeat(100));
  
  // Save results
  const fs = require('fs');
  const path = require('path');
  
  fs.writeFileSync(
    path.join(__dirname, '../PERFORMANCE_BENCHMARK_RESULTS.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log('Results saved to PERFORMANCE_BENCHMARK_RESULTS.json');
  
  return results;
}

// Run benchmark
runPerformanceBenchmark().catch(console.error);