'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Student {
  id: number
  studentId: string
  firstName: string
  lastName: string
  grade: number
  section: string
  class: {
    id: number
    grade: number
    section: string
    teacher: {
      id: number
      firstName: string
      lastName: string
      employeeId: string
    }
  }
  // Cross-module data
  financialInfo?: {
    overdueAmount: number
    overduePayments: number
    lastPaymentDate?: string
  }
  attendanceInfo?: {
    attendanceRate: number
    absenceCount: number
    lateCount: number
    lastAbsence?: string
  }
  servicesInfo?: {
    mealPlan?: string
    transportRoute?: string
    hasActiveMeal: boolean
    hasActiveTransport: boolean
  }
  parentInfo?: {
    fatherName: string
    motherName: string
    phone: string
    email?: string
  }
}

export type StudentContext = 'all' | 'financial' | 'attendance' | 'services' | 'rewards'

interface UseStudentDataOptions {
  context?: StudentContext
  includeRelations?: boolean
  filters?: {
    grade?: number
    hasFinancialIssues?: boolean
    hasAttendanceIssues?: boolean
  }
}

export function useStudentData(options: UseStudentDataOptions = {}) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const queryParams = new URLSearchParams()
      
      if (options.context && options.context !== 'all') {
        queryParams.append('include', options.context)
      }
      
      if (options.includeRelations) {
        queryParams.append('include', 'class,teacher,financial,attendance,services,parent')
      }
      
      if (options.filters?.grade) {
        queryParams.append('grade', options.filters.grade.toString())
      }
      
      if (options.filters?.hasFinancialIssues) {
        queryParams.append('hasFinancialIssues', 'true')
      }
      
      if (options.filters?.hasAttendanceIssues) {
        queryParams.append('hasAttendanceIssues', 'true')
      }

      const response = await fetch(`/api/students?${queryParams}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }
      
      if (result.success && result.data?.students) {
        setStudents(result.data.students)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching students:', err)
    } finally {
      setLoading(false)
    }
  }, [options.context, options.includeRelations, options.filters])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const getStudent = useCallback((studentId: number) => {
    return students.find(s => s.id === studentId)
  }, [students])

  const getStudentsByClass = useCallback((grade: number, section: string) => {
    return students.filter(s => s.grade === grade && s.section === section)
  }, [students])

  const getStudentsWithIssues = useCallback(() => {
    return students.filter(s => 
      (s.financialInfo && s.financialInfo.overdueAmount > 0) ||
      (s.attendanceInfo && s.attendanceInfo.attendanceRate < 75)
    )
  }, [students])

  const refresh = useCallback(() => {
    fetchStudents()
  }, [fetchStudents])

  return {
    students,
    loading,
    error,
    getStudent,
    getStudentsByClass,
    getStudentsWithIssues,
    refresh
  }
}

export default useStudentData