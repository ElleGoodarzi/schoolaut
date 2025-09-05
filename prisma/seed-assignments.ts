import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedClassAssignments() {
  console.log('🌱 Seeding class assignments...')

  try {
    // Get some existing students and classes
    const students = await prisma.student.findMany({
      take: 5,
      include: { class: true }
    })

    const classes = await prisma.class.findMany({
      take: 3
    })

    if (students.length === 0 || classes.length === 0) {
      console.log('❌ No students or classes found. Please seed students and classes first.')
      return
    }

    // Create some class assignments
    for (let i = 0; i < Math.min(students.length, 3); i++) {
      const student = students[i]
      const targetClass = classes[i % classes.length]

      // Create assignment record
      await prisma.studentClassAssignment.create({
        data: {
          studentId: student.id,
          classId: targetClass.id,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          reason: 'تخصیص اولیه سیستم',
          isActive: true
        }
      })

      console.log(`✅ Created assignment: Student ${student.firstName} ${student.lastName} → Class ${targetClass.grade}${targetClass.section}`)
    }

    // Create a past assignment for demonstration
    if (students.length > 3) {
      const student = students[3]
      const oldClass = classes[0]
      const newClass = classes[1]

      // Past assignment
      await prisma.studentClassAssignment.create({
        data: {
          studentId: student.id,
          classId: oldClass.id,
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
          endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          reason: 'تخصیص اولیه',
          isActive: false
        }
      })

      // Current assignment
      await prisma.studentClassAssignment.create({
        data: {
          studentId: student.id,
          classId: newClass.id,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          reason: 'انتقال به کلاس جدید',
          isActive: true
        }
      })

      console.log(`✅ Created assignment history for Student ${student.firstName} ${student.lastName}`)
    }

    console.log('🎉 Class assignments seeded successfully!')

  } catch (error) {
    console.error('❌ Error seeding class assignments:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedClassAssignments()
