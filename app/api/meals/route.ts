import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mealServiceSchema } from '@/lib/validation/schemas'
import { AuthService } from '@/lib/auth/auth'
import { AuditService, extractRequestInfo } from '@/lib/audit/auditService'
import { z } from 'zod'

// GET /api/meals - List all meal services
export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const mealServices = await db.mealService.findMany({
      orderBy: [
        { date: 'desc' },
        { mealType: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: mealServices
    })

  } catch (error) {
    console.error('Error fetching meal services:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch meal services' },
      { status: 500 }
    )
  }
}

// POST /api/meals - Create new meal service
export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check permissions - Only ADMIN and FINANCE can create meal services
    if (!['ADMIN', 'FINANCE'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = mealServiceSchema.parse(body)

    // Check for duplicate meal service on same date and type
    const existingService = await db.mealService.findFirst({
      where: {
        date: new Date(validatedData.date),
        mealType: validatedData.mealType
      }
    })

    if (existingService) {
      return NextResponse.json(
        { success: false, error: 'سرویس غذا برای این تاریخ و نوع وعده قبلاً ثبت شده است' },
        { status: 400 }
      )
    }

    const mealService = await db.mealService.create({
      data: {
        date: new Date(validatedData.date),
        mealType: validatedData.mealType,
        menuItems: validatedData.menuItems,
        price: validatedData.price,
        maxOrders: validatedData.maxOrders
      }
    })

    // Audit log
    const requestInfo = extractRequestInfo(request)
    await AuditService.logCreate(
      'MealService',
      mealService.id,
      mealService,
      user.id,
      requestInfo.ipAddress,
      requestInfo.userAgent
    )

    return NextResponse.json({
      success: true,
      data: mealService,
      message: 'سرویس غذا با موفقیت ایجاد شد'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating meal service:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create meal service' },
      { status: 500 }
    )
  }
}
