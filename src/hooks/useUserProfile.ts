'use client'

import { useState } from 'react'
import { useUser } from '@/contexts/UserContext'
import { CreateUserData, UpdateUserData } from '@/types'

export function useUserProfile() {
  const {
    user,
    isLoading,
    createUser,
    updateUser,
    checkUsernameAvailable,
    refreshUser
  } = useUser()

  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createProfile = async (profileData: CreateUserData) => {
    setIsCreating(true)
    setError(null)

    try {
      // Validate username availability if provided
      if (profileData.username) {
        const isAvailable = await checkUsernameAvailable(profileData.username)
        if (!isAvailable) {
          throw new Error('Username is already taken')
        }
      }

      const newUser = await createUser(profileData)
      return newUser
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create profile'
      setError(errorMessage)
      throw err
    } finally {
      setIsCreating(false)
    }
  }

  const updateProfile = async (profileData: UpdateUserData) => {
    setIsUpdating(true)
    setError(null)

    try {
      // Validate username availability if changing username
      if (profileData.username && profileData.username !== user?.username) {
        const isAvailable = await checkUsernameAvailable(profileData.username)
        if (!isAvailable) {
          throw new Error('Username is already taken')
        }
      }

      const updatedUser = await updateUser(profileData)
      return updatedUser
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      setError(errorMessage)
      throw err
    } finally {
      setIsUpdating(false)
    }
  }

  const validateUsername = async (username: string): Promise<boolean> => {
    if (!username || username.length < 3) {
      return false
    }

    // Check format (alphanumeric + underscore, no spaces)
    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (!usernameRegex.test(username)) {
      return false
    }

    // Check availability
    try {
      return await checkUsernameAvailable(username)
    } catch {
      return false
    }
  }

  const clearError = () => setError(null)

  return {
    // Current user state
    user,
    isLoading,
    
    // Profile operations
    createProfile,
    updateProfile,
    refreshUser,
    
    // Validation
    validateUsername,
    checkUsernameAvailable,
    
    // Operation states
    isCreating,
    isUpdating,
    isBusy: isCreating || isUpdating,
    
    // Error handling
    error,
    clearError,
    
    // Helper flags
    hasProfile: !!user,
    isProfileComplete: !!(user?.username && user?.display_name),
  }
}