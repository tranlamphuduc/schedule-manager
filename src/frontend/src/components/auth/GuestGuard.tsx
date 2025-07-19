'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Loader2 } from 'lucide-react'

interface GuestGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function GuestGuard({ children, fallback }: GuestGuardProps) {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore()
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeAuth()
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setIsInitialized(true)
      }
    }

    initialize()
  }, [initializeAuth])

  useEffect(() => {
    if (isInitialized && !isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isInitialized, isLoading, isAuthenticated, router])

  // Show loading while initializing auth
  if (!isInitialized || isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Đang kiểm tra đăng nhập...</p>
          </div>
        </div>
      )
    )
  }

  // Show nothing while redirecting to dashboard
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Đang chuyển hướng...</p>
        </div>
      </div>
    )
  }

  // User is not authenticated, show auth content
  return <>{children}</>
}
