import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const count = await prisma.student.count({
      where: { isActive: true }
    })

    return NextResponse.json({
      success: true,
      data: {
        totalStudents: count,
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching student count:', error)
    
    // Fallback data
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      data: {
        totalStudents: 186,
        lastUpdated: new Date().toISOString()
      }
    })
  }
}
