import { NextRequest, NextResponse } from 'next/server'
import { AuthService, PermissionService } from '@/lib/auth/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

// Validation schemas
const createUserSchema = z.object({
  username: z.string().min(3, 'نام کاربری باید حداقل ۳ کاراکتر باشد'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
  role: z.enum(['ADMIN', 'VICE_PRINCIPAL', 'TEACHER', 'FINANCE']),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('ایمیل معتبر وارد کنید').optional()
})

const updateUserSchema = z.object({
  username: z.string().min(3).optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['ADMIN', 'VICE_PRINCIPAL', 'TEACHER', 'FINANCE']).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional()
})

// GET /api/users - List all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'غیر مجاز' },
        { status: 401 }
      )
    }

    if (!PermissionService.hasPermission(user.role, 'VIEW', 'USER')) {
      return NextResponse.json(
        { success: false, error: 'دسترسی کافی ندارید' },
        { status: 403 }
      )
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: users
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'خطای داخلی سرور' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    const currentUser = await AuthService.getUserFromRequest(request)
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'غیر مجاز' },
        { status: 401 }
      )
    }

    if (!PermissionService.hasPermission(currentUser.role, 'CREATE', 'USER')) {
      return NextResponse.json(
        { success: false, error: 'دسترسی کافی ندارید' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Check if username already exists
    const existingUser = await db.user.findUnique({
      where: { username: validatedData.username }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'نام کاربری قبلاً استفاده شده است' },
        { status: 400 }
      )
    }

    // Create user
    const newUser = await AuthService.createUser(validatedData)

    if (!newUser) {
      return NextResponse.json(
        { success: false, error: 'خطا در ایجاد کاربر' },
        { status: 500 }
      )
    }

    // Log user creation
    await db.auditLog.create({
      data: {
        action: 'CREATE',
        model: 'User',
        recordId: newUser.id,
        userId: currentUser.id,
        oldValues: null,
        newValues: JSON.stringify({
          username: newUser.username,
          role: newUser.role
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    }).catch(() => {}) // Don't fail if audit log fails

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'کاربر با موفقیت ایجاد شد'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: 'خطای داخلی سرور' },
      { status: 500 }
    )
  }
}
