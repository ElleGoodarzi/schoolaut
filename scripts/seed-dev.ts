#!/usr/bin/env tsx

// Controlled Development Seeder
// Creates realistic but clearly marked test data for development

import { db } from '../lib/db'

interface SeedOptions {
  studentCount?: number
  teacherCount?: number
  clearFirst?: boolean
  devMode?: boolean
}

const DEV_MARKER = 'DEV_TEST'

// Realistic but clearly marked Persian names for testing
const DEV_STUDENT_NAMES = [
  { firstName: 'علی', lastName: 'احمدی', fatherName: 'محمد' },
  { firstName: 'فاطمه', lastName: 'رضایی', fatherName: 'حسن' },
  { firstName: 'محمد', lastName: 'موسوی', fatherName: 'علی' },
  { firstName: 'زهرا', lastName: 'کریمی', fatherName: 'رضا' },
  { firstName: 'حسین', lastName: 'صادقی', fatherName: 'احمد' },
  { firstName: 'مریم', lastName: 'محمدی', fatherName: 'محمود' },
  { firstName: 'رضا', lastName: 'علوی', fatherName: 'مهدی' },
  { firstName: 'سارا', lastName: 'حسینی', fatherName: 'جواد' },
  { firstName: 'امیر', lastName: 'نجفی', fatherName: 'مصطفی' },
  { firstName: 'لیلا', lastName: 'قاسمی', fatherName: 'ابراهیم' }
]

const DEV_TEACHER_NAMES = [
  { firstName: 'دکتر احمد', lastName: 'علمی', email: 'dev.teacher1@school-dev.ir' },
  { firstName: 'خانم مریم', lastName: 'آموزشی', email: 'dev.teacher2@school-dev.ir' },
  { firstName: 'استاد علی', lastName: 'دانشمند', email: 'dev.teacher3@school-dev.ir' },
  { firstName: 'خانم زهرا', lastName: 'معلم', email: 'dev.teacher4@school-dev.ir' }
]

function generateDevNationalId(index: number): string {
  // Format: DEV + year + sequential number (clearly marked as dev)
  const year = new Date().getFullYear().toString().slice(-2)
  const sequential = (index + 1).toString().padStart(4, '0')
  return `9${year}${sequential}` // Starts with 9 to indicate dev data
}

function generateDevStudentId(grade: number, index: number): string {
  const year = new Date().getFullYear().toString().slice(-2)
  const gradeStr = grade.toString().padStart(2, '0')
  const sequential = (index + 1).toString().padStart(3, '0')
  return `${DEV_MARKER}_${year}${gradeStr}${sequential}`
}

function generateDevEmployeeId(index: number): string {
  return `${DEV_MARKER}_T${(index + 1).toString().padStart(3, '0')}`
}

function generateDevPhone(index: number): string {
  const base = '09100000000'
  const suffix = (index + 1).toString().padStart(3, '0')
  return base.slice(0, -3) + suffix
}

async function clearDevData() {
  console.log('🧹 Clearing existing dev data...')
  
  // Delete students with dev markers
  const deletedStudents = await db.student.deleteMany({
    where: {
      OR: [
        { studentId: { startsWith: DEV_MARKER } },
        { nationalId: { startsWith: '9' } }, // Dev national IDs start with 9
        { address: { contains: DEV_MARKER } }
      ]
    }
  })
  
  // Delete teachers with dev markers
  const deletedTeachers = await db.teacher.deleteMany({
    where: {
      OR: [
        { employeeId: { startsWith: DEV_MARKER } },
        { email: { contains: 'school-dev.ir' } }
      ]
    }
  })
  
  console.log(`✅ Cleared ${deletedStudents.count} dev students`)
  console.log(`✅ Cleared ${deletedTeachers.count} dev teachers`)
}

async function seedDevTeachers(count: number) {
  console.log(`👩‍🏫 Creating ${count} dev teachers...`)
  
  const teachers = []
  for (let i = 0; i < count; i++) {
    const teacherData = DEV_TEACHER_NAMES[i % DEV_TEACHER_NAMES.length]
    
    teachers.push({
      employeeId: generateDevEmployeeId(i),
      firstName: teacherData.firstName,
      lastName: teacherData.lastName,
      nationalId: generateDevNationalId(i + 1000), // Offset to avoid conflicts
      phone: generateDevPhone(i + 100),
      email: teacherData.email,
      hireDate: new Date(),
      isActive: true
    })
  }
  
  const createdTeachers = await db.teacher.createMany({
    data: teachers
  })
  
  console.log(`✅ Created ${createdTeachers.count} dev teachers`)
  return createdTeachers.count
}

