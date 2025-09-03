import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const activeTeachers = await prisma.teacher.count({
      where: { isActive: true }
    })

    return NextResponse.json({
      success: true,
      data: {
        activeTeachers,
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching active teachers:', error)
    
    // Fallback data
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      data: {
        activeTeachers: 24,
        lastUpdated: new Date().toISOString()
      }
    })
  }
}
