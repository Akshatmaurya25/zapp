'use client'

import { DashboardLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useNotifications, Notification } from '@/hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'
import {
  Bell,
  BellRing,
  CheckCircle,
  Trash2,
  User,
  Loader2,
  RefreshCw,
  Settings,
  Filter
} from 'lucide-react'
import { useState } from 'react'

export default function NotificationsPage() {
  const {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createMockNotifications,
    getNotificationIcon,
    getNotificationColor,
    unreadCount,
    refetch,
    isMarkingAllAsRead
  } = useNotifications()

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.is_read
      case 'read': return notification.is_read
      default: return true
    }
  })

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }

    // Handle navigation based on notification type
    switch (notification.type) {
      case 'post':
      case 'like':
      case 'comment':
        if (notification.metadata?.post_id) {
          window.location.href = `/post/${notification.metadata.post_id}`
        }
        break
      case 'follow':
        if (notification.metadata?.actor_user_id) {
          window.location.href = `/user/${notification.metadata.actor_user_id}`
        }
        break
      case 'achievement':
        window.location.href = '/profile#achievements'
        break
      default:
        break
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-500/10 rounded-xl">
              {unreadCount > 0 ? (
                <BellRing className="h-6 w-6 text-primary-500" />
              ) : (
                <Bell className="h-6 w-6 text-primary-500" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">
                Notifications
              </h1>
              <p className="text-text-tertiary">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'You\'re all caught up!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            {unreadCount > 0 && (
              <Button
                onClick={() => markAllAsRead()}
                disabled={isMarkingAllAsRead}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isMarkingAllAsRead ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-text-tertiary" />
                <span className="text-sm text-text-secondary">Filter:</span>
                <div className="flex gap-1">
                  {(['all', 'unread', 'read'] as const).map((filterType) => (
                    <Button
                      key={filterType}
                      variant={filter === filterType ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setFilter(filterType)}
                      className="text-xs"
                    >
                      {filterType === 'all' && `All (${notifications.length})`}
                      {filterType === 'unread' && `Unread (${unreadCount})`}
                      {filterType === 'read' && `Read (${notifications.length - unreadCount})`}
                    </Button>
                  ))}
                </div>
              </div>

              <Button variant="ghost" size="sm" className="text-text-tertiary">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-2">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-500" />
                <p className="text-text-secondary">Loading notifications...</p>
              </CardContent>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <Bell className="h-12 w-12 mx-auto text-gray-600" />
                <div>
                  <p className="text-text-secondary text-lg">
                    {filter === 'all' ? 'No notifications yet' :
                     filter === 'unread' ? 'No unread notifications' :
                     'No read notifications'}
                  </p>
                  <p className="text-text-muted text-sm mt-2">
                    {filter === 'all' && "We'll notify you when something happens"}
                    {filter === 'unread' && "You're all caught up!"}
                    {filter === 'read' && "Read notifications will appear here"}
                  </p>
                </div>
                {notifications.length === 0 && (
                  <Button
                    variant="outline"
                    onClick={createMockNotifications}
                    className="mt-4"
                  >
                    Create Demo Notifications
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all duration-200 hover:shadow-lg cursor-pointer group ${
                  !notification.is_read
                    ? 'border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10'
                    : 'hover:bg-gray-800/30'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 text-2xl ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                            {notification.title}
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </h3>
                          <p className="text-text-secondary leading-relaxed">
                            {notification.message}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                              className="h-auto p-2 text-blue-400 hover:text-blue-300"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="h-auto p-2 text-gray-500 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                        <span className="text-sm text-text-muted">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                        {notification.metadata?.actor_name && (
                          <div className="flex items-center gap-1 text-sm text-text-tertiary">
                            <User className="h-3 w-3" />
                            {notification.metadata.actor_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}