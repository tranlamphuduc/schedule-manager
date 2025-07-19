'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import RegisterForm from '@/components/auth/RegisterForm'
import { useAuthStore } from '@/store/authStore'
import { type RegisterFormData } from '@/lib/validations'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading, error } = useAuthStore()

  const handleRegister = async (data: RegisterFormData) => {
    try {
      await register(data.name, data.email, data.password)
      router.push('/dashboard')
    } catch (error) {
      console.error('Registration failed:', error)
      // Error is handled in the store
    }
  }

  const handleSwitchToLogin = () => {
    router.push('/login')
  }

  return (
    <RegisterForm
      onSubmit={handleRegister}
      onSwitchToLogin={handleSwitchToLogin}
      loading={isLoading}
      error={error}
    />
  )
}
