import { create } from 'zustand'

// Core data interfaces
export interface Student {
  id: number
  studentId: string
  firstName: string
  lastName: string
  fatherName: string
  nationalId: string
  birthDate: string
  grade: number
  section: string
  classId: number
  phone?: string
  email?: string
  address?: string
  enrollmentDate: string
  isActive: boolean
  class: {
    id: number
    grade: number
    section: string
    teacher: {
      firstName: string
      lastName: string
    }
  }
  attendances?: any[]
  payments?: any[]
}

export interface Teacher {
  id: number
  employeeId: string
  firstName: string
  lastName: string
  nationalId: string
  phone: string
  email?: string
  hireDate: string
  isActive: boolean
  classes: Class[]
}

export interface Class {
  id: number
  grade: number
  section: string
  teacherId: number
  capacity: number
  isActive: boolean
  teacher: {
    firstName: string
    lastName: string
    employeeId: string
  }
  _count: {
    students: number
    attendances?: number
  }
  students?: Student[]
}

export interface Payment {
  id: number
  studentId: number
  amount: number
  dueDate: string
  paidDate?: string
  status: string
  type: string
  description?: string
  createdAt: string
  student: {
    firstName: string
    lastName: string
    studentId: string
  }
}

export interface MealService {
  id: number
  date: string
  mealType: string
  menuItems: string
  price: number
  totalOrders: number
  maxOrders: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface TransportService {
  id: number
  routeName: string
  driverName: string
  vehicleNumber: string
  capacity: number
  pickupTime: string
  dropoffTime: string
  pickupPoints: string
  monthlyFee: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    assignments: number
  }
}

export interface Attendance {
  id: number
  studentId: number
  classId: number
  date: string
  status: string
  notes?: string
  createdAt: string
  student: {
    firstName: string
    lastName: string
    studentId: string
  }
  class: {
    grade: number
    section: string
  }
}

interface DataState {
  // Data
  students: Student[]
  teachers: Teacher[]
  classes: Class[]
  payments: Payment[]
  attendances: Attendance[]
  mealServices: MealService[]
  transportServices: TransportService[]

  // Loading states
  studentsLoading: boolean
  teachersLoading: boolean
  classesLoading: boolean
  paymentsLoading: boolean
  attendancesLoading: boolean
  mealServicesLoading: boolean
  transportServicesLoading: boolean

  // Actions
  setStudents: (students: Student[]) => void
  setTeachers: (teachers: Teacher[]) => void
  setClasses: (classes: Class[]) => void
  setPayments: (payments: Payment[]) => void
  setAttendances: (attendances: Attendance[]) => void
  setMealServices: (mealServices: MealService[]) => void
  setTransportServices: (transportServices: TransportService[]) => void

  // CRUD operations
  addStudent: (student: Student) => void
  updateStudent: (id: number, updates: Partial<Student>) => void
  deleteStudent: (id: number) => void

  addTeacher: (teacher: Teacher) => void
  updateTeacher: (id: number, updates: Partial<Teacher>) => void
  deleteTeacher: (id: number) => void

  addClass: (classData: Class) => void
  updateClass: (id: number, updates: Partial<Class>) => void
  deleteClass: (id: number) => void

  addPayment: (payment: Payment) => void
  updatePayment: (id: number, updates: Partial<Payment>) => void
  deletePayment: (id: number) => void

  addAttendance: (attendance: Attendance) => void
  updateAttendance: (id: number, updates: Partial<Attendance>) => void
  deleteAttendance: (id: number) => void

  addMealService: (mealService: MealService) => void
  updateMealService: (id: number, updates: Partial<MealService>) => void
  deleteMealService: (id: number) => void

  addTransportService: (transportService: TransportService) => void
  updateTransportService: (id: number, updates: Partial<TransportService>) => void
  deleteTransportService: (id: number) => void

  // Fetch operations
  fetchStudents: (params?: any) => Promise<void>
  fetchTeachers: () => Promise<void>
  fetchClasses: () => Promise<void>
  fetchPayments: () => Promise<void>
  fetchAttendances: (params?: any) => Promise<void>
  fetchMealServices: () => Promise<void>
  fetchTransportServices: () => Promise<void>

