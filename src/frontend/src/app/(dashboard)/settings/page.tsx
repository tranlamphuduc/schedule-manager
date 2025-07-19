'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { 
  User, 
  Palette, 
  Bell, 
  Calendar,
  MessageSquare,
  ChevronRight 
} from 'lucide-react'

const settingsItems = [
  {
    title: 'Hồ sơ cá nhân',
    description: 'Quản lý thông tin tài khoản và mật khẩu',
    icon: User,
    href: '/settings/profile',
  },
  {
    title: 'Giao diện',
    description: 'Tùy chỉnh theme và hiển thị',
    icon: Palette,
    href: '/settings/appearance',
  },
  {
    title: 'Thông báo',
    description: 'Cài đặt nhắc nhở và thông báo',
    icon: Bell,
    href: '/settings/notifications',
  },
  {
    title: 'Lịch',
    description: 'Cài đặt hiển thị lịch và thời gian làm việc',
    icon: Calendar,
    href: '/settings/calendar',
  },
  {
    title: 'Phản hồi',
    description: 'Gửi phản hồi và báo lỗi',
    icon: MessageSquare,
    href: '/settings/feedback',
  },
]

export default function SettingsPage() {
  return (
    <div style={{ padding: '2rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#1e293b',
          margin: 0,
          marginBottom: '0.5rem'
        }}>
          ⚙️ Cài đặt
        </h1>
        <p style={{
          color: '#64748b',
          margin: 0,
          fontSize: '1rem'
        }}>
          Quản lý tài khoản và tùy chỉnh ứng dụng
        </p>
      </div>

      {/* Settings Grid */}
      <div style={{
        display: 'grid',
        gap: '1.5rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'
      }}>
        {settingsItems.map((item) => {
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
                  e.currentTarget.style.borderColor = '#3b82f6'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                  e.currentTarget.style.borderColor = '#e2e8f0'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#dbeafe',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon style={{
                      width: '24px',
                      height: '24px',
                      color: '#3b82f6'
                    }} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#1e293b',
                      margin: 0,
                      marginBottom: '0.5rem'
                    }}>
                      {item.title}
                    </h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#64748b',
                      margin: 0,
                      lineHeight: 1.5
                    }}>
                      {item.description}
                    </p>
                  </div>

                  <ChevronRight style={{
                    width: '20px',
                    height: '20px',
                    color: '#94a3b8',
                    flexShrink: 0
                  }} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
