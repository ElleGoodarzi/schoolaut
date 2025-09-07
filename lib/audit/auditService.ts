import { db } from '@/lib/db'

export interface AuditLogData {
  action: string
  model: string
  recordId?: number
  oldValues?: any
  newValues?: any
  userId: number
  ipAddress?: string
  userAgent?: string
}

export class AuditService {
  /**
   * Log an action to the audit trail
   */
  static async log(data: AuditLogData): Promise<void> {
    try {
      await db.auditLog.create({
        data: {
          action: data.action,
          model: data.model,
          recordId: data.recordId,
          oldValues: data.oldValues ? JSON.stringify(data.oldValues) : null,
          newValues: data.newValues ? JSON.stringify(data.newValues) : null,
          userId: data.userId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent
        }
      })
    } catch (error) {
      // Don't throw errors for audit logging failures
      // Just log to console for debugging
      console.error('Audit logging failed:', error)
    }
  }

  /**
   * Log a CREATE action
   */
  static async logCreate(
    model: string,
    recordId: number,
    newValues: any,
    userId: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: 'CREATE',
      model,
      recordId,
      newValues,
      userId,
      ipAddress,
      userAgent
    })
  }

  /**
   * Log an UPDATE action
   */
  static async logUpdate(
    model: string,
    recordId: number,
    oldValues: any,
    newValues: any,
    userId: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: 'UPDATE',
      model,
      recordId,
      oldValues,
      newValues,
      userId,
      ipAddress,
      userAgent
    })
  }

  /**
   * Log a DELETE action
   */
  static async logDelete(
    model: string,
    recordId: number,
    oldValues: any,
    userId: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: 'DELETE',
      model,
      recordId,
      oldValues,
      userId,
      ipAddress,
      userAgent
    })
  }

  /**
   * Log a LOGIN action
   */
  static async logLogin(
    userId: number,
    success: boolean,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      model: 'User',
      recordId: success ? userId : undefined,
      userId: success ? userId : 0, // Use 0 for failed login attempts
      ipAddress,
      userAgent
    })
  }

  /**
   * Log a LOGOUT action
   */
  static async logLogout(
    userId: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: 'LOGOUT',
      model: 'User',
      recordId: userId,
      userId,
      ipAddress,
      userAgent
    })
  }

  /**
   * Get audit logs with filtering and pagination
   */
  static async getLogs(params: {
    model?: string
    action?: string
    userId?: number
    recordId?: number
    startDate?: Date
    endDate?: Date
    page?: number
    limit?: number
  }) {
    const {
      model,
      action,
      userId,
      recordId,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = params

    const where: any = {}

    if (model) where.model = model
    if (action) where.action = action
    if (userId) where.userId = userId
    if (recordId) where.recordId = recordId

    if (startDate || endDate) {
      where.timestamp = {}
      if (startDate) where.timestamp.gte = startDate
      if (endDate) where.timestamp.lte = endDate
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              username: true,
              firstName: true,
              lastName: true,
              role: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.auditLog.count({ where })
    ])

    return {
      logs: logs.map(log => ({
        ...log,
        oldValues: log.oldValues ? JSON.parse(log.oldValues) : null,
        newValues: log.newValues ? JSON.parse(log.newValues) : null
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Get recent activity summary
   */
  static async getRecentActivity(days: number = 7) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const logs = await db.auditLog.findMany({
      where: {
        timestamp: {
          gte: startDate
        }
      },
      include: {
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 100
    })

    // Group by action type
    const summary = logs.reduce((acc, log) => {
      const key = `${log.model}_${log.action}`
      if (!acc[key]) {
        acc[key] = {
          model: log.model,
          action: log.action,
          count: 0,
          users: new Set(),
          latestTimestamp: log.timestamp
        }
      }
      acc[key].count++
      acc[key].users.add(log.user.username)
      return acc
    }, {} as Record<string, any>)

    return Object.values(summary).map(item => ({
      ...item,
      users: Array.from(item.users)
    }))
  }

  /**
   * Get user activity
   */
  static async getUserActivity(userId: number, days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const logs = await db.auditLog.findMany({
      where: {
        userId,
        timestamp: {
          gte: startDate
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 200
    })

    return logs.map(log => ({
      ...log,
      oldValues: log.oldValues ? JSON.parse(log.oldValues) : null,
      newValues: log.newValues ? JSON.parse(log.newValues) : null
    }))
  }
}

// Helper function to extract IP and User Agent from request
export function extractRequestInfo(request: Request) {
  const headers = request.headers
  
  return {
    ipAddress: headers.get('x-forwarded-for') ||
              headers.get('x-real-ip') ||
              headers.get('cf-connecting-ip') ||
              'unknown',
    userAgent: headers.get('user-agent') || 'unknown'
  }
}
