'use client'

import React, { useState, useRef, useEffect } from 'react'
import { getVideoAttributes } from '@/lib/media-utils'
import { ipfsGateway } from '@/lib/ipfs'
import { cn } from '@/lib/utils'
import { Play, Volume2, VolumeX, Loader2 } from 'lucide-react'

interface VideoPlayerProps {
  hash: string
  className?: string
  style?: React.CSSProperties
  isMainVideo?: boolean
  poster?: string
}

export function VideoPlayer({
  hash,
  className,
  style,
  isMainVideo = false,
  poster
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true) // Start muted for autoplay compatibility
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [videoSrc, setVideoSrc] = useState<string>('')
  const [fallbackSources, setFallbackSources] = useState<string[]>([])
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0)
  const [showDebug, setShowDebug] = useState(false)

  // Initialize video sources
  useEffect(() => {
    const initializeVideo = async () => {
      try {
        console.log(`🎬 Initializing video player for hash: ${hash}`)
        setIsLoading(true)
        setHasError(false)

        // Get optimal URL and fallbacks
        const optimalUrl = await ipfsGateway.getOptimalUrl(hash, true)
        const fallbacks = ipfsGateway.getFallbackUrls(hash, true)

        setVideoSrc(optimalUrl)
        setFallbackSources(fallbacks)
        setCurrentSourceIndex(0)

        console.log(`🚀 Video source set to: ${optimalUrl}`)
      } catch (error) {
        console.error('Failed to initialize video sources:', error)
        setHasError(true)
        setIsLoading(false)
      }
    }

    if (hash) {
      initializeVideo()
    }
  }, [hash])

  // Handle video events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadStart = () => {
      console.log('🎬 Video load started')
      setIsLoading(true)
    }

    const handleCanPlay = () => {
      console.log('✅ Video can play')
      setIsLoading(false)

      // Try to auto-play main videos when they're ready (muted)
      if (video && !isPlaying && isMainVideo) {
        console.log('🚀 Attempting auto-play for main video')
        setTimeout(() => {
          video.play().catch(error => {
            console.warn('Auto-play failed:', error.message)
            // Auto-play failed, user will need to click play
          })
        }, 100)
      }
    }

    const handleLoadedData = () => {
      console.log('✅ Video data loaded')
      setIsLoading(false)
    }

    const handleError = (e: Event) => {
      const target = e.target as HTMLVideoElement
      console.error('❌ Video error:', target.error, 'Source:', currentSourceIndex)
      setIsLoading(false)

      // Try next fallback source
      if (currentSourceIndex < fallbackSources.length - 1) {
        const nextIndex = currentSourceIndex + 1
        const nextSource = fallbackSources[nextIndex]
        console.log(`🔄 Trying fallback source ${nextIndex + 1}/${fallbackSources.length}: ${nextSource}`)

        setCurrentSourceIndex(nextIndex)
        setVideoSrc(nextSource)
        setIsLoading(true)
      } else {
        console.error('💥 All video sources failed')
        setHasError(true)
      }
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('error', handleError)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('error', handleError)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [videoSrc, currentSourceIndex, fallbackSources])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) {
      console.error('❌ Video ref not available')
      return
    }

    console.log('🎬 Toggle play clicked. Current state:', {
      isPlaying,
      isLoading,
      hasError,
      videoSrc,
      readyState: video.readyState,
      networkState: video.networkState,
      currentTime: video.currentTime,
      duration: video.duration
    })

    if (video.readyState < 2) {
      console.warn('⚠️ Video not ready yet, readyState:', video.readyState, 'Loading...')
      video.load()
      return
    }

    if (isPlaying) {
      console.log('⏸️ Pausing video')
      video.pause()
    } else {
      console.log('▶️ Playing video')
      video.play().catch(error => {
        console.error('❌ Video play failed:', error)
        // Handle autoplay policy restrictions or other issues
        if (error.name === 'NotSupportedError') {
          console.error('Video format not supported')
          setHasError(true)
        }
      })
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    const newMuted = !isMuted
    video.muted = newMuted
    setIsMuted(newMuted)
    console.log(`🔊 Video ${newMuted ? 'muted' : 'unmuted'}`)
  }

  if (hasError) {
    return (
      <div className={cn(
        "w-full bg-slate-800 flex items-center justify-center",
        className
      )} style={{
        ...style,
        minHeight: isMainVideo ? '200px' : '150px',
        maxHeight: isMainVideo ? '70vh' : '300px'
      }}>
        <div className="text-center text-gray-400 p-8">
          <div className="text-sm mb-1">Video unavailable</div>
          <div className="text-xs text-gray-500">Unable to load from IPFS</div>
          <div className="text-xs text-gray-500 mt-1">Hash: {hash.slice(0, 12)}...</div>
          {videoSrc && (
            <div className="text-xs text-gray-600 mt-2 max-w-[300px] break-all">
              Last tried: {videoSrc}
            </div>
          )}
          <button
            onClick={() => {
              setCurrentSourceIndex(0)
              setHasError(false)
              setIsLoading(true)
              // Re-initialize video sources
              ipfsGateway.getOptimalUrl(hash, true).then(url => {
                setVideoSrc(url)
              }).catch(error => {
                console.error('Retry failed:', error)
              })
            }}
            className="mt-3 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative group", className)} style={style}>
      {videoSrc ? (
        <video
          ref={videoRef}
          className="w-full h-full object-cover bg-slate-800"
          controls={false}
          preload="metadata"
          playsInline
          muted={true}
          autoPlay={false}
          poster={poster}
          onClick={togglePlay}
          style={{
            maxHeight: isMainVideo ? '70vh' : '100%',
            aspectRatio: isMainVideo ? 'auto' : '1',
          }}
          onLoadedMetadata={(e) => {
            const video = e.target as HTMLVideoElement
            if (isMainVideo && video.videoWidth && video.videoHeight) {
              const aspectRatio = video.videoWidth / video.videoHeight
              video.style.aspectRatio = aspectRatio.toString()
            }
          }}
          src={videoSrc}
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
          <div className="text-gray-400">
            <div className="text-sm">Initializing video...</div>
            <div className="text-xs mt-1">Hash: {hash.slice(0, 12)}...</div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <div className="flex flex-col items-center gap-3 text-white">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            <div className="text-center">
              <div className="text-sm">Loading video...</div>
              <div className="text-xs text-gray-400 mt-1">
                Source {currentSourceIndex + 1}/{fallbackSources.length || 1}
              </div>
              {videoSrc && (
                <div className="text-xs text-gray-500 mt-1 max-w-[200px] truncate">
                  {videoSrc.includes('/api/proxy/media') ? 'Proxied' : 'Direct'} IPFS
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2 z-10">
        {/* Debug button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowDebug(!showDebug)
          }}
          className="p-2 bg-black/70 backdrop-blur-sm rounded-full text-white hover:text-gray-300 transition-colors text-xs"
          title="Toggle debug info"
        >
          🐛
        </button>

        {/* Audio control button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleMute()
          }}
          className="p-2 bg-black/70 backdrop-blur-sm rounded-full text-white hover:text-gray-300 transition-colors"
          disabled={isLoading}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Debug panel */}
      {showDebug && (
        <div className="absolute bottom-2 left-2 right-2 bg-black/90 backdrop-blur-sm rounded p-3 text-xs text-white max-h-32 overflow-auto">
          <div><strong>Hash:</strong> {hash}</div>
          <div><strong>Source:</strong> {videoSrc || 'None'}</div>
          <div><strong>State:</strong> Loading: {isLoading.toString()}, Playing: {isPlaying.toString()}, Error: {hasError.toString()}</div>
          <div><strong>Ready State:</strong> {videoRef.current?.readyState || 'N/A'}</div>
          <div><strong>Source Index:</strong> {currentSourceIndex + 1}/{fallbackSources.length}</div>
          {videoRef.current?.error && (
            <div className="text-red-400"><strong>Video Error:</strong> {videoRef.current.error.message}</div>
          )}
        </div>
      )}

      {/* Video play indicator for when paused */}
      {!isPlaying && !isLoading && videoSrc && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 hover:bg-black/40 transition-all duration-200"
          onClick={togglePlay}
        >
          <div className="bg-white/90 hover:bg-white rounded-full p-6 backdrop-blur-sm hover:scale-110 transition-all duration-200 shadow-lg">
            <Play className="w-16 h-16 text-black ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Playing indicator */}
      {isPlaying && videoSrc && (
        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded px-3 py-1 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
          Playing
        </div>
      )}
    </div>
  )
}