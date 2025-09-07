import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: number
  username: string
  role: 'ADMIN' | 'VICE_PRINCIPAL' | 'TEACHER' | 'FINANCE'
  firstName?: string
  lastName?: string
  email?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  login: (credentials: { username: string; password: string }) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  hasPermission: (action: string, resource: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),

      setLoading: (loading) => set({ isLoading: loading }),

      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          })

          const result = await response.json()

          if (result.success) {
            set({ 
              user: result.data.user,
              isAuthenticated: true,
              isLoading: false
            })
            return true
          } else {
            set({ isLoading: false })
            return false
          }
        } catch (error) {
          console.error('Login error:', error)
          set({ isLoading: false })
          return false
        }
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' })
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({ 
            user: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
      },

      checkAuth: async () => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/auth/me')
          const result = await response.json()

          if (result.success) {
            set({ 
              user: result.data.user,
              isAuthenticated: true,
              isLoading: false
            })
          } else {
            set({ 
              user: null,
              isAuthenticated: false,
              isLoading: false
            })
          }
        } catch (error) {
          console.error('Auth check error:', error)
          set({ 
            user: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
      },

      hasPermission: (action: string, resource: string) => {
        const { user } = get()
        if (!user) return false

        // Admin has all permissions
        if (user.role === 'ADMIN') return true

        // Define role-based permissions
        const permissions: Record<string, Record<string, string[]>> = {
          VICE_PRINCIPAL: {
            VIEW: ['STUDENT', 'TEACHER', 'CLASS', 'ATTENDANCE'],
            CREATE: ['STUDENT', 'TEACHER', 'CLASS'],
            UPDATE: ['STUDENT', 'TEACHER', 'CLASS', 'ATTENDANCE'],
            DELETE: ['STUDENT', 'TEACHER', 'CLASS']
          },
          TEACHER: {
            VIEW: ['STUDENT', 'CLASS', 'ATTENDANCE'],
            UPDATE: ['ATTENDANCE']
          },
          FINANCE: {
            VIEW: ['STUDENT', 'PAYMENT'],
            CREATE: ['PAYMENT'],
            UPDATE: ['PAYMENT'],
            DELETE: ['PAYMENT']
          }
        }

        const userPermissions = permissions[user.role]
        if (!userPermissions) return false

        const allowedResources = userPermissions[action]
        return allowedResources?.includes(resource) || false
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)
