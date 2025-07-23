'use client'

import React, { useState, useEffect } from 'react'
import { CategoryStorage, useCategoryStorageListener } from '@/lib/categoryStorage'
import { EventStorage, useEventStorageListener } from '@/lib/eventStorage'
import { Category, Event } from '@/types'
import { apiClient } from '@/lib/api'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [events, setEvents] = useState<Event[]>([])

  // Load categories and events on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try API first for categories
        const categoriesResponse = await apiClient.getCategories()
        const apiCategories = categoriesResponse.categories.map((cat: any) => ({
          ...cat,
          categoryId: cat.id,
          userId: cat.user_id,
          isDefault: cat.is_default,
          createdAt: new Date(cat.created_at),
          updatedAt: new Date(cat.updated_at)
        }))

        setCategories(apiCategories)
        console.log('Categories page - Loaded categories from API:', apiCategories)

        // Try API for events
        const eventsResponse = await apiClient.getEvents()
        const apiEvents = eventsResponse.events.map((event: any) => ({
          ...event,
          startDate: new Date(event.start_date),
          endDate: new Date(event.end_date),
          categoryId: event.category_id,
          userId: event.user_id,
          recurrence: event.repeat
        }))

        setEvents(apiEvents)
        console.log('Categories page - Loaded events from API:', apiEvents)
      } catch (error) {
        console.error('API failed, using localStorage fallback:', error)

        // Fallback to localStorage
        const loadedCategories = CategoryStorage.loadCategories()
        const loadedEvents = EventStorage.loadEvents()
        setCategories(loadedCategories)
        setEvents(loadedEvents)
        console.log('Categories page - Loaded categories from localStorage:', loadedCategories)
        console.log('Categories page - Loaded events from localStorage:', loadedEvents)
      }
    }

    loadData()
  }, [])

  // Listen for storage changes
  useCategoryStorageListener((updatedCategories) => {
    setCategories(updatedCategories)
    console.log('Categories page - Categories updated from storage:', updatedCategories)
  })

  useEventStorageListener((updatedEvents) => {
    setEvents(updatedEvents)
    console.log('Categories page - Events updated from storage:', updatedEvents)
  })

  // Function to count events for a specific category
  const getEventCountForCategory = (categoryId: string): number => {
    return events.filter(event => event.categoryId === categoryId).length
  }

  // Function to check if category can be deleted
  const canDeleteCategory = (category: Category): boolean => {
    if (category.isDefault) return false
    const eventCount = getEventCountForCategory(category.id)
    return eventCount === 0
  }

  // Enhanced delete handler with better validation
  const handleDeleteWithValidation = (category: Category) => {
    if (category.isDefault) {
      alert('Không thể xóa danh mục mặc định!')
      return
    }

    const eventCount = getEventCountForCategory(category.id)
    if (eventCount > 0) {
      alert(`Không thể xóa danh mục này vì còn ${eventCount} sự kiện đang sử dụng. Vui lòng xóa hoặc chuyển các sự kiện sang danh mục khác trước.`)
      return
    }

    if (confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) {
      console.log('Categories page - Deleting category:', category.id)

      const success = CategoryStorage.deleteCategory(category.id)
      if (success) {
        const updatedCategories = CategoryStorage.loadCategories()
        setCategories(updatedCategories)
        alert('Danh mục đã được xóa!')
      } else {
        alert('Lỗi: Không thể xóa danh mục!')
      }
    }
  }

  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
    description: ''
  })

  const predefinedColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
    '#ec4899', '#6366f1', '#14b8a6', '#eab308'
  ]

  const handleAdd = () => {
    setEditingCategory(null)
    setFormData({ name: '', color: '#3b82f6', description: '' })
    setShowForm(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      color: category.color,
      description: category.description || ''
    })
    setShowForm(true)
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên danh mục')
      return
    }

    if (editingCategory) {
      // Update existing category
      console.log('Categories page - Updating category:', editingCategory.id, formData)

      const updatedCategory = CategoryStorage.updateCategory(editingCategory.id, {
        ...formData,
        userId: editingCategory.userId,
        createdAt: editingCategory.createdAt,
        updatedAt: new Date()
      })
      if (updatedCategory) {
        const updatedCategories = CategoryStorage.loadCategories()
        setCategories(updatedCategories)
        alert('Danh mục đã được cập nhật!')
      } else {
        alert('Lỗi: Không thể cập nhật danh mục!')
      }
    } else {
      // Add new category
      console.log('Categories page - Adding new category:', formData)

      try {
        // Try API first
        const response = await apiClient.createCategory({
          name: formData.name,
          color: formData.color,
          description: formData.description,
          is_default: false
        })

        // Add to local state
        const newCategory = {
          ...response.category,
          categoryId: response.category.id,
          userId: response.category.user_id,
          isDefault: response.category.is_default,
          createdAt: new Date(response.category.created_at),
          updatedAt: new Date(response.category.updated_at)
        }

        setCategories(prev => [...prev, newCategory])
        alert('Danh mục đã được tạo thành công!')
      } catch (error) {
        console.error('API failed, using localStorage fallback:', error)

        // Fallback to localStorage
        const newCategory = CategoryStorage.addCategory({
          ...formData,
          userId: 'current-user',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        const updatedCategories = CategoryStorage.loadCategories()
        setCategories(updatedCategories)
        alert('Danh mục đã được tạo thành công (offline)!')
      }
    }

    setShowForm(false)
    setEditingCategory(null)
    setFormData({ name: '', color: '#3b82f6', description: '' })
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '0.5rem'
            }}>
              🏷️ Danh mục
            </h1>
            <p style={{ color: '#64748b' }}>
              Quản lý danh mục để phân loại sự kiện
            </p>
          </div>

          <button
            onClick={handleAdd}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '500',
              fontSize: '0.875rem'
            }}
          >
            ➕ Thêm danh mục
          </button>
        </div>

        {/* Categories Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {categories.map((category) => (
            <div key={category.id} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {/* Color bar */}
              <div style={{
                height: '4px',
                backgroundColor: category.color
              }}></div>

              <div style={{ padding: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: category.color,
                        borderRadius: '4px'
                      }}></div>
                      <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#1e293b',
                        margin: 0
                      }}>
                        {category.name}
                      </h3>
                      {category.isDefault && (
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#dbeafe',
                          color: '#1e40af',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          Mặc định
                        </span>
                      )}
                    </div>

                    {category.description && (
                      <p style={{
                        color: '#64748b',
                        fontSize: '0.875rem',
                        margin: 0,
                        lineHeight: 1.5
                      }}>
                        {category.description}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleEdit(category)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>

                    {!category.isDefault && (
                      <button
                        onClick={() => handleDeleteWithValidation(category)}
                        disabled={!canDeleteCategory(category)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: canDeleteCategory(category) ? '#fef2f2' : '#f8fafc',
                          border: `1px solid ${canDeleteCategory(category) ? '#fecaca' : '#e2e8f0'}`,
                          borderRadius: '6px',
                          cursor: canDeleteCategory(category) ? 'pointer' : 'not-allowed',
                          fontSize: '0.875rem',
                          color: canDeleteCategory(category) ? '#dc2626' : '#94a3b8',
                          opacity: canDeleteCategory(category) ? 1 : 0.6
                        }}
                        title={
                          canDeleteCategory(category)
                            ? "Xóa danh mục"
                            : `Không thể xóa - có ${getEventCountForCategory(category.id)} sự kiện đang sử dụng`
                        }
                      >
                        🗑️
                      </button>
                    )}

                    {category.isDefault && (
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        color: '#0369a1',
                        fontWeight: '500'
                      }}>
                        Mặc định
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: '0.875rem',
                    color: '#64748b'
                  }}>
                    Số sự kiện
                  </span>
                  <span style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    minWidth: '2rem',
                    textAlign: 'center',
                    border: '1px solid #e2e8f0'
                  }}>
                    {getEventCountForCategory(category.id)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1rem'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '1.5rem'
              }}>
                {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
              </h2>

              <form onSubmit={handleSubmit}>
                {/* Name */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Tên danh mục *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem'
                    }}
                    placeholder="Nhập tên danh mục"
                    required
                  />
                </div>

                {/* Color */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Màu sắc
                  </label>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: color,
                          border: formData.color === color ? '3px solid #1e293b' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>

                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    style={{
                      width: '100%',
                      height: '40px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                {/* Description */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                    placeholder="Mô tả danh mục (tùy chọn)"
                  />
                </div>

                {/* Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    {editingCategory ? 'Cập nhật' : 'Thêm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
