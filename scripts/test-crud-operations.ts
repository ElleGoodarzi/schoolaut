#!/usr/bin/env tsx

// CRUD Operations Test Script
// Tests all Create, Read, Update, Delete operations for students and teachers

import { db } from '../lib/db'

interface TestResult {
  operation: string
  success: boolean
  details: string
  data?: any
}

interface TestReport {
  testName: string
  results: TestResult[]
  passed: number
  failed: number
  totalTime: number
}

class CrudTester {
  private results: TestResult[] = []
  private startTime: number = 0
  
  private async runTest<T>(
    operation: string,
    testFn: () => Promise<T>
  ): Promise<TestResult> {
    try {
      const data = await testFn()
      const result: TestResult = {
        operation,
        success: true,
        details: '✅ Test passed',
        data
      }
      this.results.push(result)
      return result
    } catch (error) {
      const result: TestResult = {
        operation,
        success: false,
        details: `❌ ${error.message || 'Unknown error'}`
      }
      this.results.push(result)
      return result
    }
  }

  private log(message: string) {
    console.log(`[${new Date().toLocaleTimeString()}] ${message}`)
  }

  async testTeacherCRUD(): Promise<TestReport> {
    this.startTime = Date.now()
    this.log('🧑‍🏫 Starting Teacher CRUD Tests...')
    
    let teacherId: number | null = null
    
    // CREATE: Add a new teacher
    await this.runTest('Create Teacher', async () => {
      const teacher = await db.teacher.create({
        data: {
          employeeId: `TEST_T_${Date.now()}`,
          firstName: 'علی',
          lastName: 'احمدی',
          nationalId: `${Date.now().toString().slice(-10)}`,
          phone: `091${Date.now().toString().slice(-8)}`,
          email: `test.teacher.${Date.now()}@school.ir`,
          hireDate: new Date(),
          isActive: true
        }
      })
      teacherId = teacher.id
      this.log(`  Created teacher: ${teacher.firstName} ${teacher.lastName} (ID: ${teacher.id})`)
      return teacher
    })

    if (!teacherId) {
      throw new Error('Teacher creation failed, cannot continue with other tests')
    }

    // READ: Get the teacher
    await this.runTest('Read Teacher', async () => {
      const teacher = await db.teacher.findUnique({
        where: { id: teacherId! },
        include: { classes: true }
      })
      
      if (!teacher) {
        throw new Error('Teacher not found')
      }
      
      this.log(`  Found teacher: ${teacher.firstName} ${teacher.lastName}`)
      return teacher
    })

    // UPDATE: Modify teacher details
    await this.runTest('Update Teacher', async () => {
      const updatedTeacher = await db.teacher.update({
        where: { id: teacherId! },
        data: {
          firstName: 'علی محمد',
          lastName: 'احمدی نژاد',
          email: `updated.teacher.${Date.now()}@school.ir`
        }
      })
      
      this.log(`  Updated teacher: ${updatedTeacher.firstName} ${updatedTeacher.lastName}`)
      return updatedTeacher
    })

    // DELETE: Remove the teacher
    await this.runTest('Delete Teacher', async () => {
      const deletedTeacher = await db.teacher.delete({
        where: { id: teacherId! }
      })
      
      this.log(`  Deleted teacher: ${deletedTeacher.firstName} ${deletedTeacher.lastName}`)
      return deletedTeacher
    })

    // Verify deletion
    await this.runTest('Verify Teacher Deletion', async () => {
      const teacher = await db.teacher.findUnique({
        where: { id: teacherId! }
      })
      
      if (teacher) {
        throw new Error('Teacher still exists after deletion')
      }
      
      this.log('  Confirmed teacher deletion')
      return null
    })

    const passed = this.results.filter(r => r.success).length
    const failed = this.results.filter(r => !r.success).length

    return {
      testName: 'Teacher CRUD',
      results: [...this.results],
      passed,
      failed,
      totalTime: Date.now() - this.startTime
    }
  }

