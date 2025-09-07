import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Get current user for audit log
    const user = await AuthService.getUserFromRequest(request)

    // Clear the auth cookie
    const cookieStore = cookies()
    cookieStore.delete('auth-token')

    // Log logout
    if (user) {
      await db.auditLog.create({
        data: {
          action: 'LOGOUT',
          model: 'User',
          recordId: user.id,
          userId: user.id,
          oldValues: null,
          newValues: null,
          ipAddress: request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      }).catch(() => {}) // Don't fail logout if audit log fails
    }

    return NextResponse.json({
      success: true,
      message: 'با موفقیت خارج شدید'
    })

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'خطای داخلی سرور' },
      { status: 500 }
    )
  }
}
