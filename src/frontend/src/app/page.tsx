'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    const initialize = async () => {
      await initializeAuth()
    }
    initialize()
  }, [initializeAuth])

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Đang kiểm tra đăng nhập...</p>
      </div>
    </div>
  )
}
