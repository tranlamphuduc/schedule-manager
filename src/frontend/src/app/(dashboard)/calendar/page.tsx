'use client'

import React, { useState } from 'react'
import EventFormModal from '@/components/events/EventFormModal'
import { EventStorage, type Event, useEventStorageListener } from '@/lib/eventStorage'
import { CategoryStorage, type Category, useCategoryStorageListener } from '@/lib/categoryStorage'
import { NotificationStorage } from '@/lib/notificationStorage'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showDayEvents, setShowDayEvents] = useState(false)
  const [selectedDayEvents, setSelectedDayEvents] = useState<Event[]>([])

  // Load categories using CategoryStorage
  const [categories, setCategories] = useState<Category[]>([])

  // Load categories on component mount
  React.useEffect(() => {
    const loadedCategories = CategoryStorage.loadCategories()
    setCategories(loadedCategories)
    console.log('Calendar - Loaded categories:', loadedCategories)
  }, [])

  // Listen for category storage changes
  useCategoryStorageListener((updatedCategories) => {
    setCategories(updatedCategories)
    console.log('Calendar - Categories updated from storage:', updatedCategories)
  })

  // Load events using EventStorage
  const [events, setEvents] = useState<Event[]>([])

  // Load events on component mount
  React.useEffect(() => {
    const loadedEvents = EventStorage.loadEvents()
    setEvents(loadedEvents)
    console.log('Calendar - Loaded events:', loadedEvents)
  }, [])

  // Listen for storage changes
  useEventStorageListener((updatedEvents) => {
    setEvents(updatedEvents)
    console.log('Calendar - Events updated from storage:', updatedEvents)
  })

  // Event handlers
  const handleAddEvent = (eventData: Omit<Event, 'id'>) => {
    console.log('Calendar - Adding new event:', eventData)

    const newEvent = EventStorage.addEvent(eventData)
    const updatedEvents = EventStorage.loadEvents()
    setEvents(updatedEvents)

    // Generate notifications for the new event
    NotificationStorage.generateEventNotifications(updatedEvents)

    alert('Sự kiện đã được tạo thành công!')
  }

  const handleEditEvent = (eventData: Omit<Event, 'id'>) => {
    if (editingEvent) {
      console.log('Calendar - Editing event:', editingEvent.id, eventData)

      const updatedEvent = EventStorage.updateEvent(editingEvent.id, eventData)
      if (updatedEvent) {
        const updatedEvents = EventStorage.loadEvents()
        setEvents(updatedEvents)
        setEditingEvent(null)

        // Regenerate notifications after editing
        NotificationStorage.generateEventNotifications(updatedEvents)

        alert('Sự kiện đã được cập nhật!')
      } else {
        alert('Lỗi: Không thể cập nhật sự kiện!')
      }
    }
  }

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
      console.log('Calendar - Deleting event:', eventId)

      const success = EventStorage.deleteEvent(eventId)
      if (success) {
        const updatedEvents = EventStorage.loadEvents()
        setEvents(updatedEvents)
        setShowDayEvents(false)
        alert('Sự kiện đã được xóa!')
      } else {
        alert('Lỗi: Không thể xóa sự kiện!')
      }
    }
  }

  const handleDayClick = (date: Date) => {
    const dayEvents = getEventsForDate(date)
    if (dayEvents.length > 0) {
      // Show events for this day
      setSelectedDayEvents(dayEvents)
      setSelectedDate(date)
      setShowDayEvents(true)
    } else {
      // No events, show empty state or do nothing
      setSelectedDayEvents([])
      setSelectedDate(date)
      setShowDayEvents(true)
    }
  }

  const handleEventClick = (event: Event) => {
    setEditingEvent(event)
    setSelectedDate(null)
    setShowEventForm(true)
  }

  const handleCreateEventForDay = (date: Date) => {
    setSelectedDate(date)
    setEditingEvent(null)
    setShowDayEvents(false)
    setShowEventForm(true)
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      // Check if event occurs on this date (including repeated events)
      if (event.repeat && event.repeat.dates) {
        return event.repeat.dates.some(repeatDate => {
          const rDate = new Date(repeatDate)
          return rDate.toDateString() === date.toDateString()
        })
      } else {
        const eventDate = new Date(event.startDate)
        return eventDate.toDateString() === date.toDateString()
      }
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long'
    })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const days = getDaysInMonth(currentDate)
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '0.5rem'
            }}>
              📅 Lịch
            </h1>
            <p style={{ color: '#64748b' }}>
              Xem và quản lý sự kiện trong lịch
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Add Event Button */}
            <button
              onClick={() => {
                setSelectedDate(new Date())
                setEditingEvent(null)
                setShowEventForm(true)
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '500'
              }}
            >
              ➕ Thêm sự kiện
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>

          {/* Calendar Header */}
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              margin: 0
            }}>
              {formatDate(currentDate)}
            </h2>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => navigateMonth('prev')}
                style={{
                  padding: '0.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                ←
              </button>

              <button
                onClick={() => setCurrentDate(new Date())}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Hôm nay
              </button>

              <button
                onClick={() => navigateMonth('next')}
                style={{
                  padding: '0.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                →
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div style={{ padding: '1.5rem' }}>
            {/* Day Names */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '1px',
              marginBottom: '1rem'
            }}>
              {dayNames.map((day) => (
                <div key={day} style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#64748b',
                  backgroundColor: '#f8fafc'
                }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '1px',
              backgroundColor: '#e2e8f0',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              {days.map((day, index) => {
                const dayEvents = day ? getEventsForDate(day) : []

                return (
                  <div key={index} style={{
                    backgroundColor: 'white',
                    minHeight: '120px',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s',
                    ...(day && isToday(day) && {
                      backgroundColor: '#dbeafe',
                      fontWeight: '600'
                    }),
                    ...(!day && {
                      backgroundColor: '#f8fafc'
                    })
                  }}
                  onClick={() => day && handleDayClick(day)}
                  onMouseOver={(e) => {
                    if (day && !isToday(day)) {
                      e.currentTarget.style.backgroundColor = '#f1f5f9'
                    }
                  }}
                  onMouseOut={(e) => {
                    if (day && !isToday(day)) {
                      e.currentTarget.style.backgroundColor = 'white'
                    }
                  }}
                  >
                    {day && (
                      <>
                        <div style={{
                          fontSize: '0.875rem',
                          color: isToday(day) ? '#1e40af' : '#1e293b',
                          fontWeight: isToday(day) ? '600' : '500',
                          marginBottom: '0.5rem'
                        }}>
                          {day.getDate()}
                        </div>

                        {/* Events for this day */}
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          maxHeight: '80px',
                          overflow: 'hidden'
                        }}>
                          {dayEvents.slice(0, 3).map((event) => {
                            const category = categories.find(cat => cat.id === event.categoryId)
                            return (
                              <div
                                key={event.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEventClick(event)
                                }}
                                style={{
                                  padding: '2px 4px',
                                  backgroundColor: category?.color || '#3b82f6',
                                  color: 'white',
                                  borderRadius: '3px',
                                  fontSize: '0.7rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  cursor: 'pointer',
                                  transition: 'opacity 0.2s'
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.opacity = '0.8'
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.opacity = '1'
                                }}
                                title={`${event.title}${event.location ? ` - ${event.location}` : ''}`}
                              >
                                {event.allDay ? '📅' : '🕒'} {event.title}
                              </div>
                            )
                          })}

                          {dayEvents.length > 3 && (
                            <div style={{
                              fontSize: '0.7rem',
                              color: '#64748b',
                              textAlign: 'center',
                              padding: '2px'
                            }}>
                              +{dayEvents.length - 3} khác
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Day Events Modal */}
        {showDayEvents && selectedDate && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1rem'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: 0
                }}>
                  📅 Sự kiện ngày {selectedDate.toLocaleDateString('vi-VN')}
                </h2>

                <button
                  onClick={() => setShowDayEvents(false)}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '1.25rem'
                  }}
                >
                  ✕
                </button>
              </div>

              {selectedDayEvents.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 1rem'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '0.5rem'
                  }}>
                    Chưa có sự kiện nào
                  </h3>
                  <p style={{
                    color: '#64748b',
                    marginBottom: '1.5rem'
                  }}>
                    Tạo sự kiện đầu tiên cho ngày này
                  </p>
                  <button
                    onClick={() => handleCreateEventForDay(selectedDate)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: '500'
                    }}
                  >
                    ➕ Tạo sự kiện
                  </button>
                </div>
              ) : (
                <>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <p style={{ color: '#64748b' }}>
                      {selectedDayEvents.length} sự kiện
                    </p>
                    <button
                      onClick={() => handleCreateEventForDay(selectedDate)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      ➕ Thêm sự kiện
                    </button>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    {selectedDayEvents
                      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
                      .map((event) => {
                        const category = categories.find(cat => cat.id === event.categoryId)
                        return (
                          <div key={event.id} style={{
                            padding: '1rem',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            borderLeft: `4px solid ${category?.color || '#3b82f6'}`
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              marginBottom: '0.5rem'
                            }}>
                              <h4 style={{
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: '#1e293b',
                                margin: 0
                              }}>
                                {event.allDay ? '📅' : '🕒'} {event.title}
                              </h4>

                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  onClick={() => handleEventClick(event)}
                                  style={{
                                    padding: '0.25rem',
                                    backgroundColor: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem'
                                  }}
                                  title="Chỉnh sửa"
                                >
                                  ✏️
                                </button>

                                <button
                                  onClick={() => handleDeleteEvent(event.id)}
                                  style={{
                                    padding: '0.25rem',
                                    backgroundColor: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    color: '#dc2626'
                                  }}
                                  title="Xóa"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>

                            <div style={{
                              fontSize: '0.875rem',
                              color: '#64748b',
                              marginBottom: '0.5rem'
                            }}>
                              {event.allDay ? (
                                'Cả ngày'
                              ) : (
                                `${event.startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${event.endDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                              )}
                              {event.location && (
                                <span> • 📍 {event.location}</span>
                              )}
                            </div>

                            {event.description && (
                              <p style={{
                                fontSize: '0.875rem',
                                color: '#64748b',
                                margin: 0,
                                lineHeight: 1.4
                              }}>
                                {event.description}
                              </p>
                            )}

                            {category && (
                              <div style={{ marginTop: '0.5rem' }}>
                                <span style={{
                                  padding: '0.25rem 0.5rem',
                                  backgroundColor: category.color + '20',
                                  color: category.color,
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: '500'
                                }}>
                                  {category.name}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Event Form Modal */}
        <EventFormModal
          event={editingEvent}
          isOpen={showEventForm}
          onClose={() => {
            setShowEventForm(false)
            setEditingEvent(null)
            setSelectedDate(null)
          }}
          onSubmit={editingEvent ? handleEditEvent : handleAddEvent}
          categories={categories}
          selectedDate={selectedDate || undefined}
        />
      </div>
    </div>
  )
}
