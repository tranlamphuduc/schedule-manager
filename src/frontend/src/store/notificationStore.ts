import { create } from 'zustand'
import type { Notification } from '@/types'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
}

interface NotificationActions {
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

type NotificationStore = NotificationState & NotificationActions

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  // Actions
  fetchNotifications: async () => {
    try {
      set({ isLoading: true, error: null })

      const response = await fetch('/api/notifications')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Không thể tải thông báo')
      }

      const notifications = data.notifications.map((notification: any) => ({
        ...notification,
        createdAt: new Date(notification.createdAt),
      }))

      const unreadCount = notifications.filter((n: Notification) => !n.read).length

      set({
        notifications,
        unreadCount,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Không thể tải thông báo',
        isLoading: false,
      })
    }
  },

  markAsRead: async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true }),
      })

      if (!response.ok) {
        throw new Error('Không thể đánh dấu đã đọc')
      }

      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Không thể đánh dấu đã đọc',
      })
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Không thể đánh dấu tất cả đã đọc')
      }

      set((state) => ({
        notifications: state.notifications.map((notification) => ({
          ...notification,
          read: true,
        })),
        unreadCount: 0,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Không thể đánh dấu tất cả đã đọc',
      })
    }
  },

  deleteNotification: async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Không thể xóa thông báo')
      }

      set((state) => {
        const notification = state.notifications.find(n => n.id === id)
        const wasUnread = notification && !notification.read

        return {
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        }
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Không thể xóa thông báo',
      })
    }
  },

  addNotification: (notificationData) => {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString(), // Simple ID generation
      createdAt: new Date(),
    }

    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.read ? state.unreadCount : state.unreadCount + 1,
    }))

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
      })
    }
  },

  showToast: (message: string, type = 'info') => {
    // This will be used with a toast system
    const notification = {
      userId: 'current-user', // TODO: Get from auth
      title: type === 'error' ? 'Lỗi' : type === 'success' ? 'Thành công' : 'Thông báo',
      message,
      type: type as any,
      read: false,
    }

    get().addNotification(notification)

    // Auto-remove toast notifications after 5 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.message !== message)
      }))
    }, 5000)
  },

  setLoading: (loading) => {
    set({ isLoading: loading })
  },

  setError: (error) => {
    set({ error })
  },
}))

// Request notification permission on store creation
if (typeof window !== 'undefined' && 'Notification' in window) {
  if (Notification.permission === 'default') {
    Notification.requestPermission()
  }
}
