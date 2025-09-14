'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  ExternalLink
} from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorFallbackProps {
  error: Error | null
  resetError: () => void
  errorInfo?: React.ErrorInfo | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error)
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          errorInfo={this.state.errorInfo}
        />
      )
    }

    return this.props.children
  }
}

export function DefaultErrorFallback({ error, resetError, errorInfo }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl" variant="elevated">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-error-500/10 rounded-full">
              <AlertTriangle className="h-12 w-12 text-error-400" />
            </div>
          </div>
          <CardTitle className="text-2xl text-text-primary">
            Oops! Something went wrong
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-text-secondary mb-4">
              We encountered an unexpected error. Don't worry - your data is safe.
            </p>
          </div>

          {/* Error details for development */}
          {isDevelopment && error && (
            <div className="space-y-4">
              <div className="p-4 bg-error-500/5 border border-error-500/20 rounded-lg">
                <h3 className="font-medium text-error-400 mb-2 flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Error Details (Development Only)
                </h3>
                <div className="text-sm text-text-secondary space-y-2">
                  <div>
                    <strong>Message:</strong> {error.message}
                  </div>
                  <div>
                    <strong>Name:</strong> {error.name}
                  </div>
                  {error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 text-xs bg-background-tertiary p-2 rounded overflow-auto max-h-40">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {errorInfo && errorInfo.componentStack && (
                <div className="p-4 bg-warning-500/5 border border-warning-500/20 rounded-lg">
                  <h3 className="font-medium text-warning-400 mb-2">
                    Component Stack
                  </h3>
                  <pre className="text-xs text-text-secondary bg-background-tertiary p-2 rounded overflow-auto max-h-40">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={resetError}
              className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.href = '/dashboard'}
              className="border-border-primary text-text-secondary"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>

            <Button
              variant="ghost"
              onClick={() => window.location.reload()}
              className="text-text-tertiary"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
          </div>

          {/* Report issue link for production */}
          {!isDevelopment && (
            <div className="text-center pt-4 border-t border-border-primary">
              <p className="text-text-tertiary text-sm mb-2">
                Still having issues? Let us know!
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open('https://github.com/anthropics/claude-code/issues', '_blank')}
                className="text-text-secondary"
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Report Issue
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for functional components to handle errors
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Caught error:', error, errorInfo)

    // In a real app, you might want to:
    // - Send to error reporting service
    // - Show toast notification
    // - Log to analytics
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  options?: {
    fallback?: React.ComponentType<ErrorFallbackProps>
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  }
) {
  return function WrappedComponent(props: T) {
    return (
      <ErrorBoundary
        fallback={options?.fallback}
        onError={options?.onError}
      >
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Lightweight error fallback for smaller components
export function InlineErrorFallback({
  error,
  resetError,
  message = "Something went wrong"
}: ErrorFallbackProps & { message?: string }) {
  return (
    <div className="flex items-center justify-center p-6 bg-error-500/5 border border-error-500/20 rounded-lg">
      <div className="text-center space-y-3">
        <AlertTriangle className="h-8 w-8 text-error-400 mx-auto" />
        <div>
          <p className="text-sm font-medium text-error-400">{message}</p>
          {error && (
            <p className="text-xs text-text-tertiary mt-1">
              {error.message}
            </p>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={resetError}
          className="border-error-500/20 text-error-400 hover:bg-error-500/10"
        >
          <RefreshCw className="h-3 w-3 mr-2" />
          Retry
        </Button>
      </div>
    </div>
  )
}