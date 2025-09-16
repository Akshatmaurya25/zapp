'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useIPFS } from '@/hooks/useIPFS'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { MediaUpload } from '@/components/ui/MediaUpload'
import { Avatar } from '@/components/ui/Avatar'
import { User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { CreateUserData, MediaUpload as MediaUploadType } from '@/types'

interface ProfileSetupProps {
  onComplete?: () => void
  existingUser?: boolean
}

export function ProfileSetup({ onComplete, existingUser = false }: ProfileSetupProps) {
  const { address } = useWallet()
  const { user, createProfile, updateProfile, validateUsername, error, clearError, isBusy } = useUserProfile()

  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    bio: '',
    avatarIpfs: '',
    websiteUrl: '',
    twitterHandle: '',
    discordHandle: ''
  })

  // Store original username to allow keeping existing username
  const [originalUsername, setOriginalUsername] = useState('')

  // Pre-populate form data when editing existing user
  useEffect(() => {
    if (existingUser && user) {
      const userUsername = user.username || ''
      setOriginalUsername(userUsername)

      setFormData({
        username: userUsername,
        displayName: user.display_name || '',
        bio: user.bio || '',
        avatarIpfs: user.avatar_ipfs || '',
        websiteUrl: user.website_url || '',
        twitterHandle: user.twitter_handle || '',
        discordHandle: user.discord_handle || ''
      })

      // Set initial validation state for existing data
      if (user.username) {
        setValidation(prev => ({
          ...prev,
          username: { isValid: true, isChecking: false, message: 'Current username' }
        }))
      }

      if (user.display_name) {
        setValidation(prev => ({
          ...prev,
          displayName: { isValid: true, message: '' }
        }))
      }
    }
  }, [existingUser, user])
  
  const [validation, setValidation] = useState({
    username: { isValid: false, isChecking: false, message: '' },
    displayName: { isValid: false, message: '' }
  })

  // Stable reference for validateUsername to prevent infinite loops
  const validateUsernameStable = React.useCallback(validateUsername, [])
  
  // Stable reference for clearError
  const clearErrorStable = React.useCallback(clearError, [])
  
  // Ref to track validation requests and prevent race conditions
  const validationRequestId = useRef(0)

  // Username validation with debounce
  useEffect(() => {
    if (!formData.username) {
      setValidation(prev => ({
        ...prev,
        username: { isValid: false, isChecking: false, message: '' }
      }))
      return
    }

    if (formData.username.length < 3) {
      setValidation(prev => ({
        ...prev,
        username: { isValid: false, isChecking: false, message: 'Username must be at least 3 characters' }
      }))
      return
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (!usernameRegex.test(formData.username)) {
      setValidation(prev => ({
        ...prev,
        username: { isValid: false, isChecking: false, message: 'Username can only contain letters, numbers, and underscores' }
      }))
      return
    }

    // Set checking state
    setValidation(prev => ({
      ...prev,
      username: { ...prev.username, isChecking: true, message: 'Checking availability...' }
    }))

    const timeoutId = setTimeout(async () => {
      const currentUsername = formData.username
      const requestId = ++validationRequestId.current

      try {
        // If editing and username hasn't changed from original, it's valid
        if (existingUser && currentUsername === originalUsername) {
          if (requestId === validationRequestId.current && currentUsername === formData.username) {
            setValidation(prev => ({
              ...prev,
              username: {
                isValid: true,
                isChecking: false,
                message: 'Current username'
              }
            }))
          }
          return
        }

        const isValid = await validateUsernameStable(currentUsername)

        // Only update if this is the latest validation request and username hasn't changed
        if (requestId === validationRequestId.current && currentUsername === formData.username) {
          setValidation(prev => ({
            ...prev,
            username: {
              isValid,
              isChecking: false,
              message: isValid ? 'Username is available!' : 'Username is already taken'
            }
          }))
        }
      } catch (error) {
        console.error('Username validation error:', error)
        // Only show error if this is the latest request and username hasn't changed
        if (requestId === validationRequestId.current && currentUsername === formData.username) {
          setValidation(prev => ({
            ...prev,
            username: { isValid: false, isChecking: false, message: 'Error checking username' }
          }))
        }
      }
    }, 800)

    return () => clearTimeout(timeoutId)
  }, [formData.username, validateUsernameStable]) // Add validateUsernameStable back since it's now stable

  // Display name validation
  useEffect(() => {
    if (!formData.displayName) {
      setValidation(prev => ({
        ...prev,
        displayName: { isValid: false, message: '' }
      }))
      return
    }

    if (formData.displayName.length < 2) {
      setValidation(prev => ({
        ...prev,
        displayName: { isValid: false, message: 'Display name must be at least 2 characters' }
      }))
      return
    }

    setValidation(prev => ({
      ...prev,
      displayName: { isValid: true, message: 'Looks good!' }
    }))
  }, [formData.displayName])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    clearErrorStable()
  }

  const handleAvatarUpload = (uploads: MediaUploadType[]) => {
    if (uploads.length > 0 && uploads[0].ipfs_hash) {
      setFormData(prev => ({ ...prev, avatarIpfs: uploads[0].ipfs_hash! }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!address) return
    if (!validation.username.isValid || !validation.displayName.isValid) return

    try {
      const profileData: CreateUserData = {
        wallet_address: address,
        username: formData.username.toLowerCase(),
        display_name: formData.displayName,
        bio: formData.bio || undefined,
        avatar_ipfs: formData.avatarIpfs || undefined,
      }

      if (existingUser) {
        await updateProfile(profileData)
      } else {
        await createProfile(profileData)
      }

      onComplete?.()
    } catch (err) {
      // Error is handled by the hook
      console.error('Profile setup failed:', err)
    }
  }

  const isFormValid = validation.username.isValid && validation.displayName.isValid

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="border-gray-700 bg-gray-900/70 backdrop-blur">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <User className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              {existingUser ? 'Update Profile' : 'Complete Your Profile'}
            </CardTitle>
          </div>
          <CardDescription className="text-gray-300 text-lg">
            {existingUser 
              ? 'Update your profile information and settings'
              : 'Let\'s set up your profile to get started on Zapp'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Upload */}
            <div className="space-y-4">
              <div className="text-center">
                <label className="text-base font-semibold text-white block mb-2">
                  Profile Avatar
                </label>
                <p className="text-sm text-gray-400">Optional - Upload a profile picture</p>
              </div>
              
              <div className="flex flex-col items-center gap-6">
                <Avatar className="h-24 w-24 border-2 border-gray-700 hover:border-blue-500 transition-colors">
                  {formData.avatarIpfs ? (
                    <img 
                      src={`https://gateway.pinata.cloud/ipfs/${formData.avatarIpfs}`}
                      alt="Avatar preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-gray-800">
                      <User className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </Avatar>
                
                <div className="w-full max-w-xs">
                  <MediaUpload
                    accept="images"
                    maxFiles={1}
                    onFilesUploaded={handleAvatarUpload}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="space-y-3">
              <label htmlFor="username" className="text-base font-semibold text-white flex items-center gap-2">
                Username
                <span className="text-red-400">*</span>
                {existingUser && (
                  <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-md">
                    Username changes may affect your profile links
                  </span>
                )}
              </label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="your_username"
                  className="pr-12 py-3 text-base bg-gray-800/50 border-gray-600 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  {validation.username.isChecking ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                  ) : validation.username.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : formData.username && validation.username.message && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              {validation.username.message && (
                <div className={`flex items-center gap-2 text-sm ${
                  validation.username.isValid ? 'text-green-400' : 
                  validation.username.isChecking ? 'text-blue-400' : 'text-red-400'
                }`}>
                  {validation.username.isValid && <CheckCircle className="h-4 w-4" />}
                  {validation.username.isChecking && <Loader2 className="h-4 w-4 animate-spin" />}
                  {!validation.username.isValid && !validation.username.isChecking && <AlertCircle className="h-4 w-4" />}
                  <span>{validation.username.message}</span>
                </div>
              )}
            </div>

            {/* Display Name */}
            <div className="space-y-3">
              <label htmlFor="displayName" className="text-base font-semibold text-white flex items-center gap-2">
                Display Name
                <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Input
                  id="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="Your Display Name"
                  className="pr-12 py-3 text-base bg-gray-800/50 border-gray-600 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  {validation.displayName.isValid && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>
              {validation.displayName.message && (
                <div className={`flex items-center gap-2 text-sm ${
                  validation.displayName.isValid ? 'text-green-400' : 'text-red-400'
                }`}>
                  {validation.displayName.isValid ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span>{validation.displayName.message}</span>
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-3">
              <label htmlFor="bio" className="text-base font-semibold text-white">
                Bio <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="space-y-2">
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself, your gaming interests, achievements..."
                  rows={4}
                  maxLength={500}
                  className="text-base bg-gray-800/50 border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">
                    Share your gaming story and interests
                  </p>
                  <p className="text-sm text-gray-400">
                    {formData.bio.length}/500
                  </p>
                </div>
              </div>
            </div>

            {/* Website URL */}
            <div className="space-y-3">
              <label htmlFor="websiteUrl" className="text-base font-semibold text-white">
                Website <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <Input
                id="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                placeholder="https://yourwebsite.com"
                className="py-3 text-base bg-gray-800/50 border-gray-600 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>

            {/* Social Media Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Twitter Handle */}
              <div className="space-y-3">
                <label htmlFor="twitterHandle" className="text-base font-semibold text-white">
                  Twitter <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-base">@</span>
                  </div>
                  <Input
                    id="twitterHandle"
                    type="text"
                    value={formData.twitterHandle}
                    onChange={(e) => handleInputChange('twitterHandle', e.target.value)}
                    placeholder="username"
                    className="pl-8 py-3 text-base bg-gray-800/50 border-gray-600 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Discord Handle */}
              <div className="space-y-3">
                <label htmlFor="discordHandle" className="text-base font-semibold text-white">
                  Discord <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <Input
                  id="discordHandle"
                  type="text"
                  value={formData.discordHandle}
                  onChange={(e) => handleInputChange('discordHandle', e.target.value)}
                  placeholder="username#1234"
                  className="py-3 text-base bg-gray-800/50 border-gray-600 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-900/30 border border-red-600/50 rounded-xl backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-red-500/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-300">Profile Setup Error</p>
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-700">
              <Button
                type="submit"
                disabled={!isFormValid || isBusy}
                className="w-full py-4 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isBusy ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{existingUser ? 'Updating Profile...' : 'Creating Profile...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <User className="h-5 w-5" />
                    <span>{existingUser ? 'Update Profile' : 'Create Profile'}</span>
                  </div>
                )}
              </Button>
              
              {!isFormValid && (formData.username || formData.displayName) && (
                <p className="text-center text-sm text-gray-400 mt-3">
                  Please complete all required fields with valid information
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}