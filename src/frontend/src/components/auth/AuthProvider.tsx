'use client'

import React, { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

interface AuthProviderProps {
  children: React.ReactNode
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { initializeAuth } = useAuthStore()

  useEffect(() => {
    // Initialize auth from localStorage on app start
    initializeAuth()
  }, [initializeAuth])

  return <>{children}</>
}

export default AuthProvider
