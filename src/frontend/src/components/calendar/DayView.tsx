'use client'

import React from 'react'
import { useCalendarStore } from '@/store/calendarStore'
import { useEventStore } from '@/store/eventStore'
import { isSameDay, formatTime, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface DayViewProps {
  className?: string
}

const DayView: React.FC<DayViewProps> = ({ className }) => {
  const { currentDate, selectedDate, setSelectedDate } = useCalendarStore()
  const { events } = useEventStore()

  const viewDate = selectedDate || currentDate

  // Generate time slots (24 hours with 30-minute intervals)
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2)
    const minute = (i % 2) * 30
    return {
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      hour,
      minute,
      index: i
    }
  })

  // Get events for the current day
  const dayEvents = events.filter(event => {
    if (event.allDay) {
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      return viewDate >= new Date(eventStart.toDateString()) && 
             viewDate <= new Date(eventEnd.toDateString())
    } else {
      return isSameDay(new Date(event.startDate), viewDate)
    }
  })

  const allDayEvents = dayEvents.filter(event => event.allDay)
  const timedEvents = dayEvents.filter(event => !event.allDay)

  const handleTimeSlotClick = (hour: number, minute: number) => {
    const newDate = new Date(viewDate)
    newDate.setHours(hour, minute, 0, 0)
    setSelectedDate(newDate)
    // TODO: Open event creation modal with pre-filled time
  }

  // Calculate event positioning for timed events
  const getEventStyle = (event: any) => {
    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)
    
    const startHour = startDate.getHours()
    const startMinute = startDate.getMinutes()
    const endHour = endDate.getHours()
    const endMinute = endDate.getMinutes()
    
    const startSlot = startHour * 2 + (startMinute >= 30 ? 1 : 0)
    const endSlot = endHour * 2 + (endMinute >= 30 ? 1 : 0)
    
    const top = startSlot * 30 + (startMinute % 30) // 30px per slot + minute offset
    const height = Math.max((endSlot - startSlot) * 30 + (endMinute % 30) - (startMinute % 30), 20)
    
    return {
      top: `${top}px`,
      height: `${height}px`,
    }
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="border-b p-4 bg-muted/30">
        <h2 className="text-lg font-semibold">{formatDate(viewDate)}</h2>
        <p className="text-sm text-muted-foreground">
          {dayEvents.length} sự kiện
        </p>
      </div>

      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="border-b p-4 bg-muted/10">
          <h3 className="text-sm font-medium mb-2">Cả ngày</h3>
          <div className="space-y-1">
            {allDayEvents.map((event) => (
              <div
                key={event.id}
                className="p-2 rounded bg-primary/20 text-primary border-l-4 border-primary"
              >
                <div className="font-medium">{event.title}</div>
                {event.description && (
                  <div className="text-sm opacity-75 mt-1">{event.description}</div>
                )}
                {event.location && (
                  <div className="text-xs opacity-60 mt-1">📍 {event.location}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1 overflow-auto relative">
        {/* Time slots */}
        {timeSlots.map((slot) => (
          <div
            key={slot.index}
            className={cn(
              'flex border-b border-gray-200 dark:border-gray-700 h-[30px] cursor-pointer hover:bg-accent/30',
              slot.minute === 0 && 'border-gray-300 dark:border-gray-600' // Stronger border for hour marks
            )}
            onClick={() => handleTimeSlotClick(slot.hour, slot.minute)}
          >
            {/* Time label */}
            <div className="w-16 border-r p-1 text-xs text-muted-foreground">
              {slot.minute === 0 && slot.time}
            </div>
            
            {/* Event area */}
            <div className="flex-1 relative">
              {/* Hour marker line */}
              {slot.minute === 0 && (
                <div className="absolute top-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700" />
              )}
            </div>
          </div>
        ))}

        {/* Timed events overlay */}
        <div className="absolute top-0 left-16 right-0 bottom-0">
          {timedEvents.map((event) => {
            const style = getEventStyle(event)
            const startTime = formatTime(new Date(event.startDate))
            const endTime = formatTime(new Date(event.endDate))
            
            return (
              <div
                key={event.id}
                className="absolute left-2 right-2 bg-primary/20 text-primary border-l-4 border-primary rounded p-2 overflow-hidden shadow-sm"
                style={style}
                title={`${event.title}\n${startTime} - ${endTime}`}
              >
                <div className="font-medium text-sm truncate">{event.title}</div>
                <div className="text-xs opacity-75">
                  {startTime} - {endTime}
                </div>
                {event.location && (
                  <div className="text-xs opacity-60 truncate">📍 {event.location}</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Current time indicator */}
        {isSameDay(viewDate, new Date()) && (
          <CurrentTimeIndicator />
        )}
      </div>
    </div>
  )
}

// Current time indicator component
const CurrentTimeIndicator: React.FC = () => {
  const [currentTime, setCurrentTime] = React.useState(new Date())

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  const hour = currentTime.getHours()
  const minute = currentTime.getMinutes()
  const top = hour * 60 + minute // 60px per hour

  return (
    <div
      className="absolute left-0 right-0 z-20"
      style={{ top: `${top}px` }}
    >
      <div className="flex items-center">
        <div className="w-16 text-xs text-primary font-medium text-right pr-2">
          {formatTime(currentTime)}
        </div>
        <div className="flex-1 h-0.5 bg-primary relative">
          <div className="absolute -left-1 -top-1 w-2 h-2 bg-primary rounded-full" />
        </div>
      </div>
    </div>
  )
}

export default DayView
