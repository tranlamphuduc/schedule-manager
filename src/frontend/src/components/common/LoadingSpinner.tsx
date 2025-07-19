import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  text 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className={cn('animate-spin', sizeClasses[size])} />
        {text && (
          <p className="text-sm text-muted-foreground">{text}</p>
        )}
      </div>
    </div>
  )
}

// Full page loading component
export const PageLoading: React.FC<{ text?: string }> = ({ text = 'Đang tải...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

// Card loading skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="bg-muted rounded-lg p-6 space-y-4">
        <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-muted-foreground/20 rounded"></div>
          <div className="h-3 bg-muted-foreground/20 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  )
}

// List loading skeleton
export const ListSkeleton: React.FC<{ items?: number; className?: string }> = ({ 
  items = 3, 
  className 
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="flex items-center space-x-4 p-4 border rounded-lg">
            <div className="w-10 h-10 bg-muted-foreground/20 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
              <div className="h-3 bg-muted-foreground/20 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Calendar loading skeleton
export const CalendarSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="h-6 bg-muted-foreground/20 rounded w-32"></div>
        <div className="flex space-x-2">
          <div className="h-8 w-16 bg-muted-foreground/20 rounded"></div>
          <div className="h-8 w-16 bg-muted-foreground/20 rounded"></div>
          <div className="h-8 w-16 bg-muted-foreground/20 rounded"></div>
        </div>
      </div>
      
      {/* Calendar grid */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="h-8 bg-muted-foreground/20 rounded"></div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, index) => (
            <div key={index} className="h-24 bg-muted-foreground/20 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner
