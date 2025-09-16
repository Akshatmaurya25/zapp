"use client";

import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  CheckCircle,
  Trash2,
  User,
  ExternalLink,
  Loader2,
  X,
} from "lucide-react";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDropdown({
  isOpen,
  onClose,
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
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
    isMarkingAsRead,
    isMarkingAllAsRead,
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Handle navigation based on notification type
    switch (notification.type) {
      case "post":
      case "like":
      case "comment":
        if (notification.metadata?.post_id) {
          // Navigate to post
          window.location.href = `/post/${notification.metadata.post_id}`;
        }
        break;
      case "follow":
        if (notification.metadata?.actor_user_id) {
          // Navigate to user profile
          window.location.href = `/user/${notification.metadata.actor_user_id}`;
        }
        break;
      case "achievement":
        // Navigate to achievements tab in profile
        window.location.href = "/profile#achievements";
        break;
      default:
        break;
    }
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-80 z-50" ref={dropdownRef}>
      <Card className="border-gray-700 bg-gray-900/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsRead()}
                  disabled={isMarkingAllAsRead}
                  className="h-auto p-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  {isMarkingAllAsRead ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCircle className="h-3 w-3" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-auto p-1 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary-500" />
              <p className="text-sm text-gray-400">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center space-y-3">
              <Bell className="h-8 w-8 mx-auto text-gray-600" />
              <div>
                <p className="text-gray-400">No notifications yet</p>
                <p className="text-xs text-gray-500 mt-1">
                  We'll notify you when something happens
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={createMockNotifications}
                className="text-xs"
              >
                Create Demo Notifications
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-gray-800/50 cursor-pointer transition-colors group ${
                    !notification.is_read
                      ? "bg-blue-500/5 border-l-2 border-l-blue-500"
                      : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 text-lg ${getNotificationColor(
                        notification.type
                      )}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-medium text-white truncate">
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-1 ml-2">
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="h-auto p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            { addSuffix: true }
                          )}
                        </span>
                        {notification.metadata?.actor_name && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="h-3 w-3" />
                            {notification.metadata.actor_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.href = "/notifications";
                onClose();
              }}
              className="w-full text-xs"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View All Notifications
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
