'use client'

import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/contexts/UserContext'

export interface Notification {
  id: string
  user_id: string
  type: 'like' | 'comment' | 'follow' | 'mention' | 'achievement' | 'donation' | 'post'
  title: string
  message: string
  metadata?: {
    actor_user_id?: string
    actor_name?: string
    actor_avatar?: string
    post_id?: string
    achievement_id?: string
    amount?: string
  }
  is_read: boolean
  created_at: string
  updated_at: string
}

export function useNotifications() {
  const { user } = useUser()
  const queryClient = useQueryClient()

  // Fetch notifications
  const {
    data: notifications,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        throw new Error(`Failed to fetch notifications: ${error.message}`)
      }

      return data as Notification[]
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user?.id) throw new Error('User must be logged in')

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) {
        throw new Error(`Failed to mark notification as read: ${error.message}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User must be logged in')

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) {
        throw new Error(`Failed to mark all notifications as read: ${error.message}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  // Create notification (for testing/admin purposes)
  const createNotificationMutation = useMutation({
    mutationFn: async (notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notification,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create notification: ${error.message}`)
      }

      return data as Notification
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user?.id) throw new Error('User must be logged in')

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) {
        throw new Error(`Failed to delete notification: ${error.message}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  // Helper functions
  const unreadCount = notifications?.filter(n => !n.is_read).length || 0
  const hasUnread = unreadCount > 0

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like': return '❤️'
      case 'comment': return '💬'
      case 'follow': return '👥'
      case 'mention': return '📢'
      case 'achievement': return '🏆'
      case 'donation': return '💰'
      case 'post': return '📝'
      default: return '🔔'
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'like': return 'text-red-400'
      case 'comment': return 'text-blue-400'
      case 'follow': return 'text-green-400'
      case 'mention': return 'text-yellow-400'
      case 'achievement': return 'text-purple-400'
      case 'donation': return 'text-emerald-400'
      case 'post': return 'text-indigo-400'
      default: return 'text-gray-400'
    }
  }

  // Create mock notifications for demo
  const createMockNotifications = useCallback(async () => {
    if (!user?.id) return

    const mockNotifications = [
      {
        user_id: user.id,
        type: 'like' as const,
        title: 'New Like',
        message: 'Someone liked your post about gaming achievements',
        metadata: {
          actor_name: 'GamerPro123',
          post_id: 'mock-post-1'
        },
        is_read: false,
      },
      {
        user_id: user.id,
        type: 'achievement' as const,
        title: 'Achievement Unlocked!',
        message: 'You\'ve earned the "Content Creator" achievement',
        metadata: {
          achievement_id: 'first-post'
        },
        is_read: false,
      },
      {
        user_id: user.id,
        type: 'follow' as const,
        title: 'New Follower',
        message: 'CryptoGamer started following you',
        metadata: {
          actor_name: 'CryptoGamer',
          actor_user_id: 'mock-user-1'
        },
        is_read: true,
      },
    ]

    for (const notification of mockNotifications) {
      await createNotificationMutation.mutateAsync(notification)
    }
  }, [user?.id, createNotificationMutation])

  return {
    // Data
    notifications: notifications || [],
    unreadCount,
    hasUnread,

    // Loading states
    isLoading,
    isError,
    error: error?.message,

    // Actions
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    createNotification: createNotificationMutation.mutateAsync,
    deleteNotification: deleteNotificationMutation.mutateAsync,
    createMockNotifications,
    refetch,

    // Helpers
    getNotificationIcon,
    getNotificationColor,

    // Mutation states
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isCreating: createNotificationMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
  }
}