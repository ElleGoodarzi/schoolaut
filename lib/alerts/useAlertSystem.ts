'use client'

import { useState, useEffect, useCallback } from 'react'
import { ContextualNavigation } from '../navigation/contextualNavigation'

export interface Alert {
  id: string
  type: 'financial' | 'attendance' | 'academic' | 'system' | 'communication'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  count: number
  timestamp: Date
  actionable: boolean
  relatedEntity?: {
    type: 'student' | 'teacher' | 'class' | 'payment'
    id: number
    name: string
  }
  actions?: AlertAction[]
  autoExpire?: number // minutes
}

export interface AlertAction {
  label: string
  url: string
  style: 'primary' | 'secondary' | 'danger'
  requiresConfirmation?: boolean
}

export function useAlertSystem() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/dashboard/alerts')
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch alerts')
      }
      
      if (result.success && result.data?.alerts) {
        // Transform API data to Alert objects and add contextual actions
        const transformedAlerts: Alert[] = result.data.alerts.map((alert: any) => ({
          ...alert,
          timestamp: new Date(alert.timestamp),
          actions: generateContextualActions(alert)
        }))
        
        setAlerts(transformedAlerts)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching alerts:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
    
    // Auto refresh alerts every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchAlerts])

  // Generate contextual actions based on alert type
  const generateContextualActions = (alert: Alert): AlertAction[] => {
    const actions: AlertAction[] = []

    switch (alert.type) {
      case 'financial':
        if (alert.relatedEntity?.type === 'student') {
          const nav = ContextualNavigation.getFinancialIssueNavigation(alert.relatedEntity.id)
          actions.push(
            {
              label: 'مشاهده پروفایل دانش‌آموز',
              url: nav.studentProfile,
              style: 'primary'
            },
            {
              label: 'ثبت پرداخت',
              url: nav.paymentForm,
              style: 'secondary'
            },
            {
              label: 'ارسال یادآوری',
              url: nav.parentCommunication,
              style: 'secondary'
            }
          )
        }
        break

      case 'attendance':
        if (alert.relatedEntity?.type === 'student') {
          const nav = ContextualNavigation.getAttendanceIssueNavigation(alert.relatedEntity.id)
          actions.push(
            {
              label: 'مشاهده حضور و غیاب',
              url: nav.studentProfile,
              style: 'primary'
            },
            {
              label: 'ثبت حضور',
              url: nav.attendanceForm,
              style: 'secondary'
            },
            {
              label: 'تماس با والدین',
              url: nav.parentCommunication,
              style: 'secondary'
            }
          )
        }
        break

      case 'academic':
        if (alert.relatedEntity?.type === 'teacher') {
          const nav = ContextualNavigation.getTeacherClassNavigation(alert.relatedEntity.id)
          actions.push(
            {
              label: 'مشاهده پروفایل معلم',
              url: nav.teacherProfile,
              style: 'primary'
            },
            {
              label: 'مدیریت کلاس',
              url: nav.classManagement,
              style: 'secondary'
            }
          )
        }
        break
    }

    return actions
  }

  // Get alerts by category for sidebar badges
  const getAlertCounts = useCallback(() => {
    return {
      financial: alerts.filter(a => a.type === 'financial').length,
      attendance: alerts.filter(a => a.type === 'attendance').length,
      academic: alerts.filter(a => a.type === 'academic').length,
      system: alerts.filter(a => a.type === 'system').length,
      communication: alerts.filter(a => a.type === 'communication').length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      total: alerts.length
    }
  }, [alerts])

  // Get high priority alerts for dashboard
  const getCriticalAlerts = useCallback(() => {
    return alerts.filter(a => a.severity === 'critical' || a.severity === 'high')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [alerts])

  // Mark alert as read/dismissed
  const dismissAlert = useCallback(async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/dismiss`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setAlerts(prev => prev.filter(a => a.id !== alertId))
      }
    } catch (err) {
      console.error('Error dismissing alert:', err)
    }
  }, [])

  // Create new alert (for other modules to trigger)
  const createAlert = useCallback(async (alertData: Omit<Alert, 'id' | 'timestamp'>) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alertData)
      })
      
      if (response.ok) {
        fetchAlerts() // Refresh alerts
      }
    } catch (err) {
      console.error('Error creating alert:', err)
    }
  }, [fetchAlerts])

  return {
    alerts,
    loading,
    error,
    getAlertCounts,
    getCriticalAlerts,
    dismissAlert,
    createAlert,
    refresh: fetchAlerts
  }
}

export default useAlertSystem