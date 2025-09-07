import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

// POST /api/seed - Development seeding utility
export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Seeding not allowed in production' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { type, count, clearFirst } = body

    let result = { success: true, message: '', data: {} }

    switch (type) {
      case 'students':
        result = await seedStudents(count || 10, clearFirst)
        break
      
      case 'teachers':
        result = await seedTeachers(count || 3, clearFirst)
        break
      
      case 'classes':
        result = await seedClasses(clearFirst)
        break
      
      case 'attendance':
        result = await seedAttendance(clearFirst)
        break
      
      case 'payments':
        result = await seedPayments(clearFirst)
        break
      
      case 'all':
        result = await seedAll(clearFirst)
        break
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid seed type' },
          { status: 400 }
        )
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error seeding data:', error)
    return NextResponse.json(
      { success: false, error: 'Seeding failed' },
      { status: 500 }
    )
  }
}

async function seedStudents(count: number, clearFirst: boolean) {
  if (clearFirst) {
    await prisma.attendance.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.studentClassAssignment.deleteMany()
    await prisma.student.deleteMany()
  }

  const classes = await prisma.class.findMany({ where: { isActive: true } })
  if (classes.length === 0) {
    return { success: false, message: 'No classes available for student assignment' }
  }

  const studentNames = [
    ['احمد', 'محمدی'], ['فاطمه', 'احمدی'], ['علی', 'رضایی'], ['مریم', 'کریمی'],
    ['حسن', 'حسینی'], ['زهرا', 'موسوی'], ['محمد', 'علوی'], ['آیدا', 'نجفی'],
    ['رضا', 'صادقی'], ['سارا', 'رحیمی'], ['امیر', 'جعفری'], ['لیلا', 'قاسمی']
  ]

  const students = []
  let studentIdCounter = Date.now().toString().slice(-6)

  for (let i = 0; i < count; i++) {
    const [firstName, lastName] = studentNames[Math.floor(Math.random() * studentNames.length)]
    const randomClass = classes[Math.floor(Math.random() * classes.length)]
    
    const student = await prisma.student.create({
      data: {
        studentId: studentIdCounter,
        firstName,
        lastName,
        fatherName: `پدر ${firstName}`,
        nationalId: (1000000000 + parseInt(studentIdCounter)).toString(),
        birthDate: new Date(2010 + randomClass.grade, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        grade: randomClass.grade,
        section: randomClass.section,
        classId: randomClass.id,
        phone: `091${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        address: `آدرس تستی ${i + 1}`,
        enrollmentDate: new Date(),
        isActive: true
      }
    })
    
    students.push(student)
    studentIdCounter = (parseInt(studentIdCounter) + 1).toString()
  }

  return {
    success: true,
    message: `${count} دانش‌آموز تستی ایجاد شد`,
    data: { studentsCreated: students.length }
  }
}

async function seedTeachers(count: number, clearFirst: boolean) {
  if (clearFirst) {
    await prisma.teacher.deleteMany()
  }

  const teacherNames = [
    ['مریم', 'احمدی'], ['فاطمه', 'محمدی'], ['علی', 'رضایی'], ['زهرا', 'کریمی'],
    ['حسن', 'موسوی'], ['سارا', 'نجفی'], ['محمد', 'صادقی'], ['آیدا', 'حسینی']
  ]

  const teachers = []
  let employeeIdCounter = 1001

  for (let i = 0; i < count; i++) {
    const [firstName, lastName] = teacherNames[Math.floor(Math.random() * teacherNames.length)]
    
    const teacher = await prisma.teacher.create({
      data: {
        employeeId: `T${employeeIdCounter}`,
        firstName,
        lastName,
        nationalId: (2000000000 + employeeIdCounter).toString(),
        phone: `091${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@school.ir`,
        hireDate: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        isActive: true
      }
    })
    
    teachers.push(teacher)
    employeeIdCounter++
  }

  return {
    success: true,
    message: `${count} معلم تستی ایجاد شد`,
    data: { teachersCreated: teachers.length }
  }
}

async function seedClasses(clearFirst: boolean) {
  if (clearFirst) {
    await prisma.class.deleteMany()
  }

  const teachers = await prisma.teacher.findMany({ where: { isActive: true } })
  if (teachers.length === 0) {
    return { success: false, message: 'No teachers available for class assignment' }
  }

  const classDefinitions = [
    { grade: 1, section: 'الف', capacity: 25 },
    { grade: 1, section: 'ب', capacity: 25 },
    { grade: 2, section: 'الف', capacity: 28 },
    { grade: 2, section: 'ب', capacity: 28 },
    { grade: 3, section: 'الف', capacity: 22 },
    { grade: 3, section: 'ب', capacity: 22 },
    { grade: 4, section: 'الف', capacity: 24 },
    { grade: 4, section: 'ب', capacity: 24 },
    { grade: 5, section: 'الف', capacity: 20 },
    { grade: 6, section: 'الف', capacity: 18 }
  ]

  const classes = []
  
  for (const classDef of classDefinitions) {
    const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)]
    
    const newClass = await prisma.class.create({
      data: {
        grade: classDef.grade,
        section: classDef.section,
        teacherId: randomTeacher.id,
        capacity: classDef.capacity,
        isActive: true
      }
    })
    
    classes.push(newClass)
  }

  return {
    success: true,
    message: `${classes.length} کلاس تستی ایجاد شد`,
    data: { classesCreated: classes.length }
  }
}

async function seedAttendance(clearFirst: boolean) {
  if (clearFirst) {
    await prisma.attendance.deleteMany()
  }

  const students = await prisma.student.findMany({ 
    where: { isActive: true },
    include: { class: true }
  })

  if (students.length === 0) {
    return { success: false, message: 'No students available for attendance seeding' }
  }

  const attendanceRecords = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Create attendance for last 5 days
  for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
    const date = new Date(today)
    date.setDate(date.getDate() - dayOffset)

    for (const student of students) {
      const rand = Math.random()
      const status = rand < 0.85 ? 'PRESENT' : 
                    rand < 0.92 ? 'ABSENT' : 
                    rand < 0.97 ? 'LATE' : 'EXCUSED'

      const attendance = await prisma.attendance.create({
        data: {
          studentId: student.id,
          classId: student.classId,
          date: date,
          status: status,
          notes: status === 'EXCUSED' ? 'مرخصی استعلاجی' : 
                status === 'LATE' ? 'تأخیر ۱۵ دقیقه‌ای' :
                status === 'ABSENT' ? 'غیبت بدون اطلاع' : ''
        }
      })
      
      attendanceRecords.push(attendance)
    }
  }

  return {
    success: true,
    message: `${attendanceRecords.length} رکورد حضور و غیاب ایجاد شد`,
    data: { attendanceRecordsCreated: attendanceRecords.length }
  }
}

async function seedPayments(clearFirst: boolean) {
  if (clearFirst) {
    await prisma.payment.deleteMany()
  }

  const students = await prisma.student.findMany({ where: { isActive: true } })
  
  if (students.length === 0) {
    return { success: false, message: 'No students available for payment seeding' }
  }

  const payments = []
  
  for (const student of students) {
    // Create 2-3 payments per student
    const paymentCount = Math.floor(Math.random() * 2) + 2
    
    for (let i = 0; i < paymentCount; i++) {
      const dueDate = new Date()
      dueDate.setMonth(dueDate.getMonth() - i)
      
      const isPaid = Math.random() > 0.3
      const isOverdue = !isPaid && dueDate < new Date()
      
      const payment = await prisma.payment.create({
        data: {
          studentId: student.id,
          amount: 2500000, // 2.5 million Toman
          dueDate: dueDate,
          paidDate: isPaid ? new Date(dueDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
          status: isOverdue ? 'OVERDUE' : isPaid ? 'PAID' : 'PENDING',
          type: 'TUITION',
          description: `شهریه ${dueDate.toLocaleDateString('fa-IR')}`,
          createdAt: new Date()
        }
      })
      
      payments.push(payment)
    }
  }

  return {
    success: true,
    message: `${payments.length} رکورد پرداخت ایجاد شد`,
    data: { paymentsCreated: payments.length }
  }
}

async function seedAll(clearFirst: boolean) {
  const results = {
    teachers: await seedTeachers(4, clearFirst),
    classes: await seedClasses(clearFirst),
    students: await seedStudents(50, clearFirst),
    attendance: await seedAttendance(clearFirst),
    payments: await seedPayments(clearFirst)
  }

  return {
    success: true,
    message: 'تمام داده‌های تستی با موفقیت ایجاد شد',
    data: results
  }
}
