import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'نام کاربری و رمز عبور الزامی است' },
        { status: 400 }
      )
    }

    // Authenticate user
    const user = await AuthService.authenticate(username, password)
    
    if (!user) {
      // Log failed login attempt
      await db.auditLog.create({
        data: {
          action: 'LOGIN_FAILED',
          model: 'User',
          recordId: null,
          userId: 0, // System user for failed attempts
          oldValues: JSON.stringify({ username }),
          newValues: null,
          ipAddress: request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      }).catch(() => {}) // Don't fail login if audit log fails

      return NextResponse.json(
        { success: false, error: 'نام کاربری یا رمز عبور اشتباه است' },
        { status: 401 }
      )
    }

    // Generate token
    const token = AuthService.generateToken(user)

    // Set secure cookie
    const cookieStore = cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    // Log successful login
    await db.auditLog.create({
      data: {
        action: 'LOGIN_SUCCESS',
        model: 'User',
        recordId: user.id,
        userId: user.id,
        oldValues: null,
        newValues: JSON.stringify({ role: user.role }),
        ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    }).catch(() => {}) // Don't fail login if audit log fails

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        },
        token
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'خطای داخلی سرور' },
      { status: 500 }
    )
  }
}
