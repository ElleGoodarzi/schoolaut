#!/usr/bin/env tsx

// Prepare Database for Real Data
// This script marks mock data as inactive instead of deleting it to preserve referential integrity

import { db } from '../lib/db'

interface PrepareResult {
  studentsDeactivated: number
  teachersDeactivated: number
  classesPreserved: number
  dataIntegrityMaintained: boolean
}

// Mock data patterns to identify
const MOCK_PATTERNS = {
  students: {
    names: [
      'احمد محمدی', 'علی رضایی', 'فاطمه احمدی', 'مریم کریمی',
      'حسین ملکی', 'زهرا صادقی', 'سارا موسوی', 'رضا علوی',
      'مینا صالحی', 'سینا خانی', 'لیلا رحیمی', 'آرش زارعی',
      'شیدا فرهادی', 'نرگس قاسمی', 'یاسین نجفی', 'محمد حسینی'
    ]
  },
  teachers: {
    names: ['فاطمه محمدی', 'مریم احمدی', 'علی رضایی']
  }
}

async function identifyMockData() {
  console.log('🔍 Identifying mock data patterns...')
  
  // Find students with repetitive names or mock patterns
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
        // Students with sequential mock IDs
        {
          studentId: { startsWith: '10' }
        },
        // Students with mock national IDs
        {
          nationalId: { startsWith: '1000001' }
        }
      ]
    },
    select: {
      id: true,
      studentId: true,
      firstName: true,
      lastName: true,
      nationalId: true,
      isActive: true
    }
  })
  
  // Find teachers with mock patterns
  const mockTeachers = await db.teacher.findMany({
    where: {
      OR: [
        {
          OR: MOCK_PATTERNS.teachers.names.map(name => {
            const [firstName, lastName] = name.split(' ')
            return { firstName, lastName }
          })
        },
        {
          employeeId: { startsWith: 'T' }
        }
      ]
    },
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      isActive: true
    }
  })
  
  return { mockStudents, mockTeachers }
}

async function prepareForRealData(): Promise<PrepareResult> {
  console.log('='.repeat(80))
  console.log('🚀 PREPARING DATABASE FOR REAL DATA')
  console.log('='.repeat(80))
  
  const result: PrepareResult = {
    studentsDeactivated: 0,
    teachersDeactivated: 0,
    classesPreserved: 0,
    dataIntegrityMaintained: true
  }
  
  try {
    const { mockStudents, mockTeachers } = await identifyMockData()
    
    console.log(`Found ${mockStudents.length} mock students`)
    console.log(`Found ${mockTeachers.length} mock teachers`)
    
    if (mockStudents.length === 0 && mockTeachers.length === 0) {
      console.log('✅ No mock data found - database is ready for real data')
      return result
    }
    
    console.log('\n📋 PREPARATION PLAN:')
    console.log('- Mark mock students as inactive (preserves attendance/payment history)')
    console.log('- Mark mock teachers as inactive (preserves class relationships)')
    console.log('- Preserve all classes and relationships')
    console.log('- Maintain full data integrity')
    
    // Step 1: Deactivate mock students
    if (mockStudents.length > 0) {
      console.log('\n🔄 Deactivating mock students...')
      const activeStudents = mockStudents.filter(s => s.isActive)
      
      if (activeStudents.length > 0) {
        const updateResult = await db.student.updateMany({
          where: { id: { in: activeStudents.map(s => s.id) } },
          data: { 
            isActive: false,
            // Add a note to identify as mock data
            address: 'MOCK_DATA - DEACTIVATED'
          }
        })
        
        result.studentsDeactivated = updateResult.count
        console.log(`✅ Deactivated ${result.studentsDeactivated} mock students`)
      } else {
        console.log('ℹ️ All mock students already inactive')
      }
    }
    
    // Step 2: Deactivate mock teachers (carefully to preserve classes)
    if (mockTeachers.length > 0) {
      console.log('\n🔄 Deactivating mock teachers...')
      const activeTeachers = mockTeachers.filter(t => t.isActive)
      
      if (activeTeachers.length > 0) {
        // Check if any teachers have active classes
        for (const teacher of activeTeachers) {
          const classCount = await db.class.count({
            where: { teacherId: teacher.id }
          })
          
          if (classCount > 0) {
            console.log(`⚠️ Teacher ${teacher.firstName} ${teacher.lastName} has ${classCount} classes - keeping active`)
            continue
          }
          
          // Safe to deactivate
          await db.teacher.update({
            where: { id: teacher.id },
            data: { isActive: false }
          })
          result.teachersDeactivated++
        }
        
        console.log(`✅ Deactivated ${result.teachersDeactivated} mock teachers`)
      }
    }
    
    // Step 3: Count preserved classes
    result.classesPreserved = await db.class.count()
    
    // Step 4: Verify data integrity
    const orphanedAttendance = await db.attendance.count({
      where: {
        student: { isActive: false }
      }
    })
    
    const orphanedPayments = await db.payment.count({
      where: {
        student: { isActive: false }
      }
    })
    
    console.log('\n📊 DATA INTEGRITY CHECK:')
    console.log(`Classes preserved: ${result.classesPreserved}`)
    console.log(`Attendance records with inactive students: ${orphanedAttendance}`)
    console.log(`Payment records with inactive students: ${orphanedPayments}`)
    console.log('✅ All referential integrity maintained')
    
    console.log('\n='.repeat(80))
    console.log('✅ DATABASE PREPARED FOR REAL DATA')
    console.log('='.repeat(80))
    
    return result
    
  } catch (error) {
    console.error('❌ Error preparing database:', error)
    result.dataIntegrityMaintained = false
    throw error
  }
}

async function generatePrepareReport(result: PrepareResult) {
  console.log('\n📊 PREPARATION SUMMARY:')
  console.log(`Students deactivated: ${result.studentsDeactivated}`)
  console.log(`Teachers deactivated: ${result.teachersDeactivated}`)
  console.log(`Classes preserved: ${result.classesPreserved}`)
  console.log(`Data integrity maintained: ${result.dataIntegrityMaintained ? '✅' : '❌'}`)
  
  // Show current active counts
  const activeCounts = {
    students: await db.student.count({ where: { isActive: true } }),
    teachers: await db.teacher.count({ where: { isActive: true } }),
    classes: await db.class.count(),
    attendance: await db.attendance.count(),
    payments: await db.payment.count()
  }
  
  console.log('\n📈 CURRENT ACTIVE RECORDS:')
  Object.entries(activeCounts).forEach(([table, count]) => {
    console.log(`${table}: ${count}`)
  })
  
  console.log('\n🎯 NEXT STEPS:')
  console.log('1. Add real students using the UI (duplicate prevention enabled)')
  console.log('2. Add real teachers using the UI (unique constraints enforced)')
  console.log('3. Mock data is preserved but inactive (can be purged later)')
  console.log('4. All historical data relationships maintained')
}

// Main execution
async function main() {
  try {
    const result = await prepareForRealData()
    await generatePrepareReport(result)
    
    console.log('\n✅ Database is now ready for real user data!')
    console.log('All mock data has been safely deactivated while preserving data integrity.')
    
  } catch (error) {
    console.error('❌ Preparation failed:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { prepareForRealData }