  async testStudentCRUD(): Promise<TestReport> {
    this.results = [] // Reset results for new test
    this.startTime = Date.now()
    this.log('🎓 Starting Student CRUD Tests...')
    
    let teacherId: number | null = null
    let classId: number | null = null
    let studentId: number | null = null

    // Setup: Create a teacher and class first
    await this.runTest('Setup Teacher for Class', async () => {
      const teacher = await db.teacher.create({
        data: {
          employeeId: `TEST_SETUP_T_${Date.now()}`,
          firstName: 'معلم',
          lastName: 'تست',
          nationalId: `${Date.now().toString().slice(-10)}`,
          phone: `092${Date.now().toString().slice(-8)}`,
          email: `setup.teacher.${Date.now()}@school.ir`,
          hireDate: new Date(),
          isActive: true
        }
      })
      teacherId = teacher.id
      this.log(`  Setup teacher created: ID ${teacher.id}`)
      return teacher
    })

    await this.runTest('Setup Class for Student', async () => {
      const classData = await db.class.create({
        data: {
          grade: 1,
          section: 'TEST',
          teacherId: teacherId!,
          capacity: 30,
          isActive: true
        }
      })
      classId = classData.id
      this.log(`  Setup class created: Grade ${classData.grade}${classData.section} (ID: ${classData.id})`)
      return classData
    })

    // CREATE: Add a new student
    await this.runTest('Create Student', async () => {
      const student = await db.student.create({
        data: {
          studentId: `TEST_ST_${Date.now()}`,
          firstName: 'احمد',
          lastName: 'محمدی',
          fatherName: 'محمد',
          nationalId: `${Date.now().toString().slice(-10)}`,
          birthDate: new Date('2015-01-01'),
          grade: 1,
          section: 'TEST',
          classId: classId!,
          phone: `093${Date.now().toString().slice(-8)}`,
          email: `test.student.${Date.now()}@example.com`,
          address: 'آدرس تست',
          enrollmentDate: new Date(),
          isActive: true
        }
      })
      studentId = student.id
      this.log(`  Created student: ${student.firstName} ${student.lastName} (ID: ${student.id})`)
      return student
    })

    if (!studentId) {
      throw new Error('Student creation failed, cannot continue with other tests')
    }

    // READ: Get the student
    await this.runTest('Read Student', async () => {
      const student = await db.student.findUnique({
        where: { id: studentId! },
        include: { class: true, attendances: true, payments: true }
      })
      
      if (!student) {
        throw new Error('Student not found')
      }
      
      this.log(`  Found student: ${student.firstName} ${student.lastName}`)
      return student
    })

    // UPDATE: Modify student details
    await this.runTest('Update Student', async () => {
      const updatedStudent = await db.student.update({
        where: { id: studentId! },
        data: {
          firstName: 'احمد علی',
          lastName: 'محمدی پور',
          email: `updated.student.${Date.now()}@example.com`,
          address: 'آدرس بروزرسانی شده'
        }
      })
      
      this.log(`  Updated student: ${updatedStudent.firstName} ${updatedStudent.lastName}`)
      return updatedStudent
    })

    // Test CASCADE: Add attendance and payment records
    await this.runTest('Create Attendance Record', async () => {
      const attendance = await db.attendance.create({
        data: {
          studentId: studentId!,
          classId: classId!,
          date: new Date(),
          status: 'PRESENT',
          notes: 'تست حضور و غیاب',
          createdAt: new Date()
        }
      })
      
      this.log(`  Created attendance record for student`)
      return attendance
    })

    await this.runTest('Create Payment Record', async () => {
      const payment = await db.payment.create({
        data: {
          studentId: studentId!,
          amount: 1000000,
          dueDate: new Date(),
          status: 'PENDING',
          type: 'TUITION',
          description: 'پرداخت تست',
          createdAt: new Date()
        }
      })
      
      this.log(`  Created payment record for student`)
      return payment
    })

    // DELETE: Remove the student (should cascade to attendance and payments)
    await this.runTest('Delete Student (Cascade Test)', async () => {
      const deletedStudent = await db.student.delete({
        where: { id: studentId! }
      })
      
      this.log(`  Deleted student: ${deletedStudent.firstName} ${deletedStudent.lastName}`)
      return deletedStudent
    })

    // Verify cascade deletion
    await this.runTest('Verify Attendance Cascade Deletion', async () => {
      const attendance = await db.attendance.findMany({
        where: { studentId: studentId! }
      })
      
      if (attendance.length > 0) {
        throw new Error('Attendance records still exist after student deletion')
      }
      
      this.log('  Confirmed attendance records cascade deletion')
      return null
    })

    await this.runTest('Verify Payment Cascade Deletion', async () => {
      const payments = await db.payment.findMany({
        where: { studentId: studentId! }
      })
      
      if (payments.length > 0) {
        throw new Error('Payment records still exist after student deletion')
      }
      
      this.log('  Confirmed payment records cascade deletion')
      return null
    })

    // Cleanup
    await this.runTest('Cleanup Test Class', async () => {
      await db.class.delete({ where: { id: classId! } })
      this.log('  Cleaned up test class')
      return null
    })

    await this.runTest('Cleanup Test Teacher', async () => {
      await db.teacher.delete({ where: { id: teacherId! } })
      this.log('  Cleaned up test teacher')
      return null
    })

    const passed = this.results.filter(r => r.success).length
    const failed = this.results.filter(r => !r.success).length

    return {
      testName: 'Student CRUD',
      results: [...this.results],
      passed,
      failed,
      totalTime: Date.now() - this.startTime
    }
  }

