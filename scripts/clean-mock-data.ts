#!/usr/bin/env tsx

// Clean Mock Data Script
// Removes all seeded/mock data while preserving referential integrity

import { db } from '../lib/db'

async function cleanMockData() {
  console.log('='.repeat(60))
  console.log('🧹 CLEANING MOCK DATA')
  console.log('='.repeat(60))
  
  try {
    // Clean in reverse dependency order to avoid foreign key violations
    
    console.log('🗑️ Deleting attendance records...')
    const attendanceDeleted = await db.attendance.deleteMany({})
    console.log(`✅ Deleted ${attendanceDeleted.count} attendance records`)
    
    console.log('🗑️ Deleting payment records...')
    const paymentsDeleted = await db.payment.deleteMany({})
    console.log(`✅ Deleted ${paymentsDeleted.count} payment records`)
    
    console.log('🗑️ Deleting student class assignments...')
    const assignmentsDeleted = await db.studentClassAssignment.deleteMany({})
    console.log(`✅ Deleted ${assignmentsDeleted.count} class assignments`)
    
    console.log('🗑️ Deleting students...')
    const studentsDeleted = await db.student.deleteMany({})
    console.log(`✅ Deleted ${studentsDeleted.count} students`)
    
    console.log('🗑️ Deleting classes...')
    const classesDeleted = await db.class.deleteMany({})
    console.log(`✅ Deleted ${classesDeleted.count} classes`)
    
    console.log('🗑️ Deleting teachers...')
    const teachersDeleted = await db.teacher.deleteMany({})
    console.log(`✅ Deleted ${teachersDeleted.count} teachers`)
    
    console.log('🗑️ Deleting announcements...')
    const announcementsDeleted = await db.announcement.deleteMany({})
    console.log(`✅ Deleted ${announcementsDeleted.count} announcements`)
    
    console.log('🗑️ Deleting meal services...')
    const mealsDeleted = await db.mealService.deleteMany({})
    console.log(`✅ Deleted ${mealsDeleted.count} meal services`)
    
    console.log('\n📊 CLEANUP SUMMARY:')
    console.log(`Students: ${studentsDeleted.count}`)
    console.log(`Teachers: ${teachersDeleted.count}`)
    console.log(`Classes: ${classesDeleted.count}`)
    console.log(`Attendance: ${attendanceDeleted.count}`)
    console.log(`Payments: ${paymentsDeleted.count}`)
    console.log(`Assignments: ${assignmentsDeleted.count}`)
    console.log(`Announcements: ${announcementsDeleted.count}`)
    console.log(`Meal Services: ${mealsDeleted.count}`)
    
    const totalDeleted = studentsDeleted.count + teachersDeleted.count + 
                        classesDeleted.count + attendanceDeleted.count + 
                        paymentsDeleted.count + assignmentsDeleted.count +
                        announcementsDeleted.count + mealsDeleted.count
    
    console.log(`\nTotal records removed: ${totalDeleted}`)
    
    // Verify database is empty
    const remainingCounts = {
      students: await db.student.count(),
      teachers: await db.teacher.count(),
      classes: await db.class.count(),
      attendance: await db.attendance.count(),
      payments: await db.payment.count()
    }
    
    console.log('\n📈 REMAINING RECORDS:')
    Object.entries(remainingCounts).forEach(([table, count]) => {
      console.log(`${table}: ${count}`)
    })
    
    const hasRemainingData = Object.values(remainingCounts).some(count => count > 0)
    
    if (hasRemainingData) {
      console.log('\n⚠️ Some data remains in the database')
    } else {
      console.log('\n✅ Database is completely clean!')
      console.log('🎯 Ready for real user data entry via UI forms')
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  }
}

async function main() {
  try {
    await cleanMockData()
    console.log('\n✅ Mock data cleanup completed successfully!')
    console.log('The database is now ready for real data entry.')
    
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

export { cleanMockData }