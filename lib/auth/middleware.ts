import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AuthService } from './auth'

// Define protected routes
const protectedRoutes = [
  '/management',
  '/people',
  '/attendance',
  '/financial',
  '/services',
  '/teachers',
  '/api/students',
  '/api/teachers',
  '/api/classes',
  '/api/attendance',
  '/api/financial',
  '/api/management'
]

// Define public routes
const publicRoutes = [
  '/auth/login',
  '/auth/signup',
  '/api/auth',
  '/',
  '/static-test'
]

// Admin-only routes
const adminRoutes = [
  '/system',
  '/api/users',
  '/api/system'
]

// Role-based route access
const roleRoutes: Record<string, string[]> = {
  FINANCE: ['/financial', '/api/financial'],
  TEACHER: ['/attendance', '/people/students'],
  VICE_PRINCIPAL: ['/management', '/teachers', '/people', '/attendance'],
  ADMIN: ['*'] // Admin can access everything
}

export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') // files with extensions
  ) {
    return NextResponse.next()
  }

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Get user from request
  const user = await AuthService.getUserFromRequest(request)

  // If no user and route is protected, redirect to login
  if (!user && protectedRoutes.some(route => pathname.startsWith(route))) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user exists, check role-based access
  if (user) {
    // Check admin-only routes
    if (adminRoutes.some(route => pathname.startsWith(route)) && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Check role-specific routes
    const userRoleRoutes = roleRoutes[user.role] || []
    const hasAccess = userRoleRoutes.includes('*') || 
                     userRoleRoutes.some(route => pathname.startsWith(route))

    if (!hasAccess && protectedRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.json(
        { error: 'Access denied for your role' },
        { status: 403 }
      )
    }

    // Add user info to headers for API routes
    const response = NextResponse.next()
    response.headers.set('x-user-id', user.id.toString())
    response.headers.set('x-user-role', user.role)
    response.headers.set('x-user-username', user.username)
    
    return response
  }

  return NextResponse.next()
}

// Middleware configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
