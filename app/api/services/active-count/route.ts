import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { getTodayDate } from '@/lib/utils'

export async function GET() {
  try {
    const today = getTodayDate()
    const todayDate = new Date(today)

    // Count active meal services for today (representing various services)
    const activeServices = await prisma.mealService.count({
      where: {
        date: todayDate,
        isActive: true
      }
    })

    // Get service details
    const services = await prisma.mealService.findMany({
      where: {
        date: todayDate,
        isActive: true
      },
      select: {
        id: true,
        mealType: true,
        totalOrders: true,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        activeServicesCount: activeServices,
        services,
        date: today,
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching active services:', error)
    
    // Fallback data
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      data: {
        activeServicesCount: 3,
        services: [
          { id: 1, mealType: 'BREAKFAST', totalOrders: 45, isActive: true },
          { id: 2, mealType: 'LUNCH', totalOrders: 177, isActive: true },
          { id: 3, mealType: 'SNACK', totalOrders: 89, isActive: true }
        ],
        date: getTodayDate(),
        lastUpdated: new Date().toISOString()
      }
    })
  }
}
