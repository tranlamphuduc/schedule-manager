// Notification storage utilities for localStorage management

export interface SystemNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  createdAt: Date
  isRead: boolean
  persistent?: boolean // If true, won't auto-delete
}

export interface EventNotification {
  id: string
  eventId: string
  eventTitle: string
  type: 'upcoming' | 'starting' | 'ongoing' | 'reminder'
  message: string
  eventStartDate: Date
  eventEndDate: Date
  createdAt: Date
  isRead: boolean
}

const SYSTEM_NOTIFICATIONS_KEY_PREFIX = 'schedule-manager-system-notifications'
const EVENT_NOTIFICATIONS_KEY_PREFIX = 'schedule-manager-event-notifications'

// Get storage key for specific user
const getStorageKey = (prefix: string, userId: string) => `${prefix}-${userId}`

// Get current user ID from localStorage
const getCurrentUserId = (): string => {
  if (typeof window === 'undefined') return 'default-user'
  
  const currentUser = localStorage.getItem('schedule-manager-current-user')
  if (currentUser) {
    try {
      const user = JSON.parse(currentUser)
      return user.email || user.id || 'default-user'
    } catch (error) {
      console.error('Error parsing current user:', error)
    }
  }
  
  return 'default-user'
}

export const NotificationStorage = {
  // System Notifications
  loadSystemNotifications(): SystemNotification[] {
    try {
      if (typeof window === 'undefined') return []

      const userId = getCurrentUserId()
      const storageKey = getStorageKey(SYSTEM_NOTIFICATIONS_KEY_PREFIX, userId)
      const saved = localStorage.getItem(storageKey)
      
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved).map((notif: any) => ({
          ...notif,
          createdAt: new Date(notif.createdAt)
        }))
        return parsed
      }

      return []
    } catch (error) {
      console.error('Error loading system notifications:', error)
      return []
    }
  },

  saveSystemNotifications(notifications: SystemNotification[]): void {
    try {
      if (typeof window === 'undefined') return

      const userId = getCurrentUserId()
      const storageKey = getStorageKey(SYSTEM_NOTIFICATIONS_KEY_PREFIX, userId)
      localStorage.setItem(storageKey, JSON.stringify(notifications))
      
      // Dispatch event for real-time updates
      window.dispatchEvent(new CustomEvent('systemNotificationsUpdated', { 
        detail: { notifications, userId } 
      }))
    } catch (error) {
      console.error('Error saving system notifications:', error)
    }
  },

  addSystemNotification(notification: Omit<SystemNotification, 'id' | 'createdAt'>): SystemNotification {
    const newNotification: SystemNotification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date()
    }

    const current = this.loadSystemNotifications()
    const updated = [newNotification, ...current]
    this.saveSystemNotifications(updated)

    return newNotification
  },

  markSystemNotificationAsRead(notificationId: string): void {
    const notifications = this.loadSystemNotifications()
    const updated = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    )
    this.saveSystemNotifications(updated)
  },

  deleteSystemNotification(notificationId: string): void {
    const notifications = this.loadSystemNotifications()
    const updated = notifications.filter(notif => notif.id !== notificationId)
    this.saveSystemNotifications(updated)
  },

  // Event Notifications
  loadEventNotifications(): EventNotification[] {
    try {
      if (typeof window === 'undefined') return []

      const userId = getCurrentUserId()
      const storageKey = getStorageKey(EVENT_NOTIFICATIONS_KEY_PREFIX, userId)
      const saved = localStorage.getItem(storageKey)
      
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved).map((notif: any) => ({
          ...notif,
          eventStartDate: new Date(notif.eventStartDate),
          eventEndDate: new Date(notif.eventEndDate),
          createdAt: new Date(notif.createdAt)
        }))
        return parsed
      }

      return []
    } catch (error) {
      console.error('Error loading event notifications:', error)
      return []
    }
  },

  saveEventNotifications(notifications: EventNotification[]): void {
    try {
      if (typeof window === 'undefined') return

      const userId = getCurrentUserId()
      const storageKey = getStorageKey(EVENT_NOTIFICATIONS_KEY_PREFIX, userId)
      localStorage.setItem(storageKey, JSON.stringify(notifications))
      
      // Dispatch event for real-time updates
      window.dispatchEvent(new CustomEvent('eventNotificationsUpdated', { 
        detail: { notifications, userId } 
      }))
    } catch (error) {
      console.error('Error saving event notifications:', error)
    }
  },

  addEventNotification(notification: Omit<EventNotification, 'id' | 'createdAt'>): EventNotification {
    const newNotification: EventNotification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date()
    }

    const current = this.loadEventNotifications()
    const updated = [newNotification, ...current]
    this.saveEventNotifications(updated)

    return newNotification
  },

  markEventNotificationAsRead(notificationId: string): void {
    const notifications = this.loadEventNotifications()
    const updated = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    )
    this.saveEventNotifications(updated)
  },

  deleteEventNotification(notificationId: string): void {
    const notifications = this.loadEventNotifications()
    const updated = notifications.filter(notif => notif.id !== notificationId)
    this.saveEventNotifications(updated)
  },

  // Clean up expired event notifications
  cleanupExpiredEventNotifications(): void {
    const notifications = this.loadEventNotifications()
    const now = new Date()
    
    // Remove notifications for events that have ended
    const active = notifications.filter(notif => {
      const eventEnd = new Date(notif.eventEndDate)
      return eventEnd > now
    })
    
    if (active.length !== notifications.length) {
      this.saveEventNotifications(active)
      console.log(`Cleaned up ${notifications.length - active.length} expired event notifications`)
    }
  },

  // Generate notifications for upcoming/ongoing events
  generateEventNotifications(events: any[]): void {
    const now = new Date()
    const existingNotifications = this.loadEventNotifications()
    const newNotifications: EventNotification[] = []

    // Process all events (including repeat events)
    events.forEach(event => {
      if (event.recurrence) {
        // Handle recurrence events - for now just check main event
        // TODO: Implement proper recurrence date calculation
        const eventStart = new Date(event.startDate)
        const eventEnd = new Date(event.endDate)

        this.processEventForNotification(event, eventStart, eventEnd, now, existingNotifications, newNotifications)
      } else {
        // Handle single events
        const eventStart = new Date(event.startDate)
        const eventEnd = new Date(event.endDate)

        this.processEventForNotification(event, eventStart, eventEnd, now, existingNotifications, newNotifications)
      }
    })

    // Add new notifications
    if (newNotifications.length > 0) {
      newNotifications.forEach(notif => {
        this.addEventNotification(notif)
      })
    }

    // Clean up expired notifications
    this.cleanupExpiredEventNotifications()
  },

  // Helper function to process individual event occurrences
  processEventForNotification(
    event: any,
    eventStart: Date,
    eventEnd: Date,
    now: Date,
    existingNotifications: EventNotification[],
    newNotifications: EventNotification[]
  ): void {
    // Skip past events
    if (eventEnd <= now) return

    // Create unique key for this specific occurrence
    const occurrenceKey = `${event.id}-${eventStart.toISOString()}`

    // Check if notification already exists for this specific occurrence
    const existingNotif = existingNotifications.find(notif =>
      notif.eventId === event.id &&
      Math.abs(new Date(notif.eventStartDate).getTime() - eventStart.getTime()) < 60000 // Within 1 minute
    )

    if (!existingNotif) {
      // Create notification for upcoming/ongoing events
      let type: 'upcoming' | 'starting' | 'ongoing' = 'upcoming'
      let message = ''

      if (now >= eventStart && now <= eventEnd) {
        type = 'ongoing'
        message = `Sự kiện "${event.title}" đang diễn ra`
        if (event.location) {
          message += ` tại ${event.location}`
        }
      } else if (eventStart > now) {
        const timeDiff = eventStart.getTime() - now.getTime()
        const minutesUntil = Math.ceil(timeDiff / (1000 * 60))
        const hoursUntil = Math.ceil(timeDiff / (1000 * 60 * 60))
        const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

        if (minutesUntil <= 15) {
          type = 'starting'
          message = `Sự kiện "${event.title}" sẽ bắt đầu trong ${minutesUntil} phút`
        } else if (hoursUntil <= 2) {
          type = 'starting'
          message = `Sự kiện "${event.title}" sẽ bắt đầu trong ${hoursUntil} giờ`
        } else if (hoursUntil <= 24) {
          type = 'starting'
          message = `Sự kiện "${event.title}" sẽ bắt đầu trong ${hoursUntil} giờ (${eventStart.toLocaleDateString('vi-VN')})`
        } else if (daysUntil <= 7) {
          message = `Sự kiện "${event.title}" sẽ diễn ra trong ${daysUntil} ngày (${eventStart.toLocaleDateString('vi-VN')})`
        } else {
          // Don't create notifications for events more than 7 days away
          return
        }

        if (event.location && (type === 'starting' || daysUntil <= 3)) {
          message += ` tại ${event.location}`
        }
      }

      newNotifications.push({
        id: '',
        eventId: event.id,
        eventTitle: event.title,
        type,
        message,
        eventStartDate: eventStart,
        eventEndDate: eventEnd,
        createdAt: new Date(),
        isRead: false
      })
    }
  },

  // Get unread count
  getUnreadCount(): { system: number, events: number, total: number } {
    const systemNotifications = this.loadSystemNotifications()
    const eventNotifications = this.loadEventNotifications()
    
    const systemUnread = systemNotifications.filter(notif => !notif.isRead).length
    const eventsUnread = eventNotifications.filter(notif => !notif.isRead).length
    
    return {
      system: systemUnread,
      events: eventsUnread,
      total: systemUnread + eventsUnread
    }
  }
}

// Hook for listening to notification changes
export const useNotificationStorageListener = (
  onSystemUpdate: (notifications: SystemNotification[]) => void,
  onEventUpdate: (notifications: EventNotification[]) => void
) => {
  React.useEffect(() => {
    const currentUserId = getCurrentUserId()
    
    const handleSystemUpdate = (e: CustomEvent) => {
      if (e.detail.userId === currentUserId) {
        onSystemUpdate(e.detail.notifications)
      }
    }

    const handleEventUpdate = (e: CustomEvent) => {
      if (e.detail.userId === currentUserId) {
        onEventUpdate(e.detail.notifications)
      }
    }

    window.addEventListener('systemNotificationsUpdated', handleSystemUpdate as EventListener)
    window.addEventListener('eventNotificationsUpdated', handleEventUpdate as EventListener)

    return () => {
      window.removeEventListener('systemNotificationsUpdated', handleSystemUpdate as EventListener)
      window.removeEventListener('eventNotificationsUpdated', handleEventUpdate as EventListener)
    }
  }, [onSystemUpdate, onEventUpdate])
}

// Import React for the hook
import React from 'react'
