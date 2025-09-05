'use client'

export interface NavigationContext {
  studentId?: number
  teacherId?: number  
  classId?: number
  focus?: 'financial' | 'attendance' | 'services' | 'evaluation' | 'communication'
  alert?: 'overdue' | 'absence' | 'performance'
}

export class ContextualNavigation {
  // Smart routing between related modules
  static navigateToStudent(context: NavigationContext & { studentId: number }) {
    const { studentId, focus, alert } = context
    let baseUrl = `/people/students/${studentId}`
    
    // Add focus tab
    if (focus) {
      baseUrl += `?tab=${focus}`
    }
    
    // Add alert context for highlighting specific issues
    if (alert) {
      const separator = focus ? '&' : '?'
      baseUrl += `${separator}alert=${alert}`
    }
    
    return baseUrl
  }

  static navigateToTeacher(context: NavigationContext & { teacherId: number }) {
    const { teacherId, focus } = context
    let baseUrl = `/people/teachers/${teacherId}`
    
    if (focus) {
      baseUrl += `?tab=${focus}`
    }
    
    return baseUrl
  }

  static navigateToClass(context: NavigationContext & { classId: number }) {
    const { classId, focus } = context
    let baseUrl = `/management/classes/${classId}`
    
    if (focus) {
      baseUrl += `?tab=${focus}`
    }
    
    return baseUrl
  }

  // Cross-module navigation patterns
  static getFinancialIssueNavigation(studentId: number) {
    return {
      studentProfile: this.navigateToStudent({ studentId, focus: 'financial', alert: 'overdue' }),
      paymentForm: `/financial/payments?studentId=${studentId}`,
      parentCommunication: `/communications/send?studentId=${studentId}&template=payment_reminder`
    }
  }

  static getAttendanceIssueNavigation(studentId: number) {
    return {
      studentProfile: this.navigateToStudent({ studentId, focus: 'attendance', alert: 'absence' }),
      attendanceForm: `/attendance/mark?studentId=${studentId}`,
      parentCommunication: `/communications/send?studentId=${studentId}&template=attendance_alert`
    }
  }

  static getTeacherClassNavigation(teacherId: number) {
    return {
      teacherProfile: this.navigateToTeacher({ teacherId, focus: 'evaluation' }),
      classManagement: `/management/classes?teacherId=${teacherId}`,
      studentList: `/students?teacherId=${teacherId}`,
      attendanceToday: `/attendance/today?teacherId=${teacherId}`
    }
  }

  // Dashboard quick actions with context
  static getDashboardQuickActions() {
    return {
      todayAttendance: '/attendance/today',
      overduePayments: '/financial?filter=overdue',
      newAnnouncement: '/announcements/new',
      frequentAbsentees: '/students?filter=frequent_absentees',
      financialReport: '/financial/reports/monthly',
      teacherEvaluation: '/evaluation?pending=true'
    }
  }

  // Sidebar menu with intelligent badges
  static getMenuItemContext() {
    return {
      financial: {
        path: '/financial',
        alerts: ['overdue_count', 'payment_due_today'],
        relatedModules: ['students', 'communications', 'dashboard']
      },
      attendance: {
        path: '/attendance', 
        alerts: ['absent_today', 'frequent_absentees'],
        relatedModules: ['students', 'communications', 'dashboard']
      },
      students: {
        path: '/students',
        alerts: ['new_enrollments', 'issues_summary'],
        relatedModules: ['financial', 'attendance', 'services', 'communications']
      },
      teachers: {
        path: '/teachers',
        alerts: ['evaluation_due', 'class_assignments'],
        relatedModules: ['management', 'evaluation', 'students']
      },
      communications: {
        path: '/communications',
        alerts: ['pending_messages', 'parent_responses'],
        relatedModules: ['students', 'financial', 'attendance', 'announcements']
      }
    }
  }
}