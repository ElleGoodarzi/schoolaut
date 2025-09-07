import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { transportServiceSchema } from '@/lib/validation/schemas'
import { AuthService } from '@/lib/auth/auth'
import { AuditService, extractRequestInfo } from '@/lib/audit/auditService'
import { z } from 'zod'

// GET /api/transport - List all transport services
export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const transportServices = await db.transportService.findMany({
      include: {
        _count: {
          select: {
            assignments: true
          }
        }
      },
      orderBy: [
        { routeName: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: transportServices
    })

  } catch (error) {
    console.error('Error fetching transport services:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transport services' },
      { status: 500 }
    )
  }
}

// POST /api/transport - Create new transport service
export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check permissions - Only ADMIN and VICE_PRINCIPAL can create transport services
    if (!['ADMIN', 'VICE_PRINCIPAL'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = transportServiceSchema.parse(body)

    // Check for duplicate route name
    const existingRoute = await db.transportService.findUnique({
      where: { routeName: validatedData.routeName }
    })

    if (existingRoute) {
      return NextResponse.json(
        { success: false, error: 'مسیر با این نام قبلاً ثبت شده است' },
        { status: 400 }
      )
    }

    const transportService = await db.transportService.create({
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
    await AuditService.logCreate(
      'TransportService',
      transportService.id,
      transportService,
      user.id,
      requestInfo.ipAddress,
      requestInfo.userAgent
    )

    return NextResponse.json({
      success: true,
      data: transportService,
      message: 'سرویس حمل‌ونقل با موفقیت ایجاد شد'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating transport service:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create transport service' },
      { status: 500 }
    )
  }
}
