'use client'

import React from 'react'
import { useCalendarStore } from '@/store/calendarStore'
import { useEventStore } from '@/store/eventStore'
import { DAYS_OF_WEEK_SHORT } from '@/lib/constants'
import { getDaysInMonth, startOfMonth, endOfMonth, isToday, isSameDay } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MonthViewProps {
  className?: string
}

const MonthView: React.FC<MonthViewProps> = ({ className }) => {
  const { currentDate, selectedDate, setSelectedDate, showWeekends } = useCalendarStore()
  const { events } = useEventStore()

  // Get all days in the current month
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = getDaysInMonth(currentDate)

  // Get the first day of the week for the month
  const startDay = monthStart.getDay()
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1 // Monday = 0

  // Add previous month days to fill the first week
  const previousMonthDays: Date[] = []
  for (let i = adjustedStartDay - 1; i >= 0; i--) {
    const day = new Date(monthStart)
    day.setDate(day.getDate() - (i + 1))
    previousMonthDays.push(day)
  }

  // Add next month days to fill the last week
  const nextMonthDays: Date[] = []
  const totalCells = 42 // 6 weeks * 7 days
  const currentCells = previousMonthDays.length + daysInMonth.length
  for (let i = 0; i < totalCells - currentCells; i++) {
    const day = new Date(monthEnd)
    day.setDate(day.getDate() + (i + 1))
    nextMonthDays.push(day)
  }

  const allDays = [...previousMonthDays, ...daysInMonth, ...nextMonthDays]

  // Filter days if weekends should be hidden
  const visibleDays = showWeekends ? allDays : allDays.filter(day => {
    const dayOfWeek = day.getDay()
    return dayOfWeek !== 0 && dayOfWeek !== 6 // Hide Sunday (0) and Saturday (6)
  })

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      if (event.allDay) {
        return day >= new Date(event.startDate.toDateString()) && 
               day <= new Date(event.endDate.toDateString())
      } else {
        return isSameDay(event.startDate, day)
      }
    })
  }

  const handleDayClick = (day: Date) => {
    setSelectedDate(day)
  }

  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === currentDate.getMonth()
  }

  const isWeekend = (day: Date) => {
    const dayOfWeek = day.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Days of week header */}
      <div className="grid grid-cols-7 border-b">
        {DAYS_OF_WEEK_SHORT.map((day, index) => {
          if (!showWeekends && (index === 0 || index === 6)) return null
          
          return (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0"
            >
              {day}
            </div>
          )
        })}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {visibleDays.map((day, index) => {
          const dayEvents = getEventsForDay(day)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isCurrentDay = isToday(day)
          const isOtherMonth = !isCurrentMonth(day)
          const isWeekendDay = isWeekend(day)

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'border-r border-b last:border-r-0 p-2 cursor-pointer hover:bg-accent/50 transition-colors min-h-[120px]',
                isSelected && 'bg-primary/10 border-primary',
                isCurrentDay && 'bg-primary/5',
                isOtherMonth && 'text-muted-foreground bg-muted/30',
                isWeekendDay && 'bg-muted/20'
              )}
              onClick={() => handleDayClick(day)}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'text-sm font-medium',
                    isCurrentDay && 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs',
                    isOtherMonth && 'text-muted-foreground'
                  )}
                >
                  {day.getDate()}
                </span>
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event, eventIndex) => (
                  <div
                    key={event.id}
                    className={cn(
                      'text-xs p-1 rounded truncate',
                      'bg-primary/20 text-primary border-l-2 border-primary'
                    )}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayEvents.length - 3} khác
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MonthView