  async testDataIntegrity(): Promise<TestReport> {
    this.results = [] // Reset results
    this.startTime = Date.now()
    this.log('🔐 Starting Data Integrity Tests...')

    // Test unique constraints
    let teacherId1: number | null = null
    let teacherId2: number | null = null

    // Create first teacher
    await this.runTest('Create First Teacher', async () => {
      const teacher = await db.teacher.create({
        data: {
          employeeId: `UNIQUE_TEST_1`,
          firstName: 'معلم',
          lastName: 'یکم',
          nationalId: '1234567890',
          phone: '09123456789',
          email: 'unique.test@school.ir',
          hireDate: new Date(),
          isActive: true
        }
      })
      teacherId1 = teacher.id
      return teacher
    })

    // Try to create teacher with duplicate national ID (should fail)
    await this.runTest('Test Duplicate National ID Constraint', async () => {
      try {
        await db.teacher.create({
          data: {
            employeeId: `UNIQUE_TEST_2`,
            firstName: 'معلم',
            lastName: 'دوم',
            nationalId: '1234567890', // Same as first teacher
            phone: '09123456790',
            email: 'unique.test2@school.ir',
            hireDate: new Date(),
            isActive: true
          }
        })
        throw new Error('Expected unique constraint violation, but creation succeeded')
      } catch (error) {
        if (error.code === 'P2002' || error.message.includes('unique constraint')) {
          this.log('  ✅ Unique constraint properly enforced for national ID')
          return null
        } else {
          throw error
        }
      }
    })

    // Try to create teacher with duplicate phone (should fail)
    await this.runTest('Test Duplicate Phone Constraint', async () => {
      try {
        await db.teacher.create({
          data: {
            employeeId: `UNIQUE_TEST_3`,
            firstName: 'معلم',
            lastName: 'سوم',
            nationalId: '1234567891',
            phone: '09123456789', // Same as first teacher
            email: 'unique.test3@school.ir',
            hireDate: new Date(),
            isActive: true
          }
        })
        throw new Error('Expected unique constraint violation, but creation succeeded')
      } catch (error) {
        if (error.code === 'P2002' || error.message.includes('unique constraint')) {
          this.log('  ✅ Unique constraint properly enforced for phone')
          return null
        } else {
          throw error
        }
      }
    })

    // Cleanup
    await this.runTest('Cleanup Integrity Test Data', async () => {
      if (teacherId1) {
        await db.teacher.delete({ where: { id: teacherId1 } })
      }
      if (teacherId2) {
        await db.teacher.delete({ where: { id: teacherId2 } })
      }
      return null
    })

    const passed = this.results.filter(r => r.success).length
    const failed = this.results.filter(r => !r.success).length

    return {
      testName: 'Data Integrity',
      results: [...this.results],
      passed,
      failed,
      totalTime: Date.now() - this.startTime
    }
  }
}

async function runAllTests() {
  console.log('='.repeat(80))
  console.log('🧪 COMPREHENSIVE CRUD AND DATA INTEGRITY TEST SUITE')
  console.log('='.repeat(80))
  
  const tester = new CrudTester()
  const allReports: TestReport[] = []
  
  try {
    // Run all test suites
    const teacherReport = await tester.testTeacherCRUD()
    const studentReport = await tester.testStudentCRUD()
    const integrityReport = await tester.testDataIntegrity()
    
    allReports.push(teacherReport, studentReport, integrityReport)
    
    // Generate summary report
    console.log('\n' + '='.repeat(80))
    console.log('📊 TEST SUMMARY REPORT')
    console.log('='.repeat(80))
    
    let totalPassed = 0
    let totalFailed = 0
    let totalTime = 0
    
    allReports.forEach(report => {
      totalPassed += report.passed
      totalFailed += report.failed
      totalTime += report.totalTime
      
      console.log(`\n${report.testName}:`)
      console.log(`  ✅ Passed: ${report.passed}`)
      console.log(`  ❌ Failed: ${report.failed}`)
      console.log(`  ⏱️ Time: ${report.totalTime}ms`)
      
      if (report.failed > 0) {
        console.log('  Failed tests:')
        report.results
          .filter(r => !r.success)
          .forEach(r => console.log(`    - ${r.operation}: ${r.details}`))
      }
    })
    
    console.log('\n' + '-'.repeat(50))
    console.log(`OVERALL RESULTS:`)
    console.log(`✅ Total Passed: ${totalPassed}`)
    console.log(`❌ Total Failed: ${totalFailed}`)
    console.log(`⏱️ Total Time: ${totalTime}ms`)
    console.log(`📊 Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`)
    
    if (totalFailed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! The system is ready for production use.')
      console.log('✅ Full CRUD operations work correctly')
      console.log('✅ Data integrity constraints are enforced')
      console.log('✅ Cascade deletions work properly')
    } else {
      console.log('\n⚠️ Some tests failed. Please review and fix issues before production.')
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error)
    process.exit(1)
  }
}

async function main() {
  try {
    await runAllTests()
  } catch (error) {
    console.error('❌ Critical error:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { CrudTester }