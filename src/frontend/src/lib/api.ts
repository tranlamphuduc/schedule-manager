// API client for Schedule Manager Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

// Types
export interface User {
  id: string
  name: string
  email: string
  created_at: string
  updated_at?: string
}

export interface Event {
  id: string
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
    dates: Date[]
  }
  user_id: string
  created_at: string
  updated_at: string
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

// API Client class
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.loadToken()
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  private saveToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  private removeToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error)
      throw error
    }
  }

  // Auth methods
  async register(name: string, email: string, password: string) {
    const response = await this.request<{
      message: string
      token: string
      user: User
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })

    this.saveToken(response.token)
    return response
  }

  async login(email: string, password: string) {
    const response = await this.request<{
      message: string
      token: string
      user: User
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    this.saveToken(response.token)
    return response
  }

  async getCurrentUser() {
    return this.request<{ user: User }>('/auth/me')
  }

  async refreshToken() {
    const response = await this.request<{ token: string }>('/auth/refresh', {
      method: 'POST',
    })

    this.saveToken(response.token)
    return response
  }

  logout() {
    this.removeToken()
  }

  // Event methods
  async getEvents(params?: {
    start_date?: string
    end_date?: string
    category_id?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.start_date) searchParams.append('start_date', params.start_date)
    if (params?.end_date) searchParams.append('end_date', params.end_date)
    if (params?.category_id) searchParams.append('category_id', params.category_id)

    const query = searchParams.toString()
    return this.request<{ events: Event[] }>(`/events${query ? `?${query}` : ''}`)
  }

  async getEvent(id: string) {
    return this.request<{ event: Event }>(`/events/${id}`)
  }

  async createEvent(eventData: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    return this.request<{ message: string; event: Event }>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    })
  }

  async updateEvent(id: string, eventData: Partial<Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) {
    return this.request<{ message: string; event: Event }>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    })
  }

  async deleteEvent(id: string) {
    return this.request<{ message: string }>(`/events/${id}`, {
      method: 'DELETE',
    })
  }

  async getEventStats() {
    return this.request<{
      stats: {
        total_events: number
        upcoming_events: number
        past_events: number
      }
    }>('/events/stats/summary')
  }

  // Category methods
  async getCategories() {
    return this.request<{ categories: Category[] }>('/categories')
  }

  async getCategory(id: string) {
    return this.request<{ category: Category }>(`/categories/${id}`)
  }

  async createCategory(categoryData: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    return this.request<{ message: string; category: Category }>('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    })
  }

  async updateCategory(id: string, categoryData: Partial<Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) {
    return this.request<{ message: string; category: Category }>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    })
  }

  async deleteCategory(id: string) {
    return this.request<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    })
  }

  // User methods
  async updateProfile(userData: { name?: string; email?: string }) {
    return this.request<{ message: string; user: User }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<{ message: string }>('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  }

  // Notification methods
  async getNotifications() {
    return this.request<{ notifications: any[] }>('/notifications')
  }

  async markNotificationAsRead(id: string) {
    return this.request<{ message: string }>(`/notifications/${id}/read`, {
      method: 'PUT',
    })
  }

  // Health check
  async healthCheck() {
    return this.request<{
      status: string
      timestamp: string
      uptime: number
    }>('/health')
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL)

// Export individual methods for convenience
export const {
  register,
  login,
  getCurrentUser,
  refreshToken,
  logout,
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventStats,
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  updateProfile,
  changePassword,
  getNotifications,
  markNotificationAsRead,
  healthCheck
} = apiClient
