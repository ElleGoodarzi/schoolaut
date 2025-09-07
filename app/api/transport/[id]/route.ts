import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { updateTransportServiceSchema } from '@/lib/validation/schemas'
import { AuthService } from '@/lib/auth/auth'
import { AuditService, extractRequestInfo } from '@/lib/audit/auditService'
import { z } from 'zod'

// GET /api/transport/[id] - Get individual transport service
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

    const transportId = parseInt(params.id)
    if (isNaN(transportId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid transport service ID' },
        { status: 400 }
      )
    }

    const transportService = await db.transportService.findUnique({
      where: { id: transportId },
      include: {
        assignments: {
          where: { isActive: true },
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true,
                studentId: true,
                grade: true,
                section: true
              }
            }
          }
        },
        _count: {
          select: {
            assignments: true
          }
        }
      }
    })

    if (!transportService) {
      return NextResponse.json(
        { success: false, error: 'Transport service not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: transportService
    })

  } catch (error) {
    console.error('Error fetching transport service:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transport service' },
      { status: 500 }
    )
  }
}

// PUT /api/transport/[id] - Update transport service
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
    if (!['ADMIN', 'VICE_PRINCIPAL'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const transportId = parseInt(params.id)
    if (isNaN(transportId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid transport service ID' },
        { status: 400 }
      )
    }

    // Get existing transport service for audit log
    const existingService = await db.transportService.findUnique({
      where: { id: transportId }
    })

    if (!existingService) {
      return NextResponse.json(
        { success: false, error: 'Transport service not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updateTransportServiceSchema.parse(body)

    // Check for duplicate route name if routeName is being updated
    if (validatedData.routeName && validatedData.routeName !== existingService.routeName) {
      const existingRoute = await db.transportService.findUnique({
        where: { routeName: validatedData.routeName }
      })

      if (existingRoute) {
        return NextResponse.json(
          { success: false, error: 'مسیر با این نام قبلاً ثبت شده است' },
          { status: 400 }
        )
      }
    }

    // Update the transport service
    const updatedService = await db.transportService.update({
      where: { id: transportId },
      data: validatedData,
      include: {
        _count: {
          select: {
            assignments: true
          }
        }
      }
    })

    // Audit log
    const requestInfo = extractRequestInfo(request)
    await AuditService.logUpdate(
      'TransportService',
      transportId,
      existingService,
      updatedService,
      user.id,
      requestInfo.ipAddress,
      requestInfo.userAgent
    )

    return NextResponse.json({
      success: true,
      data: updatedService,
      message: 'سرویس حمل‌ونقل با موفقیت به‌روزرسانی شد'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error updating transport service:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update transport service' },
      { status: 500 }
    )
  }
}

// DELETE /api/transport/[id] - Delete transport service
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
        { success: false, error: 'Only administrators can delete transport services' },
        { status: 403 }
      )
    }

    const transportId = parseInt(params.id)
    if (isNaN(transportId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid transport service ID' },
        { status: 400 }
      )
    }

    // Get existing transport service for audit log and check assignments
    const existingService = await db.transportService.findUnique({
      where: { id: transportId },
      include: {
        _count: {
          select: {
            assignments: true
          }
        }
      }
    })

    if (!existingService) {
      return NextResponse.json(
        { success: false, error: 'Transport service not found' },
        { status: 404 }
      )
    }

    // Check if there are active assignments
    if (existingService._count.assignments > 0) {
      return NextResponse.json(
        { success: false, error: 'نمی‌توان سرویسی را که دانش‌آموز مشترک دارد حذف کرد' },
        { status: 400 }
      )
    }

    // Delete the transport service
    await db.transportService.delete({
      where: { id: transportId }
    })

    // Audit log
    const requestInfo = extractRequestInfo(request)
    await AuditService.logDelete(
      'TransportService',
      transportId,
      existingService,
      user.id,
      requestInfo.ipAddress,
      requestInfo.userAgent
    )

    return NextResponse.json({
      success: true,
      message: 'سرویس حمل‌ونقل با موفقیت حذف شد'
    })

  } catch (error) {
    console.error('Error deleting transport service:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete transport service' },
      { status: 500 }
    )
  }
}
