#!/usr/bin/env tsx

// Fix duplicate data and apply schema changes
// This script handles duplicate phone numbers and other constraint violations

import { db } from '../lib/db'

async function fixDuplicatePhones() {
  console.log('📱 Fixing duplicate phone numbers...')
  
  // Find students with duplicate phones
  const duplicatePhones = await db.student.groupBy({
    by: ['phone'],
    where: {
      phone: {
        not: null
      }
    },
    having: {
      phone: {
        _count: {
          gt: 1
        }
      }
    }
  })

  for (const duplicate of duplicatePhones) {
    if (!duplicate.phone) continue
    
    // Get all students with this phone
    const studentsWithPhone = await db.student.findMany({
      where: { phone: duplicate.phone },
      orderBy: { id: 'asc' }
    })
    
    console.log(`Found ${studentsWithPhone.length} students with phone ${duplicate.phone}`)
    
    // Keep the first student's phone, nullify others
    for (let i = 1; i < studentsWithPhone.length; i++) {
      await db.student.update({
        where: { id: studentsWithPhone[i].id },
        data: { phone: null }
      })
      console.log(`  - Cleared phone for student ${studentsWithPhone[i].studentId}`)
    }
  }
}

async function fixDuplicateNationalIds() {
  console.log('🆔 Fixing duplicate national IDs...')
  
  const duplicateIds = await db.student.groupBy({
    by: ['nationalId'],
    having: {
      nationalId: {
        _count: {
          gt: 1
        }
      }
    }
  })

  for (const duplicate of duplicateIds) {
    const studentsWithId = await db.student.findMany({
      where: { nationalId: duplicate.nationalId },
      orderBy: { id: 'asc' }
    })
    
    console.log(`Found ${studentsWithId.length} students with national ID ${duplicate.nationalId}`)
    
    // Update duplicates with sequential suffixes
    for (let i = 1; i < studentsWithId.length; i++) {
      const newId = duplicate.nationalId + `_dup${i}`
      await db.student.update({
        where: { id: studentsWithId[i].id },
        data: { nationalId: newId }
      })
      console.log(`  - Updated national ID for student ${studentsWithId[i].studentId} to ${newId}`)
    }
  }
}

async function fixDuplicateStudentIds() {
  console.log('🎓 Fixing duplicate student IDs...')
  
  const duplicateStudentIds = await db.student.groupBy({
    by: ['studentId'],
    having: {
      studentId: {
        _count: {
          gt: 1
        }
      }
    }
  })

  for (const duplicate of duplicateStudentIds) {
    const studentsWithId = await db.student.findMany({
      where: { studentId: duplicate.studentId },
      orderBy: { id: 'asc' }
    })
    
    console.log(`Found ${studentsWithId.length} students with student ID ${duplicate.studentId}`)
    
    // Update duplicates with sequential suffixes
    for (let i = 1; i < studentsWithId.length; i++) {
      const newId = duplicate.studentId + `-${i}`
      await db.student.update({
        where: { id: studentsWithId[i].id },
        data: { studentId: newId }
      })
      console.log(`  - Updated student ID for ${studentsWithId[i].firstName} ${studentsWithId[i].lastName} to ${newId}`)
    }
  }
}

async function fixDuplicateStudentNamesInClass() {
  console.log('📚 Fixing duplicate student names within same class...')
  
  // Find students with same first name, last name, and class ID
  const duplicateNames = await db.student.groupBy({
    by: ['firstName', 'lastName', 'classId'],
    having: {
      firstName: {
        _count: {
          gt: 1
        }
      }
    }
  })

  for (const duplicate of duplicateNames) {
    const studentsWithSameName = await db.student.findMany({
      where: {
        firstName: duplicate.firstName,
        lastName: duplicate.lastName,
        classId: duplicate.classId
      },
      orderBy: { id: 'asc' }
    })
    
    console.log(`Found ${studentsWithSameName.length} students named ${duplicate.firstName} ${duplicate.lastName} in class ${duplicate.classId}`)
    
    // Keep the first one unchanged, modify others
    for (let i = 1; i < studentsWithSameName.length; i++) {
      const newLastName = `${duplicate.lastName} ${i + 1}`
      await db.student.update({
        where: { id: studentsWithSameName[i].id },
        data: { lastName: newLastName }
      })
      console.log(`  - Updated name for student ${studentsWithSameName[i].studentId} to ${duplicate.firstName} ${newLastName}`)
    }
  }
}

async function fixTeacherDuplicates() {
  console.log('👨‍🏫 Fixing duplicate teacher data...')
  
  // Fix duplicate phone numbers
  const duplicatePhones = await db.teacher.groupBy({
    by: ['phone'],
    having: {
      phone: {
        _count: {
          gt: 1
        }
      }
    }
  })

  for (const duplicate of duplicatePhones) {
    const teachersWithPhone = await db.teacher.findMany({
      where: { phone: duplicate.phone },
      orderBy: { id: 'asc' }
    })
    
    // Keep first, modify others
    for (let i = 1; i < teachersWithPhone.length; i++) {
      const newPhone = duplicate.phone.slice(0, -1) + i.toString()
      await db.teacher.update({
        where: { id: teachersWithPhone[i].id },
        data: { phone: newPhone }
      })
      console.log(`  - Updated phone for teacher ${teachersWithPhone[i].employeeId} to ${newPhone}`)
    }
  }

  // Fix duplicate national IDs
  const duplicateNationalIds = await db.teacher.groupBy({
    by: ['nationalId'],
    having: {
      nationalId: {
        _count: {
          gt: 1
        }
      }
    }
  })

  for (const duplicate of duplicateNationalIds) {
    const teachersWithId = await db.teacher.findMany({
      where: { nationalId: duplicate.nationalId },
      orderBy: { id: 'asc' }
    })
    
    for (let i = 1; i < teachersWithId.length; i++) {
      const newId = duplicate.nationalId + `_${i}`
      await db.teacher.update({
        where: { id: teachersWithId[i].id },
        data: { nationalId: newId }
      })
      console.log(`  - Updated national ID for teacher ${teachersWithId[i].employeeId} to ${newId}`)
    }
  }
}

async function main() {
  console.log('='.repeat(60))
  console.log('🔧 FIXING DUPLICATE DATA FOR SCHEMA MIGRATION')
  console.log('='.repeat(60))
  
  try {
    await fixDuplicatePhones()
    await fixDuplicateNationalIds()
    await fixDuplicateStudentIds()
    await fixDuplicateStudentNamesInClass()
    await fixTeacherDuplicates()
    
    console.log('\n✅ All duplicates fixed! Ready for schema migration.')
    console.log('Run: npx prisma db push')
    
  } catch (error) {
    console.error('❌ Error fixing duplicates:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

if (require.main === module) {
  main()
}