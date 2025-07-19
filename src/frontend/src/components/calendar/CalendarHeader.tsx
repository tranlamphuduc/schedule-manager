'use client'

import React from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui'
import { useCalendarStore } from '@/store/calendarStore'
import { MONTHS, CALENDAR_VIEWS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface CalendarHeaderProps {
  className?: string
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ className }) => {
  const {
    currentDate,
    view,
    setView,
    goToPrevious,
    goToNext,
    goToToday,
  } = useCalendarStore()

  const getTitle = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const date = currentDate.getDate()

    switch (view) {
      case 'month':
        return `${MONTHS[month]} ${year}`
      case 'week':
        // Get week range
        const startOfWeek = new Date(currentDate)
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1)
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        
        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
          return `${startOfWeek.getDate()}-${endOfWeek.getDate()} ${MONTHS[startOfWeek.getMonth()]} ${year}`
        } else {
          return `${startOfWeek.getDate()} ${MONTHS[startOfWeek.getMonth()]} - ${endOfWeek.getDate()} ${MONTHS[endOfWeek.getMonth()]} ${year}`
        }
      case 'day':
        return `${date} ${MONTHS[month]} ${year}`
      default:
        return ''
    }
  }

  const getNavigationLabel = () => {
    switch (view) {
      case 'month':
        return 'tháng'
      case 'week':
        return 'tuần'
      case 'day':
        return 'ngày'
      default:
        return ''
    }
  }

  return (
    <div className={cn('flex items-center justify-between p-4 border-b', className)}>
      {/* Left side - Navigation */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          Hôm nay
        </Button>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous {getNavigationLabel()}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next {getNavigationLabel()}</span>
          </Button>
        </div>
      </div>

      {/* Center - Title */}
      <div className="flex-1 text-center">
        <h2 className="text-lg font-semibold">{getTitle()}</h2>
      </div>

      {/* Right side - View Toggle */}
      <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
        {Object.entries(CALENDAR_VIEWS).map(([key, value]) => (
          <Button
            key={key}
            variant={view === value ? "default" : "ghost"}
            size="sm"
            onClick={() => setView(value as any)}
            className="h-8 px-3"
          >
            {key === 'MONTH' && 'Tháng'}
            {key === 'WEEK' && 'Tuần'}
            {key === 'DAY' && 'Ngày'}
          </Button>
        ))}
      </div>
    </div>
  )
}

export default CalendarHeader
