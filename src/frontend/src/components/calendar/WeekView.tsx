'use client'

import React from 'react'
import { useCalendarStore } from '@/store/calendarStore'
import { useEventStore } from '@/store/eventStore'
import { DAYS_OF_WEEK_SHORT } from '@/lib/constants'
import { getWeekDays, isToday, isSameDay, formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface WeekViewProps {
  className?: string
}

const WeekView: React.FC<WeekViewProps> = ({ className }) => {
  const { currentDate, selectedDate, setSelectedDate, showWeekends } = useCalendarStore()
  const { events } = useEventStore()

  // Get days for current week
  const weekDays = getWeekDays(currentDate)
  const visibleDays = showWeekends ? weekDays : weekDays.filter(day => {
    const dayOfWeek = day.getDay()
    return dayOfWeek !== 0 && dayOfWeek !== 6
  })

  // Generate time slots (24 hours)
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0')
    return `${hour}:00`
  })

  // Get events for a specific day and time
  const getEventsForDayAndTime = (day: Date, hour: number) => {
    return events.filter(event => {
      if (event.allDay) return false
      
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      
      return isSameDay(eventStart, day) && 
             eventStart.getHours() <= hour && 
             eventEnd.getHours() > hour
    })
  }

  // Get all-day events for a specific day
  const getAllDayEvents = (day: Date) => {
    return events.filter(event => {
      if (!event.allDay) return false
      
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      
      return day >= new Date(eventStart.toDateString()) && 
             day <= new Date(eventEnd.toDateString())
    })
  }

  const handleDayClick = (day: Date) => {
    setSelectedDate(day)
  }

  const handleTimeSlotClick = (day: Date, hour: number) => {
    const newDate = new Date(day)
    newDate.setHours(hour, 0, 0, 0)
    setSelectedDate(newDate)
    // TODO: Open event creation modal with pre-filled time
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header with days */}
      <div className="flex border-b bg-muted/30">
        {/* Time column header */}
        <div className="w-16 border-r p-2 text-center text-sm font-medium">
          Giờ
        </div>
        
        {/* Day headers */}
        {visibleDays.map((day, index) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isCurrentDay = isToday(day)
          
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'flex-1 border-r last:border-r-0 p-2 text-center cursor-pointer hover:bg-accent/50',
                isSelected && 'bg-primary/10',
                isCurrentDay && 'bg-primary/5'
              )}
              onClick={() => handleDayClick(day)}
            >
              <div className="text-xs text-muted-foreground">
                {DAYS_OF_WEEK_SHORT[day.getDay()]}
              </div>
              <div className={cn(
                'text-sm font-medium mt-1',
                isCurrentDay && 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mx-auto'
              )}>
                {day.getDate()}
              </div>
            </div>
          )
        })}
      </div>

      {/* All-day events row */}
      <div className="flex border-b bg-muted/10">
        <div className="w-16 border-r p-2 text-xs text-muted-foreground">
          Cả ngày
        </div>
        {visibleDays.map((day) => {
          const allDayEvents = getAllDayEvents(day)
          
          return (
            <div key={`allday-${day.toISOString()}`} className="flex-1 border-r last:border-r-0 p-1 min-h-[40px]">
              {allDayEvents.map((event) => (
                <div
                  key={event.id}
                  className="text-xs p-1 mb-1 rounded bg-primary/20 text-primary border-l-2 border-primary truncate"
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        {timeSlots.map((timeSlot, hourIndex) => (
          <div key={timeSlot} className="flex border-b border-gray-200 dark:border-gray-700 min-h-[60px]">
            {/* Time label */}
            <div className="w-16 border-r p-2 text-xs text-muted-foreground">
              {timeSlot}
            </div>
            
            {/* Day columns */}
            {visibleDays.map((day) => {
              const hourEvents = getEventsForDayAndTime(day, hourIndex)
              
              return (
                <div
                  key={`${day.toISOString()}-${hourIndex}`}
                  className="flex-1 border-r last:border-r-0 p-1 cursor-pointer hover:bg-accent/30 relative"
                  onClick={() => handleTimeSlotClick(day, hourIndex)}
                >
                  {hourEvents.map((event) => {
                    const eventStart = new Date(event.startDate)
                    const eventEnd = new Date(event.endDate)
                    const startMinutes = eventStart.getMinutes()
                    const duration = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60) // minutes
                    const height = Math.max((duration / 60) * 60, 20) // minimum 20px height
                    const top = (startMinutes / 60) * 60 // position based on minutes
                    
                    return (
                      <div
                        key={event.id}
                        className="absolute left-1 right-1 bg-primary/20 text-primary border-l-2 border-primary rounded text-xs p-1 overflow-hidden"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          zIndex: 10
                        }}
                        title={`${event.title}\n${formatTime(eventStart)} - ${formatTime(eventEnd)}`}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-xs opacity-75">
                          {formatTime(eventStart)} - {formatTime(eventEnd)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default WeekView
