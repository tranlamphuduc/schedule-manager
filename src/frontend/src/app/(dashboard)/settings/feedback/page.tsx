'use client'

import React, { useState } from 'react'
import { MessageSquare, Bug, Lightbulb, Star, Send, Heart } from 'lucide-react'

export default function FeedbackPage() {
  const [feedbackType, setFeedbackType] = useState('general')
  const [rating, setRating] = useState(0)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const feedbackTypes = [
    { id: 'general', name: 'Phản hồi chung', icon: MessageSquare, color: '#3b82f6' },
    { id: 'bug', name: 'Báo lỗi', icon: Bug, color: '#ef4444' },
    { id: 'feature', name: 'Đề xuất tính năng', icon: Lightbulb, color: '#f59e0b' },
    { id: 'rating', name: 'Đánh giá ứng dụng', icon: Star, color: '#10b981' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subject.trim() || !message.trim()) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    setIsSubmitting(true)
    
    // TODO: Submit feedback to API
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Reset form
    setSubject('')
    setMessage('')
    setRating(0)
    setIsSubmitting(false)
    
    alert('Cảm ơn bạn đã gửi phản hồi! Chúng tôi sẽ xem xét và phản hồi sớm nhất có thể.')
  }

  const StarRating = () => (
    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.25rem'
          }}
        >
          <Star
            style={{
              width: '24px',
              height: '24px',
              color: star <= rating ? '#f59e0b' : '#d1d5db',
              fill: star <= rating ? '#f59e0b' : 'none'
            }}
          />
        </button>
      ))}
      <span style={{
        marginLeft: '0.5rem',
        fontSize: '0.875rem',
        color: '#64748b'
      }}>
        {rating > 0 ? `${rating}/5 sao` : 'Chưa đánh giá'}
      </span>
    </div>
  )

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
          💬 Phản hồi & Hỗ trợ
        </h1>
        <p style={{ 
          color: '#64748b', 
          margin: 0,
          fontSize: '1rem'
        }}>
          Chia sẻ ý kiến của bạn để giúp chúng tôi cải thiện ứng dụng
        </p>
      </div>

      <div style={{
        display: 'grid',
        gap: '2rem',
        gridTemplateColumns: '2fr 1fr'
      }}>
        {/* Feedback Form */}
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
            <Send style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>
              Gửi phản hồi
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Feedback Type */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.75rem',
                color: '#374151'
              }}>
                Loại phản hồi
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {feedbackTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <div
                      key={type.id}
                      onClick={() => setFeedbackType(type.id)}
                      style={{
                        padding: '1rem',
                        border: feedbackType === type.id ? `2px solid ${type.color}` : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: feedbackType === type.id ? `${type.color}10` : 'white',
                        transition: 'all 0.2s',
                        textAlign: 'center'
                      }}
                    >
                      <Icon style={{ 
                        width: '24px', 
                        height: '24px', 
                        color: type.color,
                        margin: '0 auto 0.5rem'
                      }} />
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#1e293b'
                      }}>
                        {type.name}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Rating for rating type */}
            {feedbackType === 'rating' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.75rem',
                  color: '#374151'
                }}>
                  Đánh giá của bạn
                </label>
                <StarRating />
              </div>
            )}

            {/* Subject */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151'
              }}>
                Tiêu đề *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Nhập tiêu đề phản hồi"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Message */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151'
              }}>
                Nội dung *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mô tả chi tiết phản hồi của bạn..."
                required
                rows={6}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151'
              }}>
                Email liên hệ (tùy chọn)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
              <p style={{
                fontSize: '0.75rem',
                color: '#64748b',
                marginTop: '0.25rem',
                margin: 0
              }}>
                Để chúng tôi có thể phản hồi lại bạn
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.875rem',
                backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {isSubmitting ? '📤 Đang gửi...' : '📤 Gửi phản hồi'}
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Contact Info */}
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
              <Heart style={{ width: '20px', height: '20px', color: '#ef4444' }} />
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1e293b',
                margin: 0
              }}>
                Liên hệ khác
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: '#1e293b',
                  margin: 0,
                  marginBottom: '0.5rem'
                }}>
                  📧 Email hỗ trợ
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  margin: 0
                }}>
                  tranlamphuducc3tieucan22@gmail.com
                </p>
              </div>

              <div style={{
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: '#1e293b',
                  margin: 0,
                  marginBottom: '0.5rem'
                }}>
                  🕐 Thời gian hỗ trợ
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  margin: 0
                }}>
                  Thứ 2 - Thứ 6: 9:00 - 18:00<br />
                  Thứ 7 - CN: 10:00 - 16:00
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0,
              marginBottom: '1.5rem'
            }}>
              ❓ Câu hỏi thường gặp
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <details style={{
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <summary style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#1e293b',
                  cursor: 'pointer'
                }}>
                  Làm sao để đồng bộ dữ liệu?
                </summary>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  marginTop: '0.5rem',
                  margin: 0
                }}>
                  Dữ liệu được lưu trữ cục bộ trên thiết bị của bạn. Tính năng đồng bộ đám mây sẽ có trong phiên bản tương lai.
                </p>
              </details>

              <details style={{
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <summary style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#1e293b',
                  cursor: 'pointer'
                }}>
                  Tôi có thể xuất dữ liệu không?
                </summary>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  marginTop: '0.5rem',
                  margin: 0
                }}>
                  Hiện tại chưa hỗ trợ xuất dữ liệu. Tính năng này đang được phát triển và sẽ có trong bản cập nhật tiếp theo.
                </p>
              </details>

              <details style={{
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <summary style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#1e293b',
                  cursor: 'pointer'
                }}>
                  Ứng dụng có miễn phí không?
                </summary>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  marginTop: '0.5rem',
                  margin: 0
                }}>
                  Có, Schedule Manager hoàn toàn miễn phí sử dụng với đầy đủ tính năng.
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
