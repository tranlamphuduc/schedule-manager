// Event storage utilities for localStorage management

export interface Event {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  allDay: boolean
  categoryId: string
  location?: string
  reminder?: {
    enabled: boolean
    minutes: number
  }
  repeat?: {
    type: 'daily' | 'weekly' | 'monthly'
    endDate: Date
    dates: Date[] // Array of all dates this event occurs on
  }
}

const STORAGE_KEY_PREFIX = 'schedule-manager-events'

// Get storage key for specific user
const getStorageKey = (userId: string) => `${STORAGE_KEY_PREFIX}-${userId}`

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

// No default events - new users start with empty calendar

export const EventStorage = {
  // Load events from localStorage for current user
  loadEvents(): Event[] {
    try {
      if (typeof window === 'undefined') return []

      const userId = getCurrentUserId()
      const storageKey = getStorageKey(userId)
      const savedEvents = localStorage.getItem(storageKey)

      console.log(`Loading events for user ${userId}:`, savedEvents)

      if (savedEvents && savedEvents !== 'undefined' && savedEvents !== 'null') {
        const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
          ...event,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          repeat: event.repeat ? {
            ...event.repeat,
            endDate: new Date(event.repeat.endDate),
            dates: event.repeat.dates?.map((date: string) => new Date(date)) || []
          } : undefined
        }))
        console.log('Parsed events:', parsedEvents)
        return parsedEvents
      }

      // Return empty array for new users
      console.log(`No saved events for user ${userId}, returning empty array`)
      return []
    } catch (error) {
      console.error('Error loading events from localStorage:', error)
      return []
    }
  },

  // Save events to localStorage for current user
  saveEvents(events: Event[]): void {
    try {
      if (typeof window === 'undefined') return

      const userId = getCurrentUserId()
      const storageKey = getStorageKey(userId)

      console.log(`Saving events for user ${userId}:`, events)
      localStorage.setItem(storageKey, JSON.stringify(events))
      console.log('Events saved successfully')

      // Dispatch custom event for cross-component sync
      window.dispatchEvent(new CustomEvent('eventsUpdated', {
        detail: { events, userId }
      }))
    } catch (error) {
      console.error('Error saving events to localStorage:', error)
    }
  },

  // Add a new event
  addEvent(eventData: Omit<Event, 'id'>): Event {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString()
    }

    const currentEvents = this.loadEvents()
    const updatedEvents = [...currentEvents, newEvent]
    this.saveEvents(updatedEvents)

    return newEvent
  },

  // Update an existing event
  updateEvent(eventId: string, eventData: Omit<Event, 'id'>): Event | null {
    const currentEvents = this.loadEvents()
    const eventIndex = currentEvents.findIndex(event => event.id === eventId)

    if (eventIndex === -1) {
      console.error('Event not found:', eventId)
      return null
    }

    const updatedEvent: Event = {
      ...eventData,
      id: eventId
    }

    const updatedEvents = [...currentEvents]
    updatedEvents[eventIndex] = updatedEvent
    this.saveEvents(updatedEvents)

    return updatedEvent
  },

  // Delete an event
  deleteEvent(eventId: string): boolean {
    const currentEvents = this.loadEvents()
    const filteredEvents = currentEvents.filter(event => event.id !== eventId)

    if (filteredEvents.length === currentEvents.length) {
      console.error('Event not found for deletion:', eventId)
      return false
    }

    this.saveEvents(filteredEvents)
    return true
  },

  // Get events for a specific date (including repeated events)
  getEventsForDate(date: Date): Event[] {
    const events = this.loadEvents()
    return events.filter(event => {
      // Check if event occurs on this date
      if (event.repeat && event.repeat.dates) {
        // For repeated events, check if date is in the repeat dates array
        return event.repeat.dates.some(repeatDate => {
          const rDate = new Date(repeatDate)
          return rDate.toDateString() === date.toDateString()
        })
      } else {
        // For single events, check the start date
        const eventDate = new Date(event.startDate)
        return eventDate.toDateString() === date.toDateString()
      }
    })
  },

  // Helper function to check if an event occurs on a specific date
  eventOccursOnDate(event: Event, date: Date): boolean {
    if (event.repeat && event.repeat.dates) {
      return event.repeat.dates.some(repeatDate => {
        const rDate = new Date(repeatDate)
        return rDate.toDateString() === date.toDateString()
      })
    } else {
      const eventDate = new Date(event.startDate)
      return eventDate.toDateString() === date.toDateString()
    }
  },

  // Get all dates an event occurs on
  getEventDates(event: Event): Date[] {
    if (event.repeat && event.repeat.dates) {
      return event.repeat.dates.map(date => new Date(date))
    } else {
      return [new Date(event.startDate)]
    }
  },

  // Clear all events for current user (for testing)
  clearEvents(): void {
    try {
      if (typeof window === 'undefined') return

      const userId = getCurrentUserId()
      const storageKey = getStorageKey(userId)
      localStorage.removeItem(storageKey)
      console.log(`All events cleared for user ${userId}`)
    } catch (error) {
      console.error('Error clearing events:', error)
    }
  }
}

// Hook for listening to storage changes for current user
export const useEventStorageListener = (callback: (events: Event[]) => void) => {
  React.useEffect(() => {
    const currentUserId = getCurrentUserId()
    const currentStorageKey = getStorageKey(currentUserId)

    const handleStorageChange = (e: StorageEvent) => {
      // Only listen to changes for current user's storage key
      if (e.key === currentStorageKey && e.newValue) {
        try {
          const parsedEvents = JSON.parse(e.newValue).map((event: any) => ({
            ...event,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate)
          }))
          console.log(`Storage change detected for user ${currentUserId}:`, parsedEvents)
          callback(parsedEvents)
        } catch (error) {
          console.error('Error parsing storage event:', error)
        }
      }
    }

    const handleCustomEvent = (e: CustomEvent) => {
      // Only process events for current user
      if (e.detail.userId === currentUserId) {
        console.log(`Custom event received for user ${currentUserId}:`, e.detail.events)
        callback(e.detail.events)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('eventsUpdated', handleCustomEvent as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('eventsUpdated', handleCustomEvent as EventListener)
    }
  }, [callback])
}

// Import React for the hook
import React from 'react'
