// App constants
export const APP_NAME = 'Schedule Manager'
export const APP_DESCRIPTION = 'Quản lý thời gian biểu và sự kiện hiệu quả'

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/signin',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/signout',
  },
  EVENTS: {
    BASE: '/api/events',
    BY_ID: (id: string) => `/api/events/${id}`,
  },
  USERS: {
    PROFILE: '/api/users/profile',
    SETTINGS: '/api/users/settings',
  },
  NOTIFICATIONS: {
    BASE: '/api/notifications',
    SEND: '/api/notifications/send',
  },
} as const

// Calendar constants
export const CALENDAR_VIEWS = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day',
} as const

export const DAYS_OF_WEEK = [
  'Chủ nhật',
  'Thứ hai',
  'Thứ ba',
  'Thứ tư',
  'Thứ năm',
  'Thứ sáu',
  'Thứ bảy',
] as const

export const DAYS_OF_WEEK_SHORT = [
  'CN',
  'T2',
  'T3',
  'T4',
  'T5',
  'T6',
  'T7',
] as const

export const MONTHS = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
] as const

// Event categories
export const DEFAULT_CATEGORIES = [
  { name: 'Công việc', color: '#3B82F6' },
  { name: 'Cá nhân', color: '#10B981' },
  { name: 'Gia đình', color: '#F59E0B' },
  { name: 'Sức khỏe', color: '#EF4444' },
  { name: 'Học tập', color: '#8B5CF6' },
  { name: 'Giải trí', color: '#06B6D4' },
] as const

// Notification types
export const NOTIFICATION_TYPES = {
  REMINDER: 'reminder',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
} as const

// Reminder options (in minutes)
export const REMINDER_OPTIONS = [
  { label: 'Không nhắc nhở', value: 0 },
  { label: '5 phút trước', value: 5 },
  { label: '10 phút trước', value: 10 },
  { label: '15 phút trước', value: 15 },
  { label: '30 phút trước', value: 30 },
  { label: '1 giờ trước', value: 60 },
  { label: '2 giờ trước', value: 120 },
  { label: '1 ngày trước', value: 1440 },
] as const

// Theme options
export const THEME_OPTIONS = [
  { label: 'Sáng', value: 'light' },
  { label: 'Tối', value: 'dark' },
  { label: 'Theo hệ thống', value: 'system' },
] as const

// Language options
export const LANGUAGE_OPTIONS = [
  { label: 'Tiếng Việt', value: 'vi' },
  { label: 'English', value: 'en' },
] as const

// Validation constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 50,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
} as const

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  TIME_ONLY: 'HH:mm',
  ISO: 'yyyy-MM-dd',
  ISO_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss",
} as const

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'schedule-manager-theme',
  LANGUAGE: 'schedule-manager-language',
  CALENDAR_VIEW: 'schedule-manager-calendar-view',
  USER_PREFERENCES: 'schedule-manager-user-preferences',
} as const

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Trường này là bắt buộc',
  INVALID_EMAIL: 'Email không hợp lệ',
  PASSWORD_TOO_SHORT: `Mật khẩu phải có ít nhất ${VALIDATION.PASSWORD_MIN_LENGTH} ký tự`,
  PASSWORD_MISMATCH: 'Mật khẩu xác nhận không khớp',
  INVALID_DATE: 'Ngày không hợp lệ',
  END_DATE_BEFORE_START: 'Ngày kết thúc phải sau ngày bắt đầu',
  NETWORK_ERROR: 'Lỗi kết nối mạng',
  UNAUTHORIZED: 'Bạn không có quyền truy cập',
  SERVER_ERROR: 'Lỗi máy chủ, vui lòng thử lại sau',
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  REGISTER_SUCCESS: 'Đăng ký thành công',
  EVENT_CREATED: 'Tạo sự kiện thành công',
  EVENT_UPDATED: 'Cập nhật sự kiện thành công',
  EVENT_DELETED: 'Xóa sự kiện thành công',
  SETTINGS_SAVED: 'Lưu cài đặt thành công',
  PROFILE_UPDATED: 'Cập nhật hồ sơ thành công',
} as const
