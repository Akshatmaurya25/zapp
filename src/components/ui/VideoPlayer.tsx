'use client'

import React, { useState, useRef, useEffect } from 'react'
import { getIPFSUrl, getVideoAttributes } from '@/lib/media-utils'
import { cn } from '@/lib/utils'
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react'

interface VideoPlayerProps {
  hash: string
  mediaType?: string
  className?: string
  style?: React.CSSProperties
  isMainVideo?: boolean
  poster?: string
}

export function VideoPlayer({
  hash,
  mediaType,
  className,
  style,
  isMainVideo = false,
  poster
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentGateway, setCurrentGateway] = useState(0)

  const videoAttributes = getVideoAttributes(isMainVideo)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleError = () => {
      setIsLoading(false)
      setHasError(true)
      // Try next gateway
      if (currentGateway < 3) {
        setCurrentGateway(prev => prev + 1)
        setHasError(false)
        setIsLoading(true)
      }
    }
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [currentGateway])

  const togglePlay = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return

    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  if (hasError && currentGateway >= 3) {
    return (
      <div className={cn(
        "w-full h-full bg-slate-800 flex items-center justify-center",
        className
      )} style={style}>
        <div className="text-center text-gray-400">
          <div className="text-sm">Video unavailable</div>
          <div className="text-xs text-gray-500 mt-1">Unable to load from IPFS</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative group", className)} style={style}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover bg-slate-800"
        {...videoAttributes}
        poster={poster}
        onLoadedMetadata={(e) => {
          if (isMainVideo) {
            const video = e.target as HTMLVideoElement
            const aspectRatio = video.videoWidth / video.videoHeight
            if (aspectRatio > 0) {
              video.style.aspectRatio = aspectRatio.toString()
            }
          }
        }}
      >
        <source
          src={getIPFSUrl(hash, currentGateway)}
          type={mediaType || 'video/mp4'}
        />
        <source
          src={getIPFSUrl(hash, (currentGateway + 1) % 4)}
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex items-center gap-2 text-white">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading video...</span>
          </div>
        </div>
      )}

      {/* Custom controls overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
          <button
            onClick={togglePlay}
            className="text-white hover:text-gray-300 transition-colors"
            disabled={isLoading}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </button>

          <button
            onClick={toggleMute}
            className="text-white hover:text-gray-300 transition-colors"
            disabled={isLoading}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Video play indicator for when paused */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 rounded-full p-3 backdrop-blur-sm">
            <Play className="w-8 h-8 text-white" />
          </div>
        </div>
      )}
    </div>
  )
}