import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CalendarView } from '@/types'

interface CalendarState {
  currentDate: Date
  view: CalendarView
  selectedDate: Date | null
  showWeekends: boolean
  showCompletedEvents: boolean
  compactView: boolean
}

interface CalendarActions {
  setCurrentDate: (date: Date) => void
  setView: (view: CalendarView) => void
  setSelectedDate: (date: Date | null) => void
  setShowWeekends: (show: boolean) => void
  setShowCompletedEvents: (show: boolean) => void
  setCompactView: (compact: boolean) => void
  goToToday: () => void
  goToPrevious: () => void
  goToNext: () => void
  goToDate: (date: Date) => void
}

type CalendarStore = CalendarState & CalendarActions

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set, get) => ({
      // State
      currentDate: new Date(),
      view: 'month',
      selectedDate: null,
      showWeekends: true,
      showCompletedEvents: true,
      compactView: false,

      // Actions
      setCurrentDate: (date: Date) => {
        set({ currentDate: date })
      },

      setView: (view: CalendarView) => {
        set({ view })
      },

      setSelectedDate: (date: Date | null) => {
        set({ selectedDate: date })
      },

      setShowWeekends: (show: boolean) => {
        set({ showWeekends: show })
      },

      setShowCompletedEvents: (show: boolean) => {
        set({ showCompletedEvents: show })
      },

      setCompactView: (compact: boolean) => {
        set({ compactView: compact })
      },

      goToToday: () => {
        set({ currentDate: new Date() })
      },

      goToPrevious: () => {
        const { currentDate, view } = get()
        const newDate = new Date(currentDate)

        switch (view) {
          case 'month':
            newDate.setMonth(newDate.getMonth() - 1)
            break
          case 'week':
            newDate.setDate(newDate.getDate() - 7)
            break
          case 'day':
            newDate.setDate(newDate.getDate() - 1)
            break
        }

        set({ currentDate: newDate })
      },

      goToNext: () => {
        const { currentDate, view } = get()
        const newDate = new Date(currentDate)

        switch (view) {
          case 'month':
            newDate.setMonth(newDate.getMonth() + 1)
            break
          case 'week':
            newDate.setDate(newDate.getDate() + 7)
            break
          case 'day':
            newDate.setDate(newDate.getDate() + 1)
            break
        }

        set({ currentDate: newDate })
      },

      goToDate: (date: Date) => {
        set({ currentDate: date, selectedDate: date })
      },
    }),
    {
      name: 'calendar-storage',
      partialize: (state) => ({
        view: state.view,
        showWeekends: state.showWeekends,
        showCompletedEvents: state.showCompletedEvents,
        compactView: state.compactView,
      }),
    }
  )
)
