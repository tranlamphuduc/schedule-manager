'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui'
import { User, Mail, Lock, Camera } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { profileUpdateSchema, passwordChangeSchema } from '@/lib/validations'
import type { ProfileUpdateFormData, PasswordChangeFormData } from '@/lib/validations'
import PasswordToggle from '@/components/auth/PasswordToggle'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Profile form
  const profileForm = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    }
  })

  // Password form
  const passwordForm = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  })

  const handleProfileUpdate = async (data: ProfileUpdateFormData) => {
    try {
      setIsUpdatingProfile(true)
      
      // TODO: Call API to update profile
      console.log('Updating profile:', data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // TODO: Update user in store
      
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handlePasswordChange = async (data: PasswordChangeFormData) => {
    try {
      setIsChangingPassword(true)
      
      // TODO: Call API to change password
      console.log('Changing password')
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Reset form on success
      passwordForm.reset()
      
    } catch (error) {
      console.error('Error changing password:', error)
    } finally {
      setIsChangingPassword(false)
    }
  }

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
          👤 Hồ sơ cá nhân
        </h1>
        <p style={{
          color: '#64748b',
          margin: 0,
          fontSize: '1rem'
        }}>
          Quản lý thông tin tài khoản và bảo mật
        </p>
      </div>

      <div style={{
        display: 'grid',
        gap: '2rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
      }}>
        {/* Profile Information */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <User style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>
              Thông tin cá nhân
            </h2>
          </div>
          {/* Avatar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User style={{ width: '32px', height: '32px', color: '#3b82f6' }} />
              </div>
              <button
                style={{
                  position: 'absolute',
                  bottom: '-8px',
                  right: '-8px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Camera style={{ width: '16px', height: '16px', color: '#64748b' }} />
              </button>
            </div>
            <div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '500',
                color: '#1e293b',
                margin: 0,
                marginBottom: '0.25rem'
              }}>
                {user?.name}
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#64748b',
                margin: 0
              }}>
                {user?.email}
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151'
              }}>
                Họ và tên
              </label>
              <input
                id="name"
                placeholder="Nhập họ và tên"
                disabled={isUpdatingProfile}
                {...profileForm.register('name')}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: profileForm.formState.errors.name ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: isUpdatingProfile ? '#f9fafb' : 'white',
                  outline: 'none'
                }}
              />
              {profileForm.formState.errors.name && (
                <p style={{
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  marginTop: '0.25rem'
                }}>
                  {profileForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151'
              }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Nhập email"
                disabled={isUpdatingProfile}
                {...profileForm.register('email')}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: profileForm.formState.errors.email ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: isUpdatingProfile ? '#f9fafb' : 'white',
                  outline: 'none'
                }}
              />
              {profileForm.formState.errors.email && (
                <p style={{
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  marginTop: '0.25rem'
                }}>
                  {profileForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              style={{
                width: '100%',
                padding: '0.875rem',
                backgroundColor: isUpdatingProfile ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: isUpdatingProfile ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {isUpdatingProfile ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <Lock style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>
              Đổi mật khẩu
            </h2>
          </div>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151'
              }}>
                Mật khẩu hiện tại
              </label>
              <PasswordToggle
                id="currentPassword"
                value={passwordForm.watch('currentPassword')}
                onChange={(value) => passwordForm.setValue('currentPassword', value)}
                placeholder="Nhập mật khẩu hiện tại"
                disabled={isChangingPassword}
                className={passwordForm.formState.errors.currentPassword ? 'border-red-500' : ''}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p style={{
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  marginTop: '0.25rem'
                }}>
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151'
              }}>
                Mật khẩu mới
              </label>
              <PasswordToggle
                id="newPassword"
                value={passwordForm.watch('newPassword')}
                onChange={(value) => passwordForm.setValue('newPassword', value)}
                placeholder="Nhập mật khẩu mới"
                disabled={isChangingPassword}
                className={passwordForm.formState.errors.newPassword ? 'border-red-500' : ''}
              />
              {passwordForm.formState.errors.newPassword && (
                <p style={{
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  marginTop: '0.25rem'
                }}>
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151'
              }}>
                Xác nhận mật khẩu mới
              </label>
              <PasswordToggle
                id="confirmNewPassword"
                value={passwordForm.watch('confirmNewPassword')}
                onChange={(value) => passwordForm.setValue('confirmNewPassword', value)}
                placeholder="Nhập lại mật khẩu mới"
                disabled={isChangingPassword}
                className={passwordForm.formState.errors.confirmNewPassword ? 'border-red-500' : ''}
              />
              {passwordForm.formState.errors.confirmNewPassword && (
                <p style={{
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  marginTop: '0.25rem'
                }}>
                  {passwordForm.formState.errors.confirmNewPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              style={{
                width: '100%',
                padding: '0.875rem',
                backgroundColor: isChangingPassword ? '#9ca3af' : '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: isChangingPassword ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {isChangingPassword ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>
      </div>

      {/* Account Stats */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginTop: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#1e293b',
          margin: 0,
          marginBottom: '1.5rem'
        }}>
          📊 Thống kê tài khoản
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#3b82f6',
              marginBottom: '0.25rem'
            }}>
              0
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#64748b'
            }}>
              Sự kiện
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#10b981',
              marginBottom: '0.25rem'
            }}>
              0
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#64748b'
            }}>
              Danh mục
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#f59e0b',
              marginBottom: '0.25rem'
            }}>
              0
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#64748b'
            }}>
              Hoàn thành
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#8b5cf6',
              marginBottom: '0.25rem'
            }}>
              {user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#64748b'
            }}>
              Ngày sử dụng
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
