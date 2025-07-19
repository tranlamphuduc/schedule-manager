import { z } from 'zod'
import { VALIDATION, ERROR_MESSAGES } from './constants'

// Auth validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .email(ERROR_MESSAGES.INVALID_EMAIL),
  password: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .min(VALIDATION.PASSWORD_MIN_LENGTH, ERROR_MESSAGES.PASSWORD_TOO_SHORT),
})

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .min(VALIDATION.NAME_MIN_LENGTH, `Tên phải có ít nhất ${VALIDATION.NAME_MIN_LENGTH} ký tự`)
    .max(VALIDATION.NAME_MAX_LENGTH, `Tên không được quá ${VALIDATION.NAME_MAX_LENGTH} ký tự`),
  email: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .email(ERROR_MESSAGES.INVALID_EMAIL),
  password: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .min(VALIDATION.PASSWORD_MIN_LENGTH, ERROR_MESSAGES.PASSWORD_TOO_SHORT)
    .max(VALIDATION.PASSWORD_MAX_LENGTH, `Mật khẩu không được quá ${VALIDATION.PASSWORD_MAX_LENGTH} ký tự`),
  confirmPassword: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD),
}).refine((data) => data.password === data.confirmPassword, {
  message: ERROR_MESSAGES.PASSWORD_MISMATCH,
  path: ["confirmPassword"],
})

// Event validation schemas
export const eventSchema = z.object({
  title: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .min(VALIDATION.TITLE_MIN_LENGTH, `Tiêu đề phải có ít nhất ${VALIDATION.TITLE_MIN_LENGTH} ký tự`)
    .max(VALIDATION.TITLE_MAX_LENGTH, `Tiêu đề không được quá ${VALIDATION.TITLE_MAX_LENGTH} ký tự`),
  description: z
    .string()
    .max(VALIDATION.DESCRIPTION_MAX_LENGTH, `Mô tả không được quá ${VALIDATION.DESCRIPTION_MAX_LENGTH} ký tự`)
    .optional(),
  startDate: z
    .date({
      required_error: ERROR_MESSAGES.REQUIRED_FIELD,
      invalid_type_error: ERROR_MESSAGES.INVALID_DATE,
    }),
  endDate: z
    .date({
      required_error: ERROR_MESSAGES.REQUIRED_FIELD,
      invalid_type_error: ERROR_MESSAGES.INVALID_DATE,
    }),
  allDay: z.boolean().default(false),
  categoryId: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD),
  location: z
    .string()
    .max(255, "Địa điểm không được quá 255 ký tự")
    .optional(),
  reminder: z.object({
    enabled: z.boolean().default(false),
    minutes: z.number().min(0).max(10080).default(15), // Max 1 week
  }).optional(),
}).refine((data) => data.endDate >= data.startDate, {
  message: ERROR_MESSAGES.END_DATE_BEFORE_START,
  path: ["endDate"],
})

// Category validation schema
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .max(100, "Tên danh mục không được quá 100 ký tự"),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Màu sắc không hợp lệ"),
  description: z
    .string()
    .max(500, "Mô tả không được quá 500 ký tự")
    .optional(),
})

// User settings validation schema
export const userSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.enum(['vi', 'en']).default('vi'),
  timezone: z.string().default('Asia/Ho_Chi_Minh'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    reminder: z.boolean().default(true),
  }),
  calendar: z.object({
    defaultView: z.enum(['month', 'week', 'day']).default('month'),
    weekStartsOn: z.number().min(0).max(1).default(1),
    workingHours: z.object({
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Giờ không hợp lệ").default('08:00'),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Giờ không hợp lệ").default('17:00'),
    }),
  }),
})

// Profile update validation schema
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .min(VALIDATION.NAME_MIN_LENGTH, `Tên phải có ít nhất ${VALIDATION.NAME_MIN_LENGTH} ký tự`)
    .max(VALIDATION.NAME_MAX_LENGTH, `Tên không được quá ${VALIDATION.NAME_MAX_LENGTH} ký tự`),
  email: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .email(ERROR_MESSAGES.INVALID_EMAIL),
})

// Password change validation schema
export const passwordChangeSchema = z.object({
  currentPassword: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD),
  newPassword: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .min(VALIDATION.PASSWORD_MIN_LENGTH, ERROR_MESSAGES.PASSWORD_TOO_SHORT)
    .max(VALIDATION.PASSWORD_MAX_LENGTH, `Mật khẩu không được quá ${VALIDATION.PASSWORD_MAX_LENGTH} ký tự`),
  confirmNewPassword: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: ERROR_MESSAGES.PASSWORD_MISMATCH,
  path: ["confirmNewPassword"],
})

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type EventFormData = z.infer<typeof eventSchema>
export type CategoryFormData = z.infer<typeof categorySchema>
export type UserSettingsFormData = z.infer<typeof userSettingsSchema>
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>
