import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedUsers() {
  console.log('🔐 Seeding demo users...')

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 12)
  const vicePassword = await bcrypt.hash('vice123', 12)
  const teacherPassword = await bcrypt.hash('teacher123', 12)
  const financePassword = await bcrypt.hash('finance123', 12)

  // Create demo users
  const users = [
    {
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN' as const,
      firstName: 'مدیر',
      lastName: 'سیستم',
      email: 'admin@school.local',
      isActive: true
    },
    {
      username: 'vice',
      passwordHash: vicePassword,
      role: 'VICE_PRINCIPAL' as const,
      firstName: 'معاون',
      lastName: 'مدرسه',
      email: 'vice@school.local',
      isActive: true
    },
    {
      username: 'teacher',
      passwordHash: teacherPassword,
      role: 'TEACHER' as const,
      firstName: 'معلم',
      lastName: 'نمونه',
      email: 'teacher@school.local',
      isActive: true
    },
    {
      username: 'finance',
      passwordHash: financePassword,
      role: 'FINANCE' as const,
      firstName: 'مسئول',
      lastName: 'مالی',
      email: 'finance@school.local',
      isActive: true
    }
  ]

  for (const userData of users) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { username: userData.username }
      })

      if (existingUser) {
        console.log(`✅ User ${userData.username} already exists, skipping...`)
        continue
      }

      // Create user
      const user = await prisma.user.create({
        data: userData
      })

      console.log(`✅ Created user: ${user.username} (${user.role})`)

    } catch (error) {
      console.error(`❌ Error creating user ${userData.username}:`, error)
    }
  }

  console.log('🔐 User seeding completed!')
}

async function main() {
  try {
    await seedUsers()
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { seedUsers }
