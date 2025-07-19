'use client'

import React from 'react'
import Link from 'next/link'
import { Settings, User, Menu, Plus } from 'lucide-react'
import { Button } from '@/components/ui'
import Logo from './Logo'
import NotificationBell from '@/components/notifications/NotificationBell'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

interface HeaderProps {
  className?: string
  onMenuClick?: () => void
  showMobileMenu?: boolean
}

const Header: React.FC<HeaderProps> = ({
  className,
  onMenuClick,
  showMobileMenu = false
}) => {
  const { user } = useAuthStore()

  return (
    <header className={cn(
      'sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      className
    )}>
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left side - Logo and mobile menu */}
        <div className="flex items-center gap-4">
          {showMobileMenu && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}
          <div className="lg:hidden">
            <Logo size="sm" />
          </div>
        </div>

        {/* Center - Quick Add (Desktop) */}
        <div className="hidden md:flex">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Thêm sự kiện
          </Button>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Add (Mobile) */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Plus className="h-5 w-5" />
            <span className="sr-only">Add event</span>
          </Button>

          {/* Notifications */}
          <NotificationBell />

          {/* Settings */}
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </Link>

          {/* User profile */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">User profile</span>
            </Button>
            {user && (
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
