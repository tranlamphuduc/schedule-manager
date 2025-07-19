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

export const useAuthStoreAPI = create<AuthStore>()(
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

          const response = await apiClient.login(email, password)
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Đăng nhập thất bại'
          })
          throw error
        }
      },

      register: async (name: string, email: string, password: string) => {
        try {
          set({ isLoading: true, error: null })

          const response = await apiClient.register(name, email, password)

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Đăng ký thất bại'
          })
          throw error
        }
      },

      logout: () => {
        apiClient.logout()
        set({
          user: null,
          isAuthenticated: false,
          error: null
        })
      },

      setUser: (user: User | null) => {
        set({ 
          user, 
          isAuthenticated: !!user 
        })
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },

      initializeAuth: async () => {
        try {
          set({ isLoading: true })

          // Check if we have a token
          const token = localStorage.getItem('auth_token')
          if (!token) {
            set({ isLoading: false })
            return
          }

          // Try to get current user
          const response = await apiClient.getCurrentUser()
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

        } catch (error) {
          // Token might be expired or invalid
          apiClient.logout()
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        }
      },

      refreshUser: async () => {
        try {
          const response = await apiClient.getCurrentUser()
          set({ user: response.user })
        } catch (error) {
          console.error('Failed to refresh user:', error)
          // Don't throw error, just log it
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Initialize auth on app start
if (typeof window !== 'undefined') {
  useAuthStoreAPI.getState().initializeAuth()
}
