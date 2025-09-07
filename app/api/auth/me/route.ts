import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'غیر مجاز' },
        { status: 401 }
      )
    }

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
        }
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { success: false, error: 'خطای داخلی سرور' },
      { status: 500 }
    )
  }
}
