import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTodayDate } from '@/lib/utils'

export async function GET() {
  try {
    const today = getTodayDate()
    const todayDate = new Date(today)

    const todayMeals = await prisma.mealService.aggregate({
      where: {
        date: todayDate,
        isActive: true
      },
      _sum: {
        totalOrders: true
      }
    })

    const mealServices = await prisma.mealService.findMany({
      where: {
        date: todayDate,
        isActive: true
      },
      select: {
        id: true,
        mealType: true,
        menuItems: true,
        totalOrders: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        totalMealsToday: todayMeals._sum.totalOrders || 0,
        mealServices,
        date: today,
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching meal stats:', error)
    
    // Fallback data
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      data: {
        totalMealsToday: 177,
        mealServices: [
          {
            id: 1,
            mealType: 'LUNCH',
            menuItems: 'خورش قیمه با برنج، سالاد شیرازی، ماست',
            totalOrders: 177
          }
        ],
        date: getTodayDate(),
        lastUpdated: new Date().toISOString()
      }
    })
  }
}
