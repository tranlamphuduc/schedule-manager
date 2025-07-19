import React from 'react'
import Logo from '@/components/layout/Logo'
import GuestGuard from '@/components/auth/GuestGuard'
import { cn } from '@/lib/utils'

interface AuthLayoutProps {
  children: React.ReactNode
  className?: string
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, className }) => {
  return (
    <GuestGuard>
      <div className={cn('min-h-screen flex flex-col', className)}>
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-center px-4">
            <Logo size="md" />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {children}
          </div>
        </main>


      </div>
    </GuestGuard>
  )
}

export default AuthLayout
