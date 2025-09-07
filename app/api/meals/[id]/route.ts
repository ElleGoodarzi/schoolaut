import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { updateMealServiceSchema } from '@/lib/validation/schemas'
import { AuthService } from '@/lib/auth/auth'
import { AuditService, extractRequestInfo } from '@/lib/audit/auditService'
import { z } from 'zod'

// GET /api/meals/[id] - Get individual meal service
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await AuthService.getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const mealServiceId = parseInt(params.id)
    if (isNaN(mealServiceId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid meal service ID' },
        { status: 400 }
      )
    }

    const mealService = await db.mealService.findUnique({
      where: { id: mealServiceId }
    })

    if (!mealService) {
      return NextResponse.json(
        { success: false, error: 'Meal service not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: mealService
    })

  } catch (error) {
    console.error('Error fetching meal service:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch meal service' },
      { status: 500 }
    )
  }
}

// PUT /api/meals/[id] - Update meal service
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await AuthService.getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check permissions
    if (!['ADMIN', 'FINANCE'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const mealServiceId = parseInt(params.id)
    if (isNaN(mealServiceId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid meal service ID' },
        { status: 400 }
      )
    }

    // Get existing meal service for audit log
    const existingService = await db.mealService.findUnique({
      where: { id: mealServiceId }
    })

    if (!existingService) {
      return NextResponse.json(
        { success: false, error: 'Meal service not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updateMealServiceSchema.parse(body)

    // Update the meal service
    const updatedService = await db.mealService.update({
      where: { id: mealServiceId },
      data: {
        ...(validatedData.date && { date: new Date(validatedData.date) }),
        ...(validatedData.mealType && { mealType: validatedData.mealType }),
        ...(validatedData.menuItems && { menuItems: validatedData.menuItems }),
        ...(validatedData.price !== undefined && { price: validatedData.price }),
        ...(validatedData.maxOrders !== undefined && { maxOrders: validatedData.maxOrders }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive })
      }
    })

    // Audit log
    const requestInfo = extractRequestInfo(request)
    await AuditService.logUpdate(
      'MealService',
      mealServiceId,
      existingService,
      updatedService,
      user.id,
      requestInfo.ipAddress,
      requestInfo.userAgent
    )

    return NextResponse.json({
      success: true,
      data: updatedService,
      message: 'سرویس غذا با موفقیت به‌روزرسانی شد'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error updating meal service:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update meal service' },
      { status: 500 }
    )
  }
}

// DELETE /api/meals/[id] - Delete meal service
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await AuthService.getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check permissions - Only ADMIN can delete
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Only administrators can delete meal services' },
        { status: 403 }
      )
    }

    const mealServiceId = parseInt(params.id)
    if (isNaN(mealServiceId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid meal service ID' },
        { status: 400 }
      )
    }

    // Get existing meal service for audit log
    const existingService = await db.mealService.findUnique({
      where: { id: mealServiceId }
    })

    if (!existingService) {
      return NextResponse.json(
        { success: false, error: 'Meal service not found' },
        { status: 404 }
      )
    }

    // Delete the meal service
    await db.mealService.delete({
      where: { id: mealServiceId }
    })

    // Audit log
    const requestInfo = extractRequestInfo(request)
    await AuditService.logDelete(
      'MealService',
      mealServiceId,
      existingService,
      user.id,
      requestInfo.ipAddress,
      requestInfo.userAgent
    )

    return NextResponse.json({
      success: true,
      message: 'سرویس غذا با موفقیت حذف شد'
    })

  } catch (error) {
    console.error('Error deleting meal service:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete meal service' },
      { status: 500 }
    )
  }
}
