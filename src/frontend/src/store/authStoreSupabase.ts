import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface User {
  id: string
  email: string
  name: string
  created_at: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  initializeAuth: () => Promise<void>
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

          // Sign in with Supabase Auth
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            throw error
          }

          if (data.user) {
            // Get user profile from database
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('id, name, email, created_at')
              .eq('id', data.user.id)
              .single()

            if (profileError) {
              console.error('Error fetching user profile:', profileError)
              // If profile doesn't exist, create one
              const { data: newProfile, error: createError } = await supabase
                .from('users')
                .insert({
                  id: data.user.id,
                  email: data.user.email!,
                  name: data.user.user_metadata?.name || data.user.email!.split('@')[0],
                })
                .select('id, name, email, created_at')
                .single()

              if (createError) {
                throw createError
              }

              set({
                user: newProfile,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              })
            } else {
              set({
                user: profile,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              })
            }
          }
        } catch (error: any) {
          set({
            error: error.message || 'Đăng nhập thất bại',
            isLoading: false,
          })
          throw error
        }
      },

      register: async (name: string, email: string, password: string) => {
        try {
          set({ isLoading: true, error: null })

          // Sign up with Supabase Auth
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: name,
              }
            }
          })

          if (error) {
            throw error
          }

          if (data.user) {
            // Create user profile in database
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email: email,
                name: name,
              })
              .select('id, name, email, created_at')
              .single()

            if (profileError) {
              throw profileError
            }

            set({
              user: profile,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          }
        } catch (error: any) {
          set({
            error: error.message || 'Đăng ký thất bại',
            isLoading: false,
          })
          throw error
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut()
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          })
        } catch (error: any) {
          console.error('Logout error:', error)
          // Force logout even if there's an error
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          })
        }
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

          // Get current session
          const { data: { session }, error } = await supabase.auth.getSession()

          if (error) {
            throw error
          }

          if (session?.user) {
            // Get user profile from database
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('id, name, email, created_at')
              .eq('id', session.user.id)
              .single()

            if (profileError) {
              console.error('Error fetching user profile:', profileError)
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
              })
            } else {
              set({
                user: profile,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              })
            }
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            })
          }
        } catch (error: any) {
          console.error('Initialize auth error:', error)
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
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

// Listen to auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  const { initializeAuth } = useAuthStore.getState()
  
  if (event === 'SIGNED_IN' && session) {
    initializeAuth()
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      error: null,
    })
  }
})
