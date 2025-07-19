import React from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const Logo: React.FC<LogoProps> = ({ 
  className, 
  showText = true, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center justify-center rounded-lg bg-primary p-2">
        <Calendar className={cn('text-primary-foreground', sizeClasses[size])} />
      </div>
      {showText && (
        <span className={cn(
          'font-bold text-primary',
          textSizeClasses[size]
        )}>
          Schedule Manager
        </span>
      )}
    </div>
  )
}

export default Logo
