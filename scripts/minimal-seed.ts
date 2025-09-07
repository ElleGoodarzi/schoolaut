#!/usr/bin/env tsx

// Minimal Seed Script
// Creates just enough real data to test the platform functionality

import { db } from '../lib/db'

async function createMinimalSeedData() {
  console.log('🌱 Creating minimal seed data for testing...')
  
  try {
    // Create a few teachers
    const teachers = await Promise.all([
      db.teacher.create({
        data: {
          employeeId: 'T2025001',
          firstName: 'مریم',
          lastName: 'احمدی',
          nationalId: '1234567890',
          phone: '09121234567',
          email: 'ahmadi@school.ir',
          hireDate: new Date('2024-09-01'),
          isActive: true
        }
      }),
      db.teacher.create({
        data: {
          employeeId: 'T2025002',
          firstName: 'علی',
          lastName: 'رضایی',
          nationalId: '1234567891',
          phone: '09121234568',
          email: 'rezaei@school.ir',
          hireDate: new Date('2024-09-01'),
          isActive: true
        }
      })
    ])

    console.log('✅ Created 2 teachers')

    // Create some classes
    const classes = await Promise.all([
      db.class.create({
        data: {
          grade: 1,
          section: 'الف',
          teacherId: teachers[0].id,
          capacity: 25,
          isActive: true
        }
      }),
      db.class.create({
        data: {
          grade: 1,
          section: 'ب',
          teacherId: teachers[0].id,
          capacity: 25,
          isActive: true
        }
      }),
      db.class.create({
        data: {
          grade: 2,
          section: 'الف',
          teacherId: teachers[1].id,
          capacity: 25,
          isActive: true
        }
      })
    ])

    console.log('✅ Created 3 classes')

    // Create a few sample students
    const students = []
    const sampleNames = [
      { firstName: 'احمد', lastName: 'محمدی', fatherName: 'محمد' },
      { firstName: 'فاطمه', lastName: 'احمدی', fatherName: 'علی' },
      { firstName: 'علی', lastName: 'رضایی', fatherName: 'حسن' }
    ]

    for (let i = 0; i < sampleNames.length; i++) {
      const name = sampleNames[i]
      const targetClass = classes[i % classes.length]
      
      const student = await db.student.create({
        data: {
          studentId: `25${targetClass.grade.toString().padStart(2, '0')}${(i + 1).toString().padStart(3, '0')}`,
          firstName: name.firstName,
          lastName: name.lastName,
          fatherName: name.fatherName,
          nationalId: `100000${(i + 1).toString().padStart(4, '0')}`,
          birthDate: new Date(`${2018 - targetClass.grade}-03-15`),
          grade: targetClass.grade,
          section: targetClass.section,
          classId: targetClass.id,
          phone: `0912345678${i}`,
          email: `${name.firstName.toLowerCase()}.${name.lastName.toLowerCase()}@example.com`,
          address: `آدرس نمونه ${i + 1}`,
          enrollmentDate: new Date('2024-09-01'),
          isActive: true
        }
      })
      
      students.push(student)

      // Create attendance record for today
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      await db.attendance.create({
        data: {
          studentId: student.id,
          classId: student.classId,
          date: today,
          status: 'PRESENT',
          notes: 'حضور عادی',
          createdAt: new Date()
        }
      })

      // Create a payment record
      await db.payment.create({
        data: {
          studentId: student.id,
          amount: 2500000,
          dueDate: new Date(),
          status: 'PAID',
          type: 'TUITION',
          description: 'شهریه ماهانه',
          paidDate: new Date(),
          createdAt: new Date()
        }
      })
    }

    console.log(`✅ Created ${students.length} students with attendance and payment records`)

    // Create an announcement
    await db.announcement.create({
      data: {
        title: 'خوش آمدگویی',
        content: 'به سامانه مدیریت مدرسه خوش آمدید. این سامانه آماده برای استفاده واقعی است.',
        priority: 'MEDIUM',
        author: 'مدیر مدرسه',
        publishDate: new Date(),
        isActive: true,
        targetAudience: 'all'
      }
    })

    console.log('✅ Created sample announcement')

    // Create meal service for today
    await db.mealService.create({
      data: {
        date: new Date(),
        mealType: 'LUNCH',
        menuItems: 'برنج، خورش قیمه، سالاد، ماست',
        totalOrders: students.length,
        isActive: true
      }
    })

    console.log('✅ Created meal service record')

    console.log('\n🎉 Minimal seed data created successfully!')
    console.log('📊 Summary:')
    console.log(`- ${teachers.length} teachers`)
    console.log(`- ${classes.length} classes`)
    console.log(`- ${students.length} students`)
    console.log(`- ${students.length} attendance records`)
    console.log(`- ${students.length} payment records`)
    console.log('- 1 announcement')
    console.log('- 1 meal service')

  } catch (error) {
    console.error('❌ Error creating seed data:', error)
    throw error
  }
}

async function main() {
  try {
    await createMinimalSeedData()
    console.log('\n✅ Ready for testing with real data!')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

if (require.main === module) {
  main()
}