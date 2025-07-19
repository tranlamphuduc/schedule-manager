import { create } from 'zustand'
import type { Event, Category } from '@/types'

interface EventState {
  events: Event[]
  categories: Category[]
  selectedEvent: Event | null
  isLoading: boolean
  error: string | null
}

interface EventActions {
  // Events
  fetchEvents: (startDate?: Date, endDate?: Date) => Promise<void>
  createEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  setSelectedEvent: (event: Event | null) => void
  
  // Categories
  fetchCategories: () => Promise<void>
  createCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  
  // Utility
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

type EventStore = EventState & EventActions

export const useEventStore = create<EventStore>((set, get) => ({
  // State
  events: [],
  categories: [],
  selectedEvent: null,
  isLoading: false,
  error: null,

  // Event Actions
  fetchEvents: async (startDate?: Date, endDate?: Date) => {
    try {
      set({ isLoading: true, error: null })

      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate.toISOString())
      if (endDate) params.append('endDate', endDate.toISOString())

      const response = await fetch(`/api/events?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Không thể tải sự kiện')
      }

      set({
        events: data.events.map((event: any) => ({
          ...event,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt),
        })),
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Không thể tải sự kiện',
        isLoading: false,
      })
    }
  },

  createEvent: async (eventData) => {
    try {
      set({ isLoading: true, error: null })

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Không thể tạo sự kiện')
      }

      const newEvent = {
        ...data.event,
        startDate: new Date(data.event.startDate),
        endDate: new Date(data.event.endDate),
        createdAt: new Date(data.event.createdAt),
        updatedAt: new Date(data.event.updatedAt),
      }

      set((state) => ({
        events: [...state.events, newEvent],
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Không thể tạo sự kiện',
        isLoading: false,
      })
      throw error
    }
  },

  updateEvent: async (id, eventData) => {
    try {
      set({ isLoading: true, error: null })

      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Không thể cập nhật sự kiện')
      }

      const updatedEvent = {
        ...data.event,
        startDate: new Date(data.event.startDate),
        endDate: new Date(data.event.endDate),
        createdAt: new Date(data.event.createdAt),
        updatedAt: new Date(data.event.updatedAt),
      }

      set((state) => ({
        events: state.events.map((event) =>
          event.id === id ? updatedEvent : event
        ),
        selectedEvent: state.selectedEvent?.id === id ? updatedEvent : state.selectedEvent,
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Không thể cập nhật sự kiện',
        isLoading: false,
      })
      throw error
    }
  },

  deleteEvent: async (id) => {
    try {
      set({ isLoading: true, error: null })

      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Không thể xóa sự kiện')
      }

      set((state) => ({
        events: state.events.filter((event) => event.id !== id),
        selectedEvent: state.selectedEvent?.id === id ? null : state.selectedEvent,
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Không thể xóa sự kiện',
        isLoading: false,
      })
      throw error
    }
  },

  setSelectedEvent: (event) => {
    set({ selectedEvent: event })
  },

  // Category Actions
  fetchCategories: async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Không thể tải danh mục')
      }

      set({
        categories: data.categories.map((category: any) => ({
          ...category,
          createdAt: new Date(category.createdAt),
          updatedAt: new Date(category.updatedAt),
        })),
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Không thể tải danh mục',
      })
    }
  },

  createCategory: async (categoryData) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Không thể tạo danh mục')
      }

      const newCategory = {
        ...data.category,
        createdAt: new Date(data.category.createdAt),
        updatedAt: new Date(data.category.updatedAt),
      }

      set((state) => ({
        categories: [...state.categories, newCategory],
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Không thể tạo danh mục',
      })
      throw error
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Không thể cập nhật danh mục')
      }

      const updatedCategory = {
        ...data.category,
        createdAt: new Date(data.category.createdAt),
        updatedAt: new Date(data.category.updatedAt),
      }

      set((state) => ({
        categories: state.categories.map((category) =>
          category.id === id ? updatedCategory : category
        ),
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Không thể cập nhật danh mục',
      })
      throw error
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Không thể xóa danh mục')
      }

      set((state) => ({
        categories: state.categories.filter((category) => category.id !== id),
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Không thể xóa danh mục',
      })
      throw error
    }
  },

  // Utility
  setLoading: (loading) => {
    set({ isLoading: loading })
  },

  setError: (error) => {
    set({ error })
  },

  clearError: () => {
    set({ error: null })
  },
}))
