'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import {
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
  Loader2
} from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  onClose?: () => void
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
  maxToasts?: number
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? (toast.type === 'error' ? 6000 : 4000)
    }

    setToasts(prev => {
      const updated = [newToast, ...prev].slice(0, maxToasts)
      return updated
    })

    // Auto remove toast after duration (unless it's loading or duration is 0)
    if (toast.type !== 'loading' && newToast.duration! > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [maxToasts])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id)
      if (toast?.onClose) {
        toast.onClose()
      }
      return prev.filter(t => t.id !== id)
    })
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body
  )
}

interface ToastItemProps {
  toast: Toast
}

function ToastItem({ toast }: ToastItemProps) {
  const { removeToast } = useToast()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => removeToast(toast.id), 200)
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success-400" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-error-400" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning-400" />
      case 'info':
        return <Info className="h-5 w-5 text-info-400" />
      case 'loading':
        return <Loader2 className="h-5 w-5 text-primary-400 animate-spin" />
      default:
        return null
    }
  }

  const getColorClasses = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-success-500/10 border-success-500/20 text-success-400'
      case 'error':
        return 'bg-error-500/10 border-error-500/20 text-error-400'
      case 'warning':
        return 'bg-warning-500/10 border-warning-500/20 text-warning-400'
      case 'info':
        return 'bg-info-500/10 border-info-500/20 text-info-400'
      case 'loading':
        return 'bg-primary-500/10 border-primary-500/20 text-primary-400'
      default:
        return 'bg-background-elevated border-border-primary text-text-primary'
    }
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm',
        'transition-all duration-200 transform',
        getColorClasses(),
        isVisible
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-text-primary">
          {toast.title}
        </div>
        {toast.description && (
          <div className="text-sm text-text-secondary mt-1">
            {toast.description}
          </div>
        )}

        {/* Action Button */}
        {toast.action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toast.action.onClick}
            className="mt-2 h-auto p-1 text-current hover:bg-current/10"
          >
            {toast.action.label}
          </Button>
        )}
      </div>

      {/* Close Button */}
      {toast.type !== 'loading' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="flex-shrink-0 h-auto p-1 text-text-tertiary hover:text-text-primary hover:bg-current/10"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

// Convenience hooks for different toast types
export function useToastHelpers() {
  const { addToast } = useToast()

  return {
    success: (title: string, description?: string) =>
      addToast({ type: 'success', title, description }),

    error: (title: string, description?: string) =>
      addToast({ type: 'error', title, description }),

    warning: (title: string, description?: string) =>
      addToast({ type: 'warning', title, description }),

    info: (title: string, description?: string) =>
      addToast({ type: 'info', title, description }),

    loading: (title: string, description?: string) =>
      addToast({ type: 'loading', title, description, duration: 0 }),

    promise: async <T>(
      promise: Promise<T>,
      messages: {
        loading: string
        success: string | ((data: T) => string)
        error: string | ((error: any) => string)
      }
    ) => {
      const toastId = addToast({
        type: 'loading',
        title: messages.loading,
        duration: 0
      })

      try {
        const result = await promise
        const successMessage = typeof messages.success === 'function'
          ? messages.success(result)
          : messages.success

        addToast({
          type: 'success',
          title: successMessage
        })
        return result
      } catch (error) {
        const errorMessage = typeof messages.error === 'function'
          ? messages.error(error)
          : messages.error

        addToast({
          type: 'error',
          title: errorMessage
        })
        throw error
      } finally {
        // Remove loading toast
        setTimeout(() => {
          // This is handled by the removeToast in the context
        }, 100)
      }
    }
  }
}