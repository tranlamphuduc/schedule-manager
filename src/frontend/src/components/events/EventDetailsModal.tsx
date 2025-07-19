'use client'

import React, { useState } from 'react'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button
} from '@/components/ui'
import { 
  Calendar,
  Clock,
  MapPin,
  Tag,
  Bell,
  Edit,
  Trash2,
  X
} from 'lucide-react'
import { useEventStore } from '@/store/eventStore'
import { formatDateTime, formatDate, formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Event } from '@/types'

interface EventDetailsModalProps {
  event: Event | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (event: Event) => void
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  open,
  onOpenChange,
  onEdit
}) => {
  const { deleteEvent, isLoading } = useEventStore()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!event) return null

  const handleEdit = () => {
    onEdit?.(event)
    onOpenChange(false)
  }

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    try {
      setIsDeleting(true)
      await deleteEvent(event.id)
      onOpenChange(false)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Error deleting event:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  const getEventDuration = () => {
    const start = new Date(event.startDate)
    const end = new Date(event.endDate)
    const diffMs = end.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes > 0 ? `${diffMinutes}m` : ''}`
    }
    return `${diffMinutes}m`
  }

  const loading = isLoading || isDeleting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate pr-2">{event.title}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Description */}
          {event.description && (
            <div>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>
          )}

          {/* Date and Time */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {event.allDay ? (
                  formatDate(new Date(event.startDate))
                ) : (
                  formatDateTime(new Date(event.startDate))
                )}
              </span>
            </div>

            {!event.allDay && (
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {formatTime(new Date(event.startDate))} - {formatTime(new Date(event.endDate))}
                  <span className="text-muted-foreground ml-2">
                    ({getEventDuration()})
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
          )}

          {/* Category */}
          <div className="flex items-center space-x-2 text-sm">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#3B82F6' }} // TODO: Get from category
              />
              <span>Công việc</span> {/* TODO: Get category name */}
            </span>
          </div>

          {/* Reminder */}
          {event.reminder?.enabled && (
            <div className="flex items-center space-x-2 text-sm">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span>
                Nhắc nhở {event.reminder.minutes} phút trước
              </span>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center space-x-2">
            <div className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              'bg-green-100 text-green-800' // TODO: Dynamic based on status
            )}>
              Đang hoạt động
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col space-y-2">
          {showDeleteConfirm ? (
            <div className="w-full space-y-2">
              <p className="text-sm text-center text-muted-foreground">
                Bạn có chắc chắn muốn xóa sự kiện này?
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCancelDelete}
                  disabled={loading}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1"
                >
                  {isDeleting ? 'Đang xóa...' : 'Xóa'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-2 w-full">
              <Button
                variant="outline"
                onClick={handleEdit}
                disabled={loading}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EventDetailsModal
