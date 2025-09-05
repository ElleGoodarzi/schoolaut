'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface AppContextType {
  // Selected entities for cross-module navigation
  selectedStudentId: number | null
  selectedTeacherId: number | null
  selectedClassId: number | null
  
  // Active filters and search state
  activeFilters: {
    grade?: number
    section?: string
    status?: string
    dateRange?: { start: string; end: string }
    searchTerm?: string
    hasFinancialIssues?: boolean
    hasAttendanceIssues?: boolean
  }
  
  // Navigation context and history
  navigationContext: {
    sourceModule?: string
    targetModule?: string
    highlightField?: string
    activeTab?: string
    previousUrl?: string
    breadcrumbs?: Array<{
      label: string
      url: string
      context?: any
    }>
  }
  
  // Recent entities for quick access
  recentEntities: {
    students: Array<{ id: number; name: string; lastVisited: Date }>
    teachers: Array<{ id: number; name: string; lastVisited: Date }>
    classes: Array<{ id: number; name: string; lastVisited: Date }>
  }
  
  // UI state
  sidebarCollapsed: boolean
  showQuickAccess: boolean
  
  // Actions
  setSelectedStudent: (id: number | null) => void
  setSelectedTeacher: (id: number | null) => void
  setSelectedClass: (id: number | null) => void
  setActiveFilters: (filters: any) => void
  setNavigationContext: (context: any) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setShowQuickAccess: (show: boolean) => void
  addToRecentEntities: (type: 'student' | 'teacher' | 'class', entity: { id: number; name: string }) => void
  
  // Smart navigation helpers
  navigateToStudent: (id: number, tab?: string, highlight?: string, sourceModule?: string) => void
  navigateToTeacher: (id: number, tab?: string, sourceModule?: string) => void
  navigateToClass: (id: number, tab?: string, sourceModule?: string) => void
  navigateToFinancial: (studentId?: number, highlight?: string, sourceModule?: string) => void
  navigateToAttendance: (studentId?: number, highlight?: string, sourceModule?: string) => void
  navigateToServices: (studentId?: number, sourceModule?: string) => void
  
  // Smart back navigation
  goBack: () => void
  canGoBack: () => boolean
  
  // Quick access helpers
  getRecentStudents: () => Array<{ id: number; name: string; lastVisited: Date }>
  getRecentTeachers: () => Array<{ id: number; name: string; lastVisited: Date }>
  clearRecentEntities: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [activeFilters, setActiveFilters] = useState({})
  const [navigationContext, setNavigationContext] = useState({})
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showQuickAccess, setShowQuickAccess] = useState(false)
  const [recentEntities, setRecentEntities] = useState({
    students: [],
    teachers: [],
    classes: []
  })

  // Add entity to recent list
  const addToRecentEntities = (type: 'student' | 'teacher' | 'class', entity: { id: number; name: string }) => {
    setRecentEntities(prev => {
      const key = `${type}s` as keyof typeof prev
      const updated = [...prev[key]]
      
      // Remove if already exists
      const existingIndex = updated.findIndex(item => item.id === entity.id)
      if (existingIndex >= 0) {
        updated.splice(existingIndex, 1)
      }
      
      // Add to beginning
      updated.unshift({ ...entity, lastVisited: new Date() })
      
      // Keep only last 5
      return {
        ...prev,
        [key]: updated.slice(0, 5)
      }
    })
  }

  // Smart navigation helper functions with context awareness
  const navigateToStudent = (id: number, tab = 'overview', highlight = '', sourceModule = '') => {
    // Update context
    setSelectedStudentId(id)
    setNavigationContext(prev => ({
      ...prev,
      sourceModule,
      targetModule: 'student-profile',
      previousUrl: window.location.pathname + window.location.search
    }))
    
    // Build URL with parameters
    const params = new URLSearchParams()
    if (tab !== 'overview') params.set('tab', tab)
    if (highlight) params.set('highlight', highlight)
    if (sourceModule) params.set('from', sourceModule)
    
    const url = `/people/students/${id}${params.toString() ? '?' + params.toString() : ''}`
    
    // Use Next.js router if available
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', url)
      window.location.href = url
    }
  }

  const navigateToTeacher = (id: number, tab = 'overview', sourceModule = '') => {
    setSelectedTeacherId(id)
    setNavigationContext(prev => ({
      ...prev,
      sourceModule,
      targetModule: 'teacher-profile',
      previousUrl: window.location.pathname + window.location.search
    }))
    
    const params = new URLSearchParams()
    if (tab !== 'overview') params.set('tab', tab)
    if (sourceModule) params.set('from', sourceModule)
    
    const url = `/people/teachers/${id}${params.toString() ? '?' + params.toString() : ''}`
    
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', url)
      window.location.href = url
    }
  }

  const navigateToClass = (id: number, tab = 'overview', sourceModule = '') => {
    setSelectedClassId(id)
    setNavigationContext(prev => ({
      ...prev,
      sourceModule,
      targetModule: 'class-profile',
      previousUrl: window.location.pathname + window.location.search
    }))
    
    const params = new URLSearchParams()
    if (tab !== 'overview') params.set('tab', tab)
    if (sourceModule) params.set('from', sourceModule)
    
    const url = `/academic/classes/${id}${params.toString() ? '?' + params.toString() : ''}`
    
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', url)
      window.location.href = url
    }
  }

  const navigateToFinancial = (studentId?: number, highlight = '', sourceModule = '') => {
    setNavigationContext(prev => ({
      ...prev,
      sourceModule,
      targetModule: 'financial',
      previousUrl: window.location.pathname + window.location.search
    }))
    
    const params = new URLSearchParams()
    if (studentId) {
      params.set('student', studentId.toString())
      setSelectedStudentId(studentId)
    }
    if (highlight) params.set('highlight', highlight)
    if (sourceModule) params.set('from', sourceModule)
    
    const url = `/financial${params.toString() ? '?' + params.toString() : ''}`
    
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', url)
      window.location.href = url
    }
  }

  const navigateToAttendance = (studentId?: number, highlight = '', sourceModule = '') => {
    setNavigationContext(prev => ({
      ...prev,
      sourceModule,
      targetModule: 'attendance',
      previousUrl: window.location.pathname + window.location.search
    }))
    
    const params = new URLSearchParams()
    if (studentId) {
      params.set('student', studentId.toString())
      setSelectedStudentId(studentId)
    }
    if (highlight) params.set('highlight', highlight)
    if (sourceModule) params.set('from', sourceModule)
    
    const url = `/academic/attendance${params.toString() ? '?' + params.toString() : ''}`
    
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', url)
      window.location.href = url
    }
  }

  const navigateToServices = (studentId?: number, sourceModule = '') => {
    setNavigationContext(prev => ({
      ...prev,
      sourceModule,
      targetModule: 'services',
      previousUrl: window.location.pathname + window.location.search
    }))
    
    const params = new URLSearchParams()
    if (studentId) {
      params.set('student', studentId.toString())
      setSelectedStudentId(studentId)
    }
    if (sourceModule) params.set('from', sourceModule)
    
    const url = `/services${params.toString() ? '?' + params.toString() : ''}`
    
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', url)
      window.location.href = url
    }
  }

  // Smart back navigation
  const goBack = () => {
    if (navigationContext.previousUrl) {
      if (typeof window !== 'undefined') {
        window.history.back()
      }
    }
  }

  const canGoBack = () => {
    return !!navigationContext.previousUrl
  }

  // Recent entities helpers
  const getRecentStudents = () => recentEntities.students
  const getRecentTeachers = () => recentEntities.teachers
  
  const clearRecentEntities = () => {
    setRecentEntities({
      students: [],
      teachers: [],
      classes: []
    })
  }

  const value: AppContextType = {
    selectedStudentId,
    selectedTeacherId,
    selectedClassId,
    activeFilters,
    navigationContext,
    recentEntities,
    sidebarCollapsed,
    showQuickAccess,
    setSelectedStudent: setSelectedStudentId,
    setSelectedTeacher: setSelectedTeacherId,
    setSelectedClass: setSelectedClassId,
    setActiveFilters,
    setNavigationContext,
    setSidebarCollapsed,
    setShowQuickAccess,
    addToRecentEntities,
    navigateToStudent,
    navigateToTeacher,
    navigateToClass,
    navigateToFinancial,
    navigateToAttendance,
    navigateToServices,
    goBack,
    canGoBack,
    getRecentStudents,
    getRecentTeachers,
    clearRecentEntities,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
