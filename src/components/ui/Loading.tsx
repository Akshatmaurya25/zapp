import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2, Zap } from 'lucide-react'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'pulse' | 'skeleton' | 'somnia'
  className?: string
  text?: string
  fullScreen?: boolean
}

export function Loading({
  size = 'md',
  variant = 'spinner',
  className,
  text,
  fullScreen = false
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background-primary/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <LoadingIcon variant={variant} size="xl" />
          {text && (
            <p className="text-text-secondary text-lg animate-pulse">
              {text}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex items-center justify-center gap-3",
      className
    )}>
      <LoadingIcon variant={variant} size={size} />
      {text && (
        <span className={cn(
          "text-text-secondary animate-pulse",
          textSizeClasses[size]
        )}>
          {text}
        </span>
      )}
    </div>
  )
}

function LoadingIcon({
  variant,
  size
}: {
  variant: LoadingProps['variant']
  size: LoadingProps['size']
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  switch (variant) {
    case 'somnia':
      return (
        <div className="relative">
          <div className={cn(
            "animate-spin rounded-full border-2 border-primary-500/30",
            sizeClasses[size || 'md']
          )}>
            <div className="absolute top-0 left-0 h-full w-full rounded-full border-t-2 border-primary-500" />
          </div>
          <Zap className={cn(
            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary-500",
            size === 'sm' ? 'h-2 w-2' :
            size === 'md' ? 'h-3 w-3' :
            size === 'lg' ? 'h-4 w-4' :
            'h-6 w-6'
          )} />
        </div>
      )

    case 'pulse':
      return (
        <div className={cn(
          "bg-primary-500 rounded-full animate-pulse",
          sizeClasses[size || 'md']
        )} />
      )

    case 'skeleton':
      return (
        <div className={cn(
          "bg-gray-700 rounded animate-pulse",
          sizeClasses[size || 'md']
        )} />
      )

    default:
      return (
        <Loader2 className={cn(
          "animate-spin text-primary-500",
          sizeClasses[size || 'md']
        )} />
      )
  }
}

// Skeleton component for loading placeholders
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-700/50",
        className
      )}
      {...props}
    />
  )
}

// Page loading component
export function PageLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loading variant="somnia" size="xl" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-text-primary">
            {text}
          </h2>
          <p className="text-text-tertiary">
            Please wait while we prepare everything for you...
          </p>
        </div>
      </div>
    </div>
  )
}

// Inline loading for components
export function InlineLoading({
  text = "Loading...",
  size = 'sm'
}: {
  text?: string
  size?: LoadingProps['size']
}) {
  return (
    <div className="flex items-center gap-2 text-text-tertiary">
      <Loading variant="spinner" size={size} />
      <span className="text-sm">{text}</span>
    </div>
  )
}