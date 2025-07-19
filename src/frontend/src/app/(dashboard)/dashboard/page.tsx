'use client'

import React, { useState, useEffect } from 'react'
import { EventStorage, type Event, useEventStorageListener } from '@/lib/eventStorage'
import { CategoryStorage, type Category, useCategoryStorageListener } from '@/lib/categoryStorage'
import { NotificationStorage } from '@/lib/notificationStorage'

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Load events and categories on component mount
  useEffect(() => {
    const loadedEvents = EventStorage.loadEvents()
    const loadedCategories = CategoryStorage.loadCategories()
    setEvents(loadedEvents)
    setCategories(loadedCategories)

    // Generate notifications for current events
    NotificationStorage.generateEventNotifications(loadedEvents)

    console.log('Dashboard - Loaded events:', loadedEvents)
    console.log('Dashboard - Loaded categories:', loadedCategories)
  }, [])

  // Listen for storage changes
  useEventStorageListener((updatedEvents) => {
    setEvents(updatedEvents)
    // Regenerate notifications when events change
    NotificationStorage.generateEventNotifications(updatedEvents)
    console.log('Dashboard - Events updated from storage:', updatedEvents)
  })

  useCategoryStorageListener((updatedCategories) => {
    setCategories(updatedCategories)
    console.log('Dashboard - Categories updated from storage:', updatedCategories)
  })

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Helper functions to calculate real statistics
  const getTodayEvents = () => {
    const today = new Date()
    return events.filter(event => {
      // Check if event occurs today (including repeated events)
      if (event.repeat && event.repeat.dates) {
        return event.repeat.dates.some(repeatDate => {
          const rDate = new Date(repeatDate)
          return rDate.toDateString() === today.toDateString()
        })
      } else {
        const eventDate = new Date(event.startDate)
        return eventDate.toDateString() === today.toDateString()
      }
    })
  }

  const getThisWeekEvents = () => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // End of week (Saturday)

    return events.filter(event => {
      // Check if event occurs this week (including repeated events)
      if (event.repeat && event.repeat.dates) {
        return event.repeat.dates.some(repeatDate => {
          const rDate = new Date(repeatDate)
          return rDate >= startOfWeek && rDate <= endOfWeek
        })
      } else {
        const eventDate = new Date(event.startDate)
        return eventDate >= startOfWeek && eventDate <= endOfWeek
      }
    })
  }

  const getCompletedEvents = () => {
    const now = new Date()
    return events.filter(event => {
      const eventEnd = new Date(event.endDate)
      return eventEnd < now
    })
  }

  const getUpcomingEvents = () => {
    const now = new Date()
    return events.filter(event => {
      const eventStart = new Date(event.startDate)
      return eventStart > now
    })
  }

  // Helper functions for comparison statistics
  const getYesterdayEvents = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return events.filter(event => {
      const eventDate = new Date(event.startDate)
      return eventDate.toDateString() === yesterday.toDateString()
    })
  }

  const getLastWeekEvents = () => {
    const today = new Date()
    const startOfLastWeek = new Date(today)
    startOfLastWeek.setDate(today.getDate() - today.getDay() - 7) // Start of last week
    const endOfLastWeek = new Date(startOfLastWeek)
    endOfLastWeek.setDate(startOfLastWeek.getDate() + 6) // End of last week

    return events.filter(event => {
      const eventDate = new Date(event.startDate)
      return eventDate >= startOfLastWeek && eventDate <= endOfLastWeek
    })
  }

  const getLastMonthCompletedEvents = () => {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    return events.filter(event => {
      const eventEnd = new Date(event.endDate)
      const eventStart = new Date(event.startDate)
      return eventEnd < now &&
             eventStart >= lastMonth &&
             eventStart <= endOfLastMonth
    })
  }

  const getUpcomingEventsLastWeek = () => {
    // Get upcoming events as of last week (7 days ago)
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)

    return events.filter(event => {
      const eventStart = new Date(event.startDate)
      return eventStart > lastWeek
    })
  }

  // Get current statistics
  const todayEvents = getTodayEvents()
  const thisWeekEvents = getThisWeekEvents()
  const completedEvents = getCompletedEvents()
  const upcomingEvents = getUpcomingEvents()

  // Get comparison statistics
  const yesterdayEvents = getYesterdayEvents()
  const lastWeekEvents = getLastWeekEvents()
  const lastMonthCompletedEvents = getLastMonthCompletedEvents()
  const upcomingEventsLastWeek = getUpcomingEventsLastWeek()

  // Calculate differences
  const todayVsYesterday = todayEvents.length - yesterdayEvents.length
  const thisWeekVsLastWeek = thisWeekEvents.length - lastWeekEvents.length
  const completedVsLastMonth = completedEvents.length - lastMonthCompletedEvents.length
  const upcomingVsLastWeek = upcomingEvents.length - upcomingEventsLastWeek.length

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f1f5f9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      padding: '2rem'
    }}>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto'
      }}>
        
        {/* Welcome Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.875rem', 
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '0.5rem'
          }}>
            Chào mừng trở lại! 👋
          </h2>
          <p style={{ 
            color: '#64748b',
            fontSize: '1.125rem'
          }}>
            Đây là tổng quan về lịch trình của bạn - {formatDate(currentTime)}
          </p>
          <p style={{ 
            color: '#3b82f6',
            fontSize: '1.25rem',
            fontWeight: '600',
            marginTop: '0.5rem'
          }}>
            🕒 {formatTime(currentTime)}
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {/* Today's Events */}
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
            }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ 
                  color: '#64748b', 
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  SỰ KIỆN HÔM NAY
                </p>
                <p style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#1e293b',
                  margin: 0,
                  lineHeight: 1
                }}>
                  {todayEvents.length}
                </p>
                <p style={{
                  color: todayVsYesterday >= 0 ? '#10b981' : '#ef4444',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginTop: '0.5rem'
                }}>
                  {todayVsYesterday >= 0 ? '↗️' : '↘️'} {todayVsYesterday >= 0 ? '+' : ''}{todayVsYesterday} so với hôm qua
                </p>
              </div>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#dbeafe',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                📅
              </div>
            </div>
          </div>

          {/* This Week */}
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: 'linear-gradient(90deg, #10b981, #059669)'
            }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ 
                  color: '#64748b', 
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  TUẦN NÀY
                </p>
                <p style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#1e293b',
                  margin: 0,
                  lineHeight: 1
                }}>
                  {thisWeekEvents.length}
                </p>
                <p style={{
                  color: thisWeekVsLastWeek >= 0 ? '#10b981' : '#ef4444',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginTop: '0.5rem'
                }}>
                  {thisWeekVsLastWeek >= 0 ? '↗️' : '↘️'} {thisWeekVsLastWeek >= 0 ? '+' : ''}{thisWeekVsLastWeek} so với tuần trước
                </p>
              </div>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#dcfce7',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                📊
              </div>
            </div>
          </div>

          {/* Completed */}
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: 'linear-gradient(90deg, #f59e0b, #d97706)'
            }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ 
                  color: '#64748b', 
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  ĐÃ HOÀN THÀNH
                </p>
                <p style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#1e293b',
                  margin: 0,
                  lineHeight: 1
                }}>
                  {completedEvents.length}
                </p>
                <p style={{
                  color: '#f59e0b',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginTop: '0.5rem'
                }}>
                  📈 {events.length > 0 ? Math.round((completedEvents.length / events.length) * 100) : 0}% tỷ lệ hoàn thành
                </p>
                <p style={{
                  color: completedVsLastMonth >= 0 ? '#10b981' : '#ef4444',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginTop: '0.25rem'
                }}>
                  {completedVsLastMonth >= 0 ? '↗️' : '↘️'} {completedVsLastMonth >= 0 ? '+' : ''}{completedVsLastMonth} so với tháng trước
                </p>
              </div>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#fef3c7',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                ✅
              </div>
            </div>
          </div>

          {/* Upcoming */}
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)'
            }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ 
                  color: '#64748b', 
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  SẮP TỚI
                </p>
                <p style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#1e293b',
                  margin: 0,
                  lineHeight: 1
                }}>
                  {upcomingEvents.length}
                </p>
                <p style={{
                  color: upcomingVsLastWeek >= 0 ? '#10b981' : '#ef4444',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginTop: '0.5rem'
                }}>
                  {upcomingVsLastWeek >= 0 ? '↗️' : '↘️'} {upcomingVsLastWeek >= 0 ? '+' : ''}{upcomingVsLastWeek} so với tuần trước
                </p>
              </div>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#ede9fe',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                🔔
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ⚡ Thao tác nhanh
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {[
              {
                icon: '➕',
                title: 'Thêm sự kiện mới',
                desc: 'Tạo sự kiện trong lịch',
                color: '#3b82f6',
                action: () => window.location.href = '/calendar'
              },
              {
                icon: '📅',
                title: 'Xem lịch',
                desc: 'Xem lịch tháng/tuần/ngày',
                color: '#10b981',
                action: () => window.location.href = '/calendar'
              },
              {
                icon: '📋',
                title: 'Quản lý sự kiện',
                desc: 'Xem/sửa/xóa sự kiện đã tạo',
                color: '#f59e0b',
                action: () => window.location.href = '/events'
              },
              {
                icon: '🏷️',
                title: 'Quản lý danh mục',
                desc: 'Thêm/sửa danh mục sự kiện',
                color: '#8b5cf6',
                action: () => window.location.href = '/categories'
              },
              {
                icon: '⚙️',
                title: 'Cài đặt',
                desc: 'Tùy chỉnh ứng dụng',
                color: '#64748b',
                action: () => window.location.href = '/settings'
              }
            ].map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                style={{
                  padding: '1.5rem',
                  backgroundColor: 'white',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = action.color
                  e.currentTarget.style.backgroundColor = '#f8fafc'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.backgroundColor = 'white'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: action.color + '20',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  {action.icon}
                </div>

                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '0.25rem'
                  }}>
                    {action.title}
                  </h4>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                    margin: 0,
                    lineHeight: 1.4
                  }}>
                    {action.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Events Preview */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          padding: '2rem'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📋 Sự kiện hôm nay
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {todayEvents.length > 0 ? (
              todayEvents
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .map((event, index) => {
                  const category = categories.find(cat => cat.id === event.categoryId)
                  const startTime = event.allDay ? 'Cả ngày' : new Date(event.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

                  return (
                    <div key={event.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f1f5f9'
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                    onClick={() => window.location.href = '/calendar'}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: category?.color || '#3b82f6',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem'
                      }}>
                        {event.allDay ? '📅' : '🕒'}
                      </div>

                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontWeight: '500',
                          color: '#1e293b',
                          margin: 0,
                          marginBottom: '0.25rem'
                        }}>
                          {event.title}
                        </h4>
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#64748b',
                          margin: 0
                        }}>
                          {startTime}
                          {event.location && (
                            <span style={{ marginLeft: '0.5rem' }}>
                              📍 {event.location}
                            </span>
                          )}
                        </p>
                      </div>

                      <div style={{
                        width: '4px',
                        height: '48px',
                        backgroundColor: category?.color || '#3b82f6',
                        borderRadius: '2px'
                      }}></div>
                    </div>
                  )
                })
            ) : (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#64748b'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
                <p>Không có sự kiện nào hôm nay</p>
                <button
                  onClick={() => window.location.href = '/calendar'}
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Tạo sự kiện mới
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
