import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AuthService } from './lib/auth/auth'

// Define protected routes
const protectedRoutes = [
  '/management',
  '/people',
  '/attendance',
  '/financial',
  '/services',
  '/teachers',
  '/evaluation',
  '/rewards',
  '/communications',
  '/surveys',
  '/system'
]

// Define public routes
const publicRoutes = [
  '/auth/login',
  '/api/auth/login',
  '/api/auth/logout',
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
  FINANCE: ['/financial'],
  TEACHER: ['/attendance', '/people/students'],
  VICE_PRINCIPAL: ['/management', '/teachers', '/people', '/attendance', '/evaluation'],
  ADMIN: ['*'] // Admin can access everything
}

// API routes that need authentication
const protectedApiRoutes = [
  '/api/students',
  '/api/teachers',
  '/api/classes',
  '/api/attendance',
  '/api/financial',
  '/api/management',
  '/api/users'
]

export async function middleware(request: NextRequest) {
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
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Get user from request
  const user = await AuthService.getUserFromRequest(request)

  // Check if route needs authentication
  const needsAuth = protectedRoutes.some(route => pathname.startsWith(route)) ||
                   protectedApiRoutes.some(route => pathname.startsWith(route))

  // If no user and route needs auth, redirect to login
  if (!user && needsAuth) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    } else {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // If user exists, check permissions
  if (user && needsAuth) {
    // Check admin-only routes
    if (adminRoutes.some(route => pathname.startsWith(route)) && user.role !== 'ADMIN') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        )
      } else {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // Check role-specific routes
    const userRoleRoutes = roleRoutes[user.role] || []
    const hasAccess = userRoleRoutes.includes('*') || 
                     userRoleRoutes.some(route => pathname.startsWith(route))

    if (!hasAccess && !pathname.startsWith('/api/auth')) {
      // Allow access to general routes that don't require specific permissions
      const generalRoutes = ['/people', '/services', '/communications', '/surveys']
      const isGeneralRoute = generalRoutes.some(route => pathname.startsWith(route))
      
      if (!isGeneralRoute) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { success: false, error: 'Access denied for your role' },
            { status: 403 }
          )
        } else {
          return NextResponse.redirect(new URL('/', request.url))
        }
      }
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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