async function seedDevStudents(count: number) {
  console.log(`👨‍🎓 Creating ${count} dev students...`)
  
  // Get available classes
  const classes = await db.class.findMany({
    include: {
      _count: {
        select: { students: true }
      }
    }
  })
  
  if (classes.length === 0) {
    console.warn('⚠️ No classes available for students')
    return 0
  }
  
  const students = []
  for (let i = 0; i < count; i++) {
    const studentData = DEV_STUDENT_NAMES[i % DEV_STUDENT_NAMES.length]
    const targetClass = classes[i % classes.length]
    
    // Skip if class is full
    if (targetClass.capacity && targetClass._count.students >= targetClass.capacity) {
      continue
    }
    
    students.push({
      studentId: generateDevStudentId(targetClass.grade, i),
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      fatherName: studentData.fatherName,
      nationalId: generateDevNationalId(i),
      birthDate: new Date(2015 - targetClass.grade, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      grade: targetClass.grade,
      section: targetClass.section,
      classId: targetClass.id,
      phone: generateDevPhone(i),
      address: `${DEV_MARKER} - آدرس تستی شماره ${i + 1}`,
      enrollmentDate: new Date(),
      isActive: true
    })
  }
  
  const createdStudents = await db.student.createMany({
    data: students
  })
  
  console.log(`✅ Created ${createdStudents.count} dev students`)
  return createdStudents.count
}

async function generateDevAttendance() {
  console.log('📝 Generating sample attendance data...')
  
  const devStudents = await db.student.findMany({
    where: { studentId: { startsWith: DEV_MARKER } },
    select: { id: true, classId: true }
  })
  
  if (devStudents.length === 0) {
    console.log('ℹ️ No dev students found for attendance generation')
    return 0
  }
  
  const attendanceRecords = []
  const today = new Date()
  const statuses = ['PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'LATE'] // Weighted toward present
  
  // Generate attendance for last 5 days
  for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
    const date = new Date(today)
    date.setDate(date.getDate() - dayOffset)
    
    for (const student of devStudents) {
      attendanceRecords.push({
        studentId: student.id,
        classId: student.classId,
        date,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        notes: Math.random() > 0.8 ? 'یادداشت تستی' : null,
        createdAt: new Date()
      })
    }
  }
  
  const createdAttendance = await db.attendance.createMany({
    data: attendanceRecords
  })
  
  console.log(`✅ Created ${createdAttendance.count} attendance records`)
  return createdAttendance.count
}

async function seedDevData(options: SeedOptions = {}) {
  const {
    studentCount = 20,
    teacherCount = 4,
    clearFirst = false,
    devMode = true
  } = options
  
  console.log('='.repeat(80))
  console.log('🌱 CONTROLLED DEVELOPMENT SEEDER')
  console.log('='.repeat(80))
  
  if (!devMode) {
    console.error('❌ This seeder is for development only!')
    console.error('Set devMode: true to proceed')
    return
  }
  
  console.log(`📋 SEEDING PLAN:`)
  console.log(`- Students: ${studentCount}`)
  console.log(`- Teachers: ${teacherCount}`)
  console.log(`- Clear first: ${clearFirst}`)
  console.log(`- All data marked with: ${DEV_MARKER}`)
  
  try {
    if (clearFirst) {
      await clearDevData()
    }
    
    const teachersCreated = await seedDevTeachers(teacherCount)
    const studentsCreated = await seedDevStudents(studentCount)
    const attendanceCreated = await generateDevAttendance()
    
    console.log('\n='.repeat(80))
    console.log('✅ DEV SEEDING COMPLETED')
    console.log('='.repeat(80))
    console.log(`Teachers created: ${teachersCreated}`)
    console.log(`Students created: ${studentsCreated}`)
    console.log(`Attendance records: ${attendanceCreated}`)
    
    console.log('\n🔍 DEV DATA IDENTIFICATION:')
    console.log(`- Student IDs start with: ${DEV_MARKER}_`)
    console.log(`- Teacher IDs start with: ${DEV_MARKER}_T`)
    console.log(`- National IDs start with: 9`)
    console.log(`- Teacher emails end with: school-dev.ir`)
    console.log(`- Student addresses contain: ${DEV_MARKER}`)
    
    console.log('\n🧹 CLEANUP COMMAND:')
    console.log('To remove all dev data: npm run seed:dev -- --clear')
    
  } catch (error) {
    console.error('❌ Dev seeding failed:', error)
    throw error
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  const clearOnly = args.includes('--clear')
  const studentCount = parseInt(args.find(arg => arg.startsWith('--students='))?.split('=')[1] || '20')
  const teacherCount = parseInt(args.find(arg => arg.startsWith('--teachers='))?.split('=')[1] || '4')
  
  try {
    if (clearOnly) {
      await clearDevData()
      console.log('✅ Dev data cleared successfully')
    } else {
      await seedDevData({
        studentCount,
        teacherCount,
        clearFirst: args.includes('--clear-first'),
        devMode: true
      })
    }
    
  } catch (error) {
    console.error('❌ Operation failed:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { seedDevData, clearDevData }
