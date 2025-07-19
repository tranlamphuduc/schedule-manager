'use client'

import React, { useState, useEffect } from 'react'
import { NotificationStorage, SystemNotification, EventNotification } from '@/lib/notificationStorage'
import { EventStorage } from '@/lib/eventStorage'

export default function NotificationsPage() {
  const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>([])
  const [eventNotifications, setEventNotifications] = useState<EventNotification[]>([])
  const [activeTab, setActiveTab] = useState<'events' | 'system'>('events')
  const [loading, setLoading] = useState(true)

  // Load notifications
  useEffect(() => {
    loadNotifications()

    // Generate event notifications from current events
    const events = EventStorage.loadEvents()
    NotificationStorage.generateEventNotifications(events)

    // Add welcome notification if this is first time
    const systemNotifs = NotificationStorage.loadSystemNotifications()
    if (systemNotifs.length === 0) {
      NotificationStorage.addSystemNotification({
        type: 'info',
        title: 'Chào mừng đến với Schedule Manager!',
        message: 'Hệ thống thông báo đã được kích hoạt. Bạn sẽ nhận được thông báo về các sự kiện sắp diễn ra.',
        isRead: false,
        persistent: true
      })
    }

    // Reload after generating
    setTimeout(() => {
      loadNotifications()
    }, 100)
  }, [])

  const loadNotifications = () => {
    setSystemNotifications(NotificationStorage.loadSystemNotifications())
    setEventNotifications(NotificationStorage.loadEventNotifications())
    setLoading(false)
  }

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      loadNotifications()
    }

    window.addEventListener('systemNotificationsUpdated', handleStorageChange)
    window.addEventListener('eventNotificationsUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('systemNotificationsUpdated', handleStorageChange)
      window.removeEventListener('eventNotificationsUpdated', handleStorageChange)
    }
  }, [])

  const handleMarkAsRead = (type: 'system' | 'event', notificationId: string) => {
    if (type === 'system') {
      NotificationStorage.markSystemNotificationAsRead(notificationId)
    } else {
      NotificationStorage.markEventNotificationAsRead(notificationId)
    }
    loadNotifications()
  }

  const handleDelete = (type: 'system' | 'event', notificationId: string) => {
    if (type === 'system') {
      NotificationStorage.deleteSystemNotification(notificationId)
    } else {
      NotificationStorage.deleteEventNotification(notificationId)
    }
    loadNotifications()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'upcoming': return '⏰'
      case 'starting': return '🚀'
      case 'ongoing': return '▶️'
      case 'reminder': return '🔔'
      case 'info': return 'ℹ️'
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return '📢'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'upcoming': return '#3b82f6'
      case 'starting': return '#f59e0b'
      case 'ongoing': return '#10b981'
      case 'reminder': return '#8b5cf6'
      case 'info': return '#6b7280'
      case 'success': return '#10b981'
      case 'warning': return '#f59e0b'
      case 'error': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Vừa xong'
    if (minutes < 60) return `${minutes} phút trước`
    if (hours < 24) return `${hours} giờ trước`
    return `${days} ngày trước`
  }

  const unreadCounts = NotificationStorage.getUnreadCount()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        color: '#64748b'
      }}>
        <div>Đang tải thông báo...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#1e293b',
          margin: 0,
          marginBottom: '0.5rem'
        }}>
          🔔 Thông báo
        </h1>
        <p style={{
          color: '#64748b',
          margin: 0,
          fontSize: '1rem'
        }}>
          Quản lý thông báo sự kiện và hệ thống
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => setActiveTab('events')}
          style={{
            padding: '1rem 1.5rem',
            border: 'none',
            backgroundColor: 'transparent',
            borderBottom: activeTab === 'events' ? '2px solid #3b82f6' : '2px solid transparent',
            color: activeTab === 'events' ? '#3b82f6' : '#64748b',
            fontWeight: activeTab === 'events' ? '600' : '500',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.2s'
          }}
        >
          📅 Sự kiện ({unreadCounts.events})
        </button>

        <button
          onClick={() => setActiveTab('system')}
          style={{
            padding: '1rem 1.5rem',
            border: 'none',
            backgroundColor: 'transparent',
            borderBottom: activeTab === 'system' ? '2px solid #3b82f6' : '2px solid transparent',
            color: activeTab === 'system' ? '#3b82f6' : '#64748b',
            fontWeight: activeTab === 'system' ? '600' : '500',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.2s'
          }}
        >
          ⚙️ Hệ thống ({unreadCounts.system})
        </button>
      </div>

      {/* Event Notifications */}
      {activeTab === 'events' && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>
              Thông báo sự kiện
            </h2>
            {eventNotifications.length > 0 && (
              <button
                onClick={() => {
                  const events = EventStorage.loadEvents()
                  NotificationStorage.generateEventNotifications(events)
                  loadNotifications()
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: '#64748b'
                }}
              >
                🔄 Làm mới
              </button>
            )}
          </div>

          {eventNotifications.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '500',
                color: '#64748b',
                margin: 0,
                marginBottom: '0.5rem'
              }}>
                Không có thông báo sự kiện
              </h3>
              <p style={{ color: '#94a3b8', margin: 0 }}>
                Thông báo sẽ xuất hiện khi có sự kiện sắp diễn ra
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {eventNotifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    backgroundColor: notification.isRead ? '#f8fafc' : 'white',
                    border: `1px solid ${notification.isRead ? '#e2e8f0' : '#3b82f6'}`,
                    borderRadius: '12px',
                    padding: '1.5rem',
                    position: 'relative',
                    transition: 'all 0.2s'
                  }}
                >
                  {!notification.isRead && (
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '50%'
                    }} />
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{
                      fontSize: '1.5rem',
                      color: getNotificationColor(notification.type)
                    }}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#1e293b',
                        margin: 0,
                        marginBottom: '0.5rem'
                      }}>
                        {notification.eventTitle}
                      </h4>

                      <p style={{
                        color: '#64748b',
                        margin: 0,
                        marginBottom: '0.75rem',
                        lineHeight: 1.5
                      }}>
                        {notification.message}
                      </p>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.875rem',
                        color: '#94a3b8'
                      }}>
                        <span>{formatTimeAgo(notification.createdAt)}</span>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead('event', notification.id)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#dbeafe',
                                border: '1px solid #bfdbfe',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                color: '#1e40af'
                              }}
                            >
                              Đánh dấu đã đọc
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete('event', notification.id)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: '#fef2f2',
                              border: '1px solid #fecaca',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              color: '#dc2626'
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* System Notifications */}
      {activeTab === 'system' && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>
              Thông báo hệ thống
            </h2>
            <button
              onClick={() => {
                // Add sample system notification for demo
                NotificationStorage.addSystemNotification({
                  type: 'info',
                  title: 'Chào mừng!',
                  message: 'Chào mừng bạn đến với Schedule Manager. Hãy bắt đầu tạo sự kiện đầu tiên của bạn!',
                  isRead: false
                })
                loadNotifications()
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: 'white'
              }}
            >
              + Thêm thông báo demo
            </button>
          </div>

          {systemNotifications.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '500',
                color: '#64748b',
                margin: 0,
                marginBottom: '0.5rem'
              }}>
                Không có thông báo hệ thống
              </h3>
              <p style={{ color: '#94a3b8', margin: 0 }}>
                Thông báo hệ thống sẽ xuất hiện ở đây
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {systemNotifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    backgroundColor: notification.isRead ? '#f8fafc' : 'white',
                    border: `1px solid ${notification.isRead ? '#e2e8f0' : getNotificationColor(notification.type)}`,
                    borderRadius: '12px',
                    padding: '1.5rem',
                    position: 'relative',
                    transition: 'all 0.2s'
                  }}
                >
                  {!notification.isRead && (
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      width: '8px',
                      height: '8px',
                      backgroundColor: getNotificationColor(notification.type),
                      borderRadius: '50%'
                    }} />
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{
                      fontSize: '1.5rem',
                      color: getNotificationColor(notification.type)
                    }}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#1e293b',
                        margin: 0,
                        marginBottom: '0.5rem'
                      }}>
                        {notification.title}
                      </h4>

                      <p style={{
                        color: '#64748b',
                        margin: 0,
                        marginBottom: '0.75rem',
                        lineHeight: 1.5
                      }}>
                        {notification.message}
                      </p>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.875rem',
                        color: '#94a3b8'
                      }}>
                        <span>{formatTimeAgo(notification.createdAt)}</span>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead('system', notification.id)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#dbeafe',
                                border: '1px solid #bfdbfe',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                color: '#1e40af'
                              }}
                            >
                              Đánh dấu đã đọc
                            </button>
                          )}

                          {!notification.persistent && (
                            <button
                              onClick={() => handleDelete('system', notification.id)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                color: '#dc2626'
                              }}
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
