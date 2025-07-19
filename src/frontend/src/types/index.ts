// User types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface UserSettings {
  id: string
  userId: string
  theme: 'light' | 'dark' | 'system'
  language: 'vi' | 'en'
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    reminder: boolean
  }
  calendar: {
    defaultView: 'month' | 'week' | 'day'
    weekStartsOn: 0 | 1 // 0 = Sunday, 1 = Monday
    workingHours: {
      start: string // HH:mm format
      end: string   // HH:mm format
    }
  }
}

// Event types
export interface Event {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  allDay: boolean
  categoryId: string
  userId: string
  location?: string
  reminder?: {
    enabled: boolean
    minutes: number // minutes before event
  }
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: number
    endDate?: Date
  }
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  color: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

// Notification types
export interface Notification {
  id: string
  userId: string
  eventId?: string
  title: string
  message: string
  type: 'reminder' | 'info' | 'warning' | 'error'
  read: boolean
  createdAt: Date
}

// API types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface EventForm {
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
}

// Calendar types
export type CalendarView = 'month' | 'week' | 'day'

export interface CalendarState {
  currentDate: Date
  view: CalendarView
  selectedDate?: Date
  events: Event[]
  categories: Category[]
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'

// Component props types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ModalProps extends BaseComponentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
}

export interface FormProps extends BaseComponentProps {
  onSubmit: (data: any) => void
  loading?: boolean
  disabled?: boolean
}
