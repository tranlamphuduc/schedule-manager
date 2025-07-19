import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface PasswordToggleProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  name?: string
  id?: string
}

const PasswordToggle: React.FC<PasswordToggleProps> = ({
  value,
  onChange,
  placeholder = "Nhập mật khẩu",
  className,
  disabled = false,
  name,
  id
}) => {
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0.75rem',
          paddingRight: '2.5rem',
          border: className?.includes('border-red-500') ? '2px solid #ef4444' : '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '0.875rem',
          backgroundColor: disabled ? '#f9fafb' : 'white',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          outline: 'none'
        }}
        disabled={disabled}
        name={name}
        id={id}
        onFocus={(e) => {
          if (!className?.includes('border-red-500')) {
            e.target.style.borderColor = '#3b82f6'
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
          }
        }}
        onBlur={(e) => {
          if (!className?.includes('border-red-500')) {
            e.target.style.borderColor = '#d1d5db'
            e.target.style.boxShadow = 'none'
          }
        }}
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        disabled={disabled}
        style={{
          position: 'absolute',
          right: '0.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          padding: '0.25rem',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          opacity: disabled ? 0.5 : 1
        }}
        onMouseOver={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = '#f3f4f6'
          }
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        {showPassword ? (
          <EyeOff style={{ width: '16px', height: '16px' }} />
        ) : (
          <Eye style={{ width: '16px', height: '16px' }} />
        )}
      </button>
    </div>
  )
}

export default PasswordToggle
