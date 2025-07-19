'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  Button, 
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui'
import { categorySchema, type CategoryFormData } from '@/lib/validations'
import { useEventStore } from '@/store/eventStore'
import { cn } from '@/lib/utils'

interface CategoryFormProps {
  category?: any // Category to edit, null for new category
  open: boolean
  onOpenChange: (open: boolean) => void
}

const predefinedColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#14B8A6', // Teal
  '#A855F7', // Violet
]

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  open,
  onOpenChange
}) => {
  const { createCategory, updateCategory, isLoading } = useEventStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#3B82F6')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      color: '#3B82F6',
      description: ''
    }
  })

  const watchedColor = watch('color')

  // Reset form when category changes
  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        color: category.color,
        description: category.description || ''
      })
      setSelectedColor(category.color)
    } else {
      reset({
        name: '',
        color: '#3B82F6',
        description: ''
      })
      setSelectedColor('#3B82F6')
    }
  }, [category, reset])

  // Update form when color changes
  useEffect(() => {
    setValue('color', selectedColor)
  }, [selectedColor, setValue])

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      setIsSubmitting(true)

      if (category) {
        await updateCategory(category.id, data)
      } else {
        await createCategory({
          ...data,
          userId: 'current-user-id' // TODO: Get from auth
        })
      }

      onOpenChange(false)
      reset()
    } catch (error) {
      console.error('Error saving category:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    reset()
  }

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
  }

  const loading = isLoading || isSubmitting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Tên danh mục *
            </label>
            <Input
              id="name"
              placeholder="Nhập tên danh mục"
              disabled={loading}
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Màu sắc *</label>
            
            {/* Predefined Colors */}
            <div className="grid grid-cols-6 gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all',
                    selectedColor === color 
                      ? 'border-foreground scale-110' 
                      : 'border-border hover:scale-105'
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>

            {/* Custom Color Input */}
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => handleColorSelect(e.target.value)}
                className="w-8 h-8 rounded border border-border cursor-pointer"
                disabled={loading}
              />
              <Input
                type="text"
                value={selectedColor}
                onChange={(e) => handleColorSelect(e.target.value)}
                placeholder="#3B82F6"
                disabled={loading}
                className="flex-1"
                {...register('color')}
              />
            </div>
            
            {errors.color && (
              <p className="text-sm text-red-500">{errors.color.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Mô tả
            </label>
            <textarea
              id="description"
              placeholder="Nhập mô tả danh mục (tùy chọn)"
              disabled={loading}
              {...register('description')}
              className={cn(
                "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                errors.description ? 'border-red-500' : ''
              )}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Xem trước</label>
            <div className="flex items-center space-x-3 p-3 border rounded-lg bg-muted/30">
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: selectedColor }}
              />
              <span className="font-medium">
                {watch('name') || 'Tên danh mục'}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : (category ? 'Cập nhật' : 'Tạo danh mục')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CategoryForm