  // Utility methods
  getStudentsByClass: (classId: number) => Student[]
  getClassesByTeacher: (teacherId: number) => Class[]
  getOverduePayments: () => Payment[]
  getRecentAttendances: (days?: number) => Attendance[]

  // Refresh all data
  refreshAll: () => Promise<void>
}

export const useDataStore = create<DataState>((set, get) => ({
  // Initial state
  students: [],
  teachers: [],
  classes: [],
  payments: [],
  attendances: [],
  mealServices: [],
  transportServices: [],

  studentsLoading: false,
  teachersLoading: false,
  classesLoading: false,
  paymentsLoading: false,
  attendancesLoading: false,
  mealServicesLoading: false,
  transportServicesLoading: false,

  // Setters
  setStudents: (students) => set({ students }),
  setTeachers: (teachers) => set({ teachers }),
  setClasses: (classes) => set({ classes }),
  setPayments: (payments) => set({ payments }),
  setAttendances: (attendances) => set({ attendances }),
  setMealServices: (mealServices) => set({ mealServices }),
  setTransportServices: (transportServices) => set({ transportServices }),

  // CRUD operations
  addStudent: (student) => set((state) => ({
    students: [...state.students, student]
  })),

  updateStudent: (id, updates) => set((state) => ({
    students: state.students.map(student =>
      student.id === id ? { ...student, ...updates } : student
    )
  })),

  deleteStudent: (id) => set((state) => ({
    students: state.students.filter(student => student.id !== id)
  })),

  addTeacher: (teacher) => set((state) => ({
    teachers: [...state.teachers, teacher]
  })),

  updateTeacher: (id, updates) => set((state) => ({
    teachers: state.teachers.map(teacher =>
      teacher.id === id ? { ...teacher, ...updates } : teacher
    )
  })),

  deleteTeacher: (id) => set((state) => ({
    teachers: state.teachers.filter(teacher => teacher.id !== id)
  })),

  addClass: (classData) => set((state) => ({
    classes: [...state.classes, classData]
  })),

  updateClass: (id, updates) => set((state) => ({
    classes: state.classes.map(cls =>
      cls.id === id ? { ...cls, ...updates } : cls
    )
  })),

  deleteClass: (id) => set((state) => ({
    classes: state.classes.filter(cls => cls.id !== id)
  })),

  addPayment: (payment) => set((state) => ({
    payments: [...state.payments, payment]
  })),

  updatePayment: (id, updates) => set((state) => ({
    payments: state.payments.map(payment =>
      payment.id === id ? { ...payment, ...updates } : payment
    )
  })),

  deletePayment: (id) => set((state) => ({
    payments: state.payments.filter(payment => payment.id !== id)
  })),

  addAttendance: (attendance) => set((state) => ({
    attendances: [...state.attendances, attendance]
  })),

  updateAttendance: (id, updates) => set((state) => ({
    attendances: state.attendances.map(attendance =>
      attendance.id === id ? { ...attendance, ...updates } : attendance
    )
  })),

  deleteAttendance: (id) => set((state) => ({
    attendances: state.attendances.filter(attendance => attendance.id !== id)
  })),

  addMealService: (mealService) => set((state) => ({
    mealServices: [...state.mealServices, mealService]
  })),

  updateMealService: (id, updates) => set((state) => ({
    mealServices: state.mealServices.map(service =>
      service.id === id ? { ...service, ...updates } : service
    )
  })),

  deleteMealService: (id) => set((state) => ({
    mealServices: state.mealServices.filter(service => service.id !== id)
  })),

  addTransportService: (transportService) => set((state) => ({
    transportServices: [...state.transportServices, transportService]
  })),

  updateTransportService: (id, updates) => set((state) => ({
    transportServices: state.transportServices.map(service =>
      service.id === id ? { ...service, ...updates } : service
    )
  })),

  deleteTransportService: (id) => set((state) => ({
    transportServices: state.transportServices.filter(service => service.id !== id)
  })),

  // Fetch operations
  fetchStudents: async (params = {}) => {
    set({ studentsLoading: true })
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await fetch(`/api/students${queryString ? '?' + queryString : ''}`)
      const result = await response.json()
      
      if (result.success) {
        set({ students: result.data || [] })
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      set({ studentsLoading: false })
    }
  },

  fetchTeachers: async () => {
    set({ teachersLoading: true })
    try {
      const response = await fetch('/api/teachers')
      const result = await response.json()
      
      if (result.success) {
        set({ teachers: result.data || [] })
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
    } finally {
      set({ teachersLoading: false })
    }
  },

  fetchClasses: async () => {
    set({ classesLoading: true })
    try {
      const response = await fetch('/api/classes')
      const result = await response.json()
      
      if (result.success) {
        set({ classes: result.data?.classes || [] })
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      set({ classesLoading: false })
    }
  },

  fetchPayments: async () => {
    set({ paymentsLoading: true })
    try {
      const response = await fetch('/api/financial/payments')
      const result = await response.json()
      
      if (result.success) {
        set({ payments: result.data || [] })
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      set({ paymentsLoading: false })
    }
  },

  fetchAttendances: async (params = {}) => {
    set({ attendancesLoading: true })
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await fetch(`/api/attendance${queryString ? '?' + queryString : ''}`)
      const result = await response.json()
      
      if (result.success) {
        set({ attendances: result.data || [] })
      }
    } catch (error) {
      console.error('Error fetching attendances:', error)
    } finally {
      set({ attendancesLoading: false })
    }
  },

  fetchMealServices: async () => {
    set({ mealServicesLoading: true })
    try {
      const response = await fetch('/api/meals')
      const result = await response.json()
      
      if (result.success) {
        set({ mealServices: result.data || [] })
      }
    } catch (error) {
      console.error('Error fetching meal services:', error)
    } finally {
      set({ mealServicesLoading: false })
    }
  },

  fetchTransportServices: async () => {
    set({ transportServicesLoading: true })
    try {
      const response = await fetch('/api/transport')
      const result = await response.json()
      
      if (result.success) {
        set({ transportServices: result.data || [] })
      }
    } catch (error) {
      console.error('Error fetching transport services:', error)
    } finally {
      set({ transportServicesLoading: false })
    }
  },

  // Utility methods
  getStudentsByClass: (classId) => {
    const { students } = get()
    return students.filter(student => student.classId === classId)
  },

  getClassesByTeacher: (teacherId) => {
    const { classes } = get()
    return classes.filter(cls => cls.teacherId === teacherId)
  },

  getOverduePayments: () => {
    const { payments } = get()
    const now = new Date()
    return payments.filter(payment => 
      payment.status === 'PENDING' && new Date(payment.dueDate) < now
    )
  },

  getRecentAttendances: (days = 7) => {
    const { attendances } = get()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return attendances.filter(attendance => 
      new Date(attendance.date) >= cutoffDate
    )
  },

  refreshAll: async () => {
    const { 
      fetchStudents, 
      fetchTeachers, 
      fetchClasses, 
      fetchPayments, 
      fetchAttendances,
      fetchMealServices,
      fetchTransportServices
    } = get()
    
    await Promise.all([
      fetchStudents(),
      fetchTeachers(),
      fetchClasses(),
      fetchPayments(),
      fetchAttendances(),
      fetchMealServices(),
      fetchTransportServices()
    ])
  }
}))

// Hook for reactive data updates
export const useReactiveData = () => {
  const dataStore = useDataStore()
  
  // Auto-refresh data when needed
  const refreshData = async (entities: string[] = []) => {
    if (entities.includes('students') || entities.length === 0) {
      await dataStore.fetchStudents()
    }
    if (entities.includes('teachers') || entities.length === 0) {
      await dataStore.fetchTeachers()
    }
    if (entities.includes('classes') || entities.length === 0) {
      await dataStore.fetchClasses()
    }
    if (entities.includes('payments') || entities.length === 0) {
      await dataStore.fetchPayments()
    }
    if (entities.includes('attendances') || entities.length === 0) {
      await dataStore.fetchAttendances()
    }
    if (entities.includes('meals') || entities.length === 0) {
      await dataStore.fetchMealServices()
    }
    if (entities.includes('transport') || entities.length === 0) {
      await dataStore.fetchTransportServices()
    }
  }

  return {
    ...dataStore,
    refreshData
  }
}
