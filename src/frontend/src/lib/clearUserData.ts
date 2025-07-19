// Utility to clear all user data for testing

export const clearAllUserData = () => {
  if (typeof window === 'undefined') return

  // Get all localStorage keys
  const keys = Object.keys(localStorage)
  
  // Filter keys related to schedule manager
  const scheduleManagerKeys = keys.filter(key => 
    key.startsWith('schedule-manager-')
  )
  
  // Remove all schedule manager data
  scheduleManagerKeys.forEach(key => {
    localStorage.removeItem(key)
    console.log(`Removed: ${key}`)
  })
  
  console.log(`Cleared ${scheduleManagerKeys.length} localStorage items`)
}

export const clearCurrentUserData = () => {
  if (typeof window === 'undefined') return

  // Get current user
  const currentUser = localStorage.getItem('schedule-manager-current-user')
  if (!currentUser) return

  try {
    const user = JSON.parse(currentUser)
    const userId = user.email || user.id || 'default-user'
    
    // Clear user-specific data
    const keysToRemove = [
      `schedule-manager-events-${userId}`,
      `schedule-manager-categories-${userId}`,
      `schedule-manager-system-notifications-${userId}`,
      `schedule-manager-event-notifications-${userId}`
    ]
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      console.log(`Removed: ${key}`)
    })
    
    console.log(`Cleared data for user: ${userId}`)
  } catch (error) {
    console.error('Error clearing user data:', error)
  }
}

// For development/testing - call this in browser console
if (typeof window !== 'undefined') {
  (window as any).clearAllUserData = clearAllUserData;
  // (window as any).clearCurrentUserData = clearCurrentUserData;
}
