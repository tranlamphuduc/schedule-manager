'use client'

import React, { useState } from 'react'
import EventFormModal from '@/components/events/EventFormModal'
import { EventStorage, useEventStorageListener } from '@/lib/eventStorage'
import { CategoryStorage, useCategoryStorageListener } from '@/lib/categoryStorage'
import { Event, Category } from '@/types'
import { apiClient } from '@/lib/api'

export default function EventsPage() {
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  
  // Load categories using CategoryStorage
  const [categories, setCategories] = useState<Category[]>([])

  // Load categories on component mount
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        // Try API first
        const response = await apiClient.getCategories()
        const apiCategories = response.categories.map((cat: any) => ({
          ...cat,
          categoryId: cat.id,
          userId: cat.user_id,
          isDefault: cat.is_default,
          createdAt: new Date(cat.created_at),
          updatedAt: new Date(cat.updated_at)
        }))

        setCategories(apiCategories)
        console.log('Events page - Loaded categories from API:', apiCategories)
      } catch (error) {
        console.error('API failed, using localStorage fallback:', error)

        // Fallback to localStorage
        const loadedCategories = CategoryStorage.loadCategories()
        setCategories(loadedCategories)
        console.log('Events page - Loaded categories from localStorage:', loadedCategories)
      }
    }

    loadCategories()
  }, [])

  // Listen for category storage changes
  useCategoryStorageListener((updatedCategories) => {
    setCategories(updatedCategories)
    console.log('Events page - Categories updated from storage:', updatedCategories)
  })
  
  // Load events using EventStorage
  const [events, setEvents] = useState<Event[]>([])

  // Load events on component mount
  React.useEffect(() => {
    const loadEvents = async () => {
      try {
        // Try API first
        const response = await apiClient.getEvents()

        const apiEvents = response.events.map((event: any) => ({
          ...event,
          startDate: new Date(event.start_date),
          endDate: new Date(event.end_date),
          categoryId: event.category_id,
          userId: event.user_id,
          recurrence: event.repeat
        }))

        setEvents(apiEvents)
        console.log('Events page - Loaded events from API:', apiEvents)
      } catch (error) {
        console.error('API failed, using localStorage fallback:', error)

        // Fallback to localStorage
        const loadedEvents = EventStorage.loadEvents()
        setEvents(loadedEvents)
        console.log('Events page - Loaded events from localStorage:', loadedEvents)
      }
    }

    loadEvents()
  }, [])

  // Listen for storage changes
  useEventStorageListener((updatedEvents) => {
    setEvents(updatedEvents)
    console.log('Events page - Events updated from storage:', updatedEvents)
  })

  // Event handlers
  const handleAddEvent = async (eventData: Omit<Event, 'id'>) => {
    try {
      console.log('Events page - Adding new event:', eventData)

      // Try API first
      const response = await apiClient.createEvent({
        title: eventData.title,
        description: eventData.description,
        start_date: eventData.startDate,
        end_date: eventData.endDate,
        all_day: eventData.allDay,
        category_id: eventData.categoryId,
        location: eventData.location,
        reminder: eventData.reminder,
        repeat: eventData.recurrence ? {
          type: eventData.recurrence.type as 'daily' | 'weekly' | 'monthly',
          end_date: eventData.recurrence.endDate || eventData.endDate,
          dates: [] // Will be calculated by backend
        } : undefined
      })

      // Add to local state
      const newEvent = {
        ...response.event,
        startDate: new Date(response.event.start_date),
        endDate: new Date(response.event.end_date),
        categoryId: response.event.category_id,
        userId: response.event.user_id,
        recurrence: response.event.repeat
      }

      setEvents(prev => [...prev, newEvent])
      alert('Sự kiện đã được tạo thành công!')
    } catch (error) {
      console.error('API failed, using localStorage fallback:', error)

      // Fallback to localStorage
      const newEvent = EventStorage.addEvent(eventData)
      const updatedEvents = EventStorage.loadEvents()
      setEvents(updatedEvents)
      alert('Sự kiện đã được tạo thành công (offline)!')
    }
  }

  const handleEditEvent = (eventData: Omit<Event, 'id'>) => {
    if (editingEvent) {
      console.log('Events page - Editing event:', editingEvent.id, eventData)

      const updatedEvent = EventStorage.updateEvent(editingEvent.id, eventData)
      if (updatedEvent) {
        const updatedEvents = EventStorage.loadEvents()
        setEvents(updatedEvents)
        setEditingEvent(null)
        alert('Sự kiện đã được cập nhật!')
      } else {
        alert('Lỗi: Không thể cập nhật sự kiện!')
      }
    }
  }

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
      console.log('Events page - Deleting event:', eventId)

      const success = EventStorage.deleteEvent(eventId)
      if (success) {
        const updatedEvents = EventStorage.loadEvents()
        setEvents(updatedEvents)
        alert('Sự kiện đã được xóa!')
      } else {
        alert('Lỗi: Không thể xóa sự kiện!')
      }
    }
  }

  const handleEditClick = (event: Event) => {
    setEditingEvent(event)
    setShowEventForm(true)
  }

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = !filterCategory || event.categoryId === filterCategory
    return matchesSearch && matchesCategory
  })

  const formatDateTime = (date: Date, allDay: boolean) => {
    if (allDay) {
      return date.toLocaleDateString('vi-VN')
    }
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventStatus = (event: Event) => {
    const now = new Date()
    const start = new Date(event.startDate)
    const end = new Date(event.endDate)
    
    if (now < start) return { status: 'upcoming', label: 'Sắp tới', color: '#3b82f6' }
    if (now >= start && now <= end) return { status: 'ongoing', label: 'Đang diễn ra', color: '#10b981' }
    return { status: 'past', label: 'Đã qua', color: '#64748b' }
  }

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
              📋 Quản lý sự kiện
            </h1>
            <p style={{ color: '#64748b' }}>
              Xem, chỉnh sửa và xóa các sự kiện đã tạo
            </p>
          </div>
          
          <button
            onClick={() => {
              setEditingEvent(null)
              setShowEventForm(true)
            }}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '500',
              fontSize: '0.875rem'
            }}
          >
            ➕ Thêm sự kiện
          </button>
        </div>

        {/* Filters */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '1rem',
            alignItems: 'end'
          }}>
            {/* Search */}
            <div>
              <label style={{ 
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Tìm kiếm
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem'
                }}
                placeholder="Tìm kiếm theo tên hoặc mô tả..."
              />
            </div>

            {/* Category Filter */}
            <div>
              <label style={{ 
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Danh mục
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem'
                }}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Results count */}
          <div style={{ 
            marginTop: '1rem',
            fontSize: '0.875rem',
            color: '#64748b'
          }}>
            Hiển thị {filteredEvents.length} / {events.length} sự kiện
          </div>
        </div>

        {/* Events List */}
        <div style={{ 
          display: 'grid',
          gap: '1rem'
        }}>
          {filteredEvents.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              padding: '3rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
              <h3 style={{ 
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '0.5rem'
              }}>
                Không tìm thấy sự kiện nào
              </h3>
              <p style={{ color: '#64748b' }}>
                {searchTerm || filterCategory 
                  ? 'Thử thay đổi bộ lọc để xem thêm sự kiện'
                  : 'Tạo sự kiện đầu tiên của bạn'
                }
              </p>
            </div>
          ) : (
            filteredEvents.map((event) => {
              const category = categories.find(cat => cat.id === event.categoryId)
              const status = getEventStatus(event)
              
              return (
                <div key={event.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden'
                }}>
                  {/* Color bar */}
                  <div style={{
                    height: '4px',
                    backgroundColor: category?.color || '#3b82f6'
                  }}></div>
                  
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.75rem',
                          marginBottom: '0.5rem'
                        }}>
                          <h3 style={{ 
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#1e293b',
                            margin: 0
                          }}>
                            {event.title}
                          </h3>
                          
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: status.color + '20',
                            color: status.color,
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            {status.label}
                          </span>
                          
                          {category && (
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
                          )}
                        </div>
                        
                        {event.description && (
                          <p style={{ 
                            color: '#64748b',
                            fontSize: '0.875rem',
                            margin: 0,
                            marginBottom: '0.75rem',
                            lineHeight: 1.5
                          }}>
                            {event.description}
                          </p>
                        )}
                        
                        <div style={{ 
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '0.75rem',
                          fontSize: '0.875rem',
                          color: '#64748b'
                        }}>
                          <div>
                            <strong>Thời gian:</strong><br />
                            {event.allDay ? '📅 Cả ngày' : '🕒'} {formatDateTime(event.startDate, event.allDay)}
                            {!event.allDay && (
                              <>
                                <br />đến {formatDateTime(event.endDate, event.allDay)}
                              </>
                            )}
                          </div>
                          
                          {event.location && (
                            <div>
                              <strong>Địa điểm:</strong><br />
                              📍 {event.location}
                            </div>
                          )}
                          
                          {event.reminder?.enabled && (
                            <div>
                              <strong>Nhắc nhở:</strong><br />
                              🔔 {event.reminder.minutes === 0 ? 'Khi bắt đầu' : `${event.reminder.minutes} phút trước`}
                            </div>
                          )}

                          {event.recurrence && (
                            <div>
                              <strong>Lặp lại:</strong><br />
                              🔄 {event.recurrence.type === 'daily' ? 'Hằng ngày' :
                                   event.recurrence.type === 'weekly' ? 'Hằng tuần' :
                                   event.recurrence.type === 'monthly' ? 'Hằng tháng' : 'Tùy chỉnh'}
                              <br />
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                Đến {event.recurrence.endDate ? new Date(event.recurrence.endDate).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEditClick(event)}
                          style={{
                            padding: '0.5rem',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          style={{
                            padding: '0.5rem',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            color: '#dc2626'
                          }}
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Event Form Modal */}
        <EventFormModal
          event={editingEvent}
          isOpen={showEventForm}
          onClose={() => {
            setShowEventForm(false)
            setEditingEvent(null)
          }}
          onSubmit={editingEvent ? handleEditEvent : handleAddEvent}
          categories={categories}
        />
      </div>
    </div>
  )
}
