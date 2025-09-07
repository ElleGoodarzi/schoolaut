#!/usr/bin/env tsx

// Mock Data Cleanup Migration Script
// This script safely removes fake/mock records while maintaining referential integrity

import { db } from '../lib/db'

interface CleanupResult {
  studentsRemoved: number
  teachersRemoved: number
  attendanceRemoved: number
  paymentsRemoved: number
  announcementsRemoved: number
  mealServicesRemoved: number
}

// Mock data patterns to identify and remove
const MOCK_PATTERNS = {
  students: {
    // Repetitive Persian names that appear multiple times
    names: [
      'احمد محمدی', 'علی رضایی', 'فاطمه احمدی', 'مریم کریمی',
      'حسین ملکی', 'زهرا صادقی', 'سارا موسوی', 'رضا علوی',
      'مینا صالحی', 'سینا خانی', 'لیلا رحیمی', 'آرش زارعی',
      'شیدا فرهادی', 'نرگس قاسمی', 'یاسین نجفی', 'محمد حسینی'
    ],
    // Sequential student IDs that indicate seeded data
    sequentialIds: /^10\d{2}$/,
    // National IDs that follow mock pattern
    mockNationalIds: /^1000001\d{3}$/
  },
  teachers: {
    names: ['فاطمه محمدی', 'مریم احمدی', 'علی رضایی'],
    mockEmployeeIds: /^T\d{3}$/
  }
}

async function identifyMockStudents() {
  console.log('🔍 Identifying mock students...')
  
  const mockStudents = await db.student.findMany({
    where: {
      OR: [
        // Students with repetitive names
        {
          OR: MOCK_PATTERNS.students.names.map(name => {
            const [firstName, lastName] = name.split(' ')
            return { firstName, lastName }
          })
        },
        // Students with sequential mock IDs (starts with 10)
        {
          studentId: {
            startsWith: '10'
          }
        },
        // Students with mock national IDs (starts with 1000001)
        {
          nationalId: {
            startsWith: '1000001'
          }
        }
      ]
    },
    select: {
      id: true,
      studentId: true,
      firstName: true,
      lastName: true,
      nationalId: true,
      _count: {
        select: {
          attendances: true,
          payments: true
        }
      }
    }
  })
  
  console.log(`Found ${mockStudents.length} mock students`)
  return mockStudents
}

async function identifyMockTeachers() {
  console.log('🔍 Identifying mock teachers...')
  
  const mockTeachers = await db.teacher.findMany({
    where: {
      OR: [
        // Teachers with repetitive names
        {
          OR: MOCK_PATTERNS.teachers.names.map(name => {
            const [firstName, lastName] = name.split(' ')
            return { firstName, lastName }
          })
        },
        // Teachers with mock employee IDs (starts with T)
        {
          employeeId: {
            startsWith: 'T'
          }
        }
      ]
    },
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      _count: {
        select: {
          classes: true
        }
      }
    }
  })
  
  console.log(`Found ${mockTeachers.length} mock teachers`)
  return mockTeachers
}

