import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create teachers
  const teachers = await Promise.all([
    prisma.teacher.create({
      data: {
        employeeId: 'T001',
        firstName: 'مریم',
        lastName: 'احمدی',
        nationalId: '1234567890',
        phone: '09121234567',
        email: 'ahmadi@school.ir',
        hireDate: new Date('2020-09-01'),
      }
    }),
    prisma.teacher.create({
      data: {
        employeeId: 'T002',
        firstName: 'فاطمه',
        lastName: 'محمدی',
        nationalId: '1234567891',
        phone: '09121234568',
        email: 'mohammadi@school.ir',
        hireDate: new Date('2019-09-01'),
      }
    }),
    prisma.teacher.create({
      data: {
        employeeId: 'T003',
        firstName: 'علی',
        lastName: 'رضایی',
        nationalId: '1234567892',
        phone: '09121234569',
        email: 'rezaei@school.ir',
        hireDate: new Date('2021-09-01'),
      }
    }),
    prisma.teacher.create({
      data: {
        employeeId: 'T004',
        firstName: 'زهرا',
        lastName: 'کریمی',
        nationalId: '1234567893',
        phone: '09121234570',
        email: 'karimi@school.ir',
        hireDate: new Date('2018-09-01'),
      }
    })
  ])

  console.log('✅ Teachers created')

  // Create classes
  const classes = await Promise.all([
    prisma.class.create({
      data: {
        grade: 1,
        section: 'الف',
        teacherId: teachers[0].id,
        capacity: 25
      }
    }),
    prisma.class.create({
      data: {
        grade: 1,
        section: 'ب',
        teacherId: teachers[0].id,
        capacity: 25
      }
    }),
    prisma.class.create({
      data: {
        grade: 2,
        section: 'الف',
        teacherId: teachers[1].id,
        capacity: 28
      }
    }),
    prisma.class.create({
      data: {
        grade: 2,
        section: 'ب',
        teacherId: teachers[1].id,
        capacity: 28
      }
    }),
    prisma.class.create({
      data: {
        grade: 3,
        section: 'الف',
        teacherId: teachers[2].id,
        capacity: 22
      }
    }),
    prisma.class.create({
      data: {
        grade: 3,
        section: 'ب',
        teacherId: teachers[2].id,
        capacity: 22
      }
    }),
    prisma.class.create({
      data: {
        grade: 4,
        section: 'الف',
        teacherId: teachers[3].id,
        capacity: 24
      }
    }),
    prisma.class.create({
      data: {
        grade: 4,
        section: 'ب',
        teacherId: teachers[3].id,
        capacity: 24
      }
    })
  ])

  console.log('✅ Classes created')

  // Create students
  const studentNames = [
    ['احمد', 'محمدی'], ['فاطمه', 'احمدی'], ['علی', 'رضایی'], ['مریم', 'کریمی'],
    ['حسن', 'نوری'], ['زهرا', 'صادقی'], ['محمد', 'حسینی'], ['سارا', 'موسوی'],
    ['رضا', 'علوی'], ['نرگس', 'قاسمی'], ['امیر', 'جعفری'], ['لیلا', 'رحیمی'],
    ['حسین', 'ملکی'], ['مینا', 'صالحی'], ['یاسین', 'نجفی'], ['شیدا', 'فرهادی'],
    ['آرش', 'زارعی'], ['نازنین', 'بهرامی'], ['سینا', 'خانی'], ['گلناز', 'امینی']
  ]

  const students = []
  let studentIdCounter = 1001

  for (let i = 0; i < classes.length; i++) {
    const classData = classes[i]
    const studentsPerClass = Math.floor(Math.random() * 10) + 20 // 20-30 students per class
    
    for (let j = 0; j < studentsPerClass; j++) {
      const [firstName, lastName] = studentNames[Math.floor(Math.random() * studentNames.length)]
      
      const student = await prisma.student.create({
        data: {
          studentId: studentIdCounter.toString(),
          firstName: firstName,
          lastName: lastName,
          fatherName: 'پدر ' + firstName,
          nationalId: (1000000000 + studentIdCounter).toString(),
          birthDate: new Date(2010 + classData.grade, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          grade: classData.grade,
          section: classData.section,
          classId: classData.id,
          enrollmentDate: new Date('2023-09-01')
        }
      })
      
      students.push(student)
      studentIdCounter++
    }
  }

  console.log(`✅ ${students.length} students created`)

  // Create attendance records for today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (const student of students) {
    const attendanceStatus = Math.random() < 0.95 ? 'PRESENT' : 
                           Math.random() < 0.7 ? 'ABSENT' : 'LATE'
    
    await prisma.attendance.create({
      data: {
        studentId: student.id,
        classId: student.classId,
        date: today,
        status: attendanceStatus
      }
    })
  }

  console.log('✅ Today\'s attendance records created')

  // Create some payment records (some overdue)
  for (const student of students) {
    // Current month payment
    const currentMonth = new Date()
    currentMonth.setDate(1) // First of current month
    
    const isOverdue = Math.random() < 0.1 // 10% chance of overdue
    const paymentStatus = isOverdue ? 'OVERDUE' : 
                         Math.random() < 0.9 ? 'PAID' : 'PENDING'
    
    await prisma.payment.create({
      data: {
        studentId: student.id,
        amount: 2500000, // 2.5 million tomans
        dueDate: currentMonth,
        paidDate: paymentStatus === 'PAID' ? new Date() : null,
        status: paymentStatus,
        type: 'TUITION',
        description: 'شهریه ماهانه'
      }
    })
  }

  console.log('✅ Payment records created')

  // Create announcements
  await Promise.all([
    prisma.announcement.create({
      data: {
        title: 'تعطیلات نوروزی',
        content: 'با عرض تبریک سال نو، اطلاع می‌رساند که تعطیلات نوروزی از تاریخ ۲۹ اسفند آغاز می‌شود.',
        priority: 'HIGH',
        author: 'مدیریت مدرسه',
        targetAudience: 'all'
      }
    }),
    prisma.announcement.create({
      data: {
        title: 'برنامه امتحانات پایان ترم',
        content: 'برنامه امتحانات نهایی ترم دوم از تاریخ ۱۵ خرداد شروع خواهد شد. دانش‌آموزان می‌توانند برنامه کامل را از سایت مدرسه دریافت کنند.',
        priority: 'MEDIUM',
        author: 'معاونت آموزشی',
        targetAudience: 'all'
      }
    }),
    prisma.announcement.create({
      data: {
        title: 'جلسه اولیا و مربیان',
        content: 'جلسه اولیا و مربیان کلاس‌های سوم و چهارم روز پنج‌شنبه ساعت ۱۶ برگزار خواهد شد.',
        priority: 'LOW',
        author: 'مسئول روابط اولیا',
        targetAudience: 'parents'
      }
    })
  ])

  console.log('✅ Announcements created')

  // Create meal services
  const today2 = new Date()
  await prisma.mealService.create({
    data: {
      date: today2,
      mealType: 'LUNCH',
      menuItems: 'خورش قیمه با برنج، سالاد شیرازی، ماست',
      totalOrders: students.length - Math.floor(Math.random() * 30), // Most students order
      isActive: true
    }
  })

  console.log('✅ Meal services created')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
