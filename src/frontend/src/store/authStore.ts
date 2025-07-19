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

          try {
            // Try API authentication first
            const response = await apiClient.login(email, password)

            // Save current user to localStorage for offline access
            localStorage.setItem('schedule-manager-current-user', JSON.stringify(response.user))

            set({
              user: {
                id: response.user.id,
                email: response.user.email,
                name: response.user.name,
                created_at: response.user.created_at
              },
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
            return
          } catch (apiError) {
            console.warn('API login failed, trying localStorage fallback:', apiError)

            // Fallback to localStorage authentication
            const users = JSON.parse(localStorage.getItem('schedule-manager-users') || '[]')
            const user = users.find((u: any) => u.email === email && u.password === password)

            if (!user) {
              throw new Error('Email hoặc mật khẩu không đúng')
            }

            localStorage.setItem('schedule-manager-current-user', JSON.stringify(user))

            set({
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                created_at: user.created_at
              },
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          }
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

          try {
            // Try API registration first
            const response = await apiClient.register(name, email, password)

            // Save current user to localStorage for offline access
            localStorage.setItem('schedule-manager-current-user', JSON.stringify(response.user))

            set({
              user: {
                id: response.user.id,
                email: response.user.email,
                name: response.user.name,
                created_at: response.user.created_at
              },
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
            return
          } catch (apiError) {
            console.warn('API register failed, trying localStorage fallback:', apiError)

            // Fallback to localStorage registration
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
              created_at: new Date().toISOString()
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
                created_at: newUser.created_at
              },
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Đăng ký thất bại',
            isLoading: false,
          })
          throw error
        }
      },

      logout: () => {
        // Clear API token
        apiClient.logout()

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
      initializeAuth: async () => {
        try {
          const currentUser = localStorage.getItem('schedule-manager-current-user')
          if (currentUser) {
            const user = JSON.parse(currentUser)
            set({
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                created_at: user.created_at
              },
              isAuthenticated: true,
            })
          }
        } catch (error) {
          console.error('Error initializing auth:', error)
          localStorage.removeItem('schedule-manager-current-user')
        }
      },

      // Refresh user data from API
      refreshUser: async () => {
        try {
          const { user } = get()
          if (user) {
            // TODO: Implement API call to refresh user data
            // const refreshedUser = await apiClient.getUser(user.id)
            // set({ user: refreshedUser })
          }
        } catch (error) {
          console.error('Error refreshing user:', error)
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
