'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog content */}
      <div className="relative z-10 animate-slideUp">
        {children}
      </div>
    </div>
  )
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

export function DialogContent({ children, className }: DialogContentProps) {
  return (
    <div className={cn(
      'bg-gray-950 border border-gray-700 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto backdrop-blur-xl',
      className
    )}>
      {children}
    </div>
  )
}

interface DialogHeaderProps {
  children: React.ReactNode
  className?: string
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  )
}

interface DialogTitleProps {
  children: React.ReactNode
  className?: string
}

export function DialogTitle({ children, className }: DialogTitleProps) {
  return (
    <h2 className={cn('text-lg font-semibold text-gray-200', className)}>
      {children}
    </h2>
  )
}

interface DialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function DialogDescription({ children, className }: DialogDescriptionProps) {
  return (
    <p className={cn('text-sm text-gray-400 mt-2', className)}>
      {children}
    </p>
  )
}

interface DialogTriggerProps {
  children: React.ReactNode
  asChild?: boolean
  className?: string
  onClick?: () => void
}

export function DialogTrigger({ children, asChild, className, onClick }: DialogTriggerProps) {
  if (asChild) {
    // Clone the child element and add onClick
    const element = children as React.ReactElement
    return React.cloneElement(element, {
      onClick: onClick,
      className: cn(className, element.props?.className)
    })
  }

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  )
}