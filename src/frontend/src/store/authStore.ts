import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient, type User } from '@/lib/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  initializeAuth: () => Promise<void>
  refreshUser: () => Promise<void>
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null })

          // Simple localStorage-based authentication
          const users = JSON.parse(localStorage.getItem('schedule-manager-users') || '[]')
          const user = users.find((u: any) => u.email === email)

          if (!user) {
            throw new Error('Email không tồn tại')
          }

          if (user.password !== password) {
            throw new Error('Mật khẩu không đúng')
          }

          // Set current user
          localStorage.setItem('schedule-manager-current-user', JSON.stringify(user))

          set({
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              createdAt: user.createdAt
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Đăng nhập thất bại',
            isLoading: false,
          })
          throw error
        }
      },

      register: async (name: string, email: string, password: string) => {
        try {
          set({ isLoading: true, error: null })

          // Validate input
          if (!name.trim()) {
            throw new Error('Tên không được để trống')
          }
          if (!email.trim()) {
            throw new Error('Email không được để trống')
          }
          if (!email.includes('@')) {
            throw new Error('Email không hợp lệ')
          }
          if (password.length < 6) {
            throw new Error('Mật khẩu phải có ít nhất 6 ký tự')
          }

          // Simple localStorage-based registration
          const users = JSON.parse(localStorage.getItem('schedule-manager-users') || '[]')

          // Check if email already exists
          if (users.find((u: any) => u.email === email)) {
            throw new Error('Email đã được sử dụng')
          }

          // Create new user
          const newUser = {
            id: Date.now().toString(),
            email: email.trim(),
            name: name.trim(),
            password: password,
            createdAt: new Date().toISOString()
          }

          // Save to localStorage
          users.push(newUser)
          localStorage.setItem('schedule-manager-users', JSON.stringify(users))
          localStorage.setItem('schedule-manager-current-user', JSON.stringify(newUser))

          set({
            user: {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              createdAt: newUser.createdAt
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Đăng ký thất bại',
            isLoading: false,
          })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        })

        // Remove current user from localStorage
        localStorage.removeItem('schedule-manager-current-user')
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },

      // Initialize user from localStorage
      initializeAuth: () => {
        try {
          const currentUser = localStorage.getItem('schedule-manager-current-user')
          if (currentUser) {
            const user = JSON.parse(currentUser)
            set({
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt
              },
              isAuthenticated: true,
            })
          }
        } catch (error) {
          console.error('Error initializing auth:', error)
          localStorage.removeItem('schedule-manager-current-user')
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
