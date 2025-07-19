// Shared types between frontend and backend

export interface User {
  id: string
  name: string
  email: string
  created_at: string
  updated_at?: string
}

export interface Category {
  id: string
  name: string
  color: string
  description?: string
  is_default: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description?: string
  start_date: Date | string
  end_date: Date | string
  all_day: boolean
  category_id: string
  location?: string
  reminder?: {
    enabled: boolean
    minutes: number
  }
  repeat?: {
    type: 'daily' | 'weekly' | 'monthly'
    end_date: Date | string
    dates?: (Date | string)[]
  }
  user_id: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'event' | 'system' | 'reminder'
  event_id?: string
  is_read: boolean
  scheduled_for?: Date | string
  user_id: string
  created_at: string
  updated_at: string
}

// API Response types
export interface ApiResponse<T = any> {
  message?: string
  error?: string
  data?: T
}

export interface AuthResponse {
  message: string
  token: string
  user: User
}

export interface EventsResponse {
  events: Event[]
}

export interface CategoriesResponse {
  categories: Category[]
}

export interface NotificationsResponse {
  notifications: Notification[]
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
  start_date: Date
  end_date: Date
  all_day: boolean
  category_id: string
  location?: string
  reminder?: {
    enabled: boolean
    minutes: number
  }
  repeat?: {
    type: 'daily' | 'weekly' | 'monthly'
    end_date: Date
    dates?: Date[]
  }
}

export interface CategoryForm {
  name: string
  color: string
  description?: string
  is_default?: boolean
}

// Statistics types
export interface EventStats {
  total_events: number
  upcoming_events: number
  past_events: number
}

export interface UserStats {
  total_events: number
  total_categories: number
  upcoming_events: number
  past_events: number
}

export interface NotificationStats {
  total_notifications: number
  unread_notifications: number
  event_notifications: number
  system_notifications: number
}

// Filter types
export interface EventFilters {
  start_date?: string
  end_date?: string
  category_id?: string
}

export interface NotificationFilters {
  type?: 'event' | 'system' | 'reminder'
  unread_only?: boolean
}

// Settings types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    sound: boolean
    reminders: boolean
  }
  calendar: {
    start_of_week: 'sunday' | 'monday'
    time_format: '12' | '24'
    default_view: 'month' | 'week' | 'day'
    show_weekends: boolean
  }
}
