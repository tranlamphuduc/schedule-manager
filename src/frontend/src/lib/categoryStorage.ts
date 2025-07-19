// Category storage utilities for localStorage management

export interface Category {
  id: string
  name: string
  color: string
  description?: string
  isDefault?: boolean
}

const STORAGE_KEY_PREFIX = 'schedule-manager-categories'

// Get storage key for specific user
const getStorageKey = (userId: string) => `${STORAGE_KEY_PREFIX}-${userId}`

// Get current user ID from localStorage
const getCurrentUserId = (): string => {
  if (typeof window === 'undefined') return 'default-user'
  
  const currentUser = localStorage.getItem('schedule-manager-current-user')
  if (currentUser) {
    try {
      const user = JSON.parse(currentUser)
      return user.email || user.id || 'default-user'
    } catch (error) {
      console.error('Error parsing current user:', error)
    }
  }
  
  return 'default-user'
}

// Default category for new users (minimal setup)
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Chung', color: '#3b82f6', description: 'Danh mục mặc định', isDefault: true }
]

export const CategoryStorage = {
  // Load categories from localStorage for current user
  loadCategories(): Category[] {
    try {
      if (typeof window === 'undefined') return DEFAULT_CATEGORIES

      const userId = getCurrentUserId()
      const storageKey = getStorageKey(userId)
      const savedCategories = localStorage.getItem(storageKey)
      
      console.log(`Loading categories for user ${userId}:`, savedCategories)

      if (savedCategories && savedCategories !== 'undefined' && savedCategories !== 'null') {
        const parsedCategories = JSON.parse(savedCategories)
        console.log('Parsed categories:', parsedCategories)
        return parsedCategories
      }

      // Return default categories if no saved data for this user
      console.log(`No saved categories for user ${userId}, returning defaults`)
      this.saveCategories(DEFAULT_CATEGORIES)
      return DEFAULT_CATEGORIES
    } catch (error) {
      console.error('Error loading categories from localStorage:', error)
      return DEFAULT_CATEGORIES
    }
  },

  // Save categories to localStorage for current user
  saveCategories(categories: Category[]): void {
    try {
      if (typeof window === 'undefined') return

      const userId = getCurrentUserId()
      const storageKey = getStorageKey(userId)
      
      console.log(`Saving categories for user ${userId}:`, categories)
      localStorage.setItem(storageKey, JSON.stringify(categories))
      console.log('Categories saved successfully')

      // Dispatch custom event for cross-component sync
      window.dispatchEvent(new CustomEvent('categoriesUpdated', { 
        detail: { categories, userId } 
      }))
    } catch (error) {
      console.error('Error saving categories to localStorage:', error)
    }
  },

  // Add a new category
  addCategory(categoryData: Omit<Category, 'id'>): Category {
    const newCategory: Category = {
      ...categoryData,
      id: Date.now().toString(),
      isDefault: false
    }

    const currentCategories = this.loadCategories()
    const updatedCategories = [...currentCategories, newCategory]
    this.saveCategories(updatedCategories)

    return newCategory
  },

  // Update an existing category
  updateCategory(categoryId: string, categoryData: Omit<Category, 'id'>): Category | null {
    const currentCategories = this.loadCategories()
    const categoryIndex = currentCategories.findIndex(category => category.id === categoryId)

    if (categoryIndex === -1) {
      console.error('Category not found:', categoryId)
      return null
    }

    const updatedCategory: Category = {
      ...categoryData,
      id: categoryId,
      isDefault: currentCategories[categoryIndex].isDefault // Preserve isDefault
    }

    const updatedCategories = [...currentCategories]
    updatedCategories[categoryIndex] = updatedCategory
    this.saveCategories(updatedCategories)

    return updatedCategory
  },

  // Delete a category (only non-default ones)
  deleteCategory(categoryId: string): boolean {
    const currentCategories = this.loadCategories()
    const categoryToDelete = currentCategories.find(cat => cat.id === categoryId)

    if (!categoryToDelete) {
      console.error('Category not found for deletion:', categoryId)
      return false
    }

    if (categoryToDelete.isDefault) {
      console.error('Cannot delete default category:', categoryId)
      return false
    }

    const filteredCategories = currentCategories.filter(category => category.id !== categoryId)
    this.saveCategories(filteredCategories)
    return true
  },

  // Get category by ID
  getCategoryById(categoryId: string): Category | null {
    const categories = this.loadCategories()
    return categories.find(category => category.id === categoryId) || null
  },

  // Clear all categories for current user (for testing)
  clearCategories(): void {
    try {
      if (typeof window === 'undefined') return
      
      const userId = getCurrentUserId()
      const storageKey = getStorageKey(userId)
      localStorage.removeItem(storageKey)
      console.log(`All categories cleared for user ${userId}`)
    } catch (error) {
      console.error('Error clearing categories:', error)
    }
  }
}

// Hook for listening to storage changes for current user
export const useCategoryStorageListener = (callback: (categories: Category[]) => void) => {
  React.useEffect(() => {
    const currentUserId = getCurrentUserId()
    const currentStorageKey = getStorageKey(currentUserId)
    
    const handleStorageChange = (e: StorageEvent) => {
      // Only listen to changes for current user's storage key
      if (e.key === currentStorageKey && e.newValue) {
        try {
          const parsedCategories = JSON.parse(e.newValue)
          console.log(`Category storage change detected for user ${currentUserId}:`, parsedCategories)
          callback(parsedCategories)
        } catch (error) {
          console.error('Error parsing category storage event:', error)
        }
      }
    }

    const handleCustomEvent = (e: CustomEvent) => {
      // Only process events for current user
      if (e.detail.userId === currentUserId) {
        console.log(`Custom category event received for user ${currentUserId}:`, e.detail.categories)
        callback(e.detail.categories)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('categoriesUpdated', handleCustomEvent as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('categoriesUpdated', handleCustomEvent as EventListener)
    }
  }, [callback])
}

// Import React for the hook
import React from 'react'
