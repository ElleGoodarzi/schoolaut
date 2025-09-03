import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const activeClasses = await prisma.class.count({
      where: { isActive: true }
    })

    return NextResponse.json({
      success: true,
      data: {
        activeClasses,
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching active classes:', error)
    
    // Fallback data
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      data: {
        activeClasses: 8,
        lastUpdated: new Date().toISOString()
      }
    })
  }
}
