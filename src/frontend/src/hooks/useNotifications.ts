import { useState, useEffect } from 'react'
import { NotificationStorage } from '@/lib/notificationStorage'
import { EventStorage } from '@/lib/eventStorage'

export const useNotifications = () => {
  const [unreadCount, setUnreadCount] = useState({ system: 0, events: 0, total: 0 })

  const updateUnreadCount = () => {
    const counts = NotificationStorage.getUnreadCount()
    setUnreadCount(counts)
  }

  useEffect(() => {
    // Initial load
    updateUnreadCount()

    // Generate event notifications
    const events = EventStorage.loadEvents()
    NotificationStorage.generateEventNotifications(events)
    
    // Update count after generating
    setTimeout(updateUnreadCount, 100)

    // Listen for changes
    const handleUpdate = () => {
      updateUnreadCount()
    }

    window.addEventListener('systemNotificationsUpdated', handleUpdate)
    window.addEventListener('eventNotificationsUpdated', handleUpdate)

    // Auto-refresh every minute to check for new event notifications
    const interval = setInterval(() => {
      const events = EventStorage.loadEvents()
      NotificationStorage.generateEventNotifications(events)
      updateUnreadCount()
    }, 60000) // 1 minute

    return () => {
      window.removeEventListener('systemNotificationsUpdated', handleUpdate)
      window.removeEventListener('eventNotificationsUpdated', handleUpdate)
      clearInterval(interval)
    }
  }, [])

  return {
    unreadCount,
    refreshNotifications: () => {
      const events = EventStorage.loadEvents()
      NotificationStorage.generateEventNotifications(events)
      updateUnreadCount()
    }
  }
}
