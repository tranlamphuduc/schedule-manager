'use client'

import React, { useState } from 'react'
import { Palette, Monitor, Sun, Moon, Eye, Type, Layout, Check } from 'lucide-react'

type Theme = 'light' | 'dark' | 'system'

const themeOptions = [
  {
    value: 'light' as Theme,
    label: 'Sáng',
    description: 'Giao diện sáng, dễ nhìn ban ngày',
    icon: Sun,
  },
  {
    value: 'dark' as Theme,
    label: 'Tối',
    description: 'Giao diện tối, dễ nhìn ban đêm',
    icon: Moon,
  },
  {
    value: 'system' as Theme,
    label: 'Tự động',
    description: 'Theo cài đặt hệ thống',
    icon: Monitor,
  },
]

const colorSchemes = [
  { id: 'blue', name: 'Xanh dương', color: '#3b82f6' },
  { id: 'green', name: 'Xanh lá', color: '#10b981' },
  { id: 'purple', name: 'Tím', color: '#8b5cf6' },
  { id: 'orange', name: 'Cam', color: '#f59e0b' },
  { id: 'red', name: 'Đỏ', color: '#ef4444' }
]

const fontSizes = [
  { id: 'small', name: 'Nhỏ', size: '14px' },
  { id: 'medium', name: 'Vừa', size: '16px' },
  { id: 'large', name: 'Lớn', size: '18px' }
]

export default function AppearancePage() {
  const [selectedTheme, setSelectedTheme] = useState<Theme>('system')
  const [colorScheme, setColorScheme] = useState('blue')
  const [fontSize, setFontSize] = useState('medium')
  const [showWeekends, setShowWeekends] = useState(true)
  const [showCompleted, setShowCompleted] = useState(true)
  const [compactMode, setCompactMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)

    // TODO: Save settings to localStorage or API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Apply theme
    if (selectedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (selectedTheme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    setIsSaving(false)
    alert('Đã lưu cài đặt thành công!')
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#1e293b',
          margin: 0,
          marginBottom: '0.5rem'
        }}>
          🎨 Cài đặt Giao diện
        </h1>
        <p style={{
          color: '#64748b',
          margin: 0,
          fontSize: '1rem'
        }}>
          Tùy chỉnh giao diện ứng dụng theo sở thích của bạn
        </p>
      </div>

      <div style={{
        display: 'grid',
        gap: '2rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
      }}>
        {/* Theme Selection */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <Palette style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>
              Chủ đề
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {themeOptions.map((option) => {
              const Icon = option.icon
              const isSelected = selectedTheme === option.value

              return (
                <div
                  key={option.value}
                  onClick={() => setSelectedTheme(option.value)}
                  style={{
                    padding: '1rem',
                    border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#f0f9ff' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: isSelected ? '#3b82f6' : '#f1f5f9',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon style={{
                        width: '20px',
                        height: '20px',
                        color: isSelected ? 'white' : '#64748b'
                      }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: '500',
                        color: '#1e293b',
                        marginBottom: '0.25rem'
                      }}>
                        {option.label}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#64748b'
                      }}>
                        {option.description}
                      </div>
                    </div>
                    {isSelected && (
                      <Check style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Color Scheme */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <Eye style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>
              Màu chủ đạo
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem' }}>
            {colorSchemes.map((color) => (
              <div
                key={color.id}
                onClick={() => setColorScheme(color.id)}
                style={{
                  padding: '1rem',
                  border: colorScheme === color.id ? `2px solid ${color.color}` : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: color.color,
                  borderRadius: '50%',
                  margin: '0 auto 0.5rem'
                }} />
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#1e293b'
                }}>
                  {color.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <Type style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>
              Kích thước chữ
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {fontSizes.map((size) => (
              <div
                key={size.id}
                onClick={() => setFontSize(size.id)}
                style={{
                  padding: '1rem',
                  border: fontSize === size.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: fontSize === size.id ? '#f0f9ff' : 'white',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  fontSize: size.size,
                  fontWeight: '500',
                  color: '#1e293b'
                }}>
                  {size.name} - Văn bản mẫu
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Display Options */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <Layout style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>
              Tùy chọn hiển thị
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: '#1e293b',
                  margin: 0,
                  marginBottom: '0.25rem'
                }}>
                  Hiển thị cuối tuần
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  margin: 0
                }}>
                  Hiển thị thứ 7 và chủ nhật trong lịch
                </p>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '44px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={showWeekends}
                  onChange={(e) => setShowWeekends(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: showWeekends ? '#3b82f6' : '#cbd5e1',
                  transition: '0.4s',
                  borderRadius: '24px'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '',
                    height: '18px',
                    width: '18px',
                    left: showWeekends ? '23px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    transition: '0.4s',
                    borderRadius: '50%'
                  }} />
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: '#1e293b',
                  margin: 0,
                  marginBottom: '0.25rem'
                }}>
                  Hiển thị sự kiện đã hoàn thành
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  margin: 0
                }}>
                  Hiển thị các sự kiện đã được đánh dấu hoàn thành
                </p>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '44px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: showCompleted ? '#3b82f6' : '#cbd5e1',
                  transition: '0.4s',
                  borderRadius: '24px'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '',
                    height: '18px',
                    width: '18px',
                    left: showCompleted ? '23px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    transition: '0.4s',
                    borderRadius: '50%'
                  }} />
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: '#1e293b',
                  margin: 0,
                  marginBottom: '0.25rem'
                }}>
                  Chế độ compact
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  margin: 0
                }}>
                  Hiển thị giao diện gọn hơn
                </p>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '44px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={compactMode}
                  onChange={(e) => setCompactMode(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: compactMode ? '#3b82f6' : '#cbd5e1',
                  transition: '0.4s',
                  borderRadius: '24px'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '',
                    height: '18px',
                    width: '18px',
                    left: compactMode ? '23px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    transition: '0.4s',
                    borderRadius: '50%'
                  }} />
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: '0.875rem 2rem',
            backgroundColor: isSaving ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {isSaving ? '💾 Đang lưu...' : '💾 Lưu cài đặt'}
        </button>
      </div>
    </div>
  )
}
