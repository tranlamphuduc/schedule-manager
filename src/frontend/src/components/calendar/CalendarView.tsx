'use client'

import React, { useEffect } from 'react'
import { useCalendarStore } from '@/store/calendarStore'
import { useEventStore } from '@/store/eventStore'
import CalendarHeader from './CalendarHeader'
import MonthView from './MonthView'
import WeekView from './WeekView'
import DayView from './DayView'
import { Card } from '@/components/ui'
import { cn } from '@/lib/utils'

interface CalendarViewProps {
  className?: string
}

const CalendarView: React.FC<CalendarViewProps> = ({ className }) => {
  const { view, currentDate } = useCalendarStore()
  const { fetchEvents, fetchCategories } = useEventStore()

  // Fetch events when component mounts or date changes
  useEffect(() => {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    
    fetchEvents(startDate, endDate)
    fetchCategories()
  }, [currentDate, fetchEvents, fetchCategories])

  const renderCalendarContent = () => {
    switch (view) {
      case 'month':
        return <MonthView />
      case 'week':
        return <WeekView />
      case 'day':
        return <DayView />
      default:
        return <MonthView />
    }
  }

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <CalendarHeader />
      <div className="flex-1 overflow-hidden">
        {renderCalendarContent()}
      </div>
    </Card>
  )
}

export default CalendarView