async function safeCleanupMockData(): Promise<CleanupResult> {
  console.log('='.repeat(80))
  console.log('🧹 MOCK DATA CLEANUP MIGRATION')
  console.log('='.repeat(80))
  
  const result: CleanupResult = {
    studentsRemoved: 0,
    teachersRemoved: 0,
    attendanceRemoved: 0,
    paymentsRemoved: 0,
    announcementsRemoved: 0,
    mealServicesRemoved: 0
  }
  
  try {
    // Step 1: Identify mock data
    const mockStudents = await identifyMockStudents()
    const mockTeachers = await identifyMockTeachers()
    
    if (mockStudents.length === 0 && mockTeachers.length === 0) {
      console.log('✅ No mock data found to clean up')
      return result
    }
    
    console.log('\n📋 CLEANUP PLAN:')
    console.log(`- Remove ${mockStudents.length} mock students`)
    console.log(`- Remove ${mockTeachers.length} mock teachers`)
    console.log('- Related attendance, payments, and assignments will cascade delete')
    
    // Step 2: Remove mock students (cascades to attendance, payments)
    if (mockStudents.length > 0) {
      console.log('\n🗑️ Removing mock students...')
      const studentIds = mockStudents.map(s => s.id)
      
      // Count related records before deletion
      const attendanceCount = await db.attendance.count({
        where: { studentId: { in: studentIds } }
      })
      const paymentCount = await db.payment.count({
        where: { studentId: { in: studentIds } }
      })
      
      // Delete students individually to handle foreign key constraints properly
      let deletedCount = 0
      for (const studentId of studentIds) {
        try {
          await db.student.delete({
            where: { id: studentId }
          })
          deletedCount++
        } catch (error) {
          console.warn(`Failed to delete student ${studentId}:`, error)
        }
      }
      
      result.studentsRemoved = deletedCount
      result.attendanceRemoved = attendanceCount
      result.paymentsRemoved = paymentCount
      
      console.log(`✅ Removed ${result.studentsRemoved} students`)
      console.log(`✅ Cascaded ${result.attendanceRemoved} attendance records`)
      console.log(`✅ Cascaded ${result.paymentsRemoved} payment records`)
    }
    
    // Step 3: Remove mock teachers (only if they have no real classes)
    if (mockTeachers.length > 0) {
      console.log('\n🗑️ Removing mock teachers...')
      const teachersToRemove = mockTeachers.filter(t => t._count.classes === 0)
      
      if (teachersToRemove.length > 0) {
        const teacherIds = teachersToRemove.map(t => t.id)
        
        const deletedTeachers = await db.teacher.deleteMany({
          where: { id: { in: teacherIds } }
        })
        
        result.teachersRemoved = deletedTeachers.count
        console.log(`✅ Removed ${result.teachersRemoved} teachers`)
      } else {
        console.log('⚠️ Mock teachers have active classes, skipping deletion')
      }
    }
    
    // Step 4: Clean up orphaned records
    console.log('\n🧹 Cleaning up orphaned records...')
    
    // Remove announcements with mock content
    const mockAnnouncements = await db.announcement.deleteMany({
      where: {
        OR: [
          { title: { contains: 'تست' } },
          { title: { contains: 'Test' } },
          { content: { contains: 'این یک اطلاعیه تستی است' } }
        ]
      }
    })
    result.announcementsRemoved = mockAnnouncements.count
    
    // Remove mock meal services
    const mockMealServices = await db.mealService.deleteMany({
      where: {
        OR: [
          { studentId: { in: mockStudents.map(s => s.id) } },
          { notes: { contains: 'تست' } }
        ]
      }
    })
    result.mealServicesRemoved = mockMealServices.count
    
    console.log('='.repeat(80))
    console.log('✅ CLEANUP COMPLETED SUCCESSFULLY')
    console.log('='.repeat(80))
    
    return result
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  }
}

async function generateCleanupReport(result: CleanupResult) {
  console.log('\n📊 CLEANUP SUMMARY:')
  console.log(`Students removed: ${result.studentsRemoved}`)
  console.log(`Teachers removed: ${result.teachersRemoved}`)
  console.log(`Attendance records removed: ${result.attendanceRemoved}`)
  console.log(`Payment records removed: ${result.paymentsRemoved}`)
  console.log(`Announcements removed: ${result.announcementsRemoved}`)
  console.log(`Meal services removed: ${result.mealServicesRemoved}`)
  
  const totalRemoved = Object.values(result).reduce((sum, count) => sum + count, 0)
  console.log(`\nTotal records removed: ${totalRemoved}`)
  
  // Verify database state after cleanup
  const remainingCounts = {
    students: await db.student.count(),
    teachers: await db.teacher.count(),
    attendance: await db.attendance.count(),
    payments: await db.payment.count(),
    classes: await db.class.count()
  }
  
  console.log('\n📈 REMAINING RECORDS:')
  Object.entries(remainingCounts).forEach(([table, count]) => {
    console.log(`${table}: ${count}`)
  })
}

// Main execution
async function main() {
  try {
    const result = await safeCleanupMockData()
    await generateCleanupReport(result)
    
    console.log('\n✅ Mock data cleanup completed successfully!')
    console.log('The database is now ready for real user data.')
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { safeCleanupMockData, identifyMockStudents, identifyMockTeachers }
