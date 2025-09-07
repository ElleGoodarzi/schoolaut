import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

export interface User {
  id: number
  username: string
  role: 'ADMIN' | 'VICE_PRINCIPAL' | 'TEACHER' | 'FINANCE'
  firstName?: string
  lastName?: string
  email?: string
  isActive: boolean
}

export interface AuthTokenPayload {
  userId: number
  username: string
  role: string
  iat?: number
  exp?: number
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const TOKEN_EXPIRY = '7d' // 7 days

export class AuthService {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  /**
   * Verify a password against its hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  /**
   * Generate a JWT token for a user
   */
  static generateToken(user: User): string {
    const payload: AuthTokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role
    }
    
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
  }

  /**
   * Verify and decode a JWT token
   */
  static verifyToken(token: string): AuthTokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as AuthTokenPayload
    } catch (error) {
      return null
    }
  }

  /**
   * Authenticate user with username and password
   */
  static async authenticate(username: string, password: string): Promise<User | null> {
    try {
      const user = await db.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          passwordHash: true,
          role: true,
          firstName: true,
          lastName: true,
          email: true,
          isActive: true
        }
      })

      if (!user || !user.isActive) {
        return null
      }

      const isValidPassword = await this.verifyPassword(password, user.passwordHash)
      if (!isValidPassword) {
        return null
      }

      // Update last login time
      await db.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      })

      // Return user without password hash
      const { passwordHash, ...userWithoutPassword } = user
      return userWithoutPassword as User

    } catch (error) {
      console.error('Authentication error:', error)
      return null
    }
  }

  /**
   * Get user from token (for protected routes)
   */
  static async getUserFromToken(token: string): Promise<User | null> {
    try {
      const payload = this.verifyToken(token)
      if (!payload) return null

      const user = await db.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          username: true,
          role: true,
          firstName: true,
          lastName: true,
          email: true,
          isActive: true
        }
      })

      if (!user || !user.isActive) {
        return null
      }

      return user as User
    } catch (error) {
      console.error('Token verification error:', error)
      return null
    }
  }

  /**
   * Extract user from request (cookies or headers)
   */
  static async getUserFromRequest(request: NextRequest): Promise<User | null> {
    // Try to get token from cookie first
    const cookieStore = cookies()
    let token = cookieStore.get('auth-token')?.value

    // If not in cookie, try Authorization header
    if (!token) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) return null

    return this.getUserFromToken(token)
  }

  /**
   * Create a new user (admin only)
   */
  static async createUser(data: {
    username: string
    password: string
    role: 'ADMIN' | 'VICE_PRINCIPAL' | 'TEACHER' | 'FINANCE'
    firstName?: string
    lastName?: string
    email?: string
  }): Promise<User | null> {
    try {
      const passwordHash = await this.hashPassword(data.password)
      
      const user = await db.user.create({
        data: {
          username: data.username,
          passwordHash,
          role: data.role,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email
        },
        select: {
          id: true,
          username: true,
          role: true,
          firstName: true,
          lastName: true,
          email: true,
          isActive: true
        }
      })

      return user as User
    } catch (error) {
      console.error('User creation error:', error)
      return null
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(userId: number, newPassword: string): Promise<boolean> {
    try {
      const passwordHash = await this.hashPassword(newPassword)
      
      await db.user.update({
        where: { id: userId },
        data: { passwordHash }
      })

      return true
    } catch (error) {
      console.error('Password update error:', error)
      return false
    }
  }
}

/**
 * Permission checking utilities
 */
export class PermissionService {
  /**
   * Check if user has permission to perform action on resource
   */
  static hasPermission(
    userRole: string,
    action: 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE',
    resource: 'STUDENT' | 'TEACHER' | 'CLASS' | 'ATTENDANCE' | 'PAYMENT' | 'USER' | 'SYSTEM',
    context?: { ownerId?: number; userId?: number }
  ): boolean {
    const role = userRole as 'ADMIN' | 'VICE_PRINCIPAL' | 'TEACHER' | 'FINANCE'

    // Admin has full access
    if (role === 'ADMIN') return true

    // Role-based permissions
    switch (role) {
      case 'VICE_PRINCIPAL':
        // Can view/edit academic data, no financial operations
        if (resource === 'PAYMENT' && ['CREATE', 'UPDATE', 'DELETE'].includes(action)) {
          return false
        }
        if (resource === 'USER' && ['CREATE', 'UPDATE', 'DELETE'].includes(action)) {
          return false
        }
        return true

      case 'TEACHER':
        // Can only access their own classes and students
        if (resource === 'PAYMENT') return false
        if (resource === 'USER') return false
        if (resource === 'SYSTEM') return false
        
        if (['CREATE', 'DELETE'].includes(action)) return false
        
        // Can view and update their own data
        if (context?.ownerId && context?.userId && context.ownerId !== context.userId) {
          return false
        }
        
        return action === 'VIEW' || action === 'UPDATE'

      case 'FINANCE':
        // Can only access financial data
        if (resource !== 'PAYMENT' && resource !== 'STUDENT') return false
        if (resource === 'STUDENT' && action !== 'VIEW') return false
        return true

      default:
        return false
    }
  }

  /**
   * Check if user can access specific student data
   */
  static async canAccessStudent(user: User, studentId: number): Promise<boolean> {
    if (user.role === 'ADMIN' || user.role === 'VICE_PRINCIPAL') {
      return true
    }

    if (user.role === 'TEACHER') {
      // Check if teacher is assigned to student's class
      const student = await db.student.findFirst({
        where: {
          id: studentId,
          class: {
            teacher: {
              // Assuming teacher has same username as user
              // You might need to link User to Teacher differently
              employeeId: user.username
            }
          }
        }
      })
      return !!student
    }

    if (user.role === 'FINANCE') {
      // Finance can access all students for payment purposes
      return true
    }

    return false
  }
}
