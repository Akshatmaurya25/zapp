'use client'

import React, { useState, useEffect } from 'react'
import { getIPFSUrl } from '@/lib/media-utils'
import { cn } from '@/lib/utils'
import { Loader2, ImageOff } from 'lucide-react'

interface IPFSImageProps {
  hash: string
  alt: string
  className?: string
  style?: React.CSSProperties
  loading?: 'lazy' | 'eager'
}

export function IPFSImage({ hash, alt, className, style, loading = 'lazy' }: IPFSImageProps) {
  const [currentGateway, setCurrentGateway] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleError = () => {
    setIsLoading(false)

    // Try next gateway
    if (currentGateway < 3) {
      setCurrentGateway(prev => prev + 1)
      setIsLoading(true)
      setHasError(false)
    } else {
      setHasError(true)
    }
  }

  // Reset when hash changes
  useEffect(() => {
    setCurrentGateway(0)
    setIsLoading(true)
    setHasError(false)
  }, [hash])

  if (hasError) {
    return (
      <div
        className={cn("w-full h-full bg-slate-700 flex items-center justify-center", className)}
        style={style}
      >
        <div className="text-center text-gray-400">
          <ImageOff className="h-8 w-8 mx-auto mb-2" />
          <div className="text-sm">Image unavailable</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)} style={style}>
      {isLoading && (
        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
        </div>
      )}

      <img
        src={getIPFSUrl(hash, currentGateway)}
        alt={alt}
        className="w-full h-full object-cover bg-slate-800 transition-transform duration-300 group-hover:scale-105"
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          ...style,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </div>
  )
}